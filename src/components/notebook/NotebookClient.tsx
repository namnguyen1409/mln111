"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Tag as TagIcon,
    Trash2,
    CalendarDays,
    Plus,
    MessageSquare,
    Link as LinkIcon,
    FileText,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import NoteEditor from './NoteEditor';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NotebookClientProps {
    initialNotes: any[];
}

export default function NotebookClient({ initialNotes }: NotebookClientProps) {
    const [notes, setNotes] = useState(initialNotes);
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<any>(null);
    const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        notes.forEach(note => note.tags?.forEach((tag: string) => tagsSet.add(tag)));
        return Array.from(tagsSet);
    }, [notes]);

    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) ||
                note.content.toLowerCase().includes(search.toLowerCase());
            const matchesTag = !selectedTag || note.tags?.includes(selectedTag);
            return matchesSearch && matchesTag;
        });
    }, [notes, search, selectedTag]);

    const handleDelete = async () => {
        if (!noteToDelete) return;

        try {
            const res = await fetch(`/api/notes/${noteToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                setNotes(notes.filter(n => n._id !== noteToDelete));
                toast({ title: "Đã xóa ghi chú" });
            }
        } catch (error) {
            toast({ title: "Lỗi khi xóa", variant: "destructive" });
        } finally {
            setNoteToDelete(null);
        }
    };

    const handleSave = (savedNote: any) => {
        const index = notes.findIndex(n => n._id === savedNote._id);
        if (index >= 0) {
            const newNotes = [...notes];
            newNotes[index] = savedNote;
            setNotes(newNotes);
        } else {
            setNotes([savedNote, ...notes]);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-[2rem] border-white/5">
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm trí thức..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white/5 border-none h-11 pl-12 rounded-xl"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 5).map(tag => (
                        <Badge
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            className={`cursor-pointer transition-all border-none ${selectedTag === tag ? 'bg-primary text-white scale-110' : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                                }`}
                        >
                            #{tag}
                        </Badge>
                    ))}
                    <Button
                        onClick={() => {
                            setEditingNote(null);
                            setIsEditorOpen(true);
                        }}
                        className="rounded-xl h-11 px-6 font-black uppercase italic neo-shadow"
                    >
                        <Plus className="mr-2 w-5 h-5" /> Thêm ghi chú
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredNotes.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center glass rounded-[3rem] text-muted-foreground italic border-white/5"
                        >
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p>Không tìm thấy ghi chú nào phù hợp.</p>
                        </motion.div>
                    ) : (
                        filteredNotes.map((note, idx) => (
                            <motion.div
                                key={note._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="glass border-white/5 h-full rounded-[2rem] overflow-hidden group hover:border-primary/20 transition-all flex flex-col">
                                    <CardContent className="p-8 flex flex-col h-full space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-wrap gap-1">
                                                {note.tags?.map((tag: string) => (
                                                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-primary/60">#{tag}</span>
                                                ))}
                                                {note.topicSlug && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-secondary flex items-center gap-1">
                                                        <LinkIcon className="w-2.5 h-2.5" /> {note.topicSlug}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setNoteToDelete(note._id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <h3 className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">{note.title}</h3>

                                        <p className="text-muted-foreground text-sm line-clamp-4 italic leading-relaxed flex-grow">
                                            "{note.content}"
                                        </p>

                                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {new Date(note.updatedAt).toLocaleDateString()}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingNote(note);
                                                    setIsEditorOpen(true);
                                                }}
                                                className="rounded-xl border-white/10 text-[10px] font-black uppercase tracking-widest h-9 hover:bg-white/10"
                                            >
                                                Xem & Sửa <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <NoteEditor
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                existingNote={editingNote}
                onSave={handleSave}
            />

            <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
                <AlertDialogContent className="glass border-white/10 rounded-[2rem]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Bạn có chắc chắn?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Ghi chú này sẽ bị xóa vĩnh viễn khỏi sổ tay tri thức của bạn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="rounded-xl border-white/10">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 rounded-xl font-bold">
                            Xác nhận xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

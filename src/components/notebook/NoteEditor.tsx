"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Save,
    X,
    Tag as TagIcon,
    FileText,
    Sparkles,
    Loader2,
    PenLine
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    topicId?: string;
    topicSlug?: string;
    topicTitle?: string;
    existingNote?: any;
    onSave?: (note: any) => void;
}

export default function NoteEditor({
    isOpen,
    onClose,
    topicId,
    topicSlug,
    topicTitle,
    existingNote,
    onSave
}: NoteEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (existingNote) {
            setTitle(existingNote.title);
            setContent(existingNote.content);
            setTags(existingNote.tags || []);
        } else if (topicTitle) {
            setTitle(`Ghi chú: ${topicTitle}`);
            setContent('');
            setTags([]);
        } else {
            setTitle('');
            setContent('');
            setTags([]);
        }
    }, [existingNote, topicTitle, isOpen]);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tiêu đề và nội dung",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: existingNote?._id,
                    title,
                    content,
                    tags,
                    topicId,
                    topicSlug
                }),
            });

            if (res.ok) {
                const savedNote = await res.json();
                toast({
                    title: "Thành công",
                    description: "Đã lưu sổ tay tri thức",
                });
                if (onSave) onSave(savedNote);
                onClose();
            } else {
                throw new Error("Failed to save note");
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể lưu ghi chú. Vui lòng thử lại.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="glass border-white/10 max-w-2xl p-0 overflow-hidden rounded-[2.5rem]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

                <DialogHeader className="p-8 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <PenLine className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Sổ tay tri thức
                            </p>
                            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                                {existingNote ? 'Chỉnh sửa tâm đắc' : 'Ghi lại suy ngẫm'}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-muted-foreground/60 tracking-widest pl-1">Tiêu đề ghi chú</label>
                        <Input
                            value={title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                            placeholder="Tiêu đề ví dụ: Ý nghĩa của Phép biện chứng..."
                            className="bg-white/5 border-white/5 h-12 rounded-xl focus:border-primary/50 text-lg font-bold"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-muted-foreground/60 tracking-widest pl-1">Bạn đang tâm đắc điều gì?</label>
                        <Textarea
                            value={content}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                            placeholder="Ghi lại những suy nghĩ, tóm tắt hoặc ví dụ mà bạn tự rút ra..."
                            className="bg-white/5 border-white/5 min-h-[200px] rounded-2xl p-6 focus:border-primary/50 leading-relaxed italic"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-muted-foreground/60 tracking-widest pl-1">Thẻ liên quan</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <AnimatePresence>
                                {tags.map(tag => (
                                    <motion.div
                                        key={tag}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 flex items-center gap-2 rounded-lg">
                                            #{tag}
                                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                                        </Badge>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className="relative">
                            <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={tagInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Thêm thẻ (Nhấn Enter để thêm)..."
                                className="bg-white/5 border-white/5 h-10 rounded-xl pl-12"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 pt-0 flex gap-4">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl h-12 px-8 font-bold text-muted-foreground">
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="rounded-xl h-12 px-8 font-black uppercase italic neo-shadow flex-grow md:flex-none"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="mr-2 w-5 h-5" /> Lưu sổ tay</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

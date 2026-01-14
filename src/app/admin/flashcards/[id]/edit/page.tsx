"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, Save, Layers, PlusCircle, Upload, FileJson, Download, Bot } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

export default function EditFlashcardPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        category: 'general',
        cards: [{ front: '', back: '' }]
    });

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const res = await fetch(`/api/admin/flashcards/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData(data);
                } else {
                    toast.error("Không tìm thấy bộ thẻ");
                    router.push('/admin/flashcards');
                }
            } catch (error) {
                toast.error("Lỗi tải dữ liệu");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchCollection();
    }, [id, router]);

    const addCard = () => {
        setFormData({
            ...formData,
            cards: [...formData.cards, { front: '', back: '' }]
        });
    };

    const removeCard = (index: number) => {
        setFormData({
            ...formData,
            cards: formData.cards.filter((_, i) => i !== index)
        });
    };

    const updateCard = (index: number, field: 'front' | 'back', value: string) => {
        const newCards = [...formData.cards];
        newCards[index][field] = value;
        setFormData({ ...formData, cards: newCards });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/flashcards/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Bộ thẻ đã được cập nhật!");
                router.push('/admin/flashcards');
            } else {
                const err = await res.json();
                toast.error(err.error || "Có lỗi xảy ra");
            }
        } catch (error: any) {
            toast.error("Lỗi khi kết nối server");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImportJson = () => {
        try {
            const data = JSON.parse(jsonInput);
            if (!data.title || !data.cards) {
                toast.error("JSON không đúng định dạng Flashcard.");
                return;
            }
            // Preserve the ID
            setFormData({ ...data, _id: (formData as any)._id });
            setIsImportModalOpen(false);
            setJsonInput('');
            toast.success("Đã nhập dữ liệu thành công!");
        } catch (error) {
            toast.error("JSON không hợp lệ.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonInput(content);
        };
        reader.readAsText(file);
    };

    const handleExportJson = () => {
        const dataStr = JSON.stringify(formData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${formData.slug || 'flashcard'}-export.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleDownloadSample = () => {
        const sample = {
            title: "Khái niệm Triết học",
            slug: "khai-niem-triet-hoc",
            description: "Các khái niệm cơ bản về Triết học và vai trò của nó.",
            category: "co-ban",
            cards: [
                {
                    front: "Triết học là gì?",
                    back: "Triết học là hệ thống tri thức lý luận chung nhất của con người về thế giới, về bản thân con người và vị trí của con người trong thế giới đó."
                }
            ]
        };
        const dataStr = JSON.stringify(sample, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', "flashcard-sample.json");
        linkElement.click();
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Đang đồng bộ hóa tri thức...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                        <Link href="/admin/flashcards"><ChevronLeft className="w-4 h-4 mr-1" /> Danh sách Bộ Thẻ</Link>
                    </Button>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Layers className="text-primary w-10 h-10" /> Hiệu chỉnh Bộ Thẻ
                    </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={handleDownloadSample} className="rounded-xl border-white/10 gap-2">
                        <Download className="w-4 h-4" /> Mẫu
                    </Button>
                    <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="rounded-xl border-white/10 gap-2">
                        <Upload className="w-4 h-4" /> Nhập JSON
                    </Button>
                    <Button variant="outline" onClick={handleExportJson} className="rounded-xl border-white/10 gap-2">
                        <FileJson className="w-4 h-4" /> Xuất JSON
                    </Button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-primary tracking-widest">Tiêu đề bộ thẻ</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-xl font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-secondary tracking-widest">Slug (Đường dẫn tĩnh)</label>
                            <input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-secondary outline-none transition-all font-mono text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Mô tả bộ thẻ</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all h-24"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-secondary tracking-widest">Danh mục</label>
                            <input
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-secondary outline-none transition-all"
                            />
                        </div>
                    </div>
                </Card>

                <div className="space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-2xl font-black italic flex items-center gap-3">
                            <PlusCircle className="text-primary w-6 h-6" /> Hiệu chỉnh thẻ ({formData.cards.length})
                        </h2>
                        <Button type="button" onClick={addCard} variant="outline" className="rounded-xl border-primary/20 bg-primary/5 gap-2">
                            <Plus className="w-4 h-4" /> Thêm thẻ mới
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence initial={false}>
                            {formData.cards.map((card, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <Card className="glass border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-start relative group">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-muted-foreground shrink-0 border border-white/10">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-primary tracking-widest opacity-60">Mặt trước (Câu hỏi/Khái niệm)</label>
                                                <textarea
                                                    value={card.front}
                                                    onChange={(e) => updateCard(idx, 'front', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all h-32 text-sm resize-none font-bold"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase text-secondary tracking-widest opacity-60">Mặt sau (Đáp án/Giải thích)</label>
                                                <textarea
                                                    value={card.back}
                                                    onChange={(e) => updateCard(idx, 'back', e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-secondary outline-none transition-all h-32 text-sm resize-none italic"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeCard(idx)}
                                            disabled={formData.cards.length === 1}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-6">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow h-16 neo-shadow rounded-[2rem] font-black text-xl bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? "Đang chuẩn bị tri thức..." : "Cập nhật & Xuất Bản Bộ Thẻ"} <Save className="ml-3" />
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-[2rem] px-12 border-white/10 font-bold">
                        <Link href="/admin/flashcards">Hủy bỏ</Link>
                    </Button>
                </div>
            </form>

            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="glass border-white/10 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Nhập dữ liệu Flashcard (JSON)</DialogTitle>
                        <DialogDescription>
                            Dán mã JSON hoặc tải tệp lên để tự động điền các trường nội dung.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Mã JSON</span>
                            <Button variant="ghost" size="sm" onClick={handleDownloadSample} className="h-6 gap-1 text-[10px] hover:text-primary">
                                <Download className="w-3 h-3" /> Tải mẫu
                            </Button>
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all h-64 font-mono text-xs"
                            placeholder='{"title": "...", "cards": [...] }'
                        />
                        <div className="flex items-center gap-4">
                            <label className="flex-grow">
                                <div className="flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-primary/50 rounded-2xl p-4 cursor-pointer transition-all bg-white/5 text-sm font-bold">
                                    <Upload className="w-4 h-4" /> Tải tệp .json lên
                                </div>
                                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setJsonInput('')}
                                className="h-14 px-6 rounded-2xl border-white/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleImportJson} className="rounded-xl neo-shadow px-8">Xác nhận nhập</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

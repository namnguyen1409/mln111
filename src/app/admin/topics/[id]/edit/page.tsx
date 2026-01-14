"use client";

import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Save, Lightbulb, Target, Bot, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function EditTopicPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [formData, setFormData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const fetchTopic = async () => {
            try {
                const res = await fetch(`/api/admin/topics/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        title: data.title,
                        slug: data.slug,
                        category: data.category,
                        customCategory: data.customCategory || '',
                        learningOutcome: data.learningOutcome,
                        coreConcept: data.content.coreConcept,
                        keyPoints: data.content.keyPoints || [''],
                        example: data.content.example,
                        thoughtQuestion: data.content.thoughtQuestion
                    });
                } else {
                    toast({ title: "Lỗi", description: "Không thể tải bài học", variant: "destructive" });
                    router.push('/admin/topics');
                }
            } catch (error) {
                toast({ title: "Lỗi", description: "Có lỗi xảy ra", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopic();
    }, [id, router, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleKeyPointChange = (index: number, value: string) => {
        const newPoints = [...formData.keyPoints];
        newPoints[index] = value;
        setFormData((prev: any) => ({ ...prev, keyPoints: newPoints }));
    };

    const addKeyPoint = () => {
        setFormData((prev: any) => ({ ...prev, keyPoints: [...prev.keyPoints, ''] }));
    };

    const removeKeyPoint = (index: number) => {
        setFormData((prev: any) => ({ ...prev, keyPoints: prev.keyPoints.filter((_: any, i: number) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/admin/topics/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    slug: formData.slug,
                    category: formData.category,
                    customCategory: formData.category === 'khac' ? formData.customCategory : undefined,
                    learningOutcome: formData.learningOutcome,
                    content: {
                        coreConcept: formData.coreConcept,
                        keyPoints: formData.keyPoints.filter((p: string) => p.trim() !== ''),
                        example: formData.example,
                        thoughtQuestion: formData.thoughtQuestion
                    }
                }),
            });

            if (res.ok) {
                toast({ title: "Thành công", description: "Đã cập nhật bài học!" });
                router.push('/admin/topics');
            } else {
                const err = await res.json();
                throw new Error(err.error || "Có lỗi xảy ra");
            }
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-24 text-center">Đang tải...</div>;
    if (!formData) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                        <Link href="/admin/topics"><ChevronLeft className="w-4 h-4 mr-1" /> Danh sách bài học</Link>
                    </Button>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Chỉnh sửa bài học</h1>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-primary">Tiêu đề</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-secondary">Slug</label>
                            <input
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-secondary outline-none font-mono text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-muted-foreground">Danh mục</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
                            >
                                <option value="co-ban">Cơ bản</option>
                                <option value="nguyen-ly">Nguyên lý</option>
                                <option value="quy-luat">Quy luật</option>
                                <option value="pham-tru">Phạm trù</option>
                                <option value="khac">Khác</option>
                            </select>
                        </div>
                        {formData.category === 'khac' && (
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase text-accent">Danh mục tùy chỉnh</label>
                                <input
                                    name="customCategory"
                                    value={formData.customCategory}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
                                    required
                                />
                            </div>
                        )}
                        <div className="space-y-3 col-span-full">
                            <label className="text-xs font-black uppercase text-primary flex items-center gap-2">
                                <Target className="w-4 h-4" /> Mục tiêu bài học
                            </label>
                            <textarea
                                name="learningOutcome"
                                value={formData.learningOutcome}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 min-h-[100px]"
                                required
                            />
                        </div>
                    </div>
                </Card>

                <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                    <div className="space-y-3">
                        <label className="text-sm font-black flex items-center gap-2">
                            <Lightbulb className="text-yellow-400 w-5 h-5" /> Nội dung cốt lõi
                        </label>
                        <textarea
                            name="coreConcept"
                            value={formData.coreConcept}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 min-h-[120px]"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-black text-primary">Các luận điểm chính</label>
                            <Button type="button" onClick={addKeyPoint} variant="outline" size="sm" className="rounded-xl border-primary/20 bg-primary/5">
                                + Thêm
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {formData.keyPoints.map((point: string, idx: number) => (
                                <div key={idx} className="flex gap-3 items-center group">
                                    <input
                                        value={point}
                                        onChange={(e) => handleKeyPointChange(idx, e.target.value)}
                                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                                        placeholder={`Luận điểm ${idx + 1}`}
                                    />
                                    {formData.keyPoints.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => removeKeyPoint(idx)}
                                            className="text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 space-y-4">
                        <label className="text-sm font-black text-secondary">Ví dụ đời thực</label>
                        <textarea
                            name="example"
                            value={formData.example}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 h-40 text-sm"
                        />
                    </Card>

                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 space-y-4">
                        <label className="text-sm font-black text-accent">Câu hỏi gợi mở</label>
                        <textarea
                            name="thoughtQuestion"
                            value={formData.thoughtQuestion}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 h-40 text-sm"
                        />
                    </Card>
                </div>

                <div className="pt-8 flex gap-6">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow h-16 neo-shadow rounded-[2rem] font-black text-xl"
                    >
                        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"} <Save className="ml-3" />
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-[2rem] px-12 border-white/10">
                        <Link href="/admin/topics">Hủy</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}

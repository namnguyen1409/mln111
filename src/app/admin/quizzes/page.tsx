"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, Edit2, Gamepad2, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminQuizzesPage() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuizzes = async () => {
        try {
            const res = await fetch('/api/admin/quizzes');
            if (res.ok) {
                const data = await res.json();
                setQuizzes(data);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách câu đố");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa câu đố này?")) return;
        try {
            const res = await fetch('/api/admin/quizzes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                toast.success("Đã xóa câu đố");
                fetchQuizzes();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                        <Link href="/admin"><ChevronLeft className="w-4 h-4 mr-1" /> Admin Hub</Link>
                    </Button>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Gamepad2 className="text-primary w-10 h-10" /> Quản lý Game Quiz
                    </h1>
                    <p className="text-muted-foreground italic">Quản lý các thử thách giúp sinh viên ôn tập và tích lũy EXP.</p>
                </div>

                <Button asChild className="rounded-xl neo-shadow gap-2">
                    <Link href="/admin/quizzes/new">
                        <Plus className="w-4 h-4" /> Tạo Quiz mới
                    </Link>
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-20 glass rounded-[3rem] animate-pulse text-muted-foreground">Đang tải danh sách Quiz...</div>
                ) : quizzes.length === 0 ? (
                    <div className="col-span-full text-center py-20 glass rounded-[3rem] text-muted-foreground italic">Chưa có Quiz nào được tạo.</div>
                ) : (
                    quizzes.map((quiz) => (
                        <Card key={quiz._id} className="glass border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/50 transition-all">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <Trophy className="text-primary w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full">
                                            <Link href={`/admin/quizzes/${quiz._id}/edit`}><Edit2 className="w-4 h-4" /></Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz._id)} className="text-red-500 hover:bg-red-500/10 rounded-full">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tight line-clamp-2">{quiz.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-bold uppercase tracking-widest opacity-60">
                                        <ArrowRight className="w-3 h-3" /> Topic: {quiz.topicSlug}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Câu hỏi</p>
                                        <p className="text-xl font-black">{quiz.questions.length}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">EXP Thưởng</p>
                                        <p className="text-xl font-black text-primary">+{quiz.xpReward}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

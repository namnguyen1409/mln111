"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Trash2, ExternalLink, ChevronLeft, RefreshCw, ShieldAlert, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Comment {
    _id: string;
    topicSlug: string;
    user: {
        name: string;
        email: string;
        image?: string;
    };
    content: string;
    createdAt: string;
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/comments');
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách thảo luận");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa thảo luận này?")) return;

        setIsDeleting(id);
        try {
            const res = await fetch('/api/admin/comments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                toast.success("Đã xóa thảo luận");
                setComments(prev => prev.filter(c => c._id !== id));
            } else {
                toast.error("Lỗi khi xóa thảo luận");
            }
        } catch (error) {
            toast.error("Lỗi kết nối mạng");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                        <Link href="/admin"><ChevronLeft className="w-4 h-4 mr-1" /> Admin Hub</Link>
                    </Button>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <ShieldAlert className="text-primary w-10 h-10" /> Kiểm duyệt thảo luận
                    </h1>
                    <p className="text-muted-foreground text-lg italic underline decoration-primary decoration-2 underline-offset-4">
                        Giữ gìn môi trường học tập văn minh và tích cực.
                    </p>
                </div>
                <Button onClick={fetchComments} variant="outline" className="rounded-xl border-white/10 gap-2">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
                </Button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="text-center py-20 glass rounded-[2rem] border-white/5 italic text-muted-foreground">
                        Đang quét dữ liệu thảo luận...
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-20 glass rounded-[2rem] border-white/5 italic text-muted-foreground">
                        Chưa có thảo luận nào cần xử lý.
                    </div>
                ) : (
                    comments.map((comment) => (
                        <Card key={comment._id} className="glass border-white/5 rounded-3xl overflow-hidden group hover:border-primary/20 transition-all p-6">
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div className="flex gap-4 flex-grow">
                                    <Avatar className="h-12 w-12 border border-white/10">
                                        <AvatarImage src={comment.user.image} />
                                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg">{comment.user.name}</span>
                                            <Badge variant="outline" className="text-[10px] opacity-50">{comment.user.email}</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
                                            <Link href={`/learn/${comment.topicSlug}`} className="flex items-center gap-1 text-primary hover:underline">
                                                <ExternalLink className="w-3 h-3" /> Bài học: {comment.topicSlug}
                                            </Link>
                                        </div>
                                        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                            {comment.content}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 self-end md:self-start">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="rounded-xl gap-2 h-10 px-4 font-bold neo-shadow"
                                        onClick={() => handleDelete(comment._id)}
                                        disabled={isDeleting === comment._id}
                                    >
                                        <Trash2 className="w-4 h-4" /> {isDeleting === comment._id ? "Đang xóa..." : "Xóa vi phạm"}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

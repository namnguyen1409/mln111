"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, RefreshCw, LogIn, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
    _id: string;
    user: {
        name: string;
        image?: string;
        email: string;
    };
    content: string;
    createdAt: string;
}

export default function Discussion({ topicSlug }: { topicSlug: string }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchComments = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        else setIsSyncing(true);

        try {
            const res = await fetch(`/api/topics/${topicSlug}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setIsLoading(false);
            setIsSyncing(false);
        }
    }, [topicSlug]);

    // Initial fetch
    useEffect(() => {
        fetchComments();

        // Auto-sync every 30 seconds
        const interval = setInterval(() => {
            fetchComments(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            signIn('google');
            return;
        }
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/topics/${topicSlug}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                setNewComment('');
                fetchComments(true);
                toast.success("Thảo luận của bạn đã được gửi!");

                // Track daily task progress
                fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'comment' })
                }).catch(err => console.error("Task tracking failed", err));
            } else {
                toast.error("Không thể gửi thảo luận. Thử lại sau!");
            }
        } catch (error) {
            toast.error("Lỗi kết nối mạng.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Vừa xong';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    <MessageSquare className="text-primary w-6 h-6" /> Thảo luận cộng đồng
                    {isSyncing && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => fetchComments()} className="text-xs uppercase font-bold tracking-widest text-muted-foreground hover:text-primary">
                    Làm mới
                </Button>
            </div>

            {session ? (
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
                    <div className="relative glass border-white/10 rounded-[2rem] p-4 flex gap-4">
                        <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                            <AvatarImage src={session.user?.image || ''} />
                            <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow space-y-3">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Bạn suy nghĩ gì về luận điểm này? Chia sẻ cùng Hub..."
                                className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none text-sm leading-relaxed placeholder:text-muted-foreground/50 h-20 py-2"
                            />
                            <div className="flex justify-end">
                                <Button
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="rounded-xl h-10 px-6 font-bold neo-shadow"
                                >
                                    {isSubmitting ? "Gửi..." : "Gửi thảo luận"} <Send className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="glass border-dashed border-white/20 rounded-[2rem] p-10 text-center space-y-4">
                    <p className="text-muted-foreground italic">Đăng nhập để tham gia thảo luận cùng các sinh viên khác.</p>
                    <Button onClick={() => signIn('google')} className="rounded-xl font-bold px-8 neo-shadow">
                        <LogIn className="mr-2 w-4 h-4" /> Đăng nhập ngay
                    </Button>
                </div>
            )}

            <div className="space-y-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-white/5" />
                            <div className="flex-grow space-y-2">
                                <div className="h-4 w-32 bg-white/5 rounded" />
                                <div className="h-20 w-full bg-white/5 rounded-2xl" />
                            </div>
                        </div>
                    ))
                ) : comments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground italic">
                        Chưa có thảo luận nào. Hãy là người đầu tiên đặt câu hỏi!
                    </div>
                ) : (
                    <AnimatePresence>
                        {comments.map((comment, index) => (
                            <motion.div
                                key={comment._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex gap-4 group"
                            >
                                <Avatar className="h-10 w-10 border border-white/5 shrink-0">
                                    <AvatarImage src={comment.user.image} />
                                    <AvatarFallback className="bg-white/5">{comment.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-sm">{comment.user.name}</span>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" /> {getTimeAgo(comment.createdAt)}
                                        </span>
                                    </div>
                                    <div className="glass border-white/5 p-4 rounded-2xl group-hover:border-primary/20 transition-colors">
                                        <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

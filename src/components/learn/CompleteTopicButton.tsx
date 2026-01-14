"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface CompleteTopicButtonProps {
    topicSlug: string;
    initialCompleted: boolean;
    nextTopic?: { slug: string; title: string } | null;
}

export default function CompleteTopicButton({ topicSlug, initialCompleted, nextTopic }: CompleteTopicButtonProps) {
    const [isCompleted, setIsCompleted] = useState(initialCompleted);
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15); // Require 15 seconds of reading
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (isCompleted) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isCompleted]);

    const handleComplete = async () => {
        if (isCompleted) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/user/complete-topic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topicSlug }),
            });

            if (res.ok) {
                setIsCompleted(true);
                toast({
                    title: "Tuyệt vời! 🎉",
                    description: "Bạn đã hoàn thành bài học và nhận được 100 EXP.",
                });
                router.refresh(); // Refresh to update server components if needed
            } else {
                throw new Error("Failed to complete topic");
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể đánh dấu hoàn thành. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 py-8">
            <AnimatePresence mode="wait">
                {isCompleted ? (
                    <motion.div
                        key="completed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6 w-full max-w-md"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                            <p className="font-bold text-green-500 uppercase tracking-widest text-xs">Bài học đã hoàn thành</p>
                        </div>

                        {nextTopic && (
                            <div className="w-full bg-muted/50 p-6 rounded-3xl border border-border flex flex-col gap-4 items-center">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Bài tiếp theo</p>
                                    <h4 className="text-xl font-black tracking-tighter italic uppercase">{nextTopic.title}</h4>
                                </div>
                                <Button
                                    asChild
                                    size="lg"
                                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 neo-shadow font-black uppercase italic italic tracking-tighter"
                                >
                                    <a href={`/learn/${nextTopic.slug}`}>
                                        Tiếp tục hành trình <ChevronRight className="ml-2 w-5 h-5" />
                                    </a>
                                </Button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="not-completed"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md"
                    >
                        <Button
                            onClick={handleComplete}
                            disabled={isLoading || timeLeft > 0}
                            className={`w-full h-16 rounded-2xl text-xl font-black uppercase italic tracking-tighter transition-all duration-300 ${isLoading || timeLeft > 0 ? 'bg-muted text-muted-foreground' : 'bg-primary hover:bg-primary/90 neo-shadow text-white'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : timeLeft > 0 ? (
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center not-italic text-sm">{timeLeft}</span>
                                    <span>Đang nạp tri thức...</span>
                                </div>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-3" /> Hoàn thành bài học
                                </>
                            )}
                        </Button>
                        <p className="text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-4">
                            {timeLeft > 0 ? `Vui lòng đọc bài trong ít nhất 15 giây` : `+100 EXP khi hoàn thành lần đầu`}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface CompleteTopicButtonProps {
    topicSlug: string;
    initialCompleted: boolean;
}

export default function CompleteTopicButton({ topicSlug, initialCompleted }: CompleteTopicButtonProps) {
    const [isCompleted, setIsCompleted] = useState(initialCompleted);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

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
                        className="flex flex-col items-center gap-3"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="font-bold text-green-500 uppercase tracking-widest text-xs">Bài học đã hoàn thành</p>
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
                            disabled={isLoading}
                            className={`w-full h-16 rounded-2xl text-xl font-black uppercase italic tracking-tighter transition-all duration-300 ${isLoading ? 'bg-white/10' : 'bg-primary hover:bg-primary/90 neo-shadow'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-3" /> Hoàn thành bài học
                                </>
                            )}
                        </Button>
                        <p className="text-center text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-4">
                            +100 EXP khi hoàn thành lần đầu
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

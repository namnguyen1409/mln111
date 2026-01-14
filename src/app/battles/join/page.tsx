"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

export default function JoinBattlePage() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/battles/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim().toUpperCase() }),
            });

            if (res.ok) {
                const battle = await res.json();
                router.push(`/battles/${battle.code}`);
            } else {
                const err = await res.json();
                toast({
                    title: "Không thể tham gia",
                    description: err.error || "Mã phòng không hợp lệ.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({ title: "Lỗi kết nối", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass rounded-[3rem] p-12 border-white/5 space-y-8 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />

                <div className="space-y-2">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Zap className="text-primary w-8 h-8 fill-current" />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                        <Sparkles className="w-3 h-3" /> Đấu trường trực tiếp
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Tham gia trận đấu</h1>
                    <p className="text-muted-foreground italic">Nhập mã phòng từ giảng viên để bắt đầu so trình!</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-4">
                    <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="MÃ PHÒNG (VD: A1B2C3)"
                        className="h-16 rounded-[1.5rem] bg-white/5 border-white/10 text-center text-3xl font-black tracking-[0.5em] placeholder:tracking-normal placeholder:text-lg focus:border-primary/50"
                        maxLength={6}
                    />
                    <Button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className="w-full h-16 rounded-2xl font-black text-xl uppercase italic neo-shadow"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Vào trận ngay <ChevronRight className="ml-2 w-6 h-6" /></>}
                    </Button>
                </form>

                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    Công cụ hỗ trợ giảng dạy tương tác PlayHub
                </p>
            </motion.div>
        </div>
    );
}

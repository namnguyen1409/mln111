"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Zap, Coins, Trophy } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface HostBattleButtonProps {
    quizId?: string;
    topicId?: string;
    topicSlug: string;
}

export default function HostBattleButton({ quizId, topicId, topicSlug }: HostBattleButtonProps) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleCreateBattle = async (type: 'classic' | 'bet', betAmount: number = 0) => {
        setLoading(true);
        try {
            const res = await fetch('/api/battles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId,
                    topicId,
                    topicSlug: topicSlug || 'general',
                    type,
                    betAmount
                }),
            });

            if (res.ok) {
                const battle = await res.json();
                toast({ title: "Thành công", description: `Đã tạo phòng Battle ${type === 'bet' ? 'đặt cược' : ''}!` });
                router.push(`/battles/${battle.code}`);
            } else {
                const error = await res.json();
                toast({ title: "Lỗi", description: error.error || "Không thể tạo phòng battle.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Lỗi kết nối.", variant: "destructive" });
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    disabled={loading}
                    variant="outline"
                    className="w-full rounded-2xl h-12 border-secondary/20 bg-secondary/5 hover:bg-secondary/10 gap-2 italic uppercase font-black text-secondary"
                >
                    <Zap className="w-4 h-4 fill-current" /> {loading ? "Đang xử lý..." : "Mở Đấu Trường"}
                </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10 rounded-[2.5rem] max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Chọn chế độ Đấu</DialogTitle>
                    <DialogDescription className="italic">
                        Tổ chức một trận chiến lý luận đầy kịch tính!
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Classic Mode */}
                    <button
                        onClick={() => handleCreateBattle('classic')}
                        className="flex items-center gap-4 p-6 glass rounded-2xl border-white/5 hover:border-primary/50 transition-all text-left group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black uppercase italic text-lg leading-none mb-1">Thi đấu truyền thống</h4>
                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Nhận EXP dựa trên câu trả lời đúng</p>
                        </div>
                    </button>

                    {/* Betting Modes */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Đấu trường sinh tử (Đặt cược)</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[100, 500, 1000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handleCreateBattle('bet', amount)}
                                    className="flex flex-col items-center justify-center gap-1 p-4 glass rounded-2xl border-white/5 hover:border-secondary/50 transition-all group"
                                >
                                    <div className="text-secondary group-hover:scale-110 transition-transform flex items-center gap-2">
                                        <Coins className="w-4 h-4" />
                                        <span className="text-xl font-black italic">-{amount}</span>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Cược EXP</span>
                                </button>
                            ))}
                            <div className="p-4 glass rounded-2xl border-white/5 flex flex-col items-center justify-center opacity-40 italic cursor-not-allowed">
                                <span className="text-xs font-bold uppercase tracking-widest leading-none">Winner Takes All</span>
                                <span className="text-[8px] mt-1 uppercase font-black">Người thắng ăn cả</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, ArrowRight, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeaderboardUser {
    _id: string;
    name: string;
    points: number;
    weeklyPoints: number;
    level: number;
    isAdmin: boolean;
    image?: string;
}

export default function LeaderboardWidget() {
    const [mode, setMode] = useState<'total' | 'weekly'>('weekly');
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/leaderboard?mode=${mode}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [mode]);

    return (
        <Card className="glass border-border rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-0">
                {/* Header with toggle */}
                <div className="p-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                            <Trophy className="text-yellow-400 w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Bảng vàng</h3>
                    </div>

                    <div className="flex bg-muted p-1 rounded-xl border border-border">
                        <button
                            onClick={() => setMode('weekly')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'weekly' ? 'bg-primary text-white neo-shadow' : 'text-muted-foreground hover:text-white'
                                }`}
                        >
                            Tuần này
                        </button>
                        <button
                            onClick={() => setMode('total')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'total' ? 'bg-primary text-white neo-shadow' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Tổng hợp
                        </button>
                    </div>
                </div>

                {/* Leaderboard List */}
                <div className="px-4 pb-8">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-64 flex items-center justify-center"
                            >
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </motion.div>
                        ) : users.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-64 flex flex-col items-center justify-center text-muted-foreground italic gap-4"
                            >
                                <TrendingUp className="w-12 h-12 opacity-10" />
                                <p>Chưa có dữ liệu tranh tài...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2"
                            >
                                {users.map((user, idx) => (
                                    <div
                                        key={user._id}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent hover:border-border hover:bg-muted/50 group ${idx === 0 ? 'bg-primary/5 border-primary/10' : ''
                                            }`}
                                    >
                                        <div className="w-8 text-center shrink-0">
                                            {idx === 0 ? <Crown className="text-yellow-400 w-6 h-6 mx-auto" /> :
                                                idx === 1 ? <Medal className="text-slate-300 w-6 h-6 mx-auto" /> :
                                                    idx === 2 ? <Medal className="text-amber-600 w-6 h-6 mx-auto" /> :
                                                        <span className="text-sm font-black text-muted-foreground opacity-30">{idx + 1}</span>}
                                        </div>

                                        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center font-black uppercase text-xs">
                                            {user.name[0]}
                                        </div>

                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm truncate max-w-[120px]">{user.name}</span>
                                                {user.isAdmin && <Badge className="bg-primary/20 text-primary border-none text-[8px] h-4 px-1">AD</Badge>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="h-1 flex-grow max-w-[40px] bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (mode === 'weekly' ? user.weeklyPoints : user.points) / 10)}%` }} />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground font-medium">Lv.{user.level}</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm font-black text-primary italic">
                                                {(mode === 'weekly' ? (user.weeklyPoints || 0) : (user.points || 0)).toLocaleString()}
                                            </div>
                                            <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest opacity-50">XP</div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer link */}
                <div className="p-4 pt-0">
                    <Button asChild variant="ghost" className="w-full rounded-2xl h-12 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted group">
                        <a href="/leaderboard">
                            Xem tất cả <ArrowRight className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-1" />
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

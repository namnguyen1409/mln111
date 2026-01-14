"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Star, Shield, Medal, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AchievementBadgesWidget() {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await fetch('/api/achievements');
                if (res.ok) {
                    const data = await res.json();
                    setAchievements(data);
                }
            } catch (error) {
                console.error("Failed to fetch achievements", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    if (isLoading) {
        return (
            <Card className="glass border-white/5 rounded-[2.5rem] p-8 animate-pulse">
                <div className="h-6 w-48 bg-white/5 rounded mb-8" />
                <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-2xl" />
                    ))}
                </div>
            </Card>
        );
    }

    if (achievements.length === 0) return null;

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'text-slate-400';
            case 'rare': return 'text-blue-400';
            case 'epic': return 'text-purple-400';
            case 'legendary': return 'text-yellow-400';
            default: return 'text-slate-400';
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'shadow-none';
            case 'rare': return 'shadow-[0_0_15px_rgba(96,165,250,0.3)]';
            case 'epic': return 'shadow-[0_0_20px_rgba(192,132,252,0.4)]';
            case 'legendary': return 'shadow-[0_0_25px_rgba(250,204,21,0.5)]';
            default: return 'shadow-none';
        }
    };

    return (
        <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl" />

            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    <Trophy className="text-yellow-400" /> Huy hiệu danh dự
                </CardTitle>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
                    {achievements.filter(a => a.isEarned).length} / {achievements.length} Đã mở khóa
                </div>
            </CardHeader>

            <CardContent className="px-0">
                <TooltipProvider>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
                        {achievements.map((achievement, idx) => (
                            <Tooltip key={achievement._id}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`relative group cursor-help`}
                                    >
                                        <div className={`aspect-square rounded-2xl flex items-center justify-center border transition-all duration-500 ${achievement.isEarned
                                                ? `bg-white/10 border-white/20 ${getRarityGlow(achievement.rarity)}`
                                                : 'bg-black/40 border-dashed border-white/5 grayscale'
                                            }`}>
                                            {achievement.isEarned ? (
                                                <div className={`text-3xl md:text-4xl ${getRarityColor(achievement.rarity)} group-hover:scale-110 transition-transform`}>
                                                    {achievement.icon.length > 2 ? <Sparkles /> : achievement.icon}
                                                </div>
                                            ) : (
                                                <Lock className="w-6 h-6 text-white/10" />
                                            )}

                                            {achievement.isEarned && (
                                                <div className="absolute -top-1 -right-1">
                                                    <div className={`w-3 h-3 rounded-full ${achievement.rarity === 'legendary' ? 'bg-yellow-400 animate-pulse' :
                                                            achievement.rarity === 'epic' ? 'bg-purple-400' : 'hidden'
                                                        }`} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="glass border-white/10 p-4 rounded-xl space-y-1 max-w-[200px]">
                                    <div className="flex justify-between items-center gap-4">
                                        <p className="font-black italic uppercase tracking-tighter text-sm">{achievement.name}</p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${achievement.rarity === 'legendary' ? 'bg-yellow-400/20 text-yellow-400' :
                                                achievement.rarity === 'epic' ? 'bg-purple-400/20 text-purple-400' :
                                                    achievement.rarity === 'rare' ? 'bg-blue-400/20 text-blue-400' : 'bg-white/10 text-slate-400'
                                            }`}>
                                            {achievement.rarity}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-tight italic">
                                        {achievement.description}
                                    </p>
                                    {!achievement.isEarned && (
                                        <div className="pt-2 border-t border-white/5 mt-2">
                                            <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
                                                Yêu cầu: {achievement.requirement} {achievement.type.split('_').join(' ')}
                                            </p>
                                        </div>
                                    )}
                                    {achievement.isEarned && (
                                        <div className="pt-2 border-t border-white/5 mt-2">
                                            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">
                                                Đạt được: {new Date(achievement.earnedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}

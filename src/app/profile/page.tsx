"use client";

import React, { useState } from 'react';
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Flame, Star, BookOpen, Target, ShieldCheck, LogOut, ChevronRight } from 'lucide-react';
import { signOut } from "next-auth/react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DailyTasksWidget from '@/components/tasks/DailyTasksWidget';
import AchievementBadgesWidget from '@/components/profile/AchievementBadgesWidget';
import PointHistory from '@/components/profile/PointHistory';
import ShareButtons from '@/components/ui/ShareButtons';

export default function ProfilePage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div className="p-24 text-center font-black animate-pulse">ĐANG TẢI DỮ LIỆU TRI THỨC...</div>;
    }

    if (!session) {
        return (
            <div className="p-24 text-center space-y-6">
                <h1 className="text-3xl font-black italic">BẠN CHƯA ĐĂNG NHẬP</h1>
                <Button asChild className="neo-shadow h-14 px-8 rounded-2xl font-bold">
                    <Link href="/">Quay về trang chủ</Link>
                </Button>
            </div>
        );
    }

    const { user } = session as any;

    // Level calculation details
    const pointsPerLevel = 1000;
    const currentLevel = user.level || 1;
    const totalPoints = user.points || 0;
    const progressToNext = (totalPoints % pointsPerLevel) / pointsPerLevel * 100;
    const pointsNeeded = pointsPerLevel - (totalPoints % pointsPerLevel);

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <Avatar className="w-32 h-32 border-4 border-primary/20 neo-shadow ring-8 ring-white/5">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="text-4xl font-black bg-primary/20">{user.name?.[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-grow space-y-2 text-center md:text-left z-10">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">{user.name}</h1>
                        {user.isAdmin && (
                            <div className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Admin
                            </div>
                        )}
                    </div>
                    <p className="text-muted-foreground font-mono">{user.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span className="font-bold text-sm tracking-tighter uppercase italic">{user.streak || 0} Ngày Streak</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            <span className="font-bold text-sm tracking-tighter uppercase italic">Hạng {currentLevel}</span>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-center md:justify-start">
                        <ShareButtons
                            title={`Hồ sơ Triết gia: ${user.name}`}
                            text={`Tôi đang đạt cấp độ ${user.level} tại Triết Học PlayHub. Cùng học Triết học Mác-Lênin với tôi nhé! 🚀`}
                        />
                    </div>
                </div>

                <Button
                    variant="ghost"
                    onClick={() => signOut()}
                    className="absolute top-6 right-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full h-12 w-12 p-0"
                >
                    <LogOut className="w-6 h-6" />
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Progress Card */}
                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <Star className="text-yellow-400 fill-yellow-400" /> Tiến trình học tập
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 space-y-12">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="text-muted-foreground text-xs font-black uppercase tracking-widest">Cấp độ hiện tại</div>
                                        <div className="text-5xl font-black italic tracking-tighter text-primary">LVL {currentLevel}</div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="text-muted-foreground text-xs font-black uppercase tracking-widest">Tổng EXP</div>
                                        <div className="text-3xl font-black tracking-tighter">{totalPoints.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Progress value={progressToNext} className="h-6 bg-white/5 rounded-full border border-white/5 overflow-hidden ring-4 ring-white/5" />
                                    <div className="flex justify-between text-xs font-bold font-mono text-muted-foreground tracking-widest">
                                        <span>{totalPoints % pointsPerLevel} EXP</span>
                                        <span>CÒN {pointsNeeded} EXP ĐỂ LÊN CẤP {currentLevel + 1}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-3 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2 text-primary">
                                        <BookOpen className="w-5 h-5" />
                                        <span className="text-xs font-black uppercase tracking-widest">Khám phá</span>
                                    </div>
                                    <div className="text-2xl font-black tracking-tighter italic uppercase">Learn Fast</div>
                                    <Button variant="link" className="p-0 h-auto text-primary text-xs font-bold group" asChild>
                                        <Link href="/learn">Bắt đầu học <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
                                    </Button>
                                </div>
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-3 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2 text-secondary">
                                        <Target className="w-5 h-5" />
                                        <span className="text-xs font-black uppercase tracking-widest">Thử thách</span>
                                    </div>
                                    <div className="text-2xl font-black tracking-tighter italic uppercase">Quiz Battles</div>
                                    <Button variant="link" className="p-0 h-auto text-secondary text-xs font-bold group" asChild>
                                        <Link href="/quiz">Vào đấu trường <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily Tasks Widget */}
                    <DailyTasksWidget />

                    {/* Achievement Badges Widget */}
                    <AchievementBadgesWidget />

                    {/* Point History Log */}
                    <PointHistory />
                </div>

                {/* Achievements/Stats Widget */}
                <div className="space-y-8">
                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Flame className="w-3 h-3 text-orange-500 fill-orange-500" /> Streak của bạn
                        </div>
                        <div className="flex items-end gap-3 px-2">
                            <span className="text-6xl font-black italic tracking-tighter leading-none">{user.streak || 0}</span>
                            <span className="text-xl font-bold uppercase tracking-tighter text-muted-foreground mb-1">Ngày</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic px-2">Duy trì streak bằng cách đăng nhập và hoàn thành ít nhất 1 bài học mỗi ngày!</p>
                    </Card>

                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Trophy className="w-3 h-3 text-yellow-400" /> Thống kê vĩ đại
                        </div>
                        <div className="space-y-4 px-2">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm font-bold text-muted-foreground font-mono tracking-tighter">Xếp hạng cao nhất</span>
                                <span className="text-sm font-black text-primary">LVL {currentLevel}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-sm font-bold text-muted-foreground font-mono tracking-tighter">Thử thách đã vượt</span>
                                <span className="text-sm font-black text-secondary">SẮP RA MẮT</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-muted-foreground font-mono tracking-tighter">Ngày tham gia</span>
                                <span className="text-sm font-black">{new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

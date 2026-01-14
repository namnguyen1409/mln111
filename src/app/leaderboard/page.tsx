import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, ChevronLeft, ArrowRight } from "lucide-react";
import { getLeaderboard, getUserRank } from "@/lib/services/userService";
import { auth } from "@/lib/auth";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
    const { mode: modeParam } = await searchParams;
    const mode = (modeParam === 'weekly' ? 'weekly' : 'total') as 'total' | 'weekly';
    const session = await auth();
    const leaderboard = await getLeaderboard(50, mode);
    const currentUserRank = session?.user?.email ? await getUserRank(session.user.email, mode) : null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="space-y-4">
                <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                    <Link href="/" className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Trang chủ
                    </Link>
                </Button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                            <Trophy className="text-yellow-400 w-12 h-12" /> Bảng xếp hạng
                        </h1>
                        <p className="text-muted-foreground italic">Top những "Triết gia" xuất sắc nhất hệ thống.</p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                        <Link
                            href="/leaderboard?mode=weekly"
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'weekly' ? 'bg-primary text-white neo-shadow' : 'text-muted-foreground hover:text-white'
                                }`}
                        >
                            Tuần này
                        </Link>
                        <Link
                            href="/leaderboard?mode=total"
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${mode === 'total' ? 'bg-primary text-white neo-shadow' : 'text-muted-foreground hover:text-white'
                                }`}
                        >
                            Tổng hợp
                        </Link>
                    </div>
                </div>

                {currentUserRank && (
                    <div className="glass px-6 py-4 rounded-2xl border-primary/20 bg-primary/5 flex items-center gap-4 max-w-fit">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Hạng của bạn</p>
                            <p className="text-2xl font-black text-primary">#{currentUserRank.rank}</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Điểm {mode === 'weekly' ? 'tuần' : 'tổng'}</p>
                            <p className="text-2xl font-black">{(currentUserRank.points || 0).toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 gap-4">
                {leaderboard.length === 0 ? (
                    <div className="py-20 text-center glass rounded-[3rem] text-muted-foreground italic">
                        Chưa có dữ liệu xếp hạng. Hãy là người đầu tiên!
                    </div>
                ) : (
                    leaderboard.map((user, idx) => (
                        <Card key={user._id.toString()} className={`glass border-white/5 overflow-hidden transition-all duration-300 hover:scale-[1.01] ${idx < 3 ? 'border-primary/20 bg-primary/5 shadow-[0_0_30px_rgba(157,0,255,0.05)]' : ''}`}>
                            <CardContent className="p-6 flex items-center gap-6">
                                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                    {idx === 0 ? <Crown className="text-yellow-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" /> :
                                        idx === 1 ? <Medal className="text-slate-300 w-8 h-8" /> :
                                            idx === 2 ? <Medal className="text-amber-600 w-8 h-8" /> :
                                                <span className="text-2xl font-black text-muted-foreground opacity-20">{idx + 1}</span>}
                                </div>

                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-xl font-black uppercase italic overflow-hidden">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name[0]
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black tracking-tight">{user.name}</h3>
                                        {user.isAdmin && <Badge className="bg-primary/20 text-primary border-none text-[10px] h-5">ADMIN</Badge>}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1.5 opacity-60">
                                        <ArrowRight className="w-3 h-3" /> Cấp độ {user.level || 1}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-black text-primary italic">
                                        {((mode === 'weekly' ? (user.weeklyPoints || 0) : (user.points || 0))).toLocaleString()}
                                        <span className="text-sm font-bold opacity-50 ml-1">XP</span>
                                    </div>
                                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                        {mode === 'weekly' ? 'Tuần này' : 'Tích lũy'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {!session && (
                <div className="glass p-12 rounded-[3.5rem] border-white/10 text-center space-y-6 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <h4 className="text-3xl font-black italic uppercase tracking-tighter">Bạn muốn ghi danh?</h4>
                    <p className="text-muted-foreground max-w-md mx-auto italic">Đăng nhập để lưu trữ tiến trình học tập, nhận EXP và tranh tài cùng cộng đồng Triết Học PlayHub.</p>
                    <Button asChild size="lg" className="h-16 neo-shadow rounded-2xl font-black px-12 text-xl bg-primary hover:bg-primary/90">
                        <Link href="/api/auth/signin">Đăng nhập ngay 🚀</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

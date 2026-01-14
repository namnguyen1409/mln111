"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, LogOut, LogIn, Settings, LayoutDashboard, Brain, Flame, Trophy } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";

export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="w-full h-20 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 md:px-12 fixed top-0 left-0 z-[1000]">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center neo-shadow group-hover:scale-110 transition-transform">
                    <Brain className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-black italic uppercase tracking-tighter hidden md:block">
                    Play<span className="text-primary">Hub</span>
                </span>
            </Link>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    <Link href="/learn" className="hover:text-primary transition-colors">Học tập</Link>
                    <Link href="/quiz" className="hover:text-primary transition-colors">Thử thách</Link>
                    <Link href="/review" className="hover:text-primary transition-colors">Ôn tập</Link>
                </div>

                {status === "loading" ? (
                    <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                ) : session ? (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                                <Avatar className="h-10 w-10 border-2 border-primary/20">
                                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                    <AvatarFallback className="bg-white/5 text-xs">
                                        {session.user?.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 glass border-white/10 mt-2 p-2 rounded-2xl" align="end">
                            <div className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm truncate">{session.user?.name}</h4>
                                    <p className="text-[10px] text-muted-foreground truncate uppercase font-black tracking-widest">{session.user?.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                                        <p className="text-[8px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                                            <Trophy className="w-2.5 h-2.5" /> EXP
                                        </p>
                                        <p className="text-sm font-black italic">{(session.user as any).points || 0}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
                                        <p className="text-[8px] font-black uppercase text-orange-500 tracking-widest flex items-center gap-1">
                                            <Flame className="w-2.5 h-2.5" /> Streak
                                        </p>
                                        <p className="text-sm font-black italic">{(session.user as any).streak || 0}d</p>
                                    </div>
                                </div>

                                {(session.user as any).isAdmin && (
                                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] font-black uppercase w-full justify-center py-1">Admin</Badge>
                                )}
                            </div>
                            <div className="h-px bg-white/5 my-1" />
                            {(session.user as any).isAdmin && (
                                <Link href="/admin">
                                    <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-white/5">
                                        <Settings className="w-4 h-4" /> Quản trị Hub
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
                                onClick={() => signOut()}
                            >
                                <LogOut className="w-4 h-4" /> Đăng xuất
                            </Button>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Button
                        className="neo-shadow rounded-xl font-bold h-10 px-6"
                        onClick={() => signIn("google")}
                    >
                        <LogIn className="mr-2 w-4 h-4" /> Đăng nhập
                    </Button>
                )}
            </div>
        </nav>
    );
}

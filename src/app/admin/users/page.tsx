"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Users,
    Search,
    Shield,
    ShieldAlert,
    Trophy,
    Flame,
    ChevronLeft,
    Mail,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAdmin = async (email: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, action: 'toggleAdmin' })
            });
            if (res.ok) {
                toast.success("Đã cập nhật quyền Admin");
                fetchUsers();
            }
        } catch (error) {
            toast.error("Lỗi cập nhật");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                        <Link href="/admin"><ChevronLeft className="w-4 h-4 mr-1" /> Admin Hub</Link>
                    </Button>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Users className="text-primary w-10 h-10" /> Quản lý Sinh viên
                    </h1>
                    <p className="text-muted-foreground italic">Theo dõi tiến độ, điểm thưởng và streak của các thành viên.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:border-primary outline-none transition-all"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="text-center py-20 glass rounded-[3rem] border-white/5 animate-pulse">
                        Đang đồng bộ dữ liệu người dùng...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-20 glass rounded-[3rem] border-white/5 text-muted-foreground italic">
                        Không tìm thấy sinh viên nào.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user) => (
                            <Card key={user._id} className="glass border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/50 transition-all">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <Avatar className="h-20 w-20 border-4 border-white/5 neo-shadow shrink-0">
                                            <AvatarImage src={user.image} />
                                            <AvatarFallback className="text-xl font-bold">{user.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-end gap-2">
                                            {user.isAdmin ? (
                                                <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5 rounded-full px-3 py-1">
                                                    <Shield className="w-3 h-3" /> Admin
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="opacity-40 rounded-full px-3 py-1">Sinh viên</Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black italic uppercase tracking-tight truncate">{user.name}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                                            <Mail className="w-3 h-3" /> {user.email}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-1.5">
                                                <Trophy className="w-3 h-3" /> Điểm (EXP)
                                            </p>
                                            <p className="text-xl font-black italic text-primary">{user.points.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/60 flex items-center gap-1.5">
                                                <Flame className="w-3 h-3" /> Streak
                                            </p>
                                            <p className="text-xl font-black italic text-orange-500">{user.streak} ngày</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Cấp độ</span>
                                            <span>LV. {user.level || 1}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                                                style={{ width: `${(user.points % 1000) / 10}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            variant="outline"
                                            className="flex-grow rounded-xl text-xs h-10 border-white/10 hover:border-primary/50"
                                            onClick={() => handleToggleAdmin(user.email)}
                                        >
                                            {user.isAdmin ? "Gỡ Admin" : "Cấp Admin"}
                                        </Button>
                                        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-white/10" asChild>
                                            <Link href={`mailto:${user.email}`}><Mail className="w-4 h-4" /></Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, Edit2, FileText, Search, BookOpen, Layers, Zap, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function TopicsListPage() {
    const [topics, setTopics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isCreatingBattle, setIsCreatingBattle] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/topics');
            if (res.ok) {
                const data = await res.json();
                setTopics(data);
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể tải danh sách bài học", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/admin/topics/${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Thành công", description: "Đã xóa bài học" });
                setTopics(topics.filter(t => t._id !== deleteId));
                setDeleteId(null);
            } else {
                throw new Error("Lỗi khi xóa");
            }
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        }
    };

    const handleCreateBattle = async (topicId: string, topicSlug: string) => {
        setIsCreatingBattle(topicId);
        try {
            const res = await fetch('/api/battles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topicId, topicSlug }),
            });
            if (res.ok) {
                const battle = await res.json();
                router.push(`/admin/battles/${battle.code}`);
            } else {
                throw new Error("Failed to create battle");
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể tạo trận đấu.", variant: "destructive" });
        } finally {
            setIsCreatingBattle(null);
        }
    };

    const filteredTopics = topics.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                        <Link href="/admin"><ChevronLeft className="w-4 h-4 mr-1" /> Admin Hub</Link>
                    </Button>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Quản lý Bài học</h1>
                    <p className="text-muted-foreground text-lg">Hệ thống hóa tri thức dành cho sinh viên.</p>
                </div>

                <Button asChild className="h-16 px-8 rounded-2xl neo-shadow font-bold text-lg bg-primary hover:bg-primary/90">
                    <Link href="/admin/topics/new"><Plus className="mr-2 w-5 h-5" /> Thêm bài mới</Link>
                </Button>
            </header>

            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    placeholder="Tìm kiếm bài học theo tiêu đề hoặc danh mục..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 focus:border-primary outline-none transition-all text-lg"
                />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 glass animate-pulse rounded-[2.5rem]" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTopics.map((topic) => (
                        <Card key={topic._id} className="glass border-white/5 hover:border-primary/50 transition-all duration-500 rounded-[2.5rem] overflow-hidden group">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                        {topic.category}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10">
                                            <Link href={`/admin/topics/${topic._id}/edit`}>
                                                <Edit2 className="w-4 h-4 text-blue-400" />
                                            </Link>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:bg-yellow-500/10 text-yellow-500"
                                            onClick={() => handleCreateBattle(topic._id, topic.slug)}
                                            disabled={!!isCreatingBattle}
                                        >
                                            {isCreatingBattle === topic._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        </Button>

                                        <Dialog open={deleteId === topic._id} onOpenChange={(open) => setDeleteId(open ? topic._id : null)}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-500/10 text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="glass border-white/10">
                                                <DialogHeader>
                                                    <DialogTitle>Xóa bài học này?</DialogTitle>
                                                    <DialogDescription>
                                                        Hành động này không thể hoàn tác. Bài học "{topic.title}" sẽ bị xóa vĩnh viễn.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
                                                    <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Xóa bài</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-bold leading-tight line-clamp-2">
                                    {topic.title}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-2 italic">
                                    {topic.learningOutcome}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 pb-8 flex items-center gap-4 text-xs text-muted-foreground font-mono">
                                <div className="flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> {topic.content?.keyPoints?.length || 0} mục chính
                                </div>
                                <span>•</span>
                                <div>{new Date(topic.updatedAt).toLocaleDateString()}</div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredTopics.length === 0 && (
                        <div className="col-span-full py-24 glass rounded-[3rem] border-white/5 text-center space-y-6">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <Search className="w-10 h-10 text-muted-foreground opacity-50" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Không tìm thấy bài học</h3>
                                <p className="text-muted-foreground mt-2">Thử thay đổi từ khóa tìm kiếm của bạn.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

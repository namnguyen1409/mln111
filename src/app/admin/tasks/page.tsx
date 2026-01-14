"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit2, CheckCircle2, XCircle, Zap, BookOpen, MessageSquare, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        type: 'read_article',
        requirement: 0,
        expReward: 0,
        isActive: true
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/tasks');
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể tải danh sách nhiệm vụ", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (task: any = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                type: task.type,
                requirement: task.requirement,
                expReward: task.expReward,
                isActive: task.isActive
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                type: 'read_article',
                requirement: 600, // Default 10 mins
                expReward: 50,
                isActive: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingTask ? `/api/admin/tasks/${editingTask._id}` : '/api/admin/tasks';
        const method = editingTask ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast({ title: "Thành công", description: editingTask ? "Đã cập nhật nhiệm vụ" : "Đã tạo nhiệm vụ mới" });
                setIsDialogOpen(false);
                fetchTasks();
            } else {
                throw new Error("Lỗi khi lưu");
            }
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này?")) return;
        try {
            const res = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Thành công", description: "Đã xóa nhiệm vụ" });
                fetchTasks();
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Lỗi khi xóa", variant: "destructive" });
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'read_article': return <BookOpen className="w-5 h-5 text-primary" />;
            case 'comment': return <MessageSquare className="w-5 h-5 text-secondary" />;
            case 'quiz_complete': return <Target className="w-5 h-5 text-accent" />;
            default: return <Zap className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getTypeName = (type: string) => {
        switch (type) {
            case 'read_article': return 'Đọc bài viết';
            case 'comment': return 'Để lại thảo luận';
            case 'quiz_complete': return 'Hoàn thành Quiz';
            default: return type;
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Quản lý nhiệm vụ</h1>
                    <p className="text-muted-foreground">Cấu hình các nhiệm vụ hàng ngày để sinh viên nhận EXP.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="neo-shadow h-14 px-8 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white border-none">
                    <Plus className="w-5 h-5 mr-2" /> Tạo nhiệm vụ mới
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-64 glass animate-pulse rounded-[2.5rem]" />)
                ) : tasks.length === 0 ? (
                    <div className="col-span-full text-center py-24 glass rounded-[2.5rem] border-dashed border-white/10">
                        <p className="text-muted-foreground italic">Chưa có nhiệm vụ nào được tạo.</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <Card key={task._id} className="glass border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between group">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                        {getIcon(task.type)}
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.isActive ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                                        {task.isActive ? 'Hoạt động' : 'Tắt'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold leading-tight">{task.title}</h3>
                                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">
                                        Loại: {getTypeName(task.type)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                        <div className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter mb-1">Yêu cầu</div>
                                        <div className="text-lg font-black italic">{task.requirement} {task.type === 'read_article' ? 's' : 'lần'}</div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                        <div className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter mb-1">Thưởng</div>
                                        <div className="text-lg font-black italic text-primary">+{task.expReward} EXP</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-8 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" onClick={() => handleOpenDialog(task)} className="flex-grow rounded-xl hover:bg-white/5">
                                    <Edit2 className="w-4 h-4 mr-2" /> Sửa
                                </Button>
                                <Button variant="ghost" onClick={() => handleDelete(task._id)} className="rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass border-white/10 sm:max-w-[425px] rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                            {editingTask ? "Chỉnh sửa nhiệm vụ" : "Tạo nhiệm vụ mới"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-muted-foreground ml-1">Tiêu đề nhiệm vụ</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-colors"
                                placeholder="VD: Khám phá tri thức"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-muted-foreground ml-1">Loại nhiệm vụ</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-colors"
                            >
                                <option value="read_article" className="bg-background">Đọc bài viết (giây)</option>
                                <option value="comment" className="bg-background">Để lại thảo luận (lần)</option>
                                <option value="quiz_complete" className="bg-background">Hoàn thành Quiz (lần)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground ml-1">Giá trị yêu cầu</label>
                                <input
                                    type="number"
                                    value={formData.requirement}
                                    onChange={(e) => setFormData({ ...formData, requirement: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-colors"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground ml-1">Thưởng (EXP)</label>
                                <input
                                    type="number"
                                    value={formData.expReward}
                                    onChange={(e) => setFormData({ ...formData, expReward: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-1">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-primary"
                            />
                            <label htmlFor="isActive" className="text-sm font-bold cursor-pointer">Nhiệm vụ đang hoạt động</label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full h-14 neo-shadow rounded-2xl font-black text-lg uppercase italic">
                                {editingTask ? "Lưu thay đổi" : "Tạo nhiệm vụ"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

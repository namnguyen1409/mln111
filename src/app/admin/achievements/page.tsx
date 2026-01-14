"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Trophy, Star, Shield, Medal, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const ICONS = ["🏆", "🌟", "🛡️", "🏅", "🔥", "📜", "🧠", "💡", "🏹", "⚔️", "💎", "🧩"];
const TYPES = [
    { value: 'points', label: 'Tổng EXP' },
    { value: 'level', label: 'Cấp độ' },
    { value: 'streak', label: 'Ngày Streak' },
    { value: 'quizzes_completed', label: 'Quiz hoàn thành' },
    { value: 'comments_posted', label: 'Thảo luận đã gửi' }
];

export default function AdminAchievementsPage() {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '🏆',
        type: 'points',
        requirement: 1000,
        rarity: 'common'
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/achievements');
            if (res.ok) {
                const data = await res.json();
                setAchievements(data);
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể tải danh sách huy hiệu", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (achievement: any = null) => {
        if (achievement) {
            setEditingAchievement(achievement);
            setFormData({
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                type: achievement.type,
                requirement: achievement.requirement,
                rarity: achievement.rarity
            });
        } else {
            setEditingAchievement(null);
            setFormData({
                name: '',
                description: '',
                icon: '🏆',
                type: 'points',
                requirement: 1000,
                rarity: 'common'
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingAchievement ? `/api/admin/achievements/${editingAchievement._id}` : '/api/admin/achievements';
        const method = editingAchievement ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast({ title: "Thành công", description: editingAchievement ? "Đã cập nhật huy hiệu" : "Đã tạo huy hiệu mới" });
                setIsDialogOpen(false);
                fetchAchievements();
            } else {
                throw new Error("Lỗi khi lưu");
            }
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa huy hiệu này?")) return;
        try {
            const res = await fetch(`/api/admin/achievements/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast({ title: "Thành công", description: "Đã xóa huy hiệu" });
                fetchAchievements();
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Lỗi khi xóa", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Quản lý Huy hiệu</h1>
                    <p className="text-muted-foreground">Thiết kế các danh hiệu và cột mốc để vinh danh sinh viên.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="neo-shadow h-14 px-8 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white border-none">
                    <Plus className="w-5 h-5 mr-2" /> Tạo huy hiệu mới
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-64 glass animate-pulse rounded-[2.5rem]" />)
                ) : achievements.length === 0 ? (
                    <div className="col-span-full text-center py-24 glass rounded-[2.5rem] border-dashed border-white/10">
                        <p className="text-muted-foreground italic">Chưa có huy hiệu nào được thiết kế.</p>
                    </div>
                ) : (
                    achievements.map((achievement) => (
                        <Card key={achievement._id} className="glass border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 p-2 text-[8px] font-black uppercase tracking-widest ${achievement.rarity === 'legendary' ? 'bg-yellow-400/20 text-yellow-400' :
                                achievement.rarity === 'epic' ? 'bg-purple-400/20 text-purple-400' :
                                    achievement.rarity === 'rare' ? 'bg-blue-400/20 text-blue-400' : 'bg-white/10 text-slate-400'
                                }`}>
                                {achievement.rarity}
                            </div>

                            <div className="space-y-6">
                                <div className="text-5xl">{achievement.icon}</div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold leading-tight">{achievement.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 italic">{achievement.description}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                    <div className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter mb-1">Mục tiêu</div>
                                    <div className="text-sm font-bold">{achievement.requirement} {TYPES.find(t => t.value === achievement.type)?.label}</div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-8 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" onClick={() => handleOpenDialog(achievement)} className="flex-grow rounded-xl hover:bg-white/5">
                                    <Edit2 className="w-4 h-4 mr-2" /> Sửa
                                </Button>
                                <Button variant="ghost" onClick={() => handleDelete(achievement._id)} className="rounded-xl hover:bg-red-500/10 hover:text-red-500 text-muted-foreground">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="glass border-white/10 sm:max-w-[450px] rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                            {editingAchievement ? "Chỉnh sửa huy hiệu" : "Thiết kế huy hiệu"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-muted-foreground ml-1">Tên huy hiệu</label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-colors"
                                placeholder="VD: Chiến thần lý luận"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-muted-foreground ml-1">Mô tả (Cách đạt được)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-colors h-20 resize-none"
                                placeholder="VD: Đạt 10.000 EXP tổng để nhận danh xưng này."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-black uppercase text-muted-foreground ml-1">Biểu tượng (Emoji hoặc Icon name)</label>
                                <div className="space-y-4">
                                    <input
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary transition-colors text-2xl text-center"
                                        placeholder="🏆"
                                        required
                                    />
                                    <div className="flex flex-wrap gap-2 p-3 glass rounded-2xl border-white/5">
                                        {ICONS.map(i => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: i })}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${formData.icon === i ? 'bg-primary text-white scale-110 neo-shadow' : 'bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                {i}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-black uppercase text-muted-foreground ml-1">Độ hiếm</label>
                                <select
                                    value={formData.rarity}
                                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary"
                                >
                                    <option value="common">Common (Xám)</option>
                                    <option value="rare">Rare (Xanh)</option>
                                    <option value="epic">Epic (Tím)</option>
                                    <option value="legendary">Legendary (Vàng)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground ml-1">Loại điều kiện</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary"
                                >
                                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-muted-foreground ml-1">Yêu cầu (Số)</label>
                                <input
                                    type="number"
                                    value={formData.requirement}
                                    onChange={(e) => setFormData({ ...formData, requirement: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:border-primary"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full h-14 neo-shadow rounded-2xl font-black text-lg uppercase italic">
                                {editingAchievement ? "Lưu thay đổi" : "Tạo huy hiệu"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
}

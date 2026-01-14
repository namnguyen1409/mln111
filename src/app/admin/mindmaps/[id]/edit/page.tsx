"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Save, Brain, Plus, Trash2, MousePointer2, Move, Settings2, FileJson, Upload, Bot, ArrowRight, Maximize2, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import MindMap from '@/components/mind-map/MindMap';
import { autoLayout } from '@/lib/utils/mindMapLayout';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from '@/components/ui/badge';

interface Node {
    id: string;
    label: string;
    type: "root" | "principle" | "law" | "category" | "detail";
    description?: string;
    x: number;
    y: number;
}

interface Connection {
    from: string;
    to: string;
}

export default function EditMindMapPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        nodes: [] as Node[],
        connections: [] as Connection[]
    });

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    useEffect(() => {
        const fetchMindMap = async () => {
            try {
                const res = await fetch(`/api/admin/mindmaps/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData(data);
                    if (data.nodes.length > 0) setSelectedNodeId(data.nodes[0].id);
                } else {
                    toast.error("Không tìm thấy sơ đồ");
                    router.push('/admin/mindmaps');
                }
            } catch (error) {
                toast.error("Lỗi tải dữ liệu");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchMindMap();
    }, [id, router]);

    const addNode = () => {
        const newNodeId = `node-${Date.now()}`;
        const parentNode = formData.nodes.find(n => n.id === selectedNodeId) || formData.nodes[0];

        const newNode: Node = {
            id: newNodeId,
            label: 'Kiến thức mới',
            type: 'detail',
            x: parentNode.x + (Math.random() - 0.5) * 400,
            y: parentNode.y + (Math.random() - 0.5) * 400,
            description: ''
        };

        setFormData(prev => ({
            ...prev,
            nodes: [...prev.nodes, newNode],
            connections: selectedNodeId ? [...prev.connections, { from: selectedNodeId, to: newNodeId }] : prev.connections
        }));
        setSelectedNodeId(newNodeId);
    };

    const removeNode = (nodeId: string) => {
        if (nodeId === 'root' || formData.nodes.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            nodes: prev.nodes.filter(n => n.id !== nodeId),
            connections: prev.connections.filter(c => c.from !== nodeId && c.to !== nodeId)
        }));
        if (selectedNodeId === nodeId) setSelectedNodeId(formData.nodes[0].id);
    };

    const updateNode = (field: string, value: any) => {
        if (!selectedNodeId) return;
        setFormData(prev => ({
            ...prev,
            nodes: prev.nodes.map(n => n.id === selectedNodeId ? { ...n, [field]: value } : n)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/mindmaps/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success("Đã cập nhật sơ đồ!");
                router.push('/admin/mindmaps');
            } else {
                toast.error("Lỗi khi cập nhật");
            }
        } catch (error) {
            toast.error("Lỗi kết nối");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedNode = formData.nodes.find(n => n.id === selectedNodeId);

    const handleImportJson = () => {
        try {
            const data = JSON.parse(jsonInput);
            setFormData({ ...data, _id: (formData as any)._id });
            setIsImportModalOpen(false);
            setJsonInput('');
            toast.success("Đã nhập dữ liệu thành công!");
        } catch (error) {
            toast.error("JSON không hợp lệ.");
        }
    };

    const handleAutoLayout = () => {
        const layoutedNodes = autoLayout(formData.nodes, formData.connections);
        setFormData(prev => ({
            ...prev,
            nodes: layoutedNodes
        }));
        toast.success("Đã tự động sắp xếp sơ đồ!");
    };

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-[#0a0a0a] text-muted-foreground animate-pulse font-black italic uppercase tracking-tighter text-2xl">Đang nạp tri thức...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col animate-fade-in bg-[#0a0a0a] pb-20">
            {/* Header Toolset */}
            <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-background/50 z-[100] backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:bg-white/5">
                        <Link href="/admin/mindmaps"><ChevronLeft className="w-4 h-4 mr-2" /> Quay lại</Link>
                    </Button>
                    <div className="h-8 w-px bg-white/10" />
                    <div>
                        <input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-transparent border-none outline-none font-black text-xl italic uppercase tracking-tighter w-64 focus:text-primary transition-colors text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="rounded-xl border-white/10 bg-white/5 h-10 gap-2">
                        <Upload className="w-4 h-4" /> Nhập JSON
                    </Button>
                    <Button variant="outline" onClick={handleAutoLayout} className="rounded-xl border-primary/20 bg-primary/5 text-primary h-10 gap-2 font-bold hover:bg-primary/20">
                        <Wand2 className="w-4 h-4" /> Tự sắp xếp
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl neo-shadow h-10 px-6 font-bold bg-primary hover:bg-primary/90">
                        {isSubmitting ? "Đang lưu..." : "Cập nhật Sơ Đồ"} <Save className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto w-full px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Node & Connection Management */}
                <div className="lg:col-span-4 space-y-8">
                    <Tabs defaultValue="nodes" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 glass p-1 rounded-xl mb-6">
                            <TabsTrigger value="nodes" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Danh sách Node</TabsTrigger>
                            <TabsTrigger value="connections" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Kết nối</TabsTrigger>
                        </TabsList>

                        <TabsContent value="nodes" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-50 px-2">Cấu trúc thực thể</h3>
                                <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 rounded-lg gap-2" onClick={addNode}>
                                    <Plus className="w-3.5 h-3.5" /> Thêm Node
                                </Button>
                            </div>

                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-4">
                                    {formData.nodes.map((node) => (
                                        <Card key={node.id} className={`glass border-white/5 transition-all ${selectedNodeId === node.id ? 'border-primary/50 ring-1 ring-primary/20 bg-primary/5' : 'hover:border-white/10'}`}>
                                            <CardContent className="p-4 space-y-4" onClick={() => setSelectedNodeId(node.id)}>
                                                <div className="flex justify-between items-center">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase opacity-60 text-white">{node.type}</Badge>
                                                    {node.id !== 'root' && (
                                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <input
                                                    value={node.label}
                                                    onChange={(e) => updateNode('label', e.target.value)}
                                                    className="w-full bg-transparent border-none font-bold text-sm focus:text-primary outline-none text-white"
                                                    placeholder="Nhãn node..."
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                                                        <span className="text-[8px] font-black opacity-30">X</span>
                                                        <input
                                                            type="number"
                                                            value={node.x}
                                                            onChange={(e) => updateNode('x', parseInt(e.target.value))}
                                                            className="w-full bg-transparent text-[10px] font-bold outline-none text-white"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                                                        <span className="text-[8px] font-black opacity-30">Y</span>
                                                        <input
                                                            type="number"
                                                            value={node.y}
                                                            onChange={(e) => updateNode('y', parseInt(e.target.value))}
                                                            className="w-full bg-transparent text-[10px] font-bold outline-none text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="connections" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground opacity-50 px-2">Các mối liên kết</h3>
                                <Button size="sm" variant="ghost" className="text-secondary hover:bg-secondary/10 rounded-lg gap-2" onClick={() => {
                                    if (formData.nodes.length < 2) return;
                                    setFormData({
                                        ...formData,
                                        connections: [...formData.connections, { from: formData.nodes[0].id, to: formData.nodes[1].id }]
                                    });
                                }}>
                                    <Plus className="w-3.5 h-3.5" /> Thêm Liên Kết
                                </Button>
                            </div>

                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-3">
                                    {formData.connections.map((conn, idx) => (
                                        <div key={idx} className="glass border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3">
                                            <select
                                                value={conn.from}
                                                onChange={(e) => {
                                                    const newConns = [...formData.connections];
                                                    newConns[idx].from = e.target.value;
                                                    setFormData({ ...formData, connections: newConns });
                                                }}
                                                className="bg-white/5 text-[10px] font-bold border-none rounded-lg p-2 flex-grow appearance-none outline-none text-white"
                                            >
                                                {formData.nodes.map(n => <option key={n.id} value={n.id} className="bg-slate-900">{n.label}</option>)}
                                            </select>
                                            <ArrowRight className="w-4 h-4 opacity-20" />
                                            <select
                                                value={conn.to}
                                                onChange={(e) => {
                                                    const newConns = [...formData.connections];
                                                    newConns[idx].to = e.target.value;
                                                    setFormData({ ...formData, connections: newConns });
                                                }}
                                                className="bg-white/5 text-[10px] font-bold border-none rounded-lg p-2 flex-grow appearance-none outline-none text-white"
                                            >
                                                {formData.nodes.map(n => <option key={n.id} value={n.id} className="bg-slate-900">{n.label}</option>)}
                                            </select>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10 shrink-0" onClick={() => {
                                                const newConns = formData.connections.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, connections: newConns });
                                            }}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Side: Visual Preview & Detailed Editing */}
                <div className="lg:col-span-8 space-y-10">
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <Maximize2 className="text-primary w-5 h-5" />
                            <h2 className="text-xl font-black italic uppercase tracking-tight">Cấu trúc hiển thị thực tế</h2>
                            <Badge variant="outline" className="ml-auto text-primary border-primary/30 opacity-60">LIVE PREVIEW</Badge>
                        </div>
                        <div className="rounded-[3.5rem] overflow-hidden border-4 border-white/5 neo-shadow relative group">
                            <MindMap
                                data={formData}
                                editable={true}
                                onNodeUpdate={(nodeId, updates) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
                                    }));
                                }}
                            />
                            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/10 rounded-[3.5rem] z-10" />
                        </div>
                    </section>

                    {selectedNode && (
                        <Card className="glass border-white/5 rounded-[3rem] p-10 space-y-8 bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-primary">
                                    <Settings2 className="w-8 h-8" /> Hiệu chỉnh tri thức
                                </h2>
                                <Badge className="bg-white/10 text-white font-mono px-3">NODE: {selectedNode.id}</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Cấp độ tri thức</label>
                                        <select
                                            value={selectedNode.type}
                                            onChange={(e) => updateNode('type', e.target.value as any)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none font-bold text-white appearance-none bg-slate-900"
                                        >
                                            <option value="root">ROOT (Trung tâm)</option>
                                            <option value="principle">PRINCIPLE (Nguyên lý)</option>
                                            <option value="law">LAW (Quy luật)</option>
                                            <option value="category">CATEGORY (Phạm trù)</option>
                                            <option value="detail">DETAIL (Chi tiết)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Tọa độ không gian (X, Y)</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <input type="number" value={selectedNode.x} onChange={(e) => updateNode('x', parseInt(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-black text-center text-primary" />
                                                <span className="absolute top-1/2 -translate-y-1/2 left-4 text-[8px] font-black opacity-30">X</span>
                                            </div>
                                            <div className="relative">
                                                <input type="number" value={selectedNode.y} onChange={(e) => updateNode('y', parseInt(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-black text-center text-primary" />
                                                <span className="absolute top-1/2 -translate-y-1/2 left-4 text-[8px] font-black opacity-30">Y</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-1">Nội dung chi tiết</label>
                                    <textarea
                                        value={selectedNode.description || ''}
                                        onChange={(e) => updateNode('description', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-primary outline-none text-base h-[156px] resize-none leading-relaxed text-slate-300"
                                        placeholder="Nhập nội dung giảng giải chi tiết cho node này..."
                                    />
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </main>

            {/* Import Modal */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="glass border-white/10 max-w-2xl rounded-[3rem]">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Đồng bộ tri thức (JSON)</DialogTitle>
                        <DialogDescription className="italic">Dán mã cấu trúc Sơ đồ mới để thay thế dữ liệu hiện tại.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all h-80 font-mono text-xs text-primary bg-black/40"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsImportModalOpen(false)} className="rounded-xl">Hủy</Button>
                        <Button onClick={handleImportJson} className="rounded-xl neo-shadow px-10 font-black italic uppercase tracking-tight bg-primary hover:bg-primary/90">Đồng bộ ngay 🧬</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

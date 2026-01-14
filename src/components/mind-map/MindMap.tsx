"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

interface Node {
    id: string;
    label: string;
    type: "root" | "principle" | "law" | "category" | "detail";
    description?: string;
    x: number;
    y: number;
    color?: string;
}

interface Connection {
    from: string;
    to: string;
}

interface MindMapProps {
    data: {
        title: string;
        nodes: Node[];
        connections: Connection[];
    };
    editable?: boolean;
    onNodeUpdate?: (nodeId: string, updates: Partial<Node>) => void;
}

export default function MindMap({ data, editable = false, onNodeUpdate }: MindMapProps) {
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [zoom, setZoom] = useState(1);
    const svgRef = useRef<SVGSVGElement>(null);

    const { nodes, connections } = data;

    const getNodeColor = (type: Node["type"]) => {
        switch (type) {
            case "root": return "var(--primary)";
            case "principle": return "var(--secondary)";
            case "law": return "var(--accent)";
            case "category": return "#A855F7"; // Purple
            default: return "var(--muted-foreground)";
        }
    };

    const getNodeSize = (type: Node["type"]) => {
        switch (type) {
            case "root": return 100;
            case "principle": return 80;
            case "law": return 75;
            case "category": return 65;
            default: return 55;
        }
    };

    return (
        <div className="relative w-full h-[700px] glass rounded-[3rem] border-white/10 overflow-hidden cursor-grab active:cursor-grabbing bg-[radial-gradient(circle_at_center,rgba(110,86,207,0.05)_0%,transparent_70%)]">
            {/* Control Overlay */}
            <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 rounded-full text-sm font-black italic uppercase tracking-widest">{data.title}</Badge>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="glass h-10 w-10 rounded-xl" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}><ZoomIn className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="glass h-10 w-10 rounded-xl" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}><ZoomOut className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="glass h-10 w-10 rounded-xl" onClick={() => setZoom(1)}><Maximize2 className="w-4 h-4" /></Button>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 z-20 glass p-4 rounded-2xl border-white/5 space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Chú giải</h5>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-xs font-bold"><div className="w-3 h-3 rounded-full bg-primary" /> Trung tâm</div>
                    <div className="flex items-center gap-3 text-xs font-bold"><div className="w-3 h-3 rounded-full bg-secondary" /> Nguyên lý</div>
                    <div className="flex items-center gap-3 text-xs font-bold"><div className="w-3 h-3 rounded-full bg-accent" /> Quy luật</div>
                </div>
            </div>

            <motion.div
                className="w-full h-full"
                style={{ scale: zoom }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <svg
                    ref={svgRef}
                    className="w-full h-full"
                    viewBox="0 0 1000 700"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="25" refY="5" orientation="auto">
                            <path d="M0,0 L10,5 L0,10 Z" fill="rgba(255,255,255,0.1)" />
                        </marker>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Lines */}
                    {connections.map((conn, idx) => {
                        const fromNode = nodes.find(n => n.id === conn.from);
                        const toNode = nodes.find(n => n.id === conn.to);
                        if (!fromNode || !toNode) return null;

                        return (
                            <motion.line
                                key={`${conn.from}-${conn.to}`}
                                x1={fromNode.x}
                                y1={fromNode.y}
                                x2={toNode.x}
                                y2={toNode.y}
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="2"
                                initial={{
                                    pathLength: 0,
                                    opacity: 0,
                                    x1: fromNode.x,
                                    y1: fromNode.y,
                                    x2: toNode.x,
                                    y2: toNode.y
                                }}
                                animate={{
                                    pathLength: 1,
                                    opacity: 1,
                                    x1: fromNode.x,
                                    y1: fromNode.y,
                                    x2: toNode.x,
                                    y2: toNode.y
                                }}
                                transition={{
                                    pathLength: { duration: 1, delay: idx * 0.1 },
                                    opacity: { duration: 1, delay: idx * 0.1 },
                                    x1: { type: "tween", duration: 0 }, // Instant sync for drag
                                    y1: { type: "tween", duration: 0 },
                                    x2: { type: "tween", duration: 0 },
                                    y2: { type: "tween", duration: 0 }
                                }}
                            />
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map((node) => (
                        <TooltipProvider key={node.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.g
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: editable ? 1.05 : 1.1 }}
                                        className={editable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
                                        onClick={() => setSelectedNode(node)}
                                        drag={editable}
                                        dragMomentum={false}
                                        onDrag={(_, info) => {
                                            if (editable && onNodeUpdate && svgRef.current) {
                                                const svgRect = svgRef.current.getBoundingClientRect();
                                                if (svgRect.width === 0 || svgRect.height === 0) return;

                                                const scaleX = 1000 / svgRect.width;
                                                const scaleY = 700 / svgRect.height;

                                                onNodeUpdate(node.id, {
                                                    x: node.x + (info.delta.x * scaleX),
                                                    y: node.y + (info.delta.y * scaleY)
                                                });
                                            }
                                        }}
                                        style={{
                                            filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))",
                                            x: node.x,
                                            y: node.y
                                        }}
                                    >
                                        <circle
                                            cx={0}
                                            cy={0}
                                            r={getNodeSize(node.type) / 2}
                                            fill={getNodeColor(node.type)}
                                            fillOpacity="0.15"
                                            stroke={getNodeColor(node.type)}
                                            strokeWidth="2.5"
                                            className="transition-all duration-300"
                                        />
                                        <circle
                                            cx={0}
                                            cy={0}
                                            r={getNodeSize(node.type) / 2.8}
                                            fill={getNodeColor(node.type)}
                                            style={{ filter: "url(#glow)" }}
                                        />
                                        <text
                                            x={0}
                                            y={getNodeSize(node.type) / 1.5}
                                            textAnchor="middle"
                                            fill="white"
                                            className="text-[12px] font-black uppercase tracking-wider drop-shadow-md select-none pointer-events-none"
                                        >
                                            {node.label}
                                        </text>
                                    </motion.g>
                                </TooltipTrigger>
                                <TooltipContent className="glass border-white/10 p-3 rounded-xl max-w-xs">
                                    <p className="text-xs font-bold leading-relaxed">{node.description || "Nhấn để xem chi tiết"}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </svg>
            </motion.div>

            <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
                <DialogContent className="glass border-white/80 sm:max-w-xl rounded-[2.5rem] overflow-hidden">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center neo-shadow"
                                style={{ backgroundColor: selectedNode ? getNodeColor(selectedNode.type) : 'transparent' }}
                            >
                                <Info className="text-white w-8 h-8" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                                    {selectedNode?.label}
                                </DialogTitle>
                                <Badge variant="outline" className="opacity-60">{selectedNode?.type.toUpperCase()}</Badge>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="py-8">
                        <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] space-y-4">
                            <h4 className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                <Move className="w-4 h-4" /> Bản chất & Phân tích
                            </h4>
                            <p className="text-xl leading-relaxed text-muted-foreground italic">
                                "{selectedNode?.description || "Tri thức là quá trình phản ánh hiện thực khách quan vào bộ óc con người..."}"
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setSelectedNode(null)} className="rounded-xl px-10">Đóng</Button>
                        <Button className="rounded-xl px-10 neo-shadow">Lưu vào mục ưa thích</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

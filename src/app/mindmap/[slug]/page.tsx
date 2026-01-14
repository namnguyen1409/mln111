import { getMindMapBySlug } from "@/lib/services/mindMapService";
import MindMap from "@/components/mind-map/MindMap";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Info, HelpCircle } from "lucide-react";
import { getMindMaps } from "@/lib/services/mindMapService";

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
    const mindMaps = await getMindMaps();
    return mindMaps.map((map) => ({
        slug: map.slug,
    }));
}

export default async function MindMapViewerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const mindMap = await getMindMapBySlug(slug);

    if (!mindMap) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                        <Button asChild variant="ghost" className="hover:bg-white/5 -ml-4">
                            <Link href="/mindmap" className="flex items-center gap-2 text-primary font-bold">
                                <ChevronLeft className="w-5 h-5" /> Trở về Hub
                            </Link>
                        </Button>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">{mindMap.title}</h1>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl border-white/10 gap-2">
                            <HelpCircle className="w-4 h-4" /> Hướng dẫn
                        </Button>
                        <Button className="rounded-xl neo-shadow gap-2">
                            <Info className="w-4 h-4" /> Ghi chú bài học
                        </Button>
                    </div>
                </div>

                <main className="relative z-10">
                    <MindMap data={mindMap} />
                </main>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass p-8 rounded-[2.5rem] border-white/5 md:col-span-2 space-y-6">
                        <h3 className="text-xl font-bold italic uppercase tracking-widest text-primary flex items-center gap-3">
                            🎯 Mục tiêu trực quan
                        </h3>
                        <p className="text-lg leading-relaxed text-muted-foreground italic">
                            {mindMap.description || "Sơ đồ này giúp bạn hệ thống hóa các kiến thức quan trọng nhất về chủ đề này thông qua các mối liên hệ biện chứng."}
                        </p>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] border-primary/20 bg-primary/5 space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                            📌 Tips học tập
                        </h3>
                        <ul className="space-y-4 text-sm text-muted-foreground list-disc list-inside">
                            <li>Nhấn vào từng nút để xem định nghĩa chi tiết.</li>
                            <li>Sử dụng con lăn chuột để Zoom in/out.</li>
                            <li>Màu sắc phân biệt Nguyên lý và Quy luật.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}

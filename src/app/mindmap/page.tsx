import { getMindMaps } from "@/lib/services/mindMapService";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ArrowRight, Share2, Star } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function MindMapHubPage() {
    const mindMaps = await getMindMaps();

    return (
        <div className="min-h-screen bg-background py-16 px-4">
            <div className="max-w-6xl mx-auto space-y-16 animate-fade-in">
                <header className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border-primary/20 text-primary animate-bounce">
                        <Brain className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Trung tâm trực quan</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                        Vũ trụ <span className="text-primary drop-shadow-[0_0_15px_rgba(110,86,207,0.5)]">Tri thức</span>
                    </h1>
                    <p className="text-muted-foreground text-lg italic max-w-2xl mx-auto">
                        Khám phá các nguyên lý và quy luật triết học thông qua sơ đồ tư duy tương tác 3D. Nhấn vào từng nút để thấu hiểu bản chất sự vật.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mindMaps.length === 0 ? (
                        <div className="col-span-full text-center py-20 glass rounded-[3rem] border-white/5 italic text-muted-foreground">
                            Đang chuẩn bị sơ đồ... Vui lòng quay lại sau!
                        </div>
                    ) : (
                        mindMaps.map((map: any) => (
                            <Card key={map._id} className="glass border-white/5 rounded-[3rem] overflow-hidden group hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
                                <CardHeader className="p-8 pb-4 relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <Brain className="w-24 h-24 text-primary" />
                                    </div>
                                    <div className="flex justify-between items-start mb-6">
                                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase tracking-widest px-3 py-1">
                                            {map.nodes.length} Nút kiến thức
                                        </Badge>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Star className="w-3 h-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><Share2 className="w-3 h-3" /></Button>
                                        </div>
                                    </div>
                                    <CardTitle className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-primary transition-colors leading-tight">
                                        {map.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-8 pb-8 space-y-8">
                                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 italic">
                                        {map.description || "Khám phá mối quan hệ biện chứng và các nguyên lý nền tảng của chủ nghĩa duy vật."}
                                    </p>

                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                        <ArrowRight className="w-3 h-3" /> Tương tác • Khám phá • Ghi nhớ
                                    </div>

                                    <Button asChild className="w-full h-14 neo-shadow rounded-[1.5rem] font-black italic uppercase tracking-tighter group-hover:scale-[1.02] transition-transform">
                                        <Link href={`/mindmap/${map.slug}`}>Mở vũ trụ ngay</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                <footer className="pt-16 border-t border-white/5 text-center">
                    <p className="text-muted-foreground text-sm italic">
                        Bạn muốn đóng góp sơ đồ mới? <Link href="/contact" className="text-primary hover:underline font-bold">Hãy liên hệ với chúng tôi</Link>
                    </p>
                </footer>
            </div>
        </div>
    );
}

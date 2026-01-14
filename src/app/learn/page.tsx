import { getTopics } from "@/lib/services/topicService";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, BookOpen, Clock, ArrowRight, LayoutGrid, Map as MapIcon, Sparkles } from "lucide-react";
import LearningPathMap from "@/components/learn/LearningPathMap";
import { auth } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/db/mongodb";

export const revalidate = 3600; // Revalidate every hour

export default async function LearnPage() {
    const topics = await getTopics();
    const session = await auth();

    let completedTopics: string[] = [];
    if (session?.user?.email) {
        await connectDB();
        const user = await User.findOne({ email: session.user.email }).lean();
        completedTopics = user?.completedTopics || [];
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
            <header className="mb-12 space-y-4">
                <Button asChild variant="ghost" size="sm" className="hover:bg-muted -ml-2">
                    <Link href="/" className="flex items-center gap-2 text-primary font-medium">
                        <ChevronLeft className="w-4 h-4" /> Trang chủ
                    </Link>
                </Button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                            <Sparkles className="w-3 h-3" /> Hành trình chinh phục
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase">Cây tri thức</h1>
                        <p className="text-muted-foreground text-lg max-w-xl">Khám phá các nguyên lý Triết học theo lộ trình khoa học. Hoàn thành bài học để mở khóa kiến thức mới.</p>
                    </div>
                </div>
            </header>

            {topics.length > 0 ? (
                <div className="relative">
                    <LearningPathMap topics={topics} completedTopics={completedTopics} />
                </div>
            ) : (
                <div className="py-32 text-center glass rounded-[3rem] border-border space-y-8">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto text-5xl">
                        🌱
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Vườn tri thức đang trống</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Vui lòng quay lại sau hoặc truy cập Admin để bắt đầu xây dựng lộ trình học tập.</p>
                    </div>
                    <Button asChild className="neo-shadow rounded-2xl h-14 px-8 font-black uppercase italic">
                        <Link href="/admin/topics">Xây dựng ngay</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

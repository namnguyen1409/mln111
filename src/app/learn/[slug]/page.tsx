import { getTopicBySlug } from "@/lib/services/topicService";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, CheckCircle2, Lightbulb, Info, Share2, Printer, Target } from "lucide-react";
import Discussion from "@/components/learn/Discussion";
import { getTopics } from "@/lib/services/topicService";
import TaskTracking from "@/components/tasks/TaskTracking";
import { auth } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/db/mongodb";
import CompleteTopicButton from "@/components/learn/CompleteTopicButton";
import QuickNoteButton from "@/components/notebook/QuickNoteButton";
import HostBattleButton from "@/components/quiz/HostBattleButton";
import { Zap } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
    const topics = await getTopics();
    return topics.map((topic: any) => ({
        slug: topic.slug,
    }));
}

export default async function TopicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const topic = await getTopicBySlug(slug);

    if (!topic) {
        notFound();
    }

    const session = await auth();
    let initialCompleted = false;
    let isAdmin = false;

    if (session?.user?.email) {
        await connectDB();
        const user = await User.findOne({ email: session.user.email }).lean();
        initialCompleted = user?.completedTopics?.includes(slug) || false;
        isAdmin = user?.isAdmin || false;
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <Button asChild variant="ghost" className="hover:bg-white/5 -ml-4">
                        <Link href="/learn" className="flex items-center gap-2 text-primary">
                            <ChevronLeft className="w-5 h-5" /> Danh sách bài học
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <QuickNoteButton
                            topicId={topic._id.toString()}
                            topicSlug={slug}
                            topicTitle={topic.title}
                        />
                        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-white/10 hover:bg-white/5"><Share2 className="w-5 h-5" /></Button>
                        {isAdmin && (
                            <div className="flex items-center gap-3 glass px-4 py-1.5 rounded-2xl border-secondary/20 bg-secondary/5">
                                <span className="text-[10px] font-black uppercase text-secondary tracking-widest leading-none">Admin Tools</span>
                                <HostBattleButton topicId={topic._id.toString()} topicSlug={slug} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Header Section */}
                <header className="space-y-6">
                    <div className="space-y-2">
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-sm px-3">{topic.category.toUpperCase()}</Badge>
                        <h1 className="text-4xl md:text-5xl font-black">{topic.title}</h1>
                    </div>
                    <div className="glass p-8 rounded-3xl border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Info className="w-24 h-24 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Info className="text-primary" /> Khái niệm cốt lõi
                        </h2>
                        <p className="text-xl leading-relaxed font-medium italic">
                            "{topic.content.coreConcept}"
                        </p>
                    </div>

                    <div className="flex items-center gap-4 p-5 glass rounded-2xl border-primary/10 bg-primary/5">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center neo-shadow shrink-0">
                            <Target className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary/60">Mục tiêu bài học</h3>
                            <p className="font-bold">{topic.learningOutcome}</p>
                        </div>
                    </div>
                </header>

                {/* Content Tabs-like sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <section className="space-y-4">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <CheckCircle2 className="text-green-500" /> Các ý chính
                            </h3>
                            <ul className="space-y-4">
                                {topic.content.keyPoints.map((point: string, idx: number) => (
                                    <li key={idx} className="flex gap-4 p-4 glass rounded-2xl hover:bg-white/5 transition-colors border-white/5">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                            {idx + 1}
                                        </span>
                                        <p className="text-muted-foreground">{point}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <Lightbulb className="text-yellow-400" /> Ví dụ đời sống Việt Nam
                            </h3>
                            <div className="glass p-6 rounded-2xl border-yellow-500/20 bg-yellow-500/5">
                                <p className="text-lg leading-relaxed">{topic.content.example}</p>
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <div className="glass p-6 rounded-3xl border-accent/20 bg-accent/5 sticky top-20">
                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                💬 Câu hỏi gợi mở
                            </h4>
                            <p className="text-muted-foreground mb-6">
                                {topic.content.thoughtQuestion}
                            </p>
                            <Button className="w-full neo-shadow font-bold">Thảo luận ngay</Button>
                        </div>
                    </aside>
                </div>

                {/* Completion Section */}
                <CompleteTopicButton topicSlug={slug} initialCompleted={initialCompleted} />

                {/* Discussion Section */}
                <div className="pt-12 border-t border-white/5">
                    <Discussion topicSlug={slug} />
                </div>

                {/* Mission Tracking */}
                <TaskTracking />
            </div>
        </div>
    );
}

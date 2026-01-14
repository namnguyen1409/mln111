import { getTopics } from "@/lib/services/topicService";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, BookOpen, Clock, ArrowRight } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function LearnPage() {
    const topics = await getTopics();

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
            <header className="mb-12 space-y-4">
                <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2">
                    <Link href="/" className="flex items-center gap-2 text-primary font-medium">
                        <ChevronLeft className="w-4 h-4" /> Trang chủ
                    </Link>
                </Button>
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Học nhanh lý thuyết</h1>
                    <p className="text-muted-foreground text-lg">Tóm tắt các kiến thức cốt lõi, ví dụ thực tế và câu hỏi gợi mở của MLN111.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.length > 0 ? (
                    topics.map((topic) => (
                        <Link key={topic.slug} href={`/learn/${topic.slug}`}>
                            <Card className="h-full glass hover:border-primary/50 transition-all duration-300 flex flex-col group cursor-pointer hover:-translate-y-1">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 capitalize font-bold">
                                            {topic.category.replace('-', ' ')}
                                        </Badge>
                                        <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">{topic.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-muted-foreground text-sm line-clamp-3 italic">
                                        "{topic.content.coreConcept}"
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-0 flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 5 phút đọc
                                    </span>
                                    <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Khám phá <ArrowRight className="w-4 h-4" />
                                    </span>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 glass rounded-3xl text-center space-y-6">
                        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl">
                            🏜️
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Chưa có dữ liệu học tập</h2>
                            <p className="text-muted-foreground">Vui lòng quay lại trang chủ hoặc thêm bài học mới từ Admin.</p>
                        </div>
                        <Button asChild className="neo-shadow rounded-xl font-bold px-8">
                            <Link href="/">Quay lại trang chủ</Link>
                        </Button>
                        {/* Seed data button for demonstration */}
                        <form action="/api/seed" method="POST">
                            <Button type="submit" variant="outline" className="ml-4 border-dashed border-primary/50 text-primary hover:bg-primary/5">
                                Click để nạp dữ liệu mẫu
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

import { getQuizzes } from "@/lib/services/quizService";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Gamepad2, ArrowRight, Star, Zap } from "lucide-react";
import { auth } from "@/lib/auth";
import HostBattleButton from "@/components/quiz/HostBattleButton";

export default async function QuizPortal() {
    const quizzes = await getQuizzes();
    const session = await auth();
    const isAdmin = (session?.user as any)?.isAdmin;

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="space-y-4 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Trophy className="text-yellow-400 w-10 h-10" />
                    <h1 className="text-4xl md:text-5xl font-black">Quiz Triết Học</h1>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Thử thách kiến thức triết học của bạn qua những trò chơi thú vị và tích lũy XP để thăng hạng!
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                        <Card key={quiz._id} className="glass border-white/5 hover:border-primary/50 transition-all duration-500 overflow-hidden group relative rounded-3xl flex flex-col">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Gamepad2 className="w-24 h-24" />
                            </div>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2">
                                    <Star className="w-4 h-4 fill-yellow-400" /> +{quiz.xpReward} XP
                                </div>
                                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                                    {quiz.title}
                                </CardTitle>
                                <CardDescription>Thử thách cá nhân</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow">
                                <Button asChild className="w-full neo-shadow font-bold bg-primary hover:bg-primary/90 transition-colors h-12 rounded-xl">
                                    <Link href={`/quiz/${quiz._id}`}>
                                        Chơi ngay <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>

                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    <p className="text-[10px] font-black uppercase text-secondary tracking-widest text-center">Chế độ: Đấu trường</p>
                                    <HostBattleButton quizId={quiz._id} topicSlug={quiz.topicSlug} />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 glass rounded-3xl text-center space-y-6">
                        <p className="text-muted-foreground">Hiện chưa có thử thách nào khả dụng.</p>
                        <Button asChild className="neo-shadow rounded-xl">
                            <Link href="/learn">Bắt đầu học để mở khóa Quiz</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

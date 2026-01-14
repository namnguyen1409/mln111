import { getQuizById } from "@/lib/services/quizService";
import QuizGame from "@/components/quiz/QuizGame";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function QuizSessionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quiz = await getQuizById(id);

    if (!quiz) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto mb-8 animate-fade-in">
                <Button asChild variant="ghost" className="hover:bg-white/5">
                    <Link href="/quiz" className="flex items-center gap-2 text-primary">
                        <ChevronLeft /> Thoát thử thách
                    </Link>
                </Button>
            </div>

            <main className="animate-fade-in [animation-delay:200ms]">
                <QuizGame quiz={quiz} />
            </main>
        </div>
    );
}

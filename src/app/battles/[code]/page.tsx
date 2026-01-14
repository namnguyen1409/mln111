import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LiveBattle from "@/components/quiz/LiveBattle";

export default async function StudentBattlePage({ params }: { params: Promise<{ code: string }> }) {
    const session = await auth();
    if (!session?.user?.email) redirect("/api/auth/signin");

    const { code } = await params;

    return (
        <div className="min-h-screen bg-background">
            <LiveBattle
                code={code}
                isHost={false}
                userEmail={session.user.email}
            />
        </div>
    );
}

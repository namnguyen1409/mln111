import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LiveBattle from "@/components/quiz/LiveBattle";
import { getBattleStatus } from "@/lib/services/battleService";

export default async function StudentBattlePage({ params }: { params: Promise<{ code: string }> }) {
    const session = await auth();
    if (!session?.user?.email) redirect("/api/auth/signin");

    const { code } = await params;
    const battle = await getBattleStatus(code);

    if (!battle) {
        return <div className="min-h-screen flex items-center justify-center">Không tìm thấy phòng chơi.</div>;
    }

    const isHost = battle.hostEmail === session.user.email;

    return (
        <div className="min-h-screen bg-background">
            <LiveBattle
                code={code}
                isHost={isHost}
                userEmail={session.user.email}
            />
        </div>
    );
}

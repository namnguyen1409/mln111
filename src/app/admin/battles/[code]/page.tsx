import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LiveBattle from "@/components/quiz/LiveBattle";

export default async function HostBattlePage({ params }: { params: Promise<{ code: string }> }) {
    const session = await auth();
    if (!session?.user?.email) redirect("/api/auth/signin");

    // Only admins or the specific host can access this
    // For simplicity, we assume anyone with access to /admin can host

    const { code } = await params;

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="max-w-6xl mx-auto px-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-lg">Host Mode</div>
                    <h2 className="text-xl font-bold">Bảng điều khiển Giảng viên</h2>
                </div>
            </div>
            <LiveBattle
                code={code}
                isHost={true}
                userEmail={session.user.email}
            />
        </div>
    );
}

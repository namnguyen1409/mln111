import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createBattleSession } from "@/lib/services/battleService";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { topicId, topicSlug, quizId, type, betAmount } = await req.json();
        const battle = await createBattleSession(session.user.email, topicId, topicSlug, quizId, 30, type, betAmount);
        return NextResponse.json(battle);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

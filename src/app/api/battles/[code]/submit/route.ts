import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitBattleAnswer } from "@/lib/services/battleService";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { code } = await params;
        const { isCorrect, points } = await req.json();
        const result = await submitBattleAnswer(code, session.user.email, isCorrect, points);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

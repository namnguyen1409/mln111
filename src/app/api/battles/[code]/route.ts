import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBattleStatus, updateBattleStep, finishBattle } from "@/lib/services/battleService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { code } = await params;
        const battle = await getBattleStatus(code);
        return NextResponse.json(battle);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { code } = await params;
        const body = await req.json();
        const { action, ...data } = body;

        let result;
        if (action === 'finish') {
            result = await finishBattle(code, session.user.email);
        } else {
            result = await updateBattleStep(code, session.user.email, data);
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

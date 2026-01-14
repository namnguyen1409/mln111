import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinBattleSession } from "@/lib/services/battleService";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { code } = await req.json();
        const user = {
            email: session.user.email,
            name: session.user.name || "User",
            image: session.user.image || undefined
        };
        const battle = await joinBattleSession(code, user);
        return NextResponse.json(battle);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { createAchievement } from "@/lib/services/achievementService";
import Achievement from "@/models/Achievement";

export async function GET() {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const achievements = await Achievement.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json(achievements);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const achievement = await createAchievement(data);
        return NextResponse.json(achievement);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

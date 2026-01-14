import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllAchievementsWithStatus } from "@/lib/services/achievementService";

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const achievements = await getAllAchievementsWithStatus(session.user.email);
        return NextResponse.json(achievements);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserDailyTaskProgress, updateDailyTaskProgress } from "@/lib/services/dailyTaskService";

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tasks = await getUserDailyTaskProgress(session.user.email);
        return NextResponse.json(tasks);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { type, increment } = await req.json();

        if (!['read_article', 'comment', 'quiz_complete'].includes(type)) {
            return NextResponse.json({ error: "Invalid task type" }, { status: 400 });
        }

        await updateDailyTaskProgress(session.user.email, type, increment || 1);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

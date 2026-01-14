import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import {
    getActiveDailyTasks,
    createDailyTask,
    updateDailyTask,
    deleteDailyTask
} from "@/lib/services/dailyTaskService";
import DailyTask from "@/models/DailyTask";

export async function GET() {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tasks = await DailyTask.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json(tasks);
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
        const task = await createDailyTask(data);
        return NextResponse.json(task);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

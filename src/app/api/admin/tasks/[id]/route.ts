import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { updateDailyTask, deleteDailyTask } from "@/lib/services/dailyTaskService";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const data = await req.json();
        const updatedTask = await updateDailyTask(id, data);
        return NextResponse.json(updatedTask);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await deleteDailyTask(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

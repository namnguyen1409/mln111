import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { getTopicById, updateTopic, deleteTopic } from "@/lib/services/topicService";
import { revalidatePath } from "next/cache";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const topic = await getTopicById(id);
        if (!topic) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(topic);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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
        const updatedTopic = await updateTopic(id, data);

        // Revalidate public pages
        revalidatePath('/learn');
        if (updatedTopic.slug) {
            revalidatePath(`/learn/${updatedTopic.slug}`);
        }

        return NextResponse.json(updatedTopic);
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
        await deleteTopic(id);

        // Revalidate public pages
        revalidatePath('/learn');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

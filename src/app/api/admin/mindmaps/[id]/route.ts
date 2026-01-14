import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMindMapById, updateMindMap } from "@/lib/services/mindMapService";
import { revalidatePath } from "next/cache";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const mindMap = await getMindMapById(id);

        if (!mindMap) {
            return NextResponse.json({ error: "MindMap not found" }, { status: 404 });
        }

        return NextResponse.json(mindMap);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();
        const updatedMindMap = await updateMindMap(id, data);

        // Revalidate public pages
        revalidatePath('/mindmap');
        if (updatedMindMap.slug) {
            revalidatePath(`/mindmap/${updatedMindMap.slug}`);
        }

        return NextResponse.json(updatedMindMap);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

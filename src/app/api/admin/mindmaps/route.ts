import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMindMap, deleteMindMap, getMindMaps } from "@/lib/services/mindMapService";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const mindMaps = await getMindMaps();
        return NextResponse.json(mindMaps);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        const newMindMap = await createMindMap(data);

        revalidatePath('/mindmap');
        if (newMindMap.slug) {
            revalidatePath(`/mindmap/${newMindMap.slug}`);
        }

        return NextResponse.json(newMindMap, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        await deleteMindMap(id);
        revalidatePath('/mindmap');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { getFlashcardCollectionById, updateFlashcardCollection } from "@/lib/services/flashcardService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const collection = await getFlashcardCollectionById(id);

        if (!collection) {
            return NextResponse.json({ error: "Collection not found" }, { status: 404 });
        }

        return NextResponse.json(collection);
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
        if (!session?.user || !isAdmin(session.user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();
        const collection = await updateFlashcardCollection(id, data);

        return NextResponse.json(collection);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

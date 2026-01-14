import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import FlashcardCollection from "@/models/FlashcardCollection";
import { getFlashcardCollections, deleteFlashcardCollection } from "@/lib/services/flashcardService";

export async function GET() {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const collections = await getFlashcardCollections();
        return NextResponse.json(collections);
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
        await connectDB();

        // Generate slug from title if not provided
        if (!data.slug && data.title) {
            data.slug = data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        }

        const collection = await FlashcardCollection.create({
            ...data,
            createdBy: session.user.email,
        });

        return NextResponse.json(collection, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        await deleteFlashcardCollection(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

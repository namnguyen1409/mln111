import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserNotes, createNote, updateNote } from "@/lib/services/noteService";

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const notes = await getUserNotes(session.user.email);
        return NextResponse.json(notes);
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
        const body = await req.json();
        const { id, ...data } = body;

        if (id) {
            const updated = await updateNote(id, session.user.email, data);
            return NextResponse.json(updated);
        } else {
            const created = await createNote({
                ...data,
                userEmail: session.user.email
            });
            return NextResponse.json(created);
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

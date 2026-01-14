import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteComment, getAllCommentsForAdmin } from "@/lib/services/commentService";

// GET all comments for moderation
export async function GET() {
    try {
        const session = await auth();
        // Simple admin check (matching Navbar/Admin Dashboard logic)
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const comments = await getAllCommentsForAdmin();
        return NextResponse.json(comments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE a comment (Admin only)
export async function DELETE(req: Request) {
    try {
        const session = await auth();
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        const isAdmin = session?.user?.email && adminEmails.includes(session.user.email);

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await deleteComment(id, session?.user?.email || "", true);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

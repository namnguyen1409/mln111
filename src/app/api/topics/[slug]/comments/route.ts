import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommentsByTopic, createComment } from "@/lib/services/commentService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const comments = await getCommentsByTopic(slug);
        return NextResponse.json(comments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const newComment = await createComment({
            topicSlug: slug,
            user: {
                name: session.user.name || "Anonymous",
                email: session.user.email || "",
                image: session.user.image || undefined
            },
            content: content.trim()
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

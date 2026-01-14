import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuizById, updateQuiz } from "@/lib/services/quizService";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!(session?.user as any)?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const quiz = await getQuizById(id);

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        return NextResponse.json(quiz);
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
        if (!(session?.user as any)?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();
        const quiz = await updateQuiz(id, data);

        return NextResponse.json(quiz);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

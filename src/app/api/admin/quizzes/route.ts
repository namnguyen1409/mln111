import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createQuiz, getQuizzes, deleteQuiz } from "@/lib/services/quizService";

export async function GET() {
    try {
        const session = await auth();
        if (!(session?.user as any)?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const quizzes = await getQuizzes();
        return NextResponse.json(quizzes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!(session?.user as any)?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const data = await req.json();
        const quiz = await createQuiz(data);
        return NextResponse.json(quiz);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!(session?.user as any)?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await req.json();
        await deleteQuiz(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

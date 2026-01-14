import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addPoints } from "@/lib/services/userService";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { points, quizId } = await req.json();

        // In a real app, we would verify the score server-side or add a secret token
        // For this education hub, we trust the client-side game component
        const updatedUser = await addPoints(session.user.email, points);

        return NextResponse.json({
            success: true,
            points: updatedUser?.points,
            level: updatedUser?.level
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

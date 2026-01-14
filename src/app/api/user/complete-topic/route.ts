import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { addPoints } from "@/lib/services/userService";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { topicSlug } = await req.json();
        if (!topicSlug) {
            return NextResponse.json({ error: "Topic slug is required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.completedTopics.includes(topicSlug)) {
            return NextResponse.json({ success: true, message: "Already completed" });
        }

        user.completedTopics.push(topicSlug);
        await user.save();

        // Award completion bonus (e.g., 100 EXP)
        await addPoints(session.user.email, 100);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

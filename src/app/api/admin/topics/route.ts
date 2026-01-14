import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Topic from "@/models/Topic";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        await connectDB();

        const topic = await Topic.create(data);
        return NextResponse.json(topic, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

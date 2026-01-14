import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Topic from "@/models/Topic";
import { getTopics } from "@/lib/services/topicService";
import { revalidatePath } from "next/cache";

export async function GET() {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const topics = await getTopics();
        return NextResponse.json(topics);
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

        const topic = await Topic.create(data);

        // Revalidate public pages
        revalidatePath('/learn');

        return NextResponse.json(topic, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

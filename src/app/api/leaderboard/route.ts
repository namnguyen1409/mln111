import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/services/userService";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get('mode') as 'total' | 'weekly') || 'total';
    const limit = parseInt(searchParams.get('limit') || '10');

    try {
        const users = await getLeaderboard(limit, mode);
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

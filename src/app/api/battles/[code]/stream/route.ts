import { NextRequest, NextResponse } from "next/server";
import { getBattleStatus } from "@/lib/services/battleService";
import "@/models/Topic"; // Explicitly register for populate
import "@/models/Quiz";  // Explicitly register for populate

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    let lastUpdatedAt: string | null = null;
    let isActive = true;

    // Heartbeat function to keep connection alive on Vercel
    const sendHeartbeat = async () => {
        if (!isActive) return;
        try {
            await writer.write(encoder.encode(': heartbeat\n\n'));
        } catch (e) {
            isActive = false;
        }
    };

    const fetchAndUpdate = async () => {
        if (!isActive) return;
        try {
            const battle = await getBattleStatus(code);
            if (!battle) {
                await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: "Không tìm thấy phòng" })}\n\n`));
                isActive = false;
                await writer.close();
                return;
            }

            const currentUpdatedAt = battle.updatedAt.toISOString();
            if (currentUpdatedAt !== lastUpdatedAt) {
                lastUpdatedAt = currentUpdatedAt;
                await writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(battle)}\n\n`));
            }
        } catch (error) {
            console.error("SSE Stream Error:", error);
            isActive = false;
        }
    };

    // Initial fetch
    await fetchAndUpdate();

    const intervalId = setInterval(fetchAndUpdate, 1000);
    const heartbeatId = setInterval(sendHeartbeat, 15000);

    req.signal.addEventListener('abort', () => {
        isActive = false;
        clearInterval(intervalId);
        clearInterval(heartbeatId);
        writer.close();
    });

    // Cleanup after 25 seconds to respect Vercel's timeout (Hobby/Pro limits)
    // Client should auto-reconnect
    setTimeout(() => {
        if (isActive) {
            isActive = false;
            clearInterval(intervalId);
            clearInterval(heartbeatId);
            writer.close();
        }
    }, 25000);

    return new Response(responseStream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}

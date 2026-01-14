import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllUsers, toggleAdmin } from "@/lib/services/userService";

export async function GET() {
    try {
        const session = await auth();
        if (!(session?.user as any)?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const users = await getAllUsers();
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!(session?.user as any)?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, action } = await req.json();
        if (action === "toggleAdmin") {
            const user = await toggleAdmin(email);
            return NextResponse.json(user);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

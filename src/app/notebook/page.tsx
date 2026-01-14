import { auth } from "@/lib/auth";
import { getUserNotes } from "@/lib/services/noteService";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    PenLine,
    Book,
    Search,
    Filter,
    Calendar,
    Tag as TagIcon,
    ChevronLeft,
    Sparkles,
    Trash2,
    CalendarDays
} from "lucide-react";
import NotebookClient from "@/components/notebook/NotebookClient";


export default async function NotebookPage() {
    const session = await auth();
    if (!session?.user?.email) {
        redirect("/api/auth/signin");
    }

    const initialNotes = await getUserNotes(session.user.email);

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                        <Link href="/learn"><ChevronLeft className="w-4 h-4 mr-1" /> Quay lại học tập</Link>
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                            <Sparkles className="w-3 h-3" /> Kho lưu trữ cá nhân
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                            <Book className="w-10 h-10 text-primary" /> Sổ tay tri thức
                        </h1>
                        <p className="text-muted-foreground italic max-w-lg">Nơi lưu lại những tinh hoa tri thức và suy ngẫm cá nhân của bạn về Triết học.</p>
                    </div>
                </div>
            </header>

            <NotebookClient initialNotes={JSON.parse(JSON.stringify(initialNotes))} />
        </div>
    );
}

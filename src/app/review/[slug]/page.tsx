import { getFlashcardCollectionBySlug, getFlashcardCollections } from "@/lib/services/flashcardService";
import FlashcardSet from "@/components/review/FlashcardSet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
    const collections = await getFlashcardCollections();
    return collections.map((col: any) => ({
        slug: col.slug,
    }));
}

export default async function FlashcardCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const currentCollection = await getFlashcardCollectionBySlug(slug);

    if (!currentCollection) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in space-y-12 min-h-screen">
            <header className="space-y-4">
                <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                    <Link href="/review" className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Danh sách bộ thẻ
                    </Link>
                </Button>
                <div className="text-center space-y-4 pt-8">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary">
                        {currentCollection.title}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {currentCollection.description || "Hệ thống thẻ ghi nhớ thông minh cho MLN111."}
                    </p>
                </div>
            </header>

            <main>
                <FlashcardSet cards={currentCollection.cards} />
            </main>
        </div>
    );
}

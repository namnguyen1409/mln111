import { getFlashcardCollections } from "@/lib/services/flashcardService";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronLeft, BookOpen, Layers, PlusCircle } from "lucide-react";

export default async function ReviewPortalPage() {
    const collections = await getFlashcardCollections();

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in space-y-12 min-h-screen">
            <header className="space-y-4">
                <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                    <Link href="/" className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Trang chủ
                    </Link>
                </Button>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Ôn tập Flashcards</h1>
                <p className="text-muted-foreground text-lg">Hệ thống thẻ ghi nhớ thông minh cho MLN111.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.length > 0 ? (
                    collections.map((col: any) => (
                        <Link key={col._id} href={`/review/${col.slug}`}>
                            <Card className="glass border-white/5 hover:border-primary/50 transition-all duration-500 rounded-3xl overflow-hidden group h-full flex flex-col">
                                <CardHeader className="flex-grow">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary mb-3 tracking-widest">
                                        <Layers className="w-3 h-3" /> {col.cards.length} THẺ
                                    </div>
                                    <CardTitle className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors">
                                        {col.title}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 mt-2">
                                        {col.description || "Bộ thẻ ôn tập kiến thức cốt lõi."}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0 pb-8">
                                    <Button className="w-full neo-shadow rounded-xl font-bold h-12">
                                        Bắt đầu học
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-24 glass rounded-[3rem] border-white/5 text-center space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Chưa có bộ thẻ nào</h3>
                            <p className="text-muted-foreground mt-2">Hệ thống đang được cập nhật nội dung ôn tập.</p>
                        </div>
                        <Button asChild variant="outline" className="rounded-xl border-white/10">
                            <Link href="/">Quay lại Trang chủ</Link>
                        </Button>
                    </div>
                )}
            </div>

            <div className="glass p-12 rounded-[3.5rem] border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl text-center md:text-left">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">Bạn là Giảng viên / Admin?</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Tạo các bộ thẻ Flashcard mới để hỗ trợ sinh viên ôn tập hiệu quả hơn. Hệ thống cho phép phân loại theo từng chương học.
                    </p>
                </div>
                <Button asChild size="lg" className="h-16 px-10 rounded-2xl neo-shadow font-bold text-xl shrink-0">
                    <Link href="/admin/flashcards"><PlusCircle className="mr-2" /> Tạo bộ thẻ ngay</Link>
                </Button>
            </div>
        </div>
    );
}

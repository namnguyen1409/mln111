import { auth, isAdmin } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, Plus, LayoutDashboard, FileText, HelpCircle, ChevronLeft, LogIn, User, ShieldAlert, Brain, Gamepad2 } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
    const session = await auth();

    if (!session?.user || !session.user.email || !isAdmin(session.user.email)) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center space-y-6 animate-fade-in">
                <div className="glass p-12 rounded-[3rem] border-red-500/20 bg-red-500/5 max-w-md">
                    <Settings className="w-16 h-16 text-destructive mx-auto mb-6" />
                    <h2 className="text-3xl font-black mb-4">Truy cập bị từ chối</h2>
                    <p className="text-muted-foreground mb-8">
                        Bạn không có quyền quản trị để truy cập trang này. Vui lòng đăng nhập bằng tài khoản Admin.
                    </p>
                    {!session ? (
                        <Button asChild className="w-full h-14 neo-shadow rounded-2xl font-bold text-lg">
                            <Link href="/api/auth/signin"><LogIn className="mr-2" /> Đăng nhập ngay</Link>
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3 justify-center text-muted-foreground p-3 glass rounded-xl border-white/10">
                            <User className="w-4 h-4" /> {session.user?.email}
                        </div>
                    )}
                </div>
                <Button asChild variant="ghost" className="hover:bg-white/5">
                    <Link href="/"><ChevronLeft /> Quay lại trang chủ</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                        <Link href="/" className="flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" /> Dashboard chính
                        </Link>
                    </Button>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Admin Hub</h1>
                    <p className="text-muted-foreground text-lg">Xin chào, {session.user?.name || "Admin"} 👋</p>
                </div>
                <div className="flex items-center gap-3 p-3 glass rounded-2xl border-primary/20 bg-primary/5">
                    <Badge className="bg-primary hover:bg-primary border-none">ADMIN</Badge>
                    <span className="text-sm font-medium">{session.user.email}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Flashcard Collections Admin */}
                <Card className="glass border-white/5 rounded-3xl overflow-hidden hover:border-primary/50 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <FileText className="text-primary" /> Flashcard Collections
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">Tạo bộ thẻ ôn tập riêng lẻ cho từng chương hoặc chủ đề.</p>
                        <Button asChild className="w-full h-12 neo-shadow rounded-xl font-bold">
                            <Link href="/admin/flashcards"><Plus className="mr-2 w-4 h-4" /> Quản lý bộ thẻ</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Discussion Admin */}
                <Card className="glass border-white/5 rounded-3xl overflow-hidden hover:border-red-500/50 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <ShieldAlert className="text-red-500" /> Thảo luận & Kiểm duyệt
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">Theo dõi và xóa các bình luận vi phạm quy tắc cộng đồng.</p>
                        <Button asChild variant="destructive" className="w-full h-12 neo-shadow rounded-xl font-bold">
                            <Link href="/admin/comments"><ShieldAlert className="mr-2 w-4 h-4" /> Kiểm duyệt ngay</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Topics Admin */}
                <Card className="glass border-white/5 rounded-3xl overflow-hidden hover:border-accent/50 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Plus className="text-accent" /> Quản lý Bài học
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">Thêm nội dung lý thuyết, sơ đồ tư duy cho các bài học.</p>
                        <Button asChild className="w-full h-12 neo-shadow rounded-xl font-bold bg-white/5 hover:bg-white/10 border-white/10">
                            <Link href="/admin/topics">
                                <Plus className="mr-2 w-4 h-4" /> Viết bài mới
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Quiz Admin */}
                <Card className="glass border-white/5 rounded-3xl overflow-hidden hover:border-accent/50 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Gamepad2 className="text-accent" /> Quản lý Game Quiz
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">Tạo các bộ câu hỏi trắc nghiệm thử thách cho sinh viên.</p>
                        <Button asChild className="w-full h-12 neo-shadow rounded-xl font-bold bg-white/5 hover:bg-white/10 border-white/10">
                            <Link href="/admin/quizzes">
                                <Plus className="mr-2 w-4 h-4" /> Tạo Quiz mới
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* MindMap Admin */}
                <Card className="glass border-white/5 rounded-3xl overflow-hidden hover:border-primary/50 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Brain className="text-primary" /> Quản lý Sơ đồ Tư duy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">Xây dựng các sơ đồ trực quan kết nối các nguyên lý triết học.</p>
                        <Button asChild className="w-full h-12 neo-shadow rounded-xl font-bold bg-white/5 hover:bg-white/10 border-white/10">
                            <Link href="/admin/mindmaps">
                                <Plus className="mr-2 w-4 h-4" /> Tạo sơ đồ mới
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Users Admin */}
                <Card className="glass border-white/5 rounded-3xl overflow-hidden hover:border-yellow-500/50 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <User className="text-yellow-500" /> Quản lý Sinh viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">Theo dõi bảng xếp hạng, điểm số và chuỗi đăng nhập.</p>
                        <Button asChild className="w-full h-12 neo-shadow rounded-xl font-bold bg-white/5 hover:bg-white/10 border-white/10">
                            <Link href="/admin/users">
                                <User className="mr-2 w-4 h-4" /> Xem danh sách
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Analytics & Settings */}
                <Card className="glass border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <LayoutDashboard className="text-muted-foreground" /> Thống kê & Hệ thống
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">Theo dõi tương tác của sinh viên và cấu hình hệ thống.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="rounded-xl border-white/10" disabled>Báo cáo</Button>
                            <Button variant="outline" className="rounded-xl border-white/10" disabled>Cài đặt</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="glass p-10 rounded-[3rem] border-yellow-500/20 bg-yellow-500/5 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <Settings className="text-yellow-500 w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xl font-bold">Lưu ý bảo mật</h4>
                    <p className="text-muted-foreground">
                        Quyền Admin được cấp dựa trên email cấu hình trong `.env`. Mọi hành động xóa nội dung đều không thể hoàn tác.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Simple Badge component since I might not have it installed or correct
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight ${className}`}>
            {children}
        </span>
    )
}

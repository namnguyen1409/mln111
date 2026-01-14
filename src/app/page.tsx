import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Gamepad2, Repeat, Trophy } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-24 flex flex-col items-center justify-center gap-16 max-w-7xl mx-auto">
      <div className="text-center space-y-6 animate-fade-in">
        <Badge variant="outline" className="px-4 py-1 border-primary text-primary bg-primary/10 rounded-full animate-bounce">
          Dự án sáng tạo MLN111
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
          Triết Học <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">PlayHub</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Chuyển hóa tri thức triết học trừu tượng thành trải nghiệm học tập trực quan, tương tác và đầy hứng khởi.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Button asChild size="lg" className="h-14 px-8 text-lg font-bold neo-shadow bg-primary hover:bg-primary/90 transition-all rounded-xl">
            <Link href="/learn">Bắt đầu học ngay</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-2 hover:bg-white/10 transition-all rounded-xl">
            <Link href="/leaderboard">Bảng xếp hạng</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-fade-in [animation-delay:200ms]">
        <FeatureCard
          title="Học nhanh"
          description="Tóm tắt lý thuyết, ví dụ đời sống Việt Nam."
          icon={<BookOpen className="w-8 h-8" />}
          href="/learn"
          color="border-primary"
        />
        <FeatureCard
          title="Sơ đồ tư duy"
          description="Trực quan hóa nguyên lý và quy luật."
          icon={<Brain className="w-8 h-8" />}
          href="/mindmap"
          color="border-secondary"
        />
        <FeatureCard
          title="Game Quiz"
          description="Thách thức kiến thức, tích lũy XP."
          icon={<Gamepad2 className="w-8 h-8" />}
          href="/quiz"
          color="border-accent"
        />
        <FeatureCard
          title="Ôn tập"
          description="Flashcards thông minh cho kỳ thi."
          icon={<Repeat className="w-8 h-8" />}
          href="/review"
          color="border-green-400"
        />
      </div>

      <div className="w-full max-w-4xl glass p-8 rounded-3xl mt-8 flex flex-col md:flex-row items-center justify-between gap-8 border-white/10 shadow-2xl animate-fade-in [animation-delay:400ms]">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-400" /> Top Người chơi tuần
          </h2>
          <p className="text-muted-foreground">Tham gia thi đấu cùng hàng ngàn sinh viên khác.</p>
        </div>
        <Button variant="secondary" className="font-bold">Xem bảng xếp hạng</Button>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon, href, color }: any) {
  return (
    <Link href={href}>
      <Card className={`h-full border-2 border-transparent hover:${color} transition-all duration-300 glass hover:-translate-y-2 cursor-pointer group rounded-2xl`}>
        <CardHeader>
          <div className="p-3 w-fit rounded-xl bg-white/5 mb-2 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

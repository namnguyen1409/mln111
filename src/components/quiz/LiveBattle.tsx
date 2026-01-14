"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Play,
    Trophy,
    Timer,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Copy,
    Share2,
    Crown,
    Zap,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import QuizGame from '@/components/quiz/QuizGame';

interface LiveBattleProps {
    code: string;
    isHost: boolean;
    userEmail: string;
}

export default function LiveBattle({ code, isHost, userEmail }: LiveBattleProps) {
    const [battle, setBattle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastStatus, setLastStatus] = useState<string>('');
    const [timeLeft, setTimeLeft] = useState<number>(30);
    const { toast } = useToast();

    // Polling interval (3 seconds)
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/battles/${code}`);
                if (res.ok) {
                    const data = await res.json();
                    setBattle(data);

                    if (data.status !== lastStatus) {
                        setLastStatus(data.status);
                    }

                    // Sync time with server
                    if (data.questionStartTime) {
                        const elapsed = Math.floor((Date.now() - new Date(data.questionStartTime).getTime()) / 1000);
                        const remaining = Math.max(0, (data.timerDuration || 30) - elapsed);
                        setTimeLeft(remaining);
                    }
                }
            } catch (error) {
                console.error("Error polling battle status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, [code, lastStatus]);

    // Local countdown timer
    useEffect(() => {
        if (!battle || battle.status !== 'in_progress') return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Trigger auto-next on host side if timer expires
                    if (isHost && battle.status === 'in_progress') {
                        const allQuestions = battle.normalizedQuestions || [];
                        const isLast = battle.currentQuestionIndex >= allQuestions.length - 1;
                        if (!isLast) {
                            handleNextQuestion();
                        } else {
                            handleFinish();
                        }
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [battle?.status, battle?.currentQuestionIndex, isHost]);

    const handleStart = async () => {
        try {
            await fetch(`/api/battles/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'in_progress' }),
            });
        } catch (error) {
            toast({ title: "Lỗi khi bắt đầu", variant: "destructive" });
        }
    };

    const handleNextQuestion = async () => {
        try {
            await fetch(`/api/battles/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentQuestionIndex: battle.currentQuestionIndex + 1 }),
            });
        } catch (error) {
            toast({ title: "Lỗi khi chuyển câu", variant: "destructive" });
        }
    };

    const handleFinish = async () => {
        try {
            await fetch(`/api/battles/${code}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'finish' }),
            });
        } catch (error) {
            toast({ title: "Lỗi khi kết thúc", variant: "destructive" });
        }
    };

    if (loading && !battle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-muted-foreground animate-pulse">Đang kết nối đấu trường...</p>
            </div>
        );
    }

    if (!battle) return <div>Không tìm thấy phòng chơi.</div>;

    // --- Lobby View ---
    if (battle.status === 'waiting') {
        return (
            <div className="max-w-4xl mx-auto space-y-12 py-12 px-4 animate-fade-in">
                <div className="text-center space-y-6">
                    <Badge className="bg-primary/20 text-primary border-none px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                        Chế độ: Đấu trường trực tiếp
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter">
                        {battle.code}
                    </h1>
                    <p className="text-muted-foreground italic text-lg">Chia sẻ mã này với cả lớp để bắt đầu trò chơi!</p>

                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5"
                            onClick={() => {
                                navigator.clipboard.writeText(battle.code);
                                toast({ title: "Đã sao chép mã" });
                            }}
                        >
                            <Copy className="mr-2 w-4 h-4" /> Sao chép mã
                        </Button>
                        {isHost && (
                            <Button
                                onClick={handleStart}
                                disabled={battle.participants.length === 0}
                                className="rounded-2xl h-12 px-10 font-black uppercase italic neo-shadow"
                            >
                                <Play className="mr-2 w-5 h-5 fill-current" /> Bắt đầu trận đấu
                            </Button>
                        )}
                    </div>
                </div>

                <div className="glass rounded-[3rem] p-12 border-white/5 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <Users className="text-primary w-8 h-8" />
                            Đang chờ ({battle.participants.length})
                        </h2>
                        {!isHost && <p className="text-primary font-bold animate-pulse italic">Đang chờ giảng viên bắt đầu...</p>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {battle.participants.map((p: any, idx: number) => (
                                <motion.div
                                    key={p.email}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-3 p-4 glass rounded-2xl border-white/5 group hover:border-primary/30 transition-all"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl font-black border border-white/5">
                                        {p.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-center truncate w-full">{p.name}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    // --- Results View ---
    if (battle.status === 'finished') {
        const sortedParticipants = [...battle.participants].sort((a, b) => b.score - a.score);
        return (
            <div className="max-w-4xl mx-auto py-12 space-y-12 px-4 animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-yellow-400 rounded-[2rem] flex items-center justify-center mx-auto neo-shadow-yellow mb-4">
                        <Trophy className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter">Kết quả trận đấu</h1>
                    <p className="text-muted-foreground italic">Trận chiến đã kết thúc. Vinh quang thuộc về các chiến thần lý luận!</p>
                </div>

                <Card className="glass border-white/5 rounded-[3rem] overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Chiến thần</span>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Tổng EXP</span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {sortedParticipants.map((p, idx) => (
                                <div key={p.email} className="p-8 flex items-center justify-between group hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-xl ${idx === 0 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/20' :
                                            idx === 1 ? 'bg-slate-300 text-slate-700' :
                                                idx === 2 ? 'bg-amber-600 text-white' : 'bg-white/5 text-muted-foreground'
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-xl">{p.name}</h4>
                                                {idx === 0 && <Crown className="w-5 h-5 text-yellow-400 fill-current" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{p.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black italic text-primary flex items-center justify-end gap-2">
                                            <Zap className="w-5 h-5 fill-current" /> +{p.score}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Đã cộng vào tài khoản</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-center">
                    <Button asChild className="rounded-2xl h-14 px-12 font-black uppercase italic neo-shadow">
                        <a href="/learn">Quay lại học tập</a>
                    </Button>
                </div>
            </div>
        );
    }

    // --- Active Game View ---
    const allQuestions = battle.normalizedQuestions || [];
    const currentQuestion = allQuestions[battle.currentQuestionIndex];
    const isLastQuestion = battle.currentQuestionIndex >= allQuestions.length - 1;

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-8 animate-fade-in relative backdrop-blur-sm">
            {/* Live Progress Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 glass p-6 rounded-[2.5rem] border-white/5">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/20 text-primary w-12 h-12 rounded-2xl flex items-center justify-center relative">
                        <Timer className={`w-6 h-6 ${timeLeft <= 5 ? 'text-red-500 animate-ping' : ''}`} />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                            {timeLeft}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tiến trình</p>
                        <p className="font-black italic text-xl uppercase tracking-tighter">Câu {battle.currentQuestionIndex + 1} / {allQuestions.length}</p>
                    </div>
                </div>

                <div className="flex -space-x-3 overflow-hidden p-2 bg-white/5 rounded-2xl border border-white/5">
                    {battle.participants.slice(0, 8).map((p: any) => (
                        <div key={p.email} className={`w-10 h-10 rounded-xl border-2 border-background flex items-center justify-center text-xs font-black ${p.lastAnswerCorrect === true ? 'bg-green-500 text-white' :
                            p.lastAnswerCorrect === false ? 'bg-red-500 text-white' : 'bg-slate-700 text-white'
                            }`} title={p.name}>
                            {p.name.charAt(0)}
                        </div>
                    ))}
                    {battle.participants.length > 8 && (
                        <div className="w-10 h-10 rounded-xl border-2 border-background bg-white/10 flex items-center justify-center text-[10px] font-black">
                            +{battle.participants.length - 8}
                        </div>
                    )}
                </div>

                {isHost && (
                    <div className="flex gap-4">
                        {!isLastQuestion ? (
                            <Button onClick={handleNextQuestion} className="rounded-xl h-12 px-8 font-bold neo-shadow">
                                Câu tiếp theo <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        ) : (
                            <Button onClick={handleFinish} className="rounded-xl h-12 px-8 font-bold bg-yellow-400 hover:bg-yellow-500 text-white neo-shadow-yellow border-none">
                                Finish & Reward <Trophy className="ml-2 w-5 h-5 fill-current" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* In-Game Quiz Component */}
            <div className="max-w-4xl mx-auto">
                {!isHost ? (
                    <QuizParticipantView
                        battle={battle}
                        currentQuestion={currentQuestion}
                        userEmail={userEmail}
                        timeLeft={timeLeft}
                    />
                ) : (
                    <div className="space-y-12 animate-fade-in">
                        {/* Host Question Display (Shared Screen) */}
                        <div className="glass rounded-[3rem] p-12 text-center space-y-8 border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-white/5">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(timeLeft / (battle.timerDuration || 30)) * 100}%` }}
                                    transition={{ duration: 1, ease: "linear" }}
                                />
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black leading-tight italic">{currentQuestion.question}</h2>

                            <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                                {currentQuestion.options.map((option: string, idx: number) => (
                                    <div key={idx} className="glass p-6 rounded-2xl border-white/5 text-left flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-lg ${idx === 0 ? 'bg-primary text-white' :
                                                idx === 1 ? 'bg-secondary text-white' :
                                                    idx === 2 ? 'bg-accent text-white' : 'bg-green-500 text-white'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-xl font-bold">{option}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Host Participant Status */}
                        <div className="glass rounded-[2rem] p-8 space-y-6 border-white/5">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <h3 className="font-black uppercase italic tracking-tighter flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" /> Bảng xếp hạng trực tiếp
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {battle.participants.sort((a: any, b: any) => b.score - a.score).map((p: any) => (
                                    <div key={p.email} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${p.lastAnswerCorrect === true ? 'bg-green-500/10 border-green-500/50' :
                                            p.lastAnswerCorrect === false ? 'bg-red-500/10 border-red-500/50' :
                                                'bg-white/5 border-white/10'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black uppercase">
                                                {p.name.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase truncate max-w-[80px]">{p.name}</span>
                                        </div>
                                        <div className="font-black text-sm">{p.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for student participation
function QuizParticipantView({ battle, currentQuestion, userEmail, timeLeft }: any) {
    const [hasAnswered, setHasAnswered] = useState(false);
    const [lastResult, setLastResult] = useState<'correct' | 'incorrect' | null>(null);
    const [currentQuestionId, setCurrentQuestionId] = useState(-1);
    const { toast } = useToast();

    // Reset when question index changes
    useEffect(() => {
        if (battle.currentQuestionIndex !== currentQuestionId) {
            setHasAnswered(false);
            setLastResult(null);
            setCurrentQuestionId(battle.currentQuestionIndex);
        }
    }, [battle.currentQuestionIndex]);

    const handleAnswer = async (option: string) => {
        if (hasAnswered) return;

        const isCorrect = option === currentQuestion.correctAnswer;
        setHasAnswered(true);
        setLastResult(isCorrect ? 'correct' : 'incorrect');

        try {
            await fetch(`/api/battles/${battle.code}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isCorrect,
                    points: isCorrect ? currentQuestion.points || 100 : 0
                })
            });
        } catch (error) {
            toast({ title: "Lỗi khi gửi kết quả", variant: "destructive" });
        }
    };

    if (hasAnswered) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-[3rem] p-12 text-center space-y-8 border-white/5 min-h-[40vh] flex flex-col justify-center items-center"
            >
                {lastResult === 'correct' ? (
                    <>
                        <div className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center neo-shadow-green mb-4">
                            <CheckCircle2 className="text-white w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-green-500">CHÍNH XÁC!</h2>
                        <p className="text-xl italic font-bold text-muted-foreground">Bản lĩnh lý luận tuyệt vời. Đang chờ câu tiếp theo...</p>
                    </>
                ) : (
                    <>
                        <div className="w-24 h-24 bg-red-500 rounded-[2.5rem] flex items-center justify-center neo-shadow-red mb-4">
                            <XCircle className="text-white w-12 h-12" />
                        </div>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-red-500">TIẾC QUÁ!</h2>
                        <p className="text-xl italic font-bold text-muted-foreground">Đừng nản chí, tri thức cần sự rèn luyện. Đang chờ câu tiếp theo...</p>
                    </>
                )}
            </motion.div>
        );
    }

    if (!currentQuestion) return <div>Đang chờ câu hỏi...</div>;

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-6">
                <Badge className="bg-secondary/20 text-secondary border-none animate-pulse">
                    NHÌN LÊN MÀN HÌNH CHUNG ĐỂ XEM CÂU HỎI
                </Badge>
                {/* Question text is hidden for student to focus on shared screen */}
                <h2 className="text-3xl font-black italic uppercase text-muted-foreground opacity-20">Hãy chọn đáp án đúng</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentQuestion.options.map((option: string, idx: number) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        disabled={timeLeft <= 0}
                        className={`group relative overflow-hidden rounded-[2.5rem] p-12 border-b-8 transition-all active:translate-y-2 active:border-b-0 ${idx === 0 ? 'bg-primary hover:bg-primary/80 border-primary/50' :
                                idx === 1 ? 'bg-secondary hover:bg-secondary/80 border-secondary/50' :
                                    idx === 2 ? 'bg-accent hover:bg-accent/80 border-accent/50' :
                                        'bg-green-500 hover:bg-green-600 border-green-700/50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-6">
                            <span className="text-6xl font-black italic text-white/40 group-hover:text-white/60 transition-colors">
                                {String.fromCharCode(65 + idx)}
                            </span>
                            {/* Option text is also very subtle to force looking at main screen, or can be removed */}
                            {/* <span className="text-2xl font-black text-white">{option}</span> */}
                        </div>
                    </button>
                ))}
            </div>

            <div className="text-center pt-8">
                <div className="inline-flex flex-col items-center gap-2 glass px-8 py-4 rounded-3xl border-white/5">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Điểm hiện tại</p>
                    <p className="text-3xl font-black italic text-primary leading-none">
                        {battle.participants.find((p: any) => p.email === userEmail)?.score || 0}
                    </p>
                </div>
            </div>
        </div>
    );
}

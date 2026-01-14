"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Clock, CheckCircle2, XCircle, ArrowRight, RefreshCw, Star, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface QuizProps {
    quiz: {
        _id?: string;
        title: string;
        questions: Question[];
        xpReward: number;
    };
}

export default function QuizGame({ quiz }: QuizProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    const { toast } = useToast();

    const currentQuestion = quiz.questions[currentStep];
    const progress = ((currentStep) / quiz.questions.length) * 100;

    useEffect(() => {
        if (showResults || isAnswered) return;

        if (timeLeft === 0) {
            handleTimeout();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isAnswered, showResults]);

    const handleTimeout = () => {
        setIsAnswered(true);
        toast({
            title: "Hết thời gian!",
            description: "Bạn đã hết thời gian cho câu hỏi này.",
            variant: "destructive",
        });
    };

    const handleAnswerSubmit = () => {
        if (selectedOption === null) return;

        setIsAnswered(true);
        if (selectedOption === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
            toast({
                title: "Chính xác!",
                description: "Bạn đã nhận được điểm.",
                className: "bg-green-500 text-white border-none",
            });
        } else {
            toast({
                title: "Chưa đúng!",
                description: "Hãy xem giải thích bên dưới.",
                variant: "destructive",
            });
        }
    };

    const nextQuestion = () => {
        if (currentStep < quiz.questions.length - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setTimeLeft(20);
        } else {
            setShowResults(true);

            // Calculation: % correct answers * total reward points
            const xpToAward = Math.round((score / quiz.questions.length) * quiz.xpReward);

            // Award XP via API
            fetch('/api/user/quiz/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    points: xpToAward,
                    quizId: quiz._id
                })
            }).then(v => {
                if (v.ok) {
                    toast({
                        title: "Hành trình vĩ đại!",
                        description: `Bạn đã được cộng ${xpToAward} EXP vào hồ sơ.`,
                    });
                }
            });

            if (score > quiz.questions.length / 2) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    if (showResults) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl mx-auto"
            >
                <Card className="glass border-primary/20 p-8 text-center space-y-8 rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent" />

                    <div className="space-y-4">
                        <Trophy className="w-20 h-20 text-yellow-400 mx-auto animate-bounce" />
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Kết quả thi đấu</h2>
                        <div className="text-6xl font-black text-primary">
                            {Math.round((score / quiz.questions.length) * 100)}%
                        </div>
                        <p className="text-muted-foreground text-lg">
                            Bạn đã trả lời đúng {score}/{quiz.questions.length} câu hỏi.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass p-6 rounded-2xl border-white/5 bg-white/5">
                            <Star className="text-yellow-400 mb-2 mx-auto" />
                            <div className="text-2xl font-bold">+{Math.round((score / quiz.questions.length) * quiz.xpReward)} XP</div>
                            <div className="text-xs text-muted-foreground uppercase font-bold">Tích lũy</div>
                        </div>
                        <div className="glass p-6 rounded-2xl border-white/5 bg-white/5">
                            <Clock className="text-secondary mb-2 mx-auto" />
                            <div className="text-2xl font-bold">Hoàn thành</div>
                            <div className="text-xs text-muted-foreground uppercase font-bold">Thời gian</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button size="lg" className="h-14 neo-shadow rounded-xl font-bold text-lg" onClick={() => window.location.reload()}>
                            <RefreshCw className="mr-2 w-5 h-5" /> Thử thách lại
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-14 rounded-xl font-bold text-lg">
                            <a href="/quiz">Quay lại Quiz Hub</a>
                        </Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-end px-2">
                <div className="space-y-1">
                    <h3 className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Câu hỏi {currentStep + 1} / {quiz.questions.length}</h3>
                    <h2 className="text-2xl font-bold">{quiz.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-primary font-mono font-bold text-xl glass px-4 py-2 rounded-xl border-primary/20">
                    <Clock className="w-5 h-5" /> {timeLeft}s
                </div>
            </div>

            <Progress value={progress} className="h-3 bg-white/10" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="glass border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl leading-relaxed font-bold">
                                {currentQuestion.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <RadioGroup
                                value={selectedOption?.toString()}
                                onValueChange={(v) => setSelectedOption(parseInt(v))}
                                disabled={isAnswered}
                                className="space-y-4"
                            >
                                {currentQuestion.options.map((option, idx) => {
                                    const isCorrect = idx === currentQuestion.correctAnswer;
                                    const isSelected = selectedOption === idx;
                                    let cardClass = "flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer hover:bg-white/5";

                                    if (isAnswered) {
                                        if (isCorrect) cardClass += " border-green-500 bg-green-500/10";
                                        else if (isSelected) cardClass += " border-red-500 bg-red-500/10";
                                        else cardClass += " border-white/5 opacity-50";
                                    } else {
                                        cardClass += isSelected ? " border-primary bg-primary/5" : " border-white/5";
                                    }

                                    return (
                                        <Label key={idx} className={cardClass}>
                                            <RadioGroupItem value={idx.toString()} className="hidden" />
                                            <span className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm shrink-0">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="text-lg font-medium">{option}</span>
                                            {isAnswered && isCorrect && <CheckCircle2 className="ml-auto text-green-500" />}
                                            {isAnswered && isSelected && !isCorrect && <XCircle className="ml-auto text-red-500" />}
                                        </Label>
                                    );
                                })}
                            </RadioGroup>

                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2"
                                >
                                    <h4 className="font-bold flex items-center gap-2 text-primary">
                                        <Info className="w-4 h-4" /> Giải thích:
                                    </h4>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {currentQuestion.explanation}
                                    </p>
                                </motion.div>
                            )}
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            {!isAnswered ? (
                                <Button
                                    className="w-full h-14 neo-shadow rounded-xl font-bold text-lg"
                                    disabled={selectedOption === null}
                                    onClick={handleAnswerSubmit}
                                >
                                    Kiểm tra đáp án
                                </Button>
                            ) : (
                                <Button
                                    className="w-full h-14 neo-shadow rounded-xl font-bold text-lg bg-secondary hover:bg-secondary/90 text-black border-none"
                                    onClick={nextQuestion}
                                >
                                    {currentStep < quiz.questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"} <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, Brain } from 'lucide-react';

interface Flashcard {
    front: string;
    back: string;
}

interface FlashcardSetProps {
    cards: Flashcard[];
}

export default function FlashcardSet({ cards }: FlashcardSetProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) {
        return (
            <div className="glass p-12 rounded-[2rem] border-white/5 text-center space-y-4">
                <Brain className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                <p className="text-muted-foreground italic">Bộ thẻ này hiện chưa có nội dung.</p>
            </div>
        );
    }

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 150);
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-12">
            <div className="flex justify-between items-center px-4">
                <h3 className="font-bold text-muted-foreground uppercase tracking-widest text-sm">
                    Thẻ {currentIndex + 1} / {cards.length}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Học lại từ đầu
                </Button>
            </div>

            <div
                className="relative h-96 w-full perspective-1000 cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full h-full relative preserve-3d"
                >
                    {/* Front */}
                    <Card className="absolute inset-0 backface-hidden glass border-primary/20 flex items-center justify-center p-8 text-center rounded-[2rem] shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Brain className="w-24 h-24" />
                        </div>
                        <p className="text-2xl font-bold leading-relaxed">{cards[currentIndex].front}</p>
                        <div className="absolute bottom-6 text-primary font-bold text-xs uppercase tracking-widest animate-pulse">
                            Click để xem đáp án
                        </div>
                    </Card>

                    {/* Back */}
                    <Card
                        className="absolute inset-0 backface-hidden glass border-secondary/20 flex items-center justify-center p-8 text-center rounded-[2rem] shadow-2xl bg-secondary/5"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <p className="text-xl font-medium leading-relaxed text-muted-foreground">
                            {cards[currentIndex].back}
                        </p>
                    </Card>
                </motion.div>
            </div>

            <div className="flex justify-center gap-6">
                <Button
                    variant="outline"
                    size="icon"
                    className="w-16 h-16 rounded-full border-2 hover:bg-white/10"
                    onClick={prevCard}
                >
                    <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-16 h-16 rounded-full border-2 hover:bg-white/10"
                    onClick={nextCard}
                >
                    <ChevronRight className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
}

"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle2, Lock, Star, ChevronRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Topic {
    _id: string;
    title: string;
    slug: string;
    category: string;
    prerequisites: { _id: string; slug: string; title: string }[];
}

interface LearningPathMapProps {
    topics: Topic[];
    completedTopics: string[];
}

export default function LearningPathMap({ topics, completedTopics }: LearningPathMapProps) {
    // Determine status for each topic
    const pathTopics = useMemo(() => {
        return topics.map((topic) => {
            const isCompleted = completedTopics.includes(topic.slug);
            const isUnlocked = topic.prerequisites.length === 0 ||
                topic.prerequisites.every(p => completedTopics.includes(p.slug));

            return {
                ...topic,
                isCompleted,
                isUnlocked
            };
        });
    }, [topics, completedTopics]);

    return (
        <div className="relative py-20 px-4 flex flex-col items-center">
            {/* Background connecting lines (simplified visual) */}
            <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent left-1/2 -translate-x-1/2 hidden md:block" />

            <div className="w-full max-w-2xl space-y-24 relative">
                {pathTopics.map((topic, index) => {
                    const isLeft = index % 2 === 0;

                    return (
                        <div key={topic._id} className={`flex w-full items-center ${isLeft ? 'justify-start' : 'justify-end'} relative`}>
                            {/* Zig-zag Connecting line for mobile/desktop */}
                            <div className={`absolute top-1/2 -translate-y-1/2 h-0.5 bg-white/5 w-24 hidden md:block ${isLeft ? 'left-full' : 'right-full'}`} />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: isLeft ? -20 : 20 }}
                                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="z-10"
                            >
                                <Link
                                    href={topic.isUnlocked ? `/learn/${topic.slug}` : '#'}
                                    className={`group block relative p-1 rounded-[2.5rem] transition-all duration-500 ${topic.isUnlocked
                                        ? 'hover:scale-105 active:scale-95'
                                        : 'cursor-not-allowed'
                                        }`}
                                >
                                    {/* Main Node */}
                                    <div className={`w-40 h-40 md:w-48 md:h-48 rounded-[2.2rem] flex flex-col items-center justify-center p-6 text-center shadow-2xl border-4 transition-all duration-500 ${topic.isUnlocked
                                        ? topic.isCompleted
                                            ? 'bg-primary text-white border-primary/20 neo-shadow'
                                            : 'glass border-primary/40 bg-white/5 hover:bg-white/10'
                                        : 'bg-black/40 border-white/5 grayscale pointer-events-none opacity-60'
                                        }`}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${topic.isCompleted ? 'bg-white/20' : 'bg-primary/20'
                                            }`}>
                                            {topic.isCompleted ? (
                                                <CheckCircle2 className="w-6 h-6" />
                                            ) : topic.isUnlocked ? (
                                                <BookOpen className="w-6 h-6 text-primary" />
                                            ) : (
                                                <Lock className="w-6 h-6 text-muted-foreground/30" />
                                            )}
                                        </div>

                                        <h3 className="font-black italic uppercase tracking-tighter text-sm md:text-base leading-tight">
                                            {topic.title}
                                        </h3>

                                        {topic.isUnlocked && !topic.isCompleted && (
                                            <Badge variant="secondary" className="mt-4 bg-primary/20 text-primary border-none text-[10px] py-0 px-2 uppercase font-black">
                                                Khám phá
                                            </Badge>
                                        )}

                                        {!topic.isUnlocked && (
                                            <span className="mt-3 text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">
                                                Đang khóa
                                            </span>
                                        )}
                                    </div>

                                    {/* Unlocked indicator for next items */}
                                    {topic.isUnlocked && !topic.isCompleted && (
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                            <Star className="w-4 h-4 text-black fill-black" />
                                        </div>
                                    )}
                                </Link>

                                {/* Prerequisite tooltip info on hover for locked items */}
                                {!topic.isUnlocked && (
                                    <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-48 text-center p-3 glass border-white/5 rounded-xl z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Cần hoàn thành:</p>
                                        {topic.prerequisites.map(p => (
                                            <div key={p.slug} className="text-xs font-bold text-primary">{p.title}</div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Legend / Info */}
            <div className="mt-32 flex flex-wrap justify-center gap-8 p-8 glass border-white/5 rounded-[2rem]">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Đã học xong</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-primary/40 bg-white/5" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sẵn sàng học</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-white/5 bg-black/40" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Đang khóa</span>
                </div>
            </div>
        </div>
    );
}

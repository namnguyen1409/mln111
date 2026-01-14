"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Flame, BookOpen, MessageSquare, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyTasksWidget() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch('/api/tasks');
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data);
                }
            } catch (error) {
                console.error("Failed to fetch daily tasks", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (isLoading) {
        return (
            <Card className="glass border-white/5 rounded-[2.5rem] p-8 animate-pulse">
                <div className="h-6 w-48 bg-white/5 rounded mb-6" />
                <div className="space-y-4">
                    <div className="h-16 w-full bg-white/5 rounded-2xl" />
                    <div className="h-16 w-full bg-white/5 rounded-2xl" />
                </div>
            </Card>
        );
    }

    if (tasks.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'read_article': return <BookOpen className="w-5 h-5 text-primary" />;
            case 'comment': return <MessageSquare className="w-5 h-5 text-secondary" />;
            case 'quiz_complete': return <Target className="w-5 h-5 text-accent" />;
            default: return <Zap className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getRequirementLabel = (task: any) => {
        if (task.type === 'read_article') {
            const mins = Math.floor(task.requirement / 60);
            return `${mins} phút`;
        }
        return `${task.requirement} lần`;
    };

    const getProgressLabel = (task: any) => {
        if (task.type === 'read_article') {
            const mins = Math.floor(task.currentProgress / 60);
            const totalMins = Math.floor(task.requirement / 60);
            return `${mins}/${totalMins}m`;
        }
        return `${task.currentProgress}/${task.requirement}`;
    };

    return (
        <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap className="w-24 h-24 text-yellow-400" />
            </div>

            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                    <Zap className="text-yellow-400 fill-yellow-400" /> Nhiệm vụ hàng ngày
                </CardTitle>
            </CardHeader>

            <CardContent className="px-0 space-y-4">
                {tasks.map((task, idx) => {
                    const progress = (task.currentProgress / task.requirement) * 100;

                    return (
                        <motion.div
                            key={task._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-5 rounded-3xl border transition-all ${task.isCompleted
                                    ? 'bg-green-500/10 border-green-500/20'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${task.isCompleted ? 'bg-green-500/20' : 'bg-white/5'
                                        }`}>
                                        {task.isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : getIcon(task.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm leading-tight">{task.title}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                                            Yêu cầu: {getRequirementLabel(task)} • +{task.expReward} EXP
                                        </p>
                                    </div>
                                </div>
                                <div className="text-xs font-black italic tracking-tighter text-muted-foreground">
                                    {getProgressLabel(task)}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Progress value={progress} className={`h-2 rounded-full ${task.isCompleted ? 'bg-green-500/20' : 'bg-white/10'}`}>
                                    <div
                                        className={`h-full transition-all ${task.isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </Progress>
                            </div>
                        </motion.div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface HostBattleButtonProps {
    quizId?: string;
    topicId?: string;
    topicSlug: string;
}

export default function HostBattleButton({ quizId, topicId, topicSlug }: HostBattleButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleCreateBattle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link from firing
        e.stopPropagation(); // Prevent Card click if any

        setLoading(true);
        try {
            const res = await fetch('/api/battles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId,
                    topicId,
                    topicSlug: topicSlug || 'general'
                }),
            });

            if (res.ok) {
                const battle = await res.json();
                toast({ title: "Thành công", description: "Đã tạo phòng Battle!" });
                router.push(`/admin/battles/${battle.code}`);
            } else {
                toast({ title: "Lỗi", description: "Không thể tạo phòng battle.", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Lỗi", description: "Lỗi kết nối.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCreateBattle}
            disabled={loading}
            variant="outline"
            className="w-full rounded-2xl h-12 border-secondary/20 bg-secondary/5 hover:bg-secondary/10 gap-2 italic uppercase font-black text-secondary"
        >
            {loading ? "Đang tạo..." : (
                <>
                    <Zap className="w-4 h-4 fill-current" /> Host Battle
                </>
            )}
        </Button>
    );
}

"use strict";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    History,
    PlusCircle,
    MinusCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Gamepad2,
    LogIn
} from "lucide-react";

interface PointLog {
    _id: string;
    amount: number;
    reason: string;
    type: 'add' | 'deduct';
    createdAt: string;
    metadata?: any;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function PointHistory() {
    const [logs, setLogs] = useState<PointLog[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/user/points/history?page=${page}&limit=10`);
                const data = await res.json();
                if (data.success) {
                    setLogs(data.data);
                    setPagination(data.pagination);
                }
            } catch (error) {
                console.error("Failed to fetch point history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [page]);

    const getIcon = (reason: string) => {
        if (reason.toLowerCase().includes("điểm danh")) return <LogIn className="w-4 h-4 text-blue-500" />;
        if (reason.toLowerCase().includes("trận đấu") || reason.toLowerCase().includes("battle")) return <Gamepad2 className="w-4 h-4 text-purple-500" />;
        if (reason.toLowerCase().includes("bài học") || reason.toLowerCase().includes("quiz")) return <Trophy className="w-4 h-4 text-yellow-500" />;
        return <History className="w-4 h-4 text-gray-500" />;
    };

    if (loading && page === 1) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold text-lg">Lịch sử tích lũy</h2>
                </div>
                {pagination && (
                    <div className="text-sm text-muted-foreground">
                        Tổng cộng: <strong>{pagination.total}</strong> giao dịch
                    </div>
                )}
            </div>

            <div className="divide-y divide-border">
                {logs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Chưa có lịch sử giao điểm nào. Hãy bắt đầu học tập để tích lũy!
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log._id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center">
                                    {getIcon(log.reason)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm sm:text-base">{log.reason}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(log.createdAt), "HH:mm, dd MMMM yyyy", { locale: vi })}
                                    </p>
                                </div>
                            </div>
                            <div className={`flex items-center gap-1 font-bold ${log.type === 'add' ? 'text-green-500' : 'text-red-500'}`}>
                                {log.type === 'add' ? <PlusCircle className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                                <span>{log.amount}</span>
                                <span className="text-xs font-normal text-muted-foreground ml-1">EXP</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1 || loading}
                        className="p-1 rounded-md hover:bg-background border border-border disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium">
                        Trang {page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                        disabled={page === pagination.totalPages || loading}
                        className="p-1 rounded-md hover:bg-background border border-border disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DataManagement() {
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await fetch('/api/admin/export');
            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mln111-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({ title: "Xuất dữ liệu thành công" });
        } catch (error) {
            console.error('Export error:', error);
            toast({ title: "Lỗi khi xuất dữ liệu", variant: "destructive" });
        } finally {
            setExporting(false);
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = JSON.parse(e.target?.result as string);
                    const response = await fetch('/api/admin/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(content)
                    });

                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || 'Import failed');

                    toast({
                        title: "Nhập dữ liệu thành công",
                        description: `Đã nhập: ${result.results.topics} bài học, ${result.results.quizzes} quiz, ${result.results.flashcards} bộ thẻ.`
                    });
                } catch (err: any) {
                    toast({ title: "Lỗi định dạng file hoặc dữ liệu", description: err.message, variant: "destructive" });
                } finally {
                    setImporting(false);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('Import error:', error);
            toast({ title: "Lỗi khi đọc file", variant: "destructive" });
            setImporting(false);
        }
    };

    return (
        <div className="flex flex-wrap gap-4">
            <Button
                onClick={handleExport}
                disabled={exporting}
                className="rounded-xl h-12 px-6 font-bold neo-shadow"
            >
                {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Xuất toàn bộ dữ liệu
            </Button>

            <div className="relative">
                <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    id="import-file"
                    disabled={importing}
                />
                <Button
                    variant="outline"
                    className="rounded-xl h-12 px-6 font-bold border-white/10 hover:bg-white/5"
                    asChild
                >
                    <label htmlFor="import-file">
                        {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Nhập dữ liệu (.json)
                    </label>
                </Button>
            </div>

            <p className="w-full text-[10px] text-muted-foreground italic mt-2">
                * Lưu ý: Nhập dữ liệu sẽ ghi đè nội dung cũ nếu trùng Slug bài học/thẻ hoặc tiêu đề Quiz.
            </p>
        </div>
    );
}

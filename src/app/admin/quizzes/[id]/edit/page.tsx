"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, Save, Gamepad2, HelpCircle, Bot, Upload, FileJson, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

export default function EditQuizPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        topicSlug: '',
        xpReward: 100,
        questions: [
            { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }
        ]
    });

    const handleImportJson = () => {
        try {
            const data = JSON.parse(jsonInput);
            if (!data.title || !data.questions) {
                toast.error("JSON không đúng định dạng Quiz.");
                return;
            }
            // Preserve the ID if it exists in the incoming data or current state
            setFormData({ ...data, _id: (formData as any)._id });
            setIsImportModalOpen(false);
            setJsonInput('');
            toast.success("Đã nhập dữ liệu thành công!");
        } catch (error) {
            toast.error("JSON không hợp lệ.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setJsonInput(content);
        };
        reader.readAsText(file);
    };

    const handleExportJson = () => {
        const dataStr = JSON.stringify(formData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `${formData.topicSlug || 'quiz'}-export.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleDownloadSample = () => {
        const sample = {
            title: "Trắc nghiệm Quy luật Lượng - Chất",
            topicSlug: "quy-luat-luong-chat",
            xpReward: 100,
            questions: [
                {
                    question: "Câu hỏi mẫu 1?",
                    options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
                    correctAnswer: 0,
                    explanation: "Giải thích chi tiết tại sao A đúng."
                }
            ]
        };
        const dataStr = JSON.stringify(sample, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', "quiz-sample.json");
        linkElement.click();
    };

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`/api/admin/quizzes/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setFormData(data);
                } else {
                    toast.error("Không tìm thấy câu đố");
                    router.push('/admin/quizzes');
                }
            } catch (error) {
                toast.error("Lỗi tải dữ liệu");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchQuiz();
    }, [id, router]);

    const handleAddQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
        });
    };

    const handleRemoveQuestion = (index: number) => {
        setFormData({
            ...formData,
            questions: formData.questions.filter((_, i) => i !== index)
        });
    };

    const handleQuestionChange = (qIndex: number, field: string, value: any) => {
        const newQuestions = [...formData.questions];
        (newQuestions[qIndex] as any)[field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/quizzes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Đã cập nhật câu đố!");
                router.push('/admin/quizzes');
            } else {
                toast.error("Có lỗi xảy ra khi cập nhật");
            }
        } catch (error) {
            toast.error("Lỗi khi kết nối server");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Đang đồng bộ kiến thức...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
                        <Link href="/admin/quizzes"><ChevronLeft className="w-4 h-4 mr-1" /> Danh sách Quiz</Link>
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleDownloadSample} className="rounded-xl border-white/10 gap-2">
                            <Download className="w-4 h-4" /> Mẫu
                        </Button>
                        <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="rounded-xl border-white/10 gap-2">
                            <Upload className="w-4 h-4" /> Nhập JSON
                        </Button>
                        <Button variant="outline" onClick={handleExportJson} className="rounded-xl border-white/10 gap-2">
                            <FileJson className="w-4 h-4" /> Xuất JSON
                        </Button>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-primary tracking-widest">Tiêu đề Quiz</label>
                            <input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-xl font-bold"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-secondary tracking-widest">Topic Slug (Liên kết bài học)</label>
                            <input
                                value={formData.topicSlug}
                                onChange={(e) => setFormData({ ...formData, topicSlug: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-secondary outline-none transition-all font-mono text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">EXP Thưởng khi hoàn thành</label>
                            <input
                                type="number"
                                value={formData.xpReward}
                                onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>
                    </div>
                </Card>

                <div className="space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <h2 className="text-2xl font-black italic flex items-center gap-3">
                            <HelpCircle className="text-primary w-6 h-6" /> Hiệu chỉnh Câu hỏi
                        </h2>
                        <Button type="button" onClick={handleAddQuestion} variant="outline" className="rounded-xl border-primary/20 bg-primary/5 gap-2">
                            <Plus className="w-4 h-4" /> Thêm câu hỏi
                        </Button>
                    </div>

                    <div className="space-y-8">
                        {formData.questions.map((q, qIdx) => (
                            <Card key={qIdx} className="glass border-white/5 rounded-[2.5rem] p-8 space-y-8 relative group">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveQuestion(qIdx)}
                                    className="absolute top-8 right-8 text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    disabled={formData.questions.length === 1}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase opacity-40 tracking-widest text-primary">Câu hỏi {qIdx + 1}</label>
                                    <textarea
                                        value={q.question}
                                        onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 focus:border-primary outline-none transition-all h-24 text-lg font-bold"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className={`flex gap-4 items-center p-4 rounded-2xl border ${q.correctAnswer === oIdx ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
                                            <input
                                                type="radio"
                                                name={`correct-${qIdx}`}
                                                checked={q.correctAnswer === oIdx}
                                                onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                                                className="w-5 h-5 accent-primary shrink-0"
                                            />
                                            <input
                                                value={opt}
                                                onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                className="bg-transparent border-none outline-none w-full font-medium"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-green-500 tracking-widest">Giải thích đáp án</label>
                                    <textarea
                                        value={q.explanation}
                                        onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-green-500 outline-none transition-all h-24 text-sm italic"
                                        required
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-6">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow h-16 neo-shadow rounded-[2rem] font-black text-xl bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? "Đang lưu lưu kiến thức..." : "Cập nhật & Xuất bản Quiz"} <Save className="ml-3" />
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-[2rem] px-12 border-white/10 font-bold">
                        <Link href="/admin/quizzes">Hủy bỏ</Link>
                    </Button>
                </div>
            </form>

            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="glass border-white/10 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Nhập dữ liệu Quiz (JSON)</DialogTitle>
                        <DialogDescription>
                            Dán mã JSON hoặc tải tệp lên để tự động điền các trường nội dung.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <span>Mã JSON</span>
                            <Button variant="ghost" size="sm" onClick={handleDownloadSample} className="h-6 gap-1 text-[10px] hover:text-primary">
                                <Download className="w-3 h-3" /> Tải mẫu
                            </Button>
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all h-64 font-mono text-xs"
                            placeholder='{"title": "...", "questions": [...] }'
                        />
                        <div className="flex items-center gap-4">
                            <label className="flex-grow">
                                <div className="flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-primary/50 rounded-2xl p-4 cursor-pointer transition-all bg-white/5 text-sm font-bold">
                                    <Upload className="w-4 h-4" /> Tải tệp .json lên
                                </div>
                                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setJsonInput('')}
                                className="h-14 px-6 rounded-2xl border-white/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleImportJson} className="rounded-xl neo-shadow px-8">Xác nhận nhập</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

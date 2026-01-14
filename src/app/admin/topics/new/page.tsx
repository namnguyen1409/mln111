"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, Save, FileText, HelpCircle, Lightbulb, Download, Upload, FileJson, Target, Tag, Bot, ListOrdered, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

export default function NewTopicPage() {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'co-ban',
        customCategory: '',
        learningOutcome: '',
        coreConcept: '',
        keyPoints: [''],
        example: '',
        thoughtQuestion: '',
        prerequisites: [] as string[],
        order: 0,
        quizContent: [{
            question: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            points: 100
        }]
    });
    const [allTopics, setAllTopics] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchTopics = async () => {
            const res = await fetch('/api/admin/topics');
            if (res.ok) {
                const data = await res.json();
                setAllTopics(data);
            }
        };
        fetchTopics();
    }, []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title' && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase()
                    .replace(/ /g, '-')
                    .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
                    .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
                    .replace(/[íìỉĩị]/g, 'i')
                    .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
                    .replace(/[úùủũụưứừửữự]/g, 'u')
                    .replace(/[ýỳỷỹỵ]/g, 'y')
                    .replace(/đ/g, 'd')
                    .replace(/[^\w-]+/g, '')
            }));
        }
    };

    const handleKeyPointChange = (index: number, value: string) => {
        const newPoints = [...formData.keyPoints];
        newPoints[index] = value;
        setFormData(prev => ({ ...prev, keyPoints: newPoints }));
    };

    const addKeyPoint = () => {
        setFormData(prev => ({ ...prev, keyPoints: [...prev.keyPoints, ''] }));
    };

    const removeKeyPoint = (index: number) => {
        setFormData(prev => ({ ...prev, keyPoints: prev.keyPoints.filter((_, i) => i !== index) }));
    };

    const handleQuizChange = (qIndex: number, field: string, value: any) => {
        const newQuiz = [...formData.quizContent];
        if (field.startsWith('option_')) {
            const optIndex = parseInt(field.split('_')[1]);
            newQuiz[qIndex].options[optIndex] = value;
        } else {
            (newQuiz[qIndex] as any)[field] = value;
        }
        setFormData(prev => ({ ...prev, quizContent: newQuiz }));
    };

    const addQuizQuestion = () => {
        setFormData(prev => ({
            ...prev,
            quizContent: [...prev.quizContent, { question: '', options: ['', '', '', ''], correctAnswer: '', points: 100 }]
        }));
    };

    const removeQuizQuestion = (index: number) => {
        setFormData(prev => ({ ...prev, quizContent: prev.quizContent.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.keyPoints.filter(p => p.trim() !== '').length === 0) {
            toast({ title: "Lỗi", description: "Phải có ít nhất 1 luận điểm", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/admin/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    slug: formData.slug,
                    category: formData.category,
                    customCategory: formData.category === 'khac' ? formData.customCategory : undefined,
                    learningOutcome: formData.learningOutcome,
                    content: {
                        coreConcept: formData.coreConcept,
                        keyPoints: formData.keyPoints.filter(p => p.trim() !== ''),
                        example: formData.example,
                        thoughtQuestion: formData.thoughtQuestion
                    },
                    prerequisites: formData.prerequisites,
                    order: formData.order,
                    quizContent: formData.quizContent.filter(q => q.question.trim() !== '')
                }),
            });

            if (res.ok) {
                toast({ title: "Thành công", description: "Bài học đã được tạo!" });
                router.push('/admin/topics');
            } else {
                const err = await res.json();
                throw new Error(err.error || "Có lỗi xảy ra");
            }
        } catch (error: any) {
            toast({ title: "Lỗi", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImportJson = () => {
        try {
            const data = JSON.parse(jsonInput);
            setFormData({
                title: data.title || '',
                slug: data.slug || '',
                category: data.category || 'co-ban',
                customCategory: data.customCategory || '',
                learningOutcome: data.learningOutcome || '',
                coreConcept: data.content?.coreConcept || '',
                keyPoints: data.content?.keyPoints || [''],
                example: data.content?.example || '',
                thoughtQuestion: data.content?.thoughtQuestion || '',
                prerequisites: data.prerequisites || [],
                order: data.order || 0,
                quizContent: data.quizContent || [{
                    question: '',
                    options: ['', '', '', ''],
                    correctAnswer: '',
                    points: 100
                }]
            });
            setIsImportModalOpen(false);
            setJsonInput('');
            toast({ title: "Nhập dữ liệu thành công" });
        } catch (error) {
            toast({ title: "Lỗi định dạng JSON", variant: "destructive" });
        }
    };

    const handleCopyAIInstructor = () => {
        const prompt = `Hãy đóng vai một chuyên gia Triết học Mác-Lênin. Tôi cần bạn tạo một tệp JSON chứa nội dung bài học theo cấu trúc chuẩn:
{
  "title": "Tiêu đề",
  "slug": "url-than-thien",
  "category": "nguyen-ly | quy-luat | pham-tru | co-ban | khac",
  "learningOutcome": "Mục tiêu",
  "content": {
    "coreConcept": "Định nghĩa cốt lõi",
    "keyPoints": ["Luận điểm 1", "Luận điểm 2"],
    "example": "Ví dụ thực tế VN",
    "thoughtQuestion": "Câu hỏi gợi mở"
  },
  "quizContent": [
    {
      "question": "Câu hỏi multiple choice?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "Đáp án đúng (phải khớp 1 trong các options)",
      "points": 100
    }
  ]
}
Chỉ phản hồi JSON. Chủ đề: [CHỦ ĐỀ]`;
        navigator.clipboard.writeText(prompt);
        toast({ title: "Đã sao chép hướng dẫn AI" });
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                        <Link href="/admin/topics"><ChevronLeft className="w-4 h-4 mr-1" /> Danh sách bài học</Link>
                    </Button>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Tạo bài học mới</h1>
                </div>

                <div className="flex gap-3">
                    <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-white/10 gap-2">
                                <Upload className="w-4 h-4" /> Nhập JSON
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-white/10 max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Nhập từ JSON</DialogTitle>
                            </DialogHeader>
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 h-64 font-mono text-xs"
                                placeholder='JSON content...'
                            />
                            <DialogFooter>
                                <Button onClick={handleImportJson}>Xác nhận</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={handleCopyAIInstructor} className="rounded-xl border-primary/20 bg-primary/5 text-primary gap-2">
                        <Bot className="w-4 h-4" /> AI Prompt
                    </Button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-primary">Tiêu đề</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-secondary">Slug</label>
                            <input
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-secondary outline-none font-mono text-sm"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-muted-foreground">Danh mục</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
                            >
                                <option value="co-ban">Cơ bản</option>
                                <option value="nguyen-ly">Nguyên lý</option>
                                <option value="quy-luat">Quy luật</option>
                                <option value="pham-tru">Phạm trù</option>
                                <option value="khac">Khác</option>
                            </select>
                        </div>
                        {formData.category === 'khac' && (
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase text-accent">Danh mục tùy chỉnh</label>
                                <input
                                    name="customCategory"
                                    value={formData.customCategory}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4"
                                    required
                                />
                            </div>
                        )}
                        <div className="space-y-3 col-span-full">
                            <label className="text-xs font-black uppercase text-primary flex items-center gap-2">
                                <Target className="w-4 h-4" /> Mục tiêu bài học (Learning Outcome)
                            </label>
                            <textarea
                                name="learningOutcome"
                                value={formData.learningOutcome}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-primary flex items-center gap-2">
                                <GitBranch className="w-4 h-4" /> Bài học tiên quyết (Locked)
                            </label>
                            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-4 glass rounded-2xl border-white/5">
                                {allTopics.map(topic => (
                                    <label key={topic._id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.prerequisites.includes(topic._id)}
                                            onChange={(e) => {
                                                const newPrereqs = e.target.checked
                                                    ? [...formData.prerequisites, topic._id]
                                                    : formData.prerequisites.filter(id => id !== topic._id);
                                                setFormData({ ...formData, prerequisites: newPrereqs });
                                            }}
                                            className="rounded border-white/10 bg-white/5"
                                        />
                                        {topic.title}
                                    </label>
                                ))}
                                {allTopics.length === 0 && <p className="text-xs text-muted-foreground italic">Chưa có bài học nào khác.</p>}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-secondary flex items-center gap-2">
                                <ListOrdered className="w-4 h-4" /> Thứ tự hiển thị
                            </label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-secondary outline-none"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                    <div className="space-y-3">
                        <label className="text-sm font-black flex items-center gap-2">
                            <Lightbulb className="text-yellow-400 w-5 h-5" /> Nội dung cốt lõi
                        </label>
                        <textarea
                            name="coreConcept"
                            value={formData.coreConcept}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 min-h-[120px]"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-black text-primary">Các luận điểm chính</label>
                            <Button type="button" onClick={addKeyPoint} variant="outline" size="sm" className="rounded-xl border-primary/20 bg-primary/5">
                                + Thêm
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {formData.keyPoints.map((point, idx) => (
                                <div key={idx} className="flex gap-3 items-center group">
                                    <input
                                        value={point}
                                        onChange={(e) => handleKeyPointChange(idx, e.target.value)}
                                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                                        placeholder={`Luận điểm ${idx + 1}`}
                                    />
                                    {formData.keyPoints.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => removeKeyPoint(idx)}
                                            className="text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 space-y-4">
                        <label className="text-sm font-black flex items-center gap-2 text-secondary">
                            Ví dụ đời thực
                        </label>
                        <textarea
                            name="example"
                            value={formData.example}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 h-40 text-sm"
                        />
                    </Card>

                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 space-y-4">
                        <label className="text-sm font-black flex items-center gap-2 text-accent">
                            Câu hỏi gợi mở
                        </label>
                        <textarea
                            name="thoughtQuestion"
                            value={formData.thoughtQuestion}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 h-40 text-sm"
                        />
                    </Card>
                </div>

                {/* Quiz Questions Section */}
                <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                    <div className="flex justify-between items-center border-b border-white/5 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                                <HelpCircle className="text-yellow-400 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black italic uppercase tracking-tighter">Bộ câu hỏi Quiz (Live Battle)</h2>
                                <p className="text-xs text-muted-foreground uppercase font-black">Các câu hỏi sẽ được dùng cho tự học và thi đấu lớp học</p>
                            </div>
                        </div>
                        <Button type="button" onClick={addQuizQuestion} variant="outline" className="rounded-xl border-primary/20 bg-primary/5">
                            + Thêm câu hỏi
                        </Button>
                    </div>

                    <div className="space-y-12">
                        {formData.quizContent.map((quiz, qIdx) => (
                            <div key={qIdx} className="space-y-6 p-6 glass rounded-3xl border-white/5 relative group">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeQuizQuestion(qIdx)}
                                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white p-0 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>

                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-primary">Câu hỏi {qIdx + 1}</label>
                                    <textarea
                                        value={quiz.question}
                                        onChange={(e) => handleQuizChange(qIdx, 'question', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 min-h-[80px]"
                                        placeholder="Nhập nội dung câu hỏi..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {quiz.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="space-y-2">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-black uppercase text-muted-foreground">Lựa chọn {String.fromCharCode(65 + oIdx)}</label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuizChange(qIdx, 'correctAnswer', opt)}
                                                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${quiz.correctAnswer === opt && opt !== '' ? 'bg-green-500 text-white' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                                                >
                                                    Đúng
                                                </button>
                                            </div>
                                            <input
                                                value={opt}
                                                onChange={(e) => handleQuizChange(qIdx, `option_${oIdx}`, e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                                                placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="pt-8 flex gap-6">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow h-16 neo-shadow rounded-[2rem] font-black text-xl"
                    >
                        {isSubmitting ? "Đang tạo..." : "Tạo bài học"} <Save className="ml-3" />
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-[2rem] px-12 border-white/10">
                        <Link href="/admin/topics">Hủy</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}

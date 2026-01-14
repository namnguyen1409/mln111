"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Plus, Trash2, Save, FileText, HelpCircle, Lightbulb, Download, Upload, FileJson, Target, Tag, Bot, Copy } from 'lucide-react';
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

export default function CreateTopicPage() {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'co-ban',
        customCategory: '',
        learningOutcome: '',
        coreConcept: '',
        keyPoints: [''],
        example: '',
        thoughtQuestion: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
        if (name === 'title' && !formData.slug) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.keyPoints.filter(p => p.trim() !== '').length === 0) {
            toast({ title: "Lỗi", description: "Phải có ít nhất 1 luận điểm", variant: "destructive" });
            return;
        }

        if (formData.category === 'khac' && !formData.customCategory.trim()) {
            toast({ title: "Lỗi", description: "Vui lòng nhập danh mục tùy chỉnh", variant: "destructive" });
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
                    }
                }),
            });

            if (res.ok) {
                toast({ title: "Thành công", description: "Bài học đã được cộng đồng đón nhận!" });
                router.push('/learn');
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

    const handleExportJson = () => {
        const dataToExport = {
            title: formData.title,
            slug: formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            category: formData.category,
            customCategory: formData.category === 'khac' ? formData.customCategory : undefined,
            learningOutcome: formData.learningOutcome,
            content: {
                coreConcept: formData.coreConcept,
                keyPoints: formData.keyPoints.filter(p => p.trim() !== ''),
                example: formData.example,
                thoughtQuestion: formData.thoughtQuestion
            }
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${dataToExport.slug || 'topic-template'}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: "Đã xuất file", description: "Dữ liệu bài học đã được tải về máy." });
    };

    const handleDownloadSample = () => {
        const sample = {
            title: "Tên bài học mẫu",
            slug: "ten-bai-hoc-mau",
            category: "nguyen-ly",
            learningOutcome: "Học xong bài này, sinh viên sẽ nắm vững...",
            content: {
                coreConcept: "Nội dung tóm tắt quan trọng nhất của bài học.",
                keyPoints: [
                    "Luận điểm chính thứ nhất",
                    "Luận điểm chính thứ hai"
                ],
                example: "Ví dụ minh họa cụ thể để minh họa khái niệm này.",
                thoughtQuestion: "Câu hỏi gợi mở cho người học?"
            }
        };

        const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mau-bai-hoc-mln111.json`;
        link.click();
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
                thoughtQuestion: data.content?.thoughtQuestion || ''
            });
            setIsImportModalOpen(false);
            setJsonInput('');
            toast({ title: "Nhập dữ liệu thành công", description: "Form đã được điền tự động từ JSON." });
        } catch (error) {
            toast({ title: "Lỗi định dạng", description: "JSON không hợp lệ. Vui lòng kiểm tra lại cấu trúc.", variant: "destructive" });
        }
    };

    const handleCopyAIInstructor = () => {
        const prompt = `Hãy đóng vai một chuyên gia Triết học Mác-Lênin. Tôi cần bạn tạo một tệp JSON chứa nội dung bài học theo cấu trúc chuẩn để nhập vào hệ thống của tôi.
Cấu trúc JSON cần có:
{
  "title": "Tiêu đề bài học (Ví dụ: Quy luật Mâu thuẫn)",
  "slug": "url-than-thien (Ví dụ: quy-luat-mau-thuan)",
  "category": "Một trong ['co-ban', 'nguyen-ly', 'quy-luat', 'pham-tru', 'khac']",
  "learningOutcome": "Mục tiêu bài học cụ thể",
  "content": {
    "coreConcept": "Định nghĩa cốt lõi, ngắn gọn",
    "keyPoints": [
      "Luận điểm chính thứ nhất",
      "Luận điểm chính thứ hai"
    ],
    "example": "Ví dụ minh họa thực tế tại Việt Nam",
    "thoughtQuestion": "Câu hỏi gợi mở sâu sắc"
  }
}

export interface ITopic extends Document {
    title: string;
    slug: string;

    content: {
        coreConcept: string;
        keyPoints: string[];
        example: string;
        thoughtQuestion: string;
    };

    learningOutcome: string;

    category:
    | "nguyen-ly"
    | "quy-luat"
    | "pham-tru"
    | "co-ban"
    | "khac";

    customCategory?: string;

    createdAt: Date;
    updatedAt: Date;
}

/**
 * Schema MongoDB
 */
const TopicSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        content: {
            coreConcept: {
                type: String,
                required: true
            },

            keyPoints: {
                type: [String],
                validate: {
                    validator: function (arr: string[]) {
                        return arr && arr.length > 0;
                    },
                    message: "Phải có ít nhất 1 luận điểm"
                }
            },

            example: {
                type: String,
                required: true
            },

            thoughtQuestion: {
                type: String,
                required: true
            }
        },

        learningOutcome: {
            type: String,
            required: true
        },

        category: {
            type: String,
            enum: ["nguyen-ly", "quy-luat", "pham-tru", "co-ban", "khac"],
            default: "co-ban"
        },

        customCategory: {
            type: String,
            trim: true,
            required: function (this: ITopic) {
                return this.category === "khac";
            }
        }
    },
    {
        timestamps: true
    }
);

Hãy phản hồi CHỈ bằng mã JSON, không thêm văn bản giải thích nào khác. Theo chủ đề: [CHÈN CHỦ ĐỀ CỦA BÀI HỌC VÀO ĐÂY]`;

        navigator.clipboard.writeText(prompt);
        toast({
            title: "Đã sao chép hướng dẫn AI",
            description: "Bây giờ bạn có thể dán vào ChatGPT/Gemini để tạo nội dung chuẩn.",
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result as string;
                setJsonInput(result);
                toast({ title: "Đã tải file", description: "Bạn có thể nhấn 'Xác nhận nhập' để điền form." });
            } catch (err) {
                toast({ title: "Lỗi đọc file", variant: "destructive" });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <Button asChild variant="ghost" size="sm" className="hover:bg-white/10 -ml-2 text-muted-foreground">
                        <Link href="/admin"><ChevronLeft className="w-4 h-4 mr-1" /> Admin Hub</Link>
                    </Button>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Viết bài mới cho Learn Fast</h1>
                    <p className="text-muted-foreground text-lg italic underline decoration-primary decoration-2 underline-offset-4">
                        Tri thức là sức mạnh - Hãy truyền tải nó một cách dễ hiểu nhất.
                    </p>
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
                                <DialogTitle className="text-2xl font-black italic flex items-center gap-3">
                                    <FileJson className="text-primary" /> Nhập bài học từ JSON
                                </DialogTitle>
                                <DialogDescription>
                                    Dán mã JSON hoặc tải file lên để điền nhanh nội dung bài học.
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
                                    placeholder='{"title": "...", "slug": "...", ...}'
                                />
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept=".json"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="rounded-xl w-full">
                                        <FileJson className="mr-2 w-4 h-4" /> Chọn file từ máy tính
                                    </Button>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>Hủy</Button>
                                <Button onClick={handleImportJson} className="rounded-xl neo-shadow px-8">Xác nhận nhập</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={handleCopyAIInstructor} className="rounded-xl border-primary/20 bg-primary/5 text-primary gap-2 hover:bg-primary/10 transition-all">
                        <Bot className="w-4 h-4" /> Copy AI Instructor
                    </Button>

                    <Button variant="outline" onClick={handleExportJson} className="rounded-xl border-white/10 gap-2">
                        <Download className="w-4 h-4" /> Xuất JSON
                    </Button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <FileText className="w-32 h-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-primary tracking-widest">Tiêu đề bài học</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-xl font-bold"
                                placeholder="Ví dụ: Quy luật Mâu thuẫn..."
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-secondary tracking-widest">Slug (URL)</label>
                            <input
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-secondary outline-none transition-all font-mono text-sm"
                                placeholder="quy-luat-mau-thuan"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Danh mục</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="co-ban">Cơ bản</option>
                                <option value="nguyen-ly">Nguyên lý</option>
                                <option value="quy-luat">Quy luật</option>
                                <option value="pham-tru">Phạm trù</option>
                                <option value="khac">Khác (Tùy chỉnh)</option>
                            </select>
                        </div>

                        {formData.category === 'khac' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-black uppercase text-accent tracking-widest flex items-center gap-2">
                                    <Tag className="w-3 h-3" /> Tên danh mục tùy chỉnh
                                </label>
                                <input
                                    name="customCategory"
                                    value={formData.customCategory}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-accent/20 rounded-2xl px-6 py-4 focus:border-accent outline-none transition-all"
                                    placeholder="Ví dụ: Ý thức hệ, Logic học..."
                                    required={formData.category === 'khac'}
                                />
                            </div>
                        )}

                        <div className="space-y-3 col-span-full">
                            <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                <Target className="w-4 h-4" /> Sau bài học này, bạn sẽ nắm vững (Learning Outcome)
                            </label>
                            <textarea
                                name="learningOutcome"
                                value={formData.learningOutcome}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all h-24"
                                placeholder="Ví dụ: Hiểu rõ nguồn gốc, bản chất của mâu thuẫn và biết cách vận dụng trong thực tế..."
                                required
                            />
                        </div>
                    </div>
                </Card>

                {/* Content Details */}
                <div className="grid grid-cols-1 gap-8">
                    <Card className="glass border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                        <div className="space-y-3">
                            <label className="text-sm font-black flex items-center gap-2">
                                <Lightbulb className="text-yellow-400 w-5 h-5" /> Nội dung cốt lõi (Khái quát nhất)
                            </label>
                            <textarea
                                name="coreConcept"
                                value={formData.coreConcept}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 focus:border-primary outline-none transition-all h-32 text-lg leading-relaxed"
                                placeholder="Tóm tắt ngắn gọn nhất về chủ đề này..."
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-black flex items-center gap-2 text-primary">
                                    <Plus className="w-5 h-5" /> Các luận điểm chính
                                </label>
                                <Button type="button" onClick={addKeyPoint} variant="outline" size="sm" className="rounded-xl border-primary/20 bg-primary/5">
                                    + Thêm dòng
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {formData.keyPoints.map((point, idx) => (
                                    <div key={idx} className="flex gap-3 items-center group">
                                        <span className="text-xs font-black text-white/20">{idx + 1}</span>
                                        <input
                                            value={point}
                                            onChange={(e) => handleKeyPointChange(idx, e.target.value)}
                                            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm"
                                            placeholder={`Luận điểm ${idx + 1}...`}
                                        />
                                        {formData.keyPoints.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeKeyPoint(idx)}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10"
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
                                <FileText className="w-4 h-4" /> Ví dụ đời thực (Việt Nam)
                            </label>
                            <textarea
                                name="example"
                                value={formData.example}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 focus:border-secondary outline-none transition-all h-40 text-sm leading-relaxed"
                                placeholder="Hãy đưa ra một ví dụ sát thực tế Việt Nam..."
                            />
                        </Card>

                        <Card className="glass border-white/5 rounded-[2.5rem] p-8 space-y-4">
                            <label className="text-sm font-black flex items-center gap-2 text-accent">
                                <HelpCircle className="w-4 h-4" /> Câu hỏi gợi mở
                            </label>
                            <textarea
                                name="thoughtQuestion"
                                value={formData.thoughtQuestion}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 focus:border-accent outline-none transition-all h-40 text-sm leading-relaxed"
                                placeholder="Câu hỏi gì khiến người học phải suy tư?"
                            />
                        </Card>
                    </div>
                </div>

                <div className="pt-8 flex flex-col md:flex-row gap-6">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow h-16 neo-shadow rounded-[2rem] font-black text-xl bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? "Đang xuất bản tri thức..." : "Xuất Bản Bài Học Ngay"} <Save className="ml-3" />
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-[2rem] px-12 border-white/10 font-bold">
                        <Link href="/admin">Hủy bỏ</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PenLine, Plus } from "lucide-react";
import NoteEditor from "@/components/notebook/NoteEditor";

interface QuickNoteButtonProps {
    topicId?: string;
    topicSlug: string;
    topicTitle: string;
}

export default function QuickNoteButton({ topicId, topicSlug, topicTitle }: QuickNoteButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold transition-all h-12 px-6"
            >
                <PenLine className="w-5 h-5 mr-2" /> Ghi chú bài học
            </Button>

            <NoteEditor
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                topicId={topicId}
                topicSlug={topicSlug}
                topicTitle={topicTitle}
            />
        </>
    );
}

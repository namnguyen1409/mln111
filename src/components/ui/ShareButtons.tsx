"use client";

import React from 'react';
import {
    Facebook,
    Twitter,
    Link as LinkIcon,
    Share2,
    Check,
    Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonsProps {
    title?: string;
    text?: string;
    url?: string;
}

export default function ShareButtons({
    title = "Triết Học PlayHub",
    text = "Học Triết học Mác-Lênin theo phong cách mới cực đỉnh!",
    url = typeof window !== 'undefined' ? window.location.href : ""
}: ShareButtonsProps) {
    const { toast } = useToast();
    const [copied, setCopied] = React.useState(false);

    const shareData = {
        title,
        text,
        url,
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast({
            title: "Đã sao chép liên kết!",
            description: "Bạn có thể gửi liên kết này cho bạn bè.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    };

    const shareToTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                onClick={shareToFacebook}
                className="rounded-xl border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-500 transition-colors gap-2"
            >
                <Facebook className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Facebook</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={shareToTwitter}
                className="rounded-xl border-sky-400/20 hover:bg-sky-400/10 hover:text-sky-400 transition-colors gap-2"
            >
                <Twitter className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Twitter</span>
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="rounded-xl border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors gap-2"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">Sao chép</span>
            </Button>

            <Button
                variant="default"
                size="sm"
                onClick={handleNativeShare}
                className="rounded-xl neo-shadow gap-2 bg-primary"
            >
                <Share2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Chia sẻ</span>
            </Button>
        </div>
    );
}

"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
}: VideoPlayerModalProps) {
  // Biến này để đảm bảo code chỉ chạy dưới Client (tránh lệch giao diện)
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-black border-none overflow-hidden shadow-2xl">
        {/* Tiêu đề ẩn (để sửa lỗi Accessibility đỏ trong Console) */}
        <DialogTitle className="sr-only">{title || "Video Preview"}</DialogTitle>
        <DialogDescription className="sr-only">
          Đang xem video: {title}
        </DialogDescription>

        {/* Nút đóng thủ công */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Khung Video 16:9 với Native HTML5 Video Player */}
        <div className="relative w-full pt-[56.25%] bg-black">
          <div className="absolute top-0 left-0 w-full h-full">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error("Video Error:", e);
                }}
              >
                Trình duyệt của bạn không hỗ trợ video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400">Không có URL video</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

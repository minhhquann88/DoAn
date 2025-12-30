"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { isYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/utils";

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

  // Process videoUrl to ensure it's absolute
  const processedVideoUrl = React.useMemo(() => {
    if (!videoUrl) return '';
    
    let url = videoUrl.trim();
    
    // If it's already absolute (http/https), use as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a relative path starting with /api/files, prepend API base URL
    if (url.startsWith('/api/files')) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      if (apiBaseUrl.endsWith('/api')) {
        return apiBaseUrl + url;
      } else {
        return apiBaseUrl + '/api' + url;
      }
    }
    
    // If it's just a filename, construct full URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
    return `${apiBaseUrl}/files/lessons/videos/${url}`;
  }, [videoUrl]);

  // Check if it's a YouTube URL
  const isYouTube = isYouTubeUrl(processedVideoUrl);
  const youtubeEmbedUrl = isYouTube ? getYouTubeEmbedUrl(processedVideoUrl) : null;

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

        {/* Khung Video 16:9 */}
        <div className="relative w-full pt-[56.25%] bg-black">
          <div className="absolute top-0 left-0 w-full h-full">
            {!processedVideoUrl ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-400">Không có URL video</p>
              </div>
            ) : isYouTube && youtubeEmbedUrl ? (
              // YouTube embed
              <iframe
                src={`${youtubeEmbedUrl}&autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || "Video"}
              />
            ) : (
              // Regular video file
              <video
                src={processedVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error("Video Error:", e);
                  console.error("Failed to load video URL:", processedVideoUrl);
                }}
              >
                Trình duyệt của bạn không hỗ trợ video tag.
              </video>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

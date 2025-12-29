'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Message } from '@/services/chatService';
import { useAuthStore } from '@/stores/authStore';
import { Check, CheckCheck } from 'lucide-react';
// Format time helper
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

interface MessageItemProps {
  message: Message;
  showAvatar?: boolean;
  showName?: boolean;
}

export function MessageItem({ message, showAvatar = true, showName = false }: MessageItemProps) {
  const { user } = useAuthStore();
  const isOwnMessage = message.senderId === user?.id;

  // Format time
  const timeAgo = formatTimeAgo(new Date(message.createdAt));

  // Format content for deleted messages
  const displayContent = message.isDeleted 
    ? 'Tin nhắn đã bị xóa' 
    : message.content;

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar || undefined} />
          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {showName && !isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1">{message.senderName}</span>
        )}
        
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          } ${message.isDeleted ? 'opacity-60 italic' : ''}`}
          style={{
            borderRadius: isOwnMessage ? '12px 0 12px 12px' : '0 12px 12px 12px',
          }}
        >
          {message.messageType === 'IMAGE' && message.fileUrl && (
            <img
              src={message.fileUrl}
              alt="Image"
              className="max-w-xs rounded-lg mb-2 cursor-pointer"
              onClick={() => window.open(message.fileUrl!, '_blank')}
            />
          )}
          
          {message.messageType === 'FILE' && message.fileUrl && (
            <a
              href={message.fileUrl}
              download={message.fileName}
              className="flex items-center gap-2 text-sm underline"
            >
              📎 {message.fileName} ({(message.fileSize! / 1024).toFixed(1)} KB)
            </a>
          )}
          
          {message.messageType === 'TEXT' && (
            <p className="text-sm whitespace-pre-wrap break-words">{displayContent}</p>
          )}
          
          {message.isEdited && (
            <span className="text-xs opacity-70 mt-1">(đã chỉnh sửa)</span>
          )}
        </div>
        
        <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{timeAgo}</span>
          {isOwnMessage && (
            <span className={message.isRead ? 'text-blue-500' : ''}>
              {message.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            </span>
          )}
        </div>
      </div>
      
      {showAvatar && isOwnMessage && (
        <div className="h-8 w-8 flex-shrink-0" />
      )}
    </div>
  );
}


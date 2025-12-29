'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/services/chatService';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected?: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const otherParticipant = conversation.otherParticipant;
  
  // Format last message time
  const formatTime = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  const lastMessagePreview = conversation.lastMessage?.content || 'Chưa có tin nhắn';
  const truncatedPreview = lastMessagePreview.length > 50 
    ? lastMessagePreview.substring(0, 50) + '...' 
    : lastMessagePreview;

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted'
      )}
    >
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={otherParticipant?.avatar || undefined} />
        <AvatarFallback>
          {otherParticipant?.fullName?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm truncate">
            {otherParticipant?.fullName || 'Người dùng'}
          </h3>
          {conversation.lastMessageAt && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
              {formatTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground truncate">
            {truncatedPreview}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="destructive" className="flex-shrink-0">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}


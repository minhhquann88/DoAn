'use client';

import React, { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { Conversation, Message } from '@/services/chatService';
import { useAuthStore } from '@/stores/authStore';
import { SendMessageRequest } from '@/services/chatService';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  typingUserIds: Set<number>;
  onlineUserIds: Set<number>;
  onSendMessage: (request: SendMessageRequest) => void;
  onTyping: (isTyping: boolean) => void;
  isLoading?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  typingUserIds,
  onlineUserIds,
  onSendMessage,
  onTyping,
  isLoading,
}: ChatWindowProps) {
  const { user } = useAuthStore();

  // Mark as read when conversation is opened
  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      // This will be handled by parent component
    }
  }, [conversation]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-semibold mb-2">Chọn cuộc trò chuyện</h3>
          <p className="text-sm text-muted-foreground">
            Chọn một cuộc trò chuyện từ danh sách để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.otherParticipant;
  const isOnline = otherParticipant ? onlineUserIds.has(otherParticipant.id) : false;
  const typingUserNames: string[] = []; // Will be populated from typingUserIds

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant?.avatar || undefined} />
              <AvatarFallback>
                {otherParticipant?.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{otherParticipant?.fullName || 'Người dùng'}</h3>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-muted-foreground">
                  {isOnline ? 'Đang hoạt động' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Info className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentUserId={user?.id}
      />

      {/* Typing Indicator */}
      {typingUserIds.size > 0 && (
        <TypingIndicator userName={otherParticipant?.fullName || 'Người dùng'} />
      )}

      {/* Input */}
      <MessageInput
        conversationId={conversation.id}
        onSend={onSendMessage}
        onTyping={onTyping}
        disabled={isLoading}
      />
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ConversationItem } from './ConversationItem';
import { NewConversationDialog } from './NewConversationDialog';
import { Conversation } from '@/services/chatService';
import { Loader2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  isLoading?: boolean;
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  isLoading,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.otherParticipant?.fullName?.toLowerCase().includes(query) ||
      conv.lastMessage?.content?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full lg:w-80 border-r bg-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <h2 className="text-xl font-bold">Tin nhắn</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <NewConversationDialog />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Chưa có cuộc trò chuyện</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Bắt đầu trò chuyện với giảng viên'}
            </p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === currentConversationId}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


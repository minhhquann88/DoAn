'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/stores/authStore';
import * as chatService from '@/services/chatService';

export function ChatLayout() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const {
    conversations,
    currentConversationId,
    currentMessages,
    typingUsers,
    onlineUsers,
    isLoading,
    isConnected,
    setCurrentConversation,
    sendMessage,
    markAsRead,
    sendTyping,
    refetchConversations,
  } = useChat();

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null;
  const typingUserIds = currentConversationId ? typingUsers : new Set<number>();

  // Auto-select conversation from URL query
  React.useEffect(() => {
    const conversationIdParam = searchParams.get('conversation');
    if (conversationIdParam) {
      const conversationId = parseInt(conversationIdParam, 10);
      if (!isNaN(conversationId) && conversationId !== currentConversationId) {
        // Check if conversation exists in list
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          setCurrentConversation(conversationId);
        } else {
          // Conversation not in list yet, refetch and then select
          refetchConversations().then(() => {
            setCurrentConversation(conversationId);
          });
        }
      }
    }
  }, [searchParams, currentConversationId, conversations, setCurrentConversation, refetchConversations]);

  // Mark as read when conversation is selected
  React.useEffect(() => {
    if (currentConversationId && currentConversation && currentConversation.unreadCount > 0) {
      markAsRead(currentConversationId);
    }
  }, [currentConversationId, currentConversation, markAsRead]);

  const handleSendMessage = (request: chatService.SendMessageRequest) => {
    sendMessage(request);
  };

  const handleTyping = (isTyping: boolean) => {
    if (currentConversationId) {
      sendTyping(currentConversationId, isTyping);
    }
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversation}
        isLoading={isLoading}
      />
      
      <ChatWindow
        conversation={currentConversation}
        messages={currentMessages}
        typingUserIds={typingUserIds}
        onlineUserIds={onlineUsers}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        isLoading={isLoading}
      />
      
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          Đang kết nối lại...
        </div>
      )}
    </div>
  );
}


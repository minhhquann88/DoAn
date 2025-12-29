/**
 * Custom hook cho Chat functionality
 */
import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import * as chatService from '@/services/chatService';
import type { SendMessageRequest, UpdateMessageRequest } from '@/services/chatService';

// WebSocket connection
let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const useChat = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    conversations,
    currentConversationId,
    messages,
    typingUsers,
    onlineUsers,
    isConnected,
    setConversations,
    addConversation,
    updateConversation,
    setCurrentConversation,
    setMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    setTyping,
    setOnline,
    setLoading,
    setConnected,
  } = useChatStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['chat-conversations', user?.id],
    queryFn: chatService.getConversations,
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch messages for current conversation
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['chat-messages', currentConversationId],
    queryFn: () => {
      if (!currentConversationId) throw new Error('No conversation selected');
      return chatService.getMessages(currentConversationId, 0, 50);
    },
    enabled: !!currentConversationId,
  });

  // Update store when data changes
  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData, setConversations]);

  useEffect(() => {
    if (messagesData && currentConversationId) {
      // Reverse messages to show oldest first
      const reversedMessages = [...messagesData.content].reverse();
      setMessages(currentConversationId, reversedMessages);
    }
  }, [messagesData, currentConversationId, setMessages]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'new-message':
        if (data.message) {
          addMessage(data.message.conversationId, data.message);
          // Update conversation last message
          const currentConversations = useChatStore.getState().conversations;
          const conversation = currentConversations.find(c => c.id === data.message.conversationId);
          if (conversation) {
            updateConversation({
              ...conversation,
              lastMessage: data.message,
              lastMessageAt: data.message.createdAt,
              unreadCount: data.message.senderId !== user?.id ? conversation.unreadCount + 1 : conversation.unreadCount,
            });
          }
          // Show notification if not current conversation
          const currentConvId = useChatStore.getState().currentConversationId;
          if (data.message.conversationId !== currentConvId) {
            addToast({
              type: 'info',
              description: `${data.message.senderName}: ${data.message.content}`,
            });
          }
        }
        break;
      case 'message-updated':
        if (data.message) {
          updateMessage(data.message.conversationId, data.message.id, data.message);
        }
        break;
      case 'message-deleted':
        if (data.conversationId && data.messageId) {
          deleteMessage(data.conversationId, data.messageId);
        }
        break;
      case 'user-typing':
        if (data.conversationId && data.userId) {
          setTyping(data.conversationId, data.userId, true);
          // Auto clear typing after 3 seconds
          setTimeout(() => {
            setTyping(data.conversationId, data.userId, false);
          }, 3000);
        }
        break;
      case 'user-stopped-typing':
        if (data.conversationId && data.userId) {
          setTyping(data.conversationId, data.userId, false);
        }
        break;
      case 'message-read':
        // Update read status
        break;
      case 'user-online':
        if (data.userId) {
          setOnline(data.userId, true);
        }
        break;
      case 'user-offline':
        if (data.userId) {
          setOnline(data.userId, false);
        }
        break;
    }
  }, [addMessage, updateConversation, updateMessage, deleteMessage, setTyping, setOnline, addToast, user?.id]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !user?.id || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      console.warn('No token found for WebSocket connection');
      return;
    }

    try {
      // Backend uses STOMP over SockJS, but for now we'll use simple WebSocket
      // In production, you should use @stomp/stompjs and SockJS
      const wsUrl = `ws://localhost:8080/ws/websocket?token=${encodeURIComponent(token)}`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttempts = 0;
        wsRef.current = socket;
        ws = socket;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        wsRef.current = null;
        ws = null;

        // Attempt reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          reconnectTimeout = setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
            connectWebSocket();
          }, 3000 * reconnectAttempts);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [isAuthenticated, user?.id, setConnected, handleWebSocketMessage]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      ws = null;
    }
    setConnected(false);
  }, [setConnected]);

  // Connect WebSocket on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user?.id, connectWebSocket, disconnectWebSocket]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (request: SendMessageRequest) => {
      // Try WebSocket first, fallback to REST
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send-message',
          ...request
        }));
        // Optimistically add message
        const optimisticMessage: chatService.Message = {
          id: Date.now(), // Temporary ID
          conversationId: request.conversationId,
          senderId: user!.id!,
          senderName: user!.fullName || user!.username,
          senderAvatar: user!.avatarUrl || null,
          content: request.content,
          messageType: request.messageType || 'TEXT',
          fileUrl: request.fileUrl || null,
          fileName: request.fileName || null,
          fileSize: request.fileSize || null,
          isEdited: false,
          editedAt: null,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          isRead: false,
          readAt: null,
        };
        addMessage(request.conversationId, optimisticMessage);
        return optimisticMessage;
      } else {
        // Fallback to REST API
        return await chatService.sendMessage(request);
      }
    },
    onSuccess: (message) => {
      // Refetch messages to get server response
      if (currentConversationId === message.conversationId) {
        refetchMessages();
      }
      refetchConversations();
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        description: 'Không thể gửi tin nhắn: ' + (error.response?.data?.message || error.message),
      });
    },
  });

  // Update message mutation
  const updateMessageMutation = useMutation({
    mutationFn: async ({ messageId, request }: { messageId: number; request: UpdateMessageRequest }) => {
      return await chatService.updateMessage(messageId, request);
    },
    onSuccess: (message) => {
      updateMessage(message.conversationId, message.id, message);
      refetchMessages();
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await chatService.deleteMessage(messageId);
    },
    onSuccess: () => {
      refetchMessages();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      await chatService.markAsRead(conversationId);
    },
    onSuccess: (_, conversationId) => {
      // Update conversation unread count
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        updateConversation({ ...conversation, unreadCount: 0 });
      }
      refetchConversations();
    },
  });

  // Send typing indicator
  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversationId,
        isTyping,
      }));
    }
  }, []);

  return {
    // State
    conversations,
    currentConversationId,
    currentMessages: currentConversationId ? (messages[currentConversationId] || []) : [],
    typingUsers: currentConversationId ? (typingUsers[currentConversationId] || new Set()) : new Set(),
    onlineUsers,
    isLoading: conversationsLoading || messagesLoading,
    isConnected,
    
    // Actions
    setCurrentConversation,
    sendMessage: sendMessageMutation.mutate,
    updateMessage: (messageId: number, request: UpdateMessageRequest) => 
      updateMessageMutation.mutate({ messageId, request }),
    deleteMessage: deleteMessageMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    sendTyping,
    refetchConversations,
    refetchMessages,
  };
};


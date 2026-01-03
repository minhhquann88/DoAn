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
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from '@/lib/constants';

// STOMP client connection
let stompClient: Client | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const WS_BASE_URL = API_BASE_URL.replace('/api', '');

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
      // Don't optimistically set online status - wait for WebSocket events to avoid flickering
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
        const message = data.message || data; // Support both formats
        if (message && message.conversationId) {
          console.log('Received new message from WebSocket:', message);
          
          // Check if this is a duplicate (optimistic message that we already added)
          const existingMessages = useChatStore.getState().messages[message.conversationId] || [];
          
          // Check if we already have this message (by ID or by content + sender + timestamp for optimistic)
          const isDuplicate = existingMessages.some(m => {
            // Exact ID match
            if (m.id === message.id) return true;
            
            // For optimistic messages: check if same sender, content, and within 3 seconds
            if (m.senderId === message.senderId && 
                m.content === message.content &&
                Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 3000) {
              return true;
            }
            
            return false;
          });
          
          if (!isDuplicate) {
            // New message, add it
            addMessage(message.conversationId, message);
          } else {
            // This is likely the server response to our optimistic message
            // Find and replace the optimistic message with the real one
            const optimisticIndex = existingMessages.findIndex(m => 
              m.senderId === message.senderId && 
              m.content === message.content &&
              m.id > 1000000000000 && // Temporary ID from Date.now()
              Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 3000
            );
            
            if (optimisticIndex !== -1) {
              // Replace optimistic message with real one
              const updatedMessages = [...existingMessages];
              updatedMessages[optimisticIndex] = message;
              useChatStore.getState().setMessages(message.conversationId, updatedMessages);
              console.log('Replaced optimistic message with real one:', message.id);
            } else {
              console.log('Duplicate message detected, skipping:', message.id);
            }
          }
          
          // Always update conversation last message
          const currentConversations = useChatStore.getState().conversations;
          const conversation = currentConversations.find(c => c.id === message.conversationId);
          if (conversation) {
            updateConversation({
              ...conversation,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              unreadCount: message.senderId !== user?.id ? conversation.unreadCount + 1 : conversation.unreadCount,
            });
          }
          
          // Show notification if not current conversation
          const currentConvId = useChatStore.getState().currentConversationId;
          if (message.conversationId !== currentConvId && message.senderId !== user?.id) {
            // Get user role to determine correct route
            const userRole = user?.role;
            const messagesPath = userRole === 'ROLE_STUDENT' 
              ? '/student/messages'
              : userRole === 'ROLE_LECTURER'
              ? '/instructor/messages'
              : '/messages';
            
            addToast({
              type: 'info',
              title: 'Tin nhắn mới',
              description: `${message.senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
            });
            
            // Navigate to conversation after a short delay (optional - can be removed if not desired)
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                window.location.href = `${messagesPath}?conversation=${message.conversationId}`;
              }
            }, 2000);
          }
        }
        break;
      case 'message-updated':
        if (data.message) {
          const updatedMessage = data.message;
          updateMessage(updatedMessage.conversationId, updatedMessage.id, {
            content: updatedMessage.content,
            isEdited: updatedMessage.isEdited,
            editedAt: updatedMessage.editedAt,
          });
          
          // Update conversation last message if this is the last message
          const currentConversations = useChatStore.getState().conversations;
          const conversation = currentConversations.find(c => c.id === updatedMessage.conversationId);
          if (conversation && conversation.lastMessage?.id === updatedMessage.id) {
            updateConversation({
              ...conversation,
              lastMessage: updatedMessage,
            });
          }
        }
        break;
      case 'message-deleted':
        if (data.messageId && data.conversationId) {
          deleteMessage(data.conversationId, data.messageId);
          // Conversation update is handled in chatStore.deleteMessage
        }
        break;
      case 'user-typing':
        if (data.conversationId && data.userId && data.userId !== user?.id) {
          // Only show typing indicator for other users, not yourself
          setTyping(data.conversationId, data.userId, true);
          // Auto clear typing after 3 seconds
          setTimeout(() => {
            setTyping(data.conversationId, data.userId, false);
          }, 3000);
        }
        break;
      case 'user-stopped-typing':
        if (data.conversationId && data.userId && data.userId !== user?.id) {
          // Only clear typing indicator for other users
          setTyping(data.conversationId, data.userId, false);
        }
        break;
      case 'message-read':
        // Update read status
        break;
      case 'user-online':
      case 'online':
        if (data.userId && data.userId !== user?.id) {
          // Clear any pending offline timeout
          if ((window as any).offlineTimeouts && (window as any).offlineTimeouts[data.userId]) {
            clearTimeout((window as any).offlineTimeouts[data.userId]);
            delete (window as any).offlineTimeouts[data.userId];
          }
          
          // Set online status immediately
          const currentOnline = useChatStore.getState().onlineUsers.has(data.userId);
          if (!currentOnline) {
          setOnline(data.userId, true);
            console.log('User online:', data.userId);
          }
        }
        break;
      case 'user-offline':
      case 'offline':
        if (data.userId && data.userId !== user?.id) {
          // Set offline status with debounce to avoid flickering
          const currentOnline = useChatStore.getState().onlineUsers.has(data.userId);
          if (currentOnline) {
            // Add small delay to avoid flickering if user quickly reconnects
            const timeoutId = setTimeout(() => {
              // Check again if still offline (user might have reconnected)
              const stillOffline = !useChatStore.getState().onlineUsers.has(data.userId);
              if (stillOffline) {
          setOnline(data.userId, false);
                console.log('User offline:', data.userId);
              }
            }, 500); // 500ms delay to avoid flickering
            
            // Store timeout ID to clear if user comes back online
            (window as any).offlineTimeouts = (window as any).offlineTimeouts || {};
            (window as any).offlineTimeouts[data.userId] = timeoutId;
          }
        }
        break;
    }
  }, [addMessage, updateConversation, updateMessage, deleteMessage, setTyping, setOnline, addToast, user?.id]);

  // STOMP WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !user?.id || stompClient?.connected) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      console.warn('No token found for WebSocket connection');
      return;
    }

    try {
      // Create SockJS connection
      const socket = new SockJS(`${WS_BASE_URL}/ws`);
      
      // Create STOMP client
      const client = new Client({
        webSocketFactory: () => socket as any,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          // Only log errors in production
          if (str.includes('ERROR') || str.includes('error')) {
            console.error('STOMP:', str);
          }
        },
        onConnect: (frame) => {
          console.log('STOMP WebSocket connected', frame);
        setConnected(true);
        reconnectAttempts = 0;
          
          // Subscribe to all conversations immediately after connection
          const currentConversations = useChatStore.getState().conversations;
          currentConversations.forEach((conv) => {
            // Subscribe to conversation messages
            client.subscribe(`/topic/conversation/${conv.id}`, (message: IMessage) => {
              try {
                const data = JSON.parse(message.body);
                console.log('Received message on topic /topic/conversation/' + conv.id + ':', data);
                
                // Check if this is a special event (update/delete) or a regular message
                if (data.type === 'message-updated' && data.message) {
                  const updatedMessage = data.message;
                  const frontendMessage: chatService.Message = {
                    id: updatedMessage.id,
                    conversationId: updatedMessage.conversationId,
                    senderId: updatedMessage.senderId,
                    senderName: updatedMessage.senderName || 'Unknown',
                    senderAvatar: updatedMessage.senderAvatar,
                    content: updatedMessage.content,
                    messageType: updatedMessage.messageType as any,
                    fileUrl: updatedMessage.fileUrl,
                    fileName: updatedMessage.fileName,
                    fileSize: updatedMessage.fileSize,
                    isEdited: updatedMessage.isEdited || false,
                    editedAt: updatedMessage.editedAt ? new Date(updatedMessage.editedAt).toISOString() : null,
                    isDeleted: updatedMessage.isDeleted || false,
                    createdAt: updatedMessage.createdAt ? new Date(updatedMessage.createdAt).toISOString() : new Date().toISOString(),
                    isRead: updatedMessage.isRead || false,
                    readAt: updatedMessage.readAt ? new Date(updatedMessage.readAt).toISOString() : null,
                  };
                  handleWebSocketMessage({ type: 'message-updated', message: frontendMessage });
                } else if (data.type === 'message-deleted') {
                  handleWebSocketMessage({ 
                    type: 'message-deleted', 
                    messageId: data.messageId,
                    conversationId: data.conversationId,
                  });
                } else {
                  // Regular message
                  const frontendMessage: chatService.Message = {
                    id: data.id,
                    conversationId: data.conversationId,
                    senderId: data.senderId,
                    senderName: data.senderName || 'Unknown',
                    senderAvatar: data.senderAvatar,
                    content: data.content,
                    messageType: data.messageType as any,
                    fileUrl: data.fileUrl,
                    fileName: data.fileName,
                    fileSize: data.fileSize,
                    isEdited: data.isEdited || false,
                    editedAt: data.editedAt ? new Date(data.editedAt).toISOString() : null,
                    isDeleted: data.isDeleted || false,
                    createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
                    isRead: data.isRead || false,
                    readAt: data.readAt ? new Date(data.readAt).toISOString() : null,
                  };
                  handleWebSocketMessage({ type: 'new-message', message: frontendMessage });
                }
              } catch (error) {
                console.error('Error parsing conversation message:', error, message.body);
              }
            });
            
            // Subscribe to typing indicators
            client.subscribe(`/topic/conversation/${conv.id}/typing`, (message: IMessage) => {
        try {
                const data = JSON.parse(message.body);
                handleWebSocketMessage({ 
                  type: data.isTyping ? 'user-typing' : 'user-stopped-typing',
                  conversationId: data.conversationId,
                  userId: data.userId,
                });
              } catch (error) {
                console.error('Error parsing typing message:', error);
              }
            });
            
            // Subscribe to online/offline events
            client.subscribe(`/topic/conversation/${conv.id}/online`, (message: IMessage) => {
              try {
                const data = JSON.parse(message.body);
                handleWebSocketMessage({ type: 'user-online', userId: data.userId });
              } catch (error) {
                console.error('Error parsing online message:', error);
              }
            });
            
            client.subscribe(`/topic/conversation/${conv.id}/offline`, (message: IMessage) => {
              try {
                const data = JSON.parse(message.body);
                handleWebSocketMessage({ type: 'user-offline', userId: data.userId });
        } catch (error) {
                console.error('Error parsing offline message:', error);
        }
            });
          });

          // Online status is now automatically handled by backend on connect
          // But we can still send it manually as a backup
          client.publish({
            destination: '/app/chat.online',
            body: JSON.stringify({ userId: user.id }),
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
        setConnected(false);
        },
        onWebSocketClose: () => {
          console.log('STOMP WebSocket disconnected');
        setConnected(false);
          stompClient = null;

        // Attempt reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          reconnectTimeout = setTimeout(() => {
            console.log(`Reconnecting... Attempt ${reconnectAttempts}`);
            connectWebSocket();
          }, 3000 * reconnectAttempts);
        }
        },
        onDisconnect: () => {
          console.log('STOMP disconnected');
          setConnected(false);
        },
      });

      client.activate();
      stompClient = client;
    } catch (error) {
      console.error('Failed to create STOMP client:', error);
    }
  }, [isAuthenticated, user?.id, setConnected, handleWebSocketMessage, conversations]);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (stompClient && stompClient.connected) {
      // Offline status is now automatically handled by backend on disconnect
      // But we can still send it manually as a backup
      if (user?.id) {
        try {
          stompClient.publish({
            destination: '/app/chat.offline',
            body: JSON.stringify({ userId: user.id }),
          });
        } catch (error) {
          // Ignore error if already disconnected
          console.log('Could not send offline notification (already disconnected)');
        }
      }
      stompClient.deactivate();
    }
    stompClient = null;
    setConnected(false);
  }, [setConnected, user?.id]);

  // Subscribe to new conversations when they are added
  useEffect(() => {
    if (stompClient && stompClient.connected) {
      // Get current subscriptions
      const subscribedIds = new Set<number>();
      if ((stompClient as any).subscriptions) {
        Object.keys((stompClient as any).subscriptions).forEach((key) => {
          const match = key.match(/\/topic\/conversation\/(\d+)/);
          if (match) {
            subscribedIds.add(parseInt(match[1], 10));
          }
        });
      }
      
      // Subscribe to new conversations
      conversations.forEach((conv) => {
        if (!subscribedIds.has(conv.id)) {
          console.log('Subscribing to conversation:', conv.id);
          
          // Subscribe to conversation messages
          stompClient?.subscribe(`/topic/conversation/${conv.id}`, (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              console.log('Received message on topic /topic/conversation/' + conv.id + ':', data);
              // Map to frontend Message format
              const frontendMessage: chatService.Message = {
                id: data.id,
                conversationId: data.conversationId,
                senderId: data.senderId,
                senderName: data.senderName || 'Unknown',
                senderAvatar: data.senderAvatar,
                content: data.content,
                messageType: data.messageType as any,
                fileUrl: data.fileUrl,
                fileName: data.fileName,
                fileSize: data.fileSize,
                isEdited: data.isEdited || false,
                editedAt: data.editedAt ? new Date(data.editedAt).toISOString() : null,
                isDeleted: data.isDeleted || false,
                createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
                isRead: data.isRead || false,
                readAt: data.readAt ? new Date(data.readAt).toISOString() : null,
              };
              handleWebSocketMessage({ type: 'new-message', message: frontendMessage });
            } catch (error) {
              console.error('Error parsing conversation message:', error, message.body);
            }
          });
          
          // Subscribe to typing indicators
          stompClient?.subscribe(`/topic/conversation/${conv.id}/typing`, (message: IMessage) => {
            try {
              const data = JSON.parse(message.body);
              handleWebSocketMessage({ 
                type: data.isTyping ? 'user-typing' : 'user-stopped-typing',
                conversationId: data.conversationId,
                userId: data.userId,
              });
            } catch (error) {
              console.error('Error parsing typing message:', error);
            }
          });
          
          // Subscribe to online/offline events
          const onlineTopic = `/topic/conversation/${conv.id}/online`;
          const offlineTopic = `/topic/conversation/${conv.id}/offline`;
          
          if (!subscribedIds.has(conv.id) || !(stompClient as any)?.subscriptions?.[onlineTopic]) {
            stompClient?.subscribe(onlineTopic, (message: IMessage) => {
              try {
                const data = JSON.parse(message.body);
                console.log('Received online event:', data);
                handleWebSocketMessage({ type: 'user-online', userId: data.userId });
              } catch (error) {
                console.error('Error parsing online message:', error);
              }
            });
          }
          
          if (!subscribedIds.has(conv.id) || !(stompClient as any)?.subscriptions?.[offlineTopic]) {
            stompClient?.subscribe(offlineTopic, (message: IMessage) => {
              try {
                const data = JSON.parse(message.body);
                console.log('Received offline event:', data);
                handleWebSocketMessage({ type: 'user-offline', userId: data.userId });
              } catch (error) {
                console.error('Error parsing offline message:', error);
              }
            });
          }
        }
      });
    }
  }, [conversations, stompClient, handleWebSocketMessage]);

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
        // Try STOMP first, fallback to REST
      if (stompClient && stompClient.connected) {
        console.log('Sending message via STOMP:', request);
        // Send via STOMP
        stompClient.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(request),
        });
        
        // Add optimistic message with temporary ID
        const tempId = Date.now();
        const optimisticMessage: chatService.Message = {
          id: tempId, // Temporary ID
          conversationId: request.conversationId,
          senderId: user!.id!,
          senderName: user!.fullName || user!.username,
          senderAvatar: user!.avatar || null,
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
      // Don't refetch - message will come via WebSocket
      // Only refetch conversations to update last message
      if (message) {
      refetchConversations();
      }
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
      // Find conversation ID
      const currentMessages = useChatStore.getState().messages;
      let conversationId: number | null = null;
      for (const [convId, msgs] of Object.entries(currentMessages)) {
        if (msgs.some(m => m.id === messageId)) {
          conversationId = parseInt(convId);
          break;
        }
      }
      
      if (!conversationId) {
        throw new Error('Message not found');
      }
      
      // Try STOMP first, fallback to REST
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/chat.delete',
          body: JSON.stringify({
            messageId,
            conversationId,
          }),
        });
        // Optimistically delete message
        deleteMessage(conversationId, messageId);
        return;
      } else {
      await chatService.deleteMessage(messageId);
      }
    },
    onSuccess: () => {
      refetchMessages();
      refetchConversations();
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
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify({
        conversationId,
        isTyping,
        }),
      });
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


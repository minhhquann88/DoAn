/**
 * Chat Store - Quản lý trạng thái chat
 */
import { create } from 'zustand';
import { Conversation, Message } from '@/services/chatService';

interface ChatState {
  conversations: Conversation[];
  currentConversationId: number | null;
  messages: Record<number, Message[]>; // conversationId -> messages
  typingUsers: Record<number, Set<number>>; // conversationId -> Set<userId>
  onlineUsers: Set<number>;
  isLoading: boolean;
  isConnected: boolean;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  setCurrentConversation: (conversationId: number | null) => void;
  setMessages: (conversationId: number, messages: Message[]) => void;
  addMessage: (conversationId: number, message: Message) => void;
  updateMessage: (conversationId: number, messageId: number, updates: Partial<Message>) => void;
  deleteMessage: (conversationId: number, messageId: number) => void;
  setTyping: (conversationId: number, userId: number, isTyping: boolean) => void;
  setOnline: (userId: number, isOnline: boolean) => void;
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
  clearMessages: (userId?: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),
  isLoading: false,
  isConnected: false,
  
  setConversations: (conversations) => set({ conversations }),
  
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations.filter(c => c.id !== conversation.id)]
  })),
  
  updateConversation: (conversation) => set((state) => ({
    conversations: state.conversations.map(c => 
      c.id === conversation.id ? conversation : c
    )
  })),
  
  setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),
  
  setMessages: (conversationId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: messages
    }
  })),
  
  addMessage: (conversationId, message) => set((state) => {
    const existingMessages = state.messages[conversationId] || [];
    // Check if message already exists
    if (existingMessages.some(m => m.id === message.id)) {
      return state;
    }
    return {
      messages: {
        ...state.messages,
        [conversationId]: [...existingMessages, message]
      }
    };
  }),
  
  updateMessage: (conversationId, messageId, updates) => set((state) => {
    const messages = state.messages[conversationId] || [];
    return {
      messages: {
        ...state.messages,
        [conversationId]: messages.map(m => 
          m.id === messageId ? { ...m, ...updates } : m
        )
      }
    };
  }),
  
  deleteMessage: (conversationId, messageId) => set((state) => {
    const messages = state.messages[conversationId] || [];
    // Filter out duplicates and update the deleted message
    const updatedMessages = messages
      .map(m => 
        m.id === messageId ? { ...m, isDeleted: true, content: 'Tin nhắn đã được thu hồi' } : m
      )
      .filter((msg, index, self) => 
        msg.id != null && 
        self.findIndex(m => m.id === msg.id) === index
      );
    
    // Update conversation last message if needed
    const updatedConversations = state.conversations.map(conv => {
      if (conv.id === conversationId && conv.lastMessage?.id === messageId) {
        // Find the new last message (not deleted)
        const newLastMessage = updatedMessages.filter(m => !m.isDeleted && m.id !== messageId).pop() || null;
        return {
          ...conv,
          lastMessage: newLastMessage,
        };
      }
      return conv;
    });
    
    return {
      messages: {
        ...state.messages,
        [conversationId]: updatedMessages
      },
      conversations: updatedConversations,
    };
  }),
  
  setTyping: (conversationId, userId, isTyping) => set((state) => {
    const typingUsers = { ...state.typingUsers };
    if (!typingUsers[conversationId]) {
      typingUsers[conversationId] = new Set();
    }
    const users = new Set(typingUsers[conversationId]);
    if (isTyping) {
      users.add(userId);
    } else {
      users.delete(userId);
    }
    typingUsers[conversationId] = users;
    return { typingUsers };
  }),
  
  setOnline: (userId, isOnline) => set((state) => {
    const onlineUsers = new Set(state.onlineUsers);
    if (isOnline) {
      onlineUsers.add(userId);
    } else {
      onlineUsers.delete(userId);
    }
    return { onlineUsers };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  clearMessages: () => set({ 
    conversations: [], 
    messages: {}, 
    currentConversationId: null,
    typingUsers: {},
    onlineUsers: new Set()
  }),
}));

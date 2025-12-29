'use client';

import React from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore, type ChatMessage } from '@/stores/chatStore';

const quickReplies = [
  'Tôi muốn tìm khóa học về lập trình',
  'Làm sao để đăng ký khóa học?',
  'Chính sách hoàn tiền như thế nào?',
  'Tôi quên mật khẩu',
];

interface ChatWidgetProps {
  courseId?: number; // Optional: để lấy context cụ thể từ khóa học
}

// Initial welcome message
const getInitialMessage = (): ChatMessage => ({
  id: '1',
  role: 'assistant',
  content: 'Xin chào! Tôi là trợ lý ảo của E-learning. Tôi có thể giúp gì cho bạn?',
  timestamp: new Date(),
});

export function ChatWidget({ courseId }: ChatWidgetProps = {}) {
  const { user, isAuthenticated } = useAuthStore();
  const { addMessage, setMessages, clearMessages } = useChatStore();
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Get current user ID (null for guest)
  const currentUserId = user?.id?.toString() || null;
  
  // Cache userKey để tránh re-render không cần thiết
  const userKey = React.useMemo(() => {
    return currentUserId ? `user_${currentUserId}` : 'guest';
  }, [currentUserId]);
  
  // Subscribe vào toàn bộ messagesByUser để tránh warning "getServerSnapshot should be cached"
  // Filter messages cho user hiện tại trong useMemo
  const messagesByUser = useChatStore((state) => state.messagesByUser);
  
  // Filter messages cho user hiện tại
  const rawMessages = React.useMemo(() => {
    return messagesByUser[userKey] || [];
  }, [messagesByUser, userKey]);
  
  // Convert messages và thêm initial message nếu cần
  const messages = React.useMemo(() => {
    if (rawMessages.length === 0) {
      return [getInitialMessage()];
    }
    // Convert timestamp strings back to Date objects
    return rawMessages.map(msg => ({
      ...msg,
      timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp,
    }));
  }, [rawMessages]);
  
  // Track previous authentication state để phát hiện khi logout
  const prevIsAuthenticatedRef = React.useRef(isAuthenticated);
  
  // Reset messages khi user thay đổi (login/logout)
  React.useEffect(() => {
    if (rawMessages.length === 0) {
      // Nếu chưa có messages cho user này, khởi tạo với welcome message
      setMessages(currentUserId, [getInitialMessage()]);
    }
  }, [currentUserId, rawMessages.length, setMessages]);
  
  // Đóng chat khi user logout (chuyển từ authenticated sang guest)
  // Nhưng không chặn guest users mở chat
  React.useEffect(() => {
    const wasAuthenticated = prevIsAuthenticatedRef.current;
    const isNowGuest = !isAuthenticated;
    
    // Chỉ đóng chat nếu chuyển từ authenticated sang guest (logout)
    if (wasAuthenticated && isNowGuest && isOpen) {
      setIsOpen(false);
    }
    
    // Update ref cho lần sau
    prevIsAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, isOpen]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    
    // Add user message to store
    addMessage(currentUserId, userMessage);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Import dynamically để avoid build errors
      const { sendChatMessage } = await import('@/services/chatbotService');
      
      // Send to chatbot backend với courseId nếu có
      const response = await sendChatMessage(currentInput, courseId);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };
      
      // Add bot response to store
      addMessage(currentUserId, botMessage);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
        timestamp: new Date(),
      };
      
      // Add error message to store
      addMessage(currentUserId, botMessage);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
  };
  
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open chat</span>
      </Button>
    );
  }
  
  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300',
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-primary-foreground">
              <AvatarFallback className="bg-primary-foreground text-primary">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-accent rounded-full border-2 border-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Trợ lý E-learning</h3>
            <p className="text-xs opacity-90">Luôn sẵn sàng hỗ trợ</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[420px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    'max-w-[75%] rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {(message.timestamp instanceof Date 
                      ? message.timestamp 
                      : new Date(message.timestamp)
                    ).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Câu hỏi gợi ý:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input */}
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Nhập tin nhắn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Powered by Gemini AI
            </p>
          </div>
        </>
      )}
    </Card>
  );
}


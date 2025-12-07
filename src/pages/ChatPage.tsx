/**
 * ChatPage Component - Cửa sổ chatbot cho hệ thống học liệu
 * Tích hợp với Gemini API và backend context
 */

import React, { useState, useEffect, useRef } from 'react';
import { getQuickResponse } from '../services/geminiService';
import { fetchChatContext, AiContextResponse } from '../services/chatContextService';
import { hasGeminiKey } from '../utils/geminiKey';
import './ChatPage.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Xin chào! 👋 Tôi là trợ lý AI cho hệ thống học liệu. Tôi có thể giúp bạn:\n\n• Giải thích bài học và khái niệm\n• Theo dõi tiến độ học tập của bạn\n• Gợi ý tài liệu và khóa học phù hợp\n• Hướng dẫn sử dụng hệ thống\n\nBạn cần tôi giúp gì hôm nay?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AiContextResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quick suggestions
  const suggestions = [
    'Giải thích bài học này cho tôi',
    'Tôi nên học gì tiếp theo?',
    'Xem tiến độ học tập của tôi',
    'Gợi ý tài liệu tham khảo',
    'Hướng dẫn sử dụng hệ thống',
  ];

  // Auto scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load context khi component mount
  useEffect(() => {
    loadContext();
  }, []);

  // Load context từ backend
  const loadContext = async () => {
    try {
      const ctx = await fetchChatContext();
      setContext(ctx);
    } catch (error) {
      console.error('Error loading context:', error);
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend) return;

    // Thêm tin nhắn user vào danh sách
    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Option 1: Gọi qua backend Python (khuyến nghị)
      try {
        const backendResponse = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: textToSend }),
        });

        if (backendResponse.ok) {
          const data = await backendResponse.json();
          const response = data.response || data.message || 'Không có phản hồi';
          
          const botMessage: Message = {
            id: Date.now() + 1,
            text: response,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
          return; // Thành công, không cần fallback
        }
      } catch (backendError) {
        console.warn('Backend không khả dụng, thử gọi Gemini trực tiếp:', backendError);
      }

      // Option 2: Fallback - Gọi Gemini API trực tiếp (nếu backend không khả dụng)
      // Load context mới nếu cần
      let currentContext = context;
      if (!currentContext) {
        currentContext = await fetchChatContext(textToSend);
        setContext(currentContext);
      }

      // Kiểm tra API key
      if (!hasGeminiKey()) {
        throw new Error(
          'Chưa cấu hình API key. Vui lòng cấu hình trong Settings hoặc file .env'
        );
      }

      // Gọi Gemini API trực tiếp
      const response = await getQuickResponse(textToSend, currentContext || undefined);

      // Thêm phản hồi bot
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `Xin lỗi, đã xảy ra lỗi: ${error?.message || String(error)}. Vui lòng thử lại.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Xử lý Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Click vào suggestion
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <h2>💬 Trợ lý AI Học Liệu</h2>
          <div className="chat-status">
            {hasGeminiKey() ? (
              <span className="status-indicator online">● Đang hoạt động</span>
            ) : (
              <span className="status-indicator offline">○ Chưa cấu hình API key</span>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                {message.text.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < message.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="message bot-message">
              <div className="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length === 1 && !isLoading && (
          <div className="suggestions-container">
            <div className="suggestions-label">💡 Gợi ý câu hỏi:</div>
            <div className="suggestions">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder="Nhập câu hỏi của bạn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              resize: 'none',
            }}
          />
          <button
            className="send-button"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;


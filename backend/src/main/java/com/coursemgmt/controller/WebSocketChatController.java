package com.coursemgmt.controller;

import com.coursemgmt.dto.ChatMessageResponse;
import com.coursemgmt.dto.SendMessageRequest;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketChatController {
    
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
                log.error("User not authenticated");
                return;
            }
            
            Long senderId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            ChatMessageResponse message = chatService.sendMessage(senderId, request);
            
            // Send to all participants in the conversation
            messagingTemplate.convertAndSend("/topic/conversation/" + request.getConversationId(), message);
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage(), e);
        }
    }
    
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingMessage typing, SimpMessageHeaderAccessor headerAccessor) {
        Authentication auth = (Authentication) headerAccessor.getUser();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
            return;
        }
        
        Long userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
        typing.setUserId(userId);
        
        // Broadcast typing status to other participants
        messagingTemplate.convertAndSend("/topic/conversation/" + typing.getConversationId() + "/typing", typing);
    }
    
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload ReadMessage read, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
                return;
            }
            
            Long userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            chatService.markAsRead(read.getConversationId(), userId);
            
            // Notify other participants
            messagingTemplate.convertAndSend("/topic/conversation/" + read.getConversationId() + "/read", read);
        } catch (Exception e) {
            log.error("Error marking as read: {}", e.getMessage(), e);
        }
    }
    
    // Inner classes for WebSocket messages
    public static class TypingMessage {
        private Long conversationId;
        private Long userId;
        private Boolean isTyping;
        
        public Long getConversationId() { return conversationId; }
        public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Boolean getIsTyping() { return isTyping; }
        public void setIsTyping(Boolean isTyping) { this.isTyping = isTyping; }
    }
    
    public static class ReadMessage {
        private Long conversationId;
        private Long messageId;
        
        public Long getConversationId() { return conversationId; }
        public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
        public Long getMessageId() { return messageId; }
        public void setMessageId(Long messageId) { this.messageId = messageId; }
    }
}


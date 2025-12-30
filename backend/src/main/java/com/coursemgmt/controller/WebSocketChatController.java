package com.coursemgmt.controller;

import com.coursemgmt.dto.ChatMessageResponse;
import com.coursemgmt.dto.SendMessageRequest;
import com.coursemgmt.dto.UpdateMessageRequest;
import com.coursemgmt.dto.DeleteMessageRequest;
import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.ChatService;
import com.coursemgmt.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketChatController {
    
    private final ChatService chatService;
    private final NotificationService notificationService;
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
            
            // Get all participants and send notifications
            List<Long> participantIds = chatService.getConversationParticipantIds(request.getConversationId());
            for (Long participantId : participantIds) {
                if (!participantId.equals(senderId)) {
                    // Send notification to recipient (saved in database)
                    notificationService.notifyNewMessage(
                        participantId,
                        senderId,
                        request.getConversationId(),
                        message.getSenderName(),
                        message.getContent()
                    );
                }
            }
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
        
        // Broadcast typing status to other participants only (not to the sender)
        // Get all participants and send only to others
        List<Long> participantIds = chatService.getConversationParticipantIds(typing.getConversationId());
        for (Long participantId : participantIds) {
            if (!participantId.equals(userId)) {
                // Send typing status to this participant via their personal queue
                messagingTemplate.convertAndSendToUser(
                    participantId.toString(),
                    "/queue/typing",
                    typing
                );
            }
        }
        
        // Also broadcast to topic for subscribers (but frontend will filter)
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
    
    @MessageMapping("/chat.update")
    public void updateMessage(@Payload UpdateMessageWrapper wrapper, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
                log.error("User not authenticated");
                return;
            }
            
            Long userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            ChatMessageResponse updatedMessage = chatService.updateMessage(wrapper.getMessageId(), userId, wrapper.getRequest());
            
            // Broadcast updated message to all participants
            Map<String, Object> updateEvent = new HashMap<>();
            updateEvent.put("type", "message-updated");
            updateEvent.put("message", updatedMessage);
            messagingTemplate.convertAndSend("/topic/conversation/" + updatedMessage.getConversationId(), updateEvent);
        } catch (Exception e) {
            log.error("Error updating message: {}", e.getMessage(), e);
        }
    }
    
    @MessageMapping("/chat.delete")
    public void deleteMessage(@Payload DeleteMessageRequest deleteRequest, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
                log.error("User not authenticated");
                return;
            }
            
            Long userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            chatService.deleteMessage(deleteRequest.getMessageId(), userId);
            
            // Broadcast delete event to all participants
            Map<String, Object> deleteEvent = new HashMap<>();
            deleteEvent.put("type", "message-deleted");
            deleteEvent.put("messageId", deleteRequest.getMessageId());
            deleteEvent.put("conversationId", deleteRequest.getConversationId());
            messagingTemplate.convertAndSend("/topic/conversation/" + deleteRequest.getConversationId(), deleteEvent);
        } catch (Exception e) {
            log.error("Error deleting message: {}", e.getMessage(), e);
        }
    }
    
    @MessageMapping("/chat.online")
    public void handleUserOnline(@Payload OnlineStatus status, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
                return;
            }
            
            Long userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            status.setUserId(userId);
            
            // Broadcast online status to all user's conversations
            List<Long> conversationIds = chatService.getUserConversationIds(userId);
            for (Long conversationId : conversationIds) {
                messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/online", status);
            }
        } catch (Exception e) {
            log.error("Error handling user online: {}", e.getMessage(), e);
        }
    }
    
    @MessageMapping("/chat.offline")
    public void handleUserOffline(@Payload OnlineStatus status, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth == null || !(auth.getPrincipal() instanceof UserDetailsImpl)) {
                return;
            }
            
            Long userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            status.setUserId(userId);
            
            // Broadcast offline status to all user's conversations
            List<Long> conversationIds = chatService.getUserConversationIds(userId);
            for (Long conversationId : conversationIds) {
                messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/offline", status);
            }
        } catch (Exception e) {
            log.error("Error handling user offline: {}", e.getMessage(), e);
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
    
    public static class OnlineStatus {
        private Long userId;
        private Boolean isOnline;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Boolean getIsOnline() { return isOnline; }
        public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }
    }
    
    public static class UpdateMessageWrapper {
        private Long messageId;
        private UpdateMessageRequest request;
        
        public Long getMessageId() { return messageId; }
        public void setMessageId(Long messageId) { this.messageId = messageId; }
        public UpdateMessageRequest getRequest() { return request; }
        public void setRequest(UpdateMessageRequest request) { this.request = request; }
    }
}


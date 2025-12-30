package com.coursemgmt.config;

import com.coursemgmt.security.services.UserDetailsImpl;
import com.coursemgmt.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) headerAccessor.getUser();
        
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            log.info("User connected: {}", userId);
            
            // Immediately broadcast online status to all user's conversations
            try {
                List<Long> conversationIds = chatService.getUserConversationIds(userId);
                for (Long conversationId : conversationIds) {
                    messagingTemplate.convertAndSend(
                        "/topic/conversation/" + conversationId + "/online",
                        new OnlineStatus(userId, true)
                    );
                }
                log.info("Broadcasted online status for user {} to {} conversations", userId, conversationIds.size());
            } catch (Exception e) {
                log.error("Error broadcasting online status: {}", e.getMessage(), e);
            }
        }
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) headerAccessor.getUser();
        
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) auth.getPrincipal()).getId();
            log.info("User disconnected: {}", userId);
            
            // Broadcast offline status immediately
            // Frontend will handle debouncing to avoid flickering
            try {
                List<Long> conversationIds = chatService.getUserConversationIds(userId);
                for (Long conversationId : conversationIds) {
                    messagingTemplate.convertAndSend(
                        "/topic/conversation/" + conversationId + "/offline",
                        new OnlineStatus(userId, false)
                    );
                }
                log.info("Broadcasted offline status for user {} to {} conversations", userId, conversationIds.size());
            } catch (Exception e) {
                log.error("Error broadcasting offline status: {}", e.getMessage(), e);
            }
        }
    }
    
    // Inner class for online status
    public static class OnlineStatus {
        private Long userId;
        private Boolean isOnline;
        
        public OnlineStatus() {}
        
        public OnlineStatus(Long userId, Boolean isOnline) {
            this.userId = userId;
            this.isOnline = isOnline;
        }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Boolean getIsOnline() { return isOnline; }
        public void setIsOnline(Boolean isOnline) { this.isOnline = isOnline; }
    }
}


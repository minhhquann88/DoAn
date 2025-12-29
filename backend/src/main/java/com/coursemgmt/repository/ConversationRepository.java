package com.coursemgmt.repository;

import com.coursemgmt.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    @Query("SELECT DISTINCT c FROM Conversation c " +
           "JOIN c.participants p " +
           "WHERE p.user.id = :userId " +
           "ORDER BY CASE WHEN c.lastMessageAt IS NULL THEN 1 ELSE 0 END, c.lastMessageAt DESC, c.updatedAt DESC")
    List<Conversation> findByUserIdOrderByLastMessageAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Conversation c " +
           "JOIN c.participants p1 " +
           "JOIN c.participants p2 " +
           "WHERE p1.user.id = :userId1 AND p2.user.id = :userId2 " +
           "AND c.type = 'DIRECT' " +
           "AND SIZE(c.participants) = 2")
    Optional<Conversation> findDirectConversationBetweenUsers(
        @Param("userId1") Long userId1, 
        @Param("userId2") Long userId2
    );
    
    @Query("SELECT c FROM Conversation c " +
           "JOIN c.participants p " +
           "WHERE c.id = :conversationId AND p.user.id = :userId")
    Optional<Conversation> findByIdAndUserId(@Param("conversationId") Long conversationId, 
                                             @Param("userId") Long userId);
}


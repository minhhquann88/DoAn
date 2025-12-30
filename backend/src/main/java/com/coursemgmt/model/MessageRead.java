package com.coursemgmt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_reads",
       uniqueConstraints = @UniqueConstraint(columnNames = {"message_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageRead {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "read_at", nullable = false, updatable = false)
    private LocalDateTime readAt = LocalDateTime.now();
}


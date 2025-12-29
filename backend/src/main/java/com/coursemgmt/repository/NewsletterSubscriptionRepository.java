package com.coursemgmt.repository;

import com.coursemgmt.model.NewsletterSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsletterSubscriptionRepository extends JpaRepository<NewsletterSubscription, Long> {
    Optional<NewsletterSubscription> findByEmail(String email);
    List<NewsletterSubscription> findByIsActiveTrue();
    boolean existsByEmail(String email);
    List<NewsletterSubscription> findByUserId(Long userId);
}


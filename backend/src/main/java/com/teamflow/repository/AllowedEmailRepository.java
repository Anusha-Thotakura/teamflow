package com.teamflow.repository;

import com.teamflow.entity.AllowedEmail;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AllowedEmailRepository extends JpaRepository<AllowedEmail, Long> {

    boolean existsByEmail(String email);

    @Transactional   // ← ADD THIS LINE
    void deleteByEmail(String email);
}
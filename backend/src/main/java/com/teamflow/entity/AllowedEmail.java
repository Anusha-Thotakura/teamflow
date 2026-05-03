package com.teamflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "allowed_emails")
@Getter
@Setter
@NoArgsConstructor
public class AllowedEmail {

    @Id
    @Column(unique = true, nullable = false)
    private String email;

    public AllowedEmail(String email) {
        this.email = email.toLowerCase().trim();
    }
}
package com.teamflow.controller;

import com.teamflow.entity.AllowedEmail;
import com.teamflow.entity.Role;
import com.teamflow.entity.User;
import com.teamflow.repository.AllowedEmailRepository;
import com.teamflow.repository.UserRepository;
import com.teamflow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repo;
    private final AllowedEmailRepository allowedEmailRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // ─────────────────────────────────────────────
    // REGISTER — only allowed emails can sign up
    // ─────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        String email = user.getEmail().toLowerCase().trim();

        // ✅ Check whitelist
        if (!allowedEmailRepo.existsByEmail(email)) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "You are not invited to this platform. Contact your admin."));
        }

        // ✅ Check duplicate
        if (repo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already registered. Please login."));
        }

        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        repo.save(user);
        return ResponseEntity.ok(Map.of("message", "Registered successfully. You can now login."));
    }
@PostMapping("/init")
public ResponseEntity<?> initAdmin() {
    String email = "admin@gmail.com";
    if (!allowedEmailRepo.existsByEmail(email)) {
        allowedEmailRepo.save(new AllowedEmail(email));
    }
    return ResponseEntity.ok(Map.of("message", "Admin email whitelisted"));
}
    // ─────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        String email = user.getEmail().toLowerCase().trim();
        User existing = repo.findByEmail(email).orElse(null);

        if (existing == null || !passwordEncoder.matches(user.getPassword(), existing.getPassword())) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(existing.getEmail(), existing.getRole().name());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", "ROLE_" + existing.getRole().name()
        ));
    }

    // ─────────────────────────────────────────────
    // ADMIN — invite a new email
    // ─────────────────────────────────────────────
    @PostMapping("/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> inviteEmail(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        email = email.toLowerCase().trim();

        if (allowedEmailRepo.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already invited"));
        }

        allowedEmailRepo.save(new AllowedEmail(email));
        return ResponseEntity.ok(Map.of("message", email + " has been invited"));
    }

    // ─────────────────────────────────────────────
    // ADMIN — remove an email from whitelist
    // ─────────────────────────────────────────────
    @DeleteMapping("/invite/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> revokeEmail(@PathVariable String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        email = email.toLowerCase().trim();
        allowedEmailRepo.deleteByEmail(email);
        return ResponseEntity.ok(Map.of("message", email + " has been removed from whitelist"));
    }

    // ─────────────────────────────────────────────
    // ADMIN — list all invited emails
    // ─────────────────────────────────────────────
    @GetMapping("/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listInvited() {
        List<String> emails = allowedEmailRepo.findAll()
                .stream()
                .map(AllowedEmail::getEmail)
                .toList();
        return ResponseEntity.ok(Map.of("invitedEmails", emails));
    }
}

package com.teamflow.service;

import com.teamflow.dto.UserRequest;
import com.teamflow.dto.UserResponse;
import com.teamflow.entity.Role;
import com.teamflow.entity.User;
import com.teamflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    // ✅ CREATE USER (DTO BASED)
    public UserResponse create(UserRequest request) {

        if (repo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // 🔥 IMPORTANT FIX (ENCRYPT PASSWORD)
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(Role.valueOf(request.getRole()));

        User saved = repo.save(user);

        return mapToResponse(saved);
    }

    // ✅ GET ALL USERS (DTO)
    public List<UserResponse> getAll() {
        return repo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ✅ GET USER BY EMAIL (USED IN LOGIN)
    public User findByEmail(String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ PASSWORD MATCH (USED IN LOGIN)
    public boolean matchPassword(String raw, String encoded) {
        return passwordEncoder.matches(raw, encoded);
    }

    // 🔄 COMMON MAPPER
    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
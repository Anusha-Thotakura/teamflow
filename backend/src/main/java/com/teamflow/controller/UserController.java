package com.teamflow.controller;

import com.teamflow.dto.UserRequest;
import com.teamflow.dto.UserResponse;
import com.teamflow.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    // Public - used during signup
    @PostMapping
    public UserResponse create(@RequestBody UserRequest request) {
        return service.create(request);
    }

    // ✅ Only ADMIN can list all users (e.g. to assign tasks)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAll() {
        return service.getAll();
    }
}

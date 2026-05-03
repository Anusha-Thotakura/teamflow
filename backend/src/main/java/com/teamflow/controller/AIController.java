package com.teamflow.controller;

import com.teamflow.dto.AIInsightResponse;
import com.teamflow.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    // ──────────────────────────────────────────────────────────
    //  GET /ai/project/{id}/analysis
    //  Get full AI-powered analysis for a project
    //  (task completion + budget usage + AI suggestions)
    // ──────────────────────────────────────────────────────────
    @GetMapping("/project/{id}/analysis")
    public ResponseEntity<AIInsightResponse> analyzeProject(@PathVariable Long id) {
        return ResponseEntity.ok(aiService.analyzeProject(id));
    }

    // ──────────────────────────────────────────────────────────
    //  GET /ai/analysis   (legacy endpoint — still works)
    //  Kept for backward compatibility
    // ──────────────────────────────────────────────────────────
    @GetMapping("/analysis")
    public ResponseEntity<String> analyzeLegacy(
            @RequestParam int total,
            @RequestParam int completed,
            @RequestParam double budget,
            @RequestParam double spent) {

        return ResponseEntity.ok(aiService.analyze(total, completed, budget, spent));
    }
}
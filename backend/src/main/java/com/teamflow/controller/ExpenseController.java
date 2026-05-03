package com.teamflow.controller;

import com.teamflow.dto.BudgetSummary;
import com.teamflow.dto.ExpenseRequest;
import com.teamflow.dto.ExpenseResponse;
import com.teamflow.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService service;

    // ──────────────────────────────────────────────────────────
    //  POST /expenses
    //  Add a new expense to a project
    //
    //  Body: { title, amount, category, date, projectId }
    // ──────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ExpenseResponse> add(@RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(service.add(request));
    }

    // ──────────────────────────────────────────────────────────
    //  GET /expenses/project/{projectId}
    //  List all expenses for a project
    // ──────────────────────────────────────────────────────────
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ExpenseResponse>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(service.getByProject(projectId));
    }

    // ──────────────────────────────────────────────────────────
    //  GET /expenses/project/{projectId}/summary
    //  Full budget summary: total, spent, remaining, % used,
    //  status (SAFE/WARNING/CRITICAL), category breakdown
    // ──────────────────────────────────────────────────────────
    @GetMapping("/project/{projectId}/summary")
    public ResponseEntity<BudgetSummary> getBudgetSummary(@PathVariable Long projectId) {
        return ResponseEntity.ok(service.getBudgetSummary(projectId));
    }

    // ──────────────────────────────────────────────────────────
    //  DELETE /expenses/{id}
    // ──────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Expense deleted"));
    }
}
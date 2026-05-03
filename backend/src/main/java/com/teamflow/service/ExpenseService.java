package com.teamflow.service;

import com.teamflow.dto.BudgetSummary;
import com.teamflow.dto.ExpenseRequest;
import com.teamflow.dto.ExpenseResponse;
import com.teamflow.entity.Expense;
import com.teamflow.entity.Project;
import com.teamflow.repository.ExpenseRepository;
import com.teamflow.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository repo;
    private final ProjectRepository projectRepo;

    // ──────────────────────────────────────────────────────────
    //  ADD EXPENSE
    // ──────────────────────────────────────────────────────────
    public ExpenseResponse add(ExpenseRequest request) {

        Project project = projectRepo.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found: " + request.getProjectId()));

        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        expense.setProject(project);

        Expense saved = repo.save(expense);
        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────────────────
    //  GET ALL EXPENSES FOR A PROJECT
    // ──────────────────────────────────────────────────────────
    public List<ExpenseResponse> getByProject(Long projectId) {
        return repo.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ──────────────────────────────────────────────────────────
    //  GET BUDGET SUMMARY  (total, spent, remaining, breakdown)
    //  ✅ FIX: Was doing findAll() + filter. Now uses DB queries.
    // ──────────────────────────────────────────────────────────
    public BudgetSummary getBudgetSummary(Long projectId) {

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // ✅ Efficient DB aggregate query
        Double totalSpent = repo.sumAmountByProjectId(projectId);
        if (totalSpent == null) totalSpent = 0.0;

        Double totalBudget = project.getBudget() != null ? project.getBudget() : 0.0;
        Double remaining = totalBudget - totalSpent;
        Double usagePercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0.0;

        // Determine budget status
        String status;
        if (usagePercent >= 90) {
            status = "CRITICAL";    // 🔴 > 90% used
        } else if (usagePercent >= 70) {
            status = "WARNING";     // 🟡 70-90%
        } else {
            status = "SAFE";        // 🟢 < 70%
        }

        // ✅ Category breakdown
        List<Object[]> categoryData = repo.sumByCategory(projectId);
        Map<String, Double> byCategory = new LinkedHashMap<>();
        for (Object[] row : categoryData) {
            byCategory.put((String) row[0], (Double) row[1]);
        }

        return new BudgetSummary(
                projectId,
                project.getName(),
                totalBudget,
                totalSpent,
                remaining,
                Math.round(usagePercent * 100.0) / 100.0,
                status,
                byCategory
        );
    }

    // ──────────────────────────────────────────────────────────
    //  DELETE EXPENSE
    // ──────────────────────────────────────────────────────────
    public void delete(Long expenseId) {
        if (!repo.existsById(expenseId)) {
            throw new RuntimeException("Expense not found: " + expenseId);
        }
        repo.deleteById(expenseId);
    }

    // ──────────────────────────────────────────────────────────
    //  HELPER: Map Expense entity → ExpenseResponse DTO
    // ──────────────────────────────────────────────────────────
    private ExpenseResponse mapToResponse(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getTitle(),
                e.getAmount(),
                e.getCategory(),
                e.getDate(),
                e.getProject().getId(),
                e.getProject().getName()
        );
    }
}
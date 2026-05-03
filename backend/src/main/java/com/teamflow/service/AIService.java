package com.teamflow.service;

import com.teamflow.dto.AIInsightResponse;
import com.teamflow.dto.BudgetSummary;
import com.teamflow.entity.Project;
import com.teamflow.entity.TaskStatus;
import com.teamflow.repository.ExpenseRepository;
import com.teamflow.repository.ProjectRepository;
import com.teamflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AIService {

    private final ProjectRepository projectRepo;
    private final TaskRepository taskRepo;
    private final ExpenseRepository expenseRepo;
    private final ExpenseService expenseService;
    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.model}")
    private String groqModel;

    // ──────────────────────────────────────────────────────────
    //  MAIN METHOD: Analyze a project and return AI insights
    // ──────────────────────────────────────────────────────────
    public AIInsightResponse analyzeProject(Long projectId) {

        // 1. Load project
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // 2. Gather task stats
        long totalTasks      = taskRepo.countByProjectId(projectId);
        long completedTasks  = taskRepo.countByProjectIdAndStatus(projectId, TaskStatus.DONE);
        long inProgressTasks = taskRepo.countByProjectIdAndStatus(projectId, TaskStatus.IN_PROGRESS);
        long pendingTasks    = taskRepo.countByProjectIdAndStatus(projectId, TaskStatus.TODO);

        // 3. Gather budget stats
        BudgetSummary budget = expenseService.getBudgetSummary(projectId);

        // 4. Build prompt
        String prompt = buildPrompt(
                project.getName(),
                totalTasks, completedTasks, inProgressTasks, pendingTasks,
                budget.getTotalBudget(), budget.getTotalSpent(),
                budget.getRemaining(), budget.getUsagePercent(),
                budget.getSpendingByCategory()
        );

        // 5. Call Groq API
        String aiText = callGroqApi(prompt);

        // 6. Extract bullet suggestions
        List<String> suggestions = extractSuggestions(aiText);

        // ✅ FIX: Build the response object field by field (no Lombok constructor)
        AIInsightResponse response = new AIInsightResponse();
        response.setProjectId(projectId);
        response.setProjectName(project.getName());
        response.setTotalTasks(totalTasks);
        response.setCompletedTasks(completedTasks);
        response.setPendingTasks(pendingTasks);
        response.setInProgressTasks(inProgressTasks);
        response.setTotalBudget(budget.getTotalBudget());
        response.setSpent(budget.getTotalSpent());
        response.setRemaining(budget.getRemaining());
        response.setUsagePercent(budget.getUsagePercent());
        response.setAiAnalysis(aiText);
        response.setSuggestions(suggestions);

        return response;
    }

    // ──────────────────────────────────────────────────────────
    //  LEGACY METHOD (kept for backward compatibility)
    // ──────────────────────────────────────────────────────────
    public String analyze(int total, int completed, double budget, double spent) {
        double usagePercent = budget > 0 ? (spent / budget) * 100 : 0;
        String prompt = String.format(
                "A software project has %d total tasks, %d completed, budget $%.2f, spent $%.2f (%.1f%%). " +
                        "In 3 bullet points, give concise project management advice.",
                total, completed, budget, spent, usagePercent
        );
        return callGroqApi(prompt);
    }

    // ──────────────────────────────────────────────────────────
    //  BUILD PROMPT
    // ──────────────────────────────────────────────────────────
    private String buildPrompt(String projectName, long total, long done,
                               long inProgress, long todo,
                               double budget, double spent,
                               double remaining, double usagePct,
                               Map<String, Double> categorySpend) {

        StringBuilder sb = new StringBuilder();
        sb.append("You are a project management AI assistant.\n\n");
        sb.append("Analyze the following project and provide actionable insights:\n\n");
        sb.append("Project: ").append(projectName).append("\n");
        sb.append("Tasks: ").append(total).append(" total, ")
                .append(done).append(" completed, ")
                .append(inProgress).append(" in progress, ")
                .append(todo).append(" pending\n");
        sb.append(String.format("Budget: $%.2f total, $%.2f spent (%.1f%%), $%.2f remaining\n",
                budget, spent, usagePct, remaining));

        if (categorySpend != null && !categorySpend.isEmpty()) {
            sb.append("Spending by category:\n");
            categorySpend.forEach((cat, amt) ->
                    sb.append("  - ").append(cat).append(": $")
                            .append(String.format("%.2f", amt)).append("\n"));
        }

        sb.append("\nProvide:\n");
        sb.append("1. A 2-sentence overall project health assessment\n");
        sb.append("2. 3-5 specific, actionable recommendations as bullet points starting with '•'\n");
        sb.append("3. Any risk warnings if applicable\n");
        sb.append("Keep your response concise and practical.\n");

        return sb.toString();
    }

    // ──────────────────────────────────────────────────────────
    //  CALL GROQ API
    // ──────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    private String callGroqApi(String userMessage) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", groqModel);
        body.put("max_tokens", 500);
        body.put("temperature", 0.7);

        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", userMessage);
        body.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    groqApiUrl, HttpMethod.POST, entity, Map.class);

            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices =
                        (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, String> msg = (Map<String, String>) choice.get("message");
                    return msg.get("content");
                }
            }
            return "AI analysis unavailable at this time.";

        } catch (Exception e) {
            return "AI service error: " + e.getMessage() +
                    ". Check your Groq API key in application.properties.";
        }
    }

    // ──────────────────────────────────────────────────────────
    //  EXTRACT BULLET POINTS from AI response
    // ──────────────────────────────────────────────────────────
    private List<String> extractSuggestions(String aiText) {
        List<String> suggestions = new ArrayList<>();
        if (aiText == null) return suggestions;

        for (String line : aiText.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.startsWith("•") || trimmed.startsWith("-")
                    || trimmed.matches("^\\d+\\..*")) {
                suggestions.add(trimmed);
            }
        }
        return suggestions;
    }
}
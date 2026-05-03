package com.teamflow.repository;

import com.teamflow.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // ✅ FIX: was using findAll() + stream filter (inefficient)
    //         now uses a proper DB query
    List<Expense> findByProjectId(Long projectId);

    // ✅ Sum of expenses for a project (native JPQL aggregate)
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.project.id = :projectId")
    Double sumAmountByProjectId(@Param("projectId") Long projectId);

    // ✅ Group by category for analytics
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e " +
            "WHERE e.project.id = :projectId GROUP BY e.category")
    List<Object[]> sumByCategory(@Param("projectId") Long projectId);
}
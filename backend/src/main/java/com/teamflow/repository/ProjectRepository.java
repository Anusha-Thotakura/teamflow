package com.teamflow.repository;

import com.teamflow.entity.Project;
import com.teamflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // ✅ Projects owned by a user
    List<Project> findByOwner(User owner);

    // ✅ Projects where user is a member
    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.email = :email")
    List<Project> findProjectsByMemberEmail(@Param("email") String email);

    // ✅ FIXED: All projects accessible to a user (owner OR member)
    //    The previous version used a subquery syntax that JPQL doesn't support.
    //    This version uses a JOIN which works correctly.
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m " +
            "WHERE p.owner.email = :email OR m.email = :email")
    List<Project> findAllAccessibleByEmail(@Param("email") String email);
}
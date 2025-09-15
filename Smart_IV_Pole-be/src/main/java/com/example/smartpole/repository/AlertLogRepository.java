package com.example.smartpole.repository;

import com.example.smartpole.entity.AlertLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertLogRepository extends JpaRepository<AlertLog, Integer> {

    // Find unacknowledged alerts
    List<AlertLog> findByAcknowledgedFalseOrderByCreatedAtDesc();

    // Find alerts by session
    List<AlertLog> findBySessionIdOrderByCreatedAtDesc(Integer sessionId);

    // Find alerts by severity
    List<AlertLog> findBySeverityOrderByCreatedAtDesc(AlertLog.Severity severity);

    // Find critical unacknowledged alerts
    List<AlertLog> findByAcknowledgedFalseAndSeverityOrderByCreatedAtDesc(AlertLog.Severity severity);

    // Recent alerts (last 24 hours)
    @Query("SELECT a FROM AlertLog a WHERE a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<AlertLog> findRecentAlerts(@Param("since") LocalDateTime since);

    // Count unacknowledged alerts by severity
    @Query("SELECT COUNT(a) FROM AlertLog a WHERE a.acknowledged = false AND a.severity = :severity")
    Long countUnacknowledgedBySeverity(@Param("severity") AlertLog.Severity severity);

    // Dashboard - unacknowledged critical alerts
    @Query("SELECT a FROM AlertLog a WHERE a.acknowledged = false AND a.severity = 'critical' ORDER BY a.createdAt DESC")
    List<AlertLog> findUnacknowledgedCriticalAlerts();
}
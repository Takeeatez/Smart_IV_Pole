package com.example.smartpole.service;

import com.example.smartpole.entity.InfusionSession;
import com.example.smartpole.entity.AlertLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final InfusionSessionService infusionSessionService;
    private final AlertLogService alertLogService;
    private final PoleService poleService;

    public Map<String, Object> getDashboardData() {
        Map<String, Object> dashboardData = new HashMap<>();

        // Active sessions
        List<InfusionSession> activeSessions = infusionSessionService.getAllActiveSessions();
        dashboardData.put("activeSessions", activeSessions);
        dashboardData.put("activeSessionCount", activeSessions.size());

        // Sessions by status
        List<InfusionSession> criticalSessions = infusionSessionService.getCriticalSessions();
        List<InfusionSession> warningSessions = infusionSessionService.getWarningSessions();

        dashboardData.put("criticalSessions", criticalSessions);
        dashboardData.put("warningSessions", warningSessions);
        dashboardData.put("criticalCount", criticalSessions.size());
        dashboardData.put("warningCount", warningSessions.size());

        // Normal sessions (not critical or warning)
        long normalCount = activeSessions.size() - criticalSessions.size() - warningSessions.size();
        dashboardData.put("normalCount", normalCount);

        // Alert data
        List<AlertLog> unacknowledgedAlerts = alertLogService.getAllUnacknowledgedAlerts();
        List<AlertLog> criticalAlerts = alertLogService.getCriticalUnacknowledgedAlerts();

        dashboardData.put("unacknowledgedAlerts", unacknowledgedAlerts);
        dashboardData.put("criticalAlerts", criticalAlerts);
        dashboardData.put("totalAlertsCount", unacknowledgedAlerts.size());
        dashboardData.put("criticalAlertsCount", criticalAlerts.size());

        // Alert counts by severity
        Long infoAlerts = alertLogService.countUnacknowledgedBySeverity(AlertLog.Severity.info);
        Long warningAlerts = alertLogService.countUnacknowledgedBySeverity(AlertLog.Severity.warning);
        Long criticalAlertsCount = alertLogService.countUnacknowledgedBySeverity(AlertLog.Severity.critical);

        Map<String, Long> alertCounts = new HashMap<>();
        alertCounts.put("info", infoAlerts);
        alertCounts.put("warning", warningAlerts);
        alertCounts.put("critical", criticalAlertsCount);
        dashboardData.put("alertCounts", alertCounts);

        // Pole statistics
        Long activePoles = poleService.countActivePoles();
        dashboardData.put("activePolesCount", activePoles);

        // System status
        Map<String, Object> systemStatus = new HashMap<>();
        systemStatus.put("totalActiveSessions", activeSessions.size());
        systemStatus.put("totalActivePoles", activePoles);
        systemStatus.put("totalUnacknowledgedAlerts", unacknowledgedAlerts.size());
        systemStatus.put("status", criticalAlerts.size() > 0 ? "critical" :
                         unacknowledgedAlerts.size() > 0 ? "warning" : "normal");
        dashboardData.put("systemStatus", systemStatus);

        return dashboardData;
    }

    public Map<String, Object> getWardOverview() {
        Map<String, Object> wardData = new HashMap<>();

        // Get all active sessions for ward view
        List<InfusionSession> activeSessions = infusionSessionService.getAllActiveSessions();

        // Group sessions by status for color coding
        Map<String, Object> sessionsByStatus = new HashMap<>();
        int normalCount = 0, warningCount = 0, criticalCount = 0, inactiveCount = 0;

        for (InfusionSession session : activeSessions) {
            double completionPercentage = session.getCompletionPercentage();
            if (completionPercentage >= 95) { // Critical: <5% remaining
                criticalCount++;
            } else if (completionPercentage >= 70) { // Warning: 10-30% remaining
                warningCount++;
            } else { // Normal: >30% remaining
                normalCount++;
            }
        }

        sessionsByStatus.put("normal", normalCount);
        sessionsByStatus.put("warning", warningCount);
        sessionsByStatus.put("critical", criticalCount);
        sessionsByStatus.put("inactive", 6 - activeSessions.size()); // Assuming 6 beds max

        wardData.put("sessionsByStatus", sessionsByStatus);
        wardData.put("activeSessions", activeSessions);

        return wardData;
    }
}
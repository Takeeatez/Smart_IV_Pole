package com.example.smartpole.service;

import com.example.smartpole.entity.AlertLog;
import com.example.smartpole.repository.AlertLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AlertLogService {

    private final AlertLogRepository alertLogRepository;

    public List<AlertLog> getAllUnacknowledgedAlerts() {
        return alertLogRepository.findByAcknowledgedFalseOrderByCreatedAtDesc();
    }

    public List<AlertLog> getCriticalUnacknowledgedAlerts() {
        return alertLogRepository.findUnacknowledgedCriticalAlerts();
    }

    public List<AlertLog> getAlertsBySession(Integer sessionId) {
        return alertLogRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
    }

    public List<AlertLog> getRecentAlerts(int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return alertLogRepository.findRecentAlerts(since);
    }

    public Long countUnacknowledgedBySeverity(AlertLog.Severity severity) {
        return alertLogRepository.countUnacknowledgedBySeverity(severity);
    }

    public Optional<AlertLog> getAlertById(Integer id) {
        return alertLogRepository.findById(id);
    }

    @Transactional
    public AlertLog createAlert(Integer sessionId, String alertType, String severity, String message) {
        AlertLog alert = new AlertLog();
        alert.setSessionId(sessionId);
        alert.setAlertType(AlertLog.AlertType.valueOf(alertType));
        alert.setSeverity(AlertLog.Severity.valueOf(severity));
        alert.setMessage(message);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setAcknowledged(false);

        return alertLogRepository.save(alert);
    }

    @Transactional
    public AlertLog acknowledgeAlert(Integer alertId, String nurseId) {
        AlertLog alert = alertLogRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + alertId));

        alert.acknowledge(nurseId);
        return alertLogRepository.save(alert);
    }

    @Transactional
    public void acknowledgeAllAlerts(String nurseId) {
        List<AlertLog> unacknowledgedAlerts = getAllUnacknowledgedAlerts();
        for (AlertLog alert : unacknowledgedAlerts) {
            alert.acknowledge(nurseId);
        }
        alertLogRepository.saveAll(unacknowledgedAlerts);
    }

    // System alerts
    @Transactional
    public AlertLog createSystemAlert(String alertType, String severity, String message) {
        return createAlert(null, alertType, severity, message);
    }

    // Battery alert
    @Transactional
    public AlertLog createBatteryAlert(String poleId, int batteryLevel) {
        String message = String.format("IV Pole %s battery level is low: %d%%", poleId, batteryLevel);
        String severity = batteryLevel < 10 ? "critical" : "warning";
        return createSystemAlert("battery_low", severity, message);
    }

    // Pole fall alert
    @Transactional
    public AlertLog createPoleFailAlert(String poleId, Integer sessionId) {
        String message = String.format("IV Pole %s detected fall or movement", poleId);
        AlertLog alert = new AlertLog();
        alert.setSessionId(sessionId);
        alert.setAlertType(AlertLog.AlertType.pole_fall);
        alert.setSeverity(AlertLog.Severity.critical);
        alert.setMessage(message);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setAcknowledged(false);

        return alertLogRepository.save(alert);
    }

    // Nurse call alert (환자가 간호사 호출 버튼 누름)
    @Transactional
    public AlertLog createNurseCallAlert(Integer sessionId, Integer patientId, String patientName) {
        String message = String.format("환자 %s님이 간호사를 호출했습니다", patientName);
        AlertLog alert = new AlertLog();
        // sessionId가 null이거나 0이면 null로 저장 (세션 없이 호출한 경우)
        alert.setSessionId(sessionId != null && sessionId > 0 ? sessionId : null);
        alert.setAlertType(AlertLog.AlertType.nurse_call);
        alert.setSeverity(AlertLog.Severity.critical);
        alert.setMessage(message);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setAcknowledged(false);

        return alertLogRepository.save(alert);
    }
}
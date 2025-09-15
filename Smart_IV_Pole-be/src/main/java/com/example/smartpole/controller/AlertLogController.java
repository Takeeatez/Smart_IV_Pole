package com.example.smartpole.controller;

import com.example.smartpole.entity.AlertLog;
import com.example.smartpole.service.AlertLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AlertLogController {

    private final AlertLogService alertLogService;

    @GetMapping
    public ResponseEntity<List<AlertLog>> getAllUnacknowledgedAlerts() {
        List<AlertLog> alerts = alertLogService.getAllUnacknowledgedAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/critical")
    public ResponseEntity<List<AlertLog>> getCriticalUnacknowledgedAlerts() {
        List<AlertLog> alerts = alertLogService.getCriticalUnacknowledgedAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlertLog> getAlertById(@PathVariable Integer id) {
        Optional<AlertLog> alert = alertLogService.getAlertById(id);
        return alert.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AlertLog>> getAlertsBySession(@PathVariable Integer sessionId) {
        List<AlertLog> alerts = alertLogService.getAlertsBySession(sessionId);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AlertLog>> getRecentAlerts(@RequestParam(defaultValue = "24") int hours) {
        List<AlertLog> alerts = alertLogService.getRecentAlerts(hours);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/count/{severity}")
    public ResponseEntity<Long> getUnacknowledgedCountBySeverity(@PathVariable String severity) {
        try {
            AlertLog.Severity sev = AlertLog.Severity.valueOf(severity.toLowerCase());
            Long count = alertLogService.countUnacknowledgedBySeverity(sev);
            return ResponseEntity.ok(count);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<AlertLog> acknowledgeAlert(@PathVariable Integer id, @RequestParam String nurseId) {
        try {
            AlertLog alert = alertLogService.acknowledgeAlert(id, nurseId);
            return ResponseEntity.ok(alert);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/acknowledge-all")
    public ResponseEntity<Void> acknowledgeAllAlerts(@RequestParam String nurseId) {
        alertLogService.acknowledgeAllAlerts(nurseId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/system")
    public ResponseEntity<AlertLog> createSystemAlert(
            @RequestParam String alertType,
            @RequestParam String severity,
            @RequestParam String message) {
        try {
            AlertLog alert = alertLogService.createSystemAlert(alertType, severity, message);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
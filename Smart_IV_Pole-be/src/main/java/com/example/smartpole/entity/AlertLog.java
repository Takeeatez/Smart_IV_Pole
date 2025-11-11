package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "alert_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AlertLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Integer alertId;

    @Column(name = "session_id", nullable = true)
    private Integer sessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 50)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private Severity severity;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "acknowledged", nullable = false)
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_by", length = 50)
    private String acknowledgedBy;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Note: @ManyToOne relationship removed to allow NULL session_id for nurse calls without active sessions

    public enum AlertType {
        low_volume, flow_stopped, pole_fall, battery_low, system_error, nurse_call
    }

    public enum Severity {
        info, warning, critical
    }

    // Utility method
    public void acknowledge(String nurseId) {
        this.acknowledged = true;
        this.acknowledgedBy = nurseId;
        this.acknowledgedAt = LocalDateTime.now();
    }
}
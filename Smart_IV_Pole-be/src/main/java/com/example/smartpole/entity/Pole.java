package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "poles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pole {

    @Id
    @Column(name = "pole_id", length = 20)
    private String poleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PoleStatus status = PoleStatus.active;

    @Column(name = "battery_level", nullable = false)
    private Integer batteryLevel = 100;

    @Column(name = "last_maintenance")
    private LocalDate lastMaintenance;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "patient_id")
    private Integer patientId; // 폴대에 할당된 환자 ID

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt; // 폴대 할당 시간

    @Column(name = "last_ping_at")
    private LocalDateTime lastPingAt; // 마지막 핑 시간

    @Column(name = "is_online", nullable = false)
    private Boolean isOnline = false; // 온라인 상태 (30초 이내 핑 = true)

    // Bidirectional relationship with Patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PoleStatus {
        active, maintenance, inactive
    }

    // Utility methods for pole assignment
    public boolean isAssigned() {
        return patientId != null;
    }

    public void assignToPatient(Integer patientId) {
        this.patientId = patientId;
        this.assignedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void unassign() {
        this.patientId = null;
        this.assignedAt = null;
        this.updatedAt = LocalDateTime.now();
    }

    // Ping management methods
    public void updatePing() {
        this.lastPingAt = LocalDateTime.now();
        this.isOnline = true;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isOnlineNow() {
        if (lastPingAt == null) return false;
        // 60초 이내 핑이 있으면 온라인
        return LocalDateTime.now().minusSeconds(60).isBefore(lastPingAt);
    }

    public void markOffline() {
        this.isOnline = false;
        this.updatedAt = LocalDateTime.now();
    }
}
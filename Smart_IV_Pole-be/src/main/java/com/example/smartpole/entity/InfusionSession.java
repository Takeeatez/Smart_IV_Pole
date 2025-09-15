package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "infusion_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InfusionSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @Column(name = "patient_id", nullable = false)
    private Integer patientId;

    @Column(name = "drip_id", nullable = false)
    private Integer dripId;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "end_exp_time")
    private LocalDateTime endExpTime;

    @Column(name = "remaining_volume", nullable = false)
    private Integer remainingVolume;

    @Column(name = "flow_rate", nullable = false, precision = 6, scale = 2)
    private BigDecimal flowRate;

    @Column(name = "iv_pole_id", nullable = false, length = 20)
    private String ivPoleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SessionStatus status = SessionStatus.ACTIVE;

    @Column(name = "total_volume_ml", nullable = false)
    private Integer totalVolumeMl;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drip_id", insertable = false, updatable = false)
    private DrugType drugType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iv_pole_id", insertable = false, updatable = false)
    private Pole pole;

    public enum SessionStatus {
        ACTIVE, PAUSED, ENDED
    }

    // Utility methods
    public double getCompletionPercentage() {
        if (totalVolumeMl == 0) return 0;
        return ((double) (totalVolumeMl - remainingVolume) / totalVolumeMl) * 100;
    }

    public boolean isLowVolume() {
        return getCompletionPercentage() > 90; // Less than 10% remaining
    }

    public boolean isCriticalVolume() {
        return getCompletionPercentage() > 95; // Less than 5% remaining
    }
}
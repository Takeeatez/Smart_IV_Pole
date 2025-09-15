package com.example.smartpole.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "infusion_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InfusionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Integer logId;

    @Column(name = "session_id", nullable = false)
    private Integer sessionId;

    @Column(name = "patient_id", nullable = false)
    private Integer patientId;

    @Column(name = "drip_id", nullable = false)
    private Integer dripId;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "note")
    private String note;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", insertable = false, updatable = false)
    private InfusionSession infusionSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drip_id", insertable = false, updatable = false)
    private DrugType drugType;
}
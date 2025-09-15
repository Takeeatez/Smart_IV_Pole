package com.example.smartpole.repository;

import com.example.smartpole.entity.InfusionSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InfusionSessionRepository extends JpaRepository<InfusionSession, Integer> {

    // Find active sessions
    List<InfusionSession> findByStatus(InfusionSession.SessionStatus status);

    // Find sessions by patient
    List<InfusionSession> findByPatientId(Integer patientId);

    // Find sessions by pole
    List<InfusionSession> findByIvPoleId(String poleId);

    // Find active session by pole (should be only one)
    Optional<InfusionSession> findByIvPoleIdAndStatus(String poleId, InfusionSession.SessionStatus status);

    // Find active session by patient (should be only one)
    Optional<InfusionSession> findByPatientIdAndStatus(Integer patientId, InfusionSession.SessionStatus status);

    // Dashboard queries - active sessions with low volume
    @Query("SELECT s FROM InfusionSession s WHERE s.status = 'ACTIVE' AND (s.remainingVolume * 100.0 / s.totalVolumeMl) <= :percentage")
    List<InfusionSession> findActiveLowVolumeSessions(@Param("percentage") double percentage);

    // Get all active sessions for dashboard
    @Query("SELECT s FROM InfusionSession s WHERE s.status = 'ACTIVE' ORDER BY s.startTime ASC")
    List<InfusionSession> findAllActiveSessions();

    // Critical sessions (less than 5% remaining)
    @Query("SELECT s FROM InfusionSession s WHERE s.status = 'ACTIVE' AND (s.remainingVolume * 100.0 / s.totalVolumeMl) <= 5")
    List<InfusionSession> findCriticalSessions();

    // Warning sessions (10-30% remaining)
    @Query("SELECT s FROM InfusionSession s WHERE s.status = 'ACTIVE' AND (s.remainingVolume * 100.0 / s.totalVolumeMl) BETWEEN 10 AND 30")
    List<InfusionSession> findWarningSessions();
}
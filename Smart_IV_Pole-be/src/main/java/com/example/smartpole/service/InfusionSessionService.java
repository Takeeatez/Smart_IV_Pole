package com.example.smartpole.service;

import com.example.smartpole.entity.InfusionSession;
import com.example.smartpole.repository.InfusionSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InfusionSessionService {

    private final InfusionSessionRepository infusionSessionRepository;
    private final AlertLogService alertLogService;

    public List<InfusionSession> getAllSessions() {
        return infusionSessionRepository.findAll();
    }

    @Transactional
    public InfusionSession createSession(InfusionSession session) {
        session.setStartTime(LocalDateTime.now());
        session.setStatus(InfusionSession.SessionStatus.ACTIVE);
        return infusionSessionRepository.save(session);
    }

    public List<InfusionSession> getAllActiveSessions() {
        return infusionSessionRepository.findAllActiveSessions();
    }

    public Optional<InfusionSession> getSessionById(Integer id) {
        return infusionSessionRepository.findById(id);
    }

    public Optional<InfusionSession> getActiveSessionByPatient(Integer patientId) {
        return infusionSessionRepository.findByPatientIdAndStatus(patientId, InfusionSession.SessionStatus.ACTIVE);
    }

    public Optional<InfusionSession> getActiveSessionByPole(String poleId) {
        return infusionSessionRepository.findByIvPoleIdAndStatus(poleId, InfusionSession.SessionStatus.ACTIVE);
    }

    public List<InfusionSession> getSessionsByPatient(Integer patientId) {
        return infusionSessionRepository.findByPatientId(patientId);
    }

    // Dashboard queries
    public List<InfusionSession> getCriticalSessions() {
        return infusionSessionRepository.findCriticalSessions();
    }

    public List<InfusionSession> getWarningSessions() {
        return infusionSessionRepository.findWarningSessions();
    }

    public List<InfusionSession> getLowVolumeSessions(double percentage) {
        return infusionSessionRepository.findActiveLowVolumeSessions(percentage);
    }

    @Transactional
    public InfusionSession startInfusion(InfusionSession session) {
        // Check if patient already has active session
        Optional<InfusionSession> existingSession = getActiveSessionByPatient(session.getPatientId());
        if (existingSession.isPresent()) {
            throw new RuntimeException("Patient already has an active infusion session");
        }

        // Check if pole is already in use
        Optional<InfusionSession> poleSession = getActiveSessionByPole(session.getIvPoleId());
        if (poleSession.isPresent()) {
            throw new RuntimeException("IV Pole is already in use");
        }

        session.setStartTime(LocalDateTime.now());
        session.setStatus(InfusionSession.SessionStatus.ACTIVE);

        return infusionSessionRepository.save(session);
    }

    @Transactional
    public InfusionSession updateRemainingVolume(Integer sessionId, Integer remainingVolume) {
        InfusionSession session = infusionSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        int previousVolume = session.getRemainingVolume();
        session.setRemainingVolume(remainingVolume);

        // Check for low volume alerts
        if (session.isLowVolume() && !session.isCriticalVolume()) {
            // Generate low volume alert if this is a new low volume state
            if (previousVolume > remainingVolume && (previousVolume * 100.0 / session.getTotalVolumeMl()) > 10) {
                alertLogService.createAlert(sessionId, "low_volume", "warning",
                    "IV fluid level is low (" + session.getCompletionPercentage() + "% remaining)");
            }
        } else if (session.isCriticalVolume()) {
            // Generate critical alert
            if (previousVolume > remainingVolume && (previousVolume * 100.0 / session.getTotalVolumeMl()) > 5) {
                alertLogService.createAlert(sessionId, "low_volume", "critical",
                    "IV fluid critically low (" + session.getCompletionPercentage() + "% remaining)");
            }
        }

        return infusionSessionRepository.save(session);
    }

    @Transactional
    public InfusionSession pauseInfusion(Integer sessionId) {
        InfusionSession session = infusionSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        session.setStatus(InfusionSession.SessionStatus.PAUSED);
        return infusionSessionRepository.save(session);
    }

    @Transactional
    public InfusionSession resumeInfusion(Integer sessionId) {
        InfusionSession session = infusionSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        session.setStatus(InfusionSession.SessionStatus.ACTIVE);
        return infusionSessionRepository.save(session);
    }

    @Transactional
    public InfusionSession endInfusion(Integer sessionId) {
        InfusionSession session = infusionSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        session.setStatus(InfusionSession.SessionStatus.ENDED);
        session.setEndTime(LocalDateTime.now());

        return infusionSessionRepository.save(session);
    }
}
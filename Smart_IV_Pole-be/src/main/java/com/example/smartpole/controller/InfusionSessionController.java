package com.example.smartpole.controller;

import com.example.smartpole.entity.InfusionSession;
import com.example.smartpole.service.InfusionSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/infusions")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class InfusionSessionController {

    private final InfusionSessionService infusionSessionService;

    @GetMapping
    public ResponseEntity<List<InfusionSession>> getAllSessions() {
        List<InfusionSession> sessions = infusionSessionService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }

    @PostMapping
    public ResponseEntity<InfusionSession> createInfusionSession(@RequestBody InfusionSession session) {
        try {
            InfusionSession createdSession = infusionSessionService.createSession(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSession);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<InfusionSession>> getActiveSessions() {
        List<InfusionSession> sessions = infusionSessionService.getAllActiveSessions();
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InfusionSession> getSessionById(@PathVariable Integer id) {
        Optional<InfusionSession> session = infusionSessionService.getSessionById(id);
        return session.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<InfusionSession>> getSessionsByPatient(@PathVariable Integer patientId) {
        List<InfusionSession> sessions = infusionSessionService.getSessionsByPatient(patientId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<InfusionSession> getActiveSessionByPatient(@PathVariable Integer patientId) {
        Optional<InfusionSession> session = infusionSessionService.getActiveSessionByPatient(patientId);
        return session.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pole/{poleId}/active")
    public ResponseEntity<InfusionSession> getActiveSessionByPole(@PathVariable String poleId) {
        Optional<InfusionSession> session = infusionSessionService.getActiveSessionByPole(poleId);
        return session.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/critical")
    public ResponseEntity<List<InfusionSession>> getCriticalSessions() {
        List<InfusionSession> sessions = infusionSessionService.getCriticalSessions();
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/status/warning")
    public ResponseEntity<List<InfusionSession>> getWarningSessions() {
        List<InfusionSession> sessions = infusionSessionService.getWarningSessions();
        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/start")
    public ResponseEntity<InfusionSession> startInfusion(@RequestBody InfusionSession session) {
        try {
            InfusionSession startedSession = infusionSessionService.startInfusion(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(startedSession);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{sessionId}/volume")
    public ResponseEntity<InfusionSession> updateRemainingVolume(
            @PathVariable Integer sessionId,
            @RequestParam Integer remainingVolume) {
        try {
            InfusionSession session = infusionSessionService.updateRemainingVolume(sessionId, remainingVolume);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{sessionId}/pause")
    public ResponseEntity<InfusionSession> pauseInfusion(@PathVariable Integer sessionId) {
        try {
            InfusionSession session = infusionSessionService.pauseInfusion(sessionId);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{sessionId}/resume")
    public ResponseEntity<InfusionSession> resumeInfusion(@PathVariable Integer sessionId) {
        try {
            InfusionSession session = infusionSessionService.resumeInfusion(sessionId);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{sessionId}/end")
    public ResponseEntity<InfusionSession> endInfusion(@PathVariable Integer sessionId) {
        try {
            InfusionSession session = infusionSessionService.endInfusion(sessionId);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteInfusionSession(@PathVariable Integer sessionId) {
        try {
            infusionSessionService.deleteSession(sessionId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
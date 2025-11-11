package com.example.smartpole.controller;

import com.example.smartpole.entity.InfusionSession;
import com.example.smartpole.entity.Patient;
import com.example.smartpole.entity.Pole;
import com.example.smartpole.entity.Prescription;
import com.example.smartpole.service.InfusionSessionService;
import com.example.smartpole.service.PatientService;
import com.example.smartpole.service.PoleService;
import com.example.smartpole.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/poles")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class PoleController {

    private final PoleService poleService;
    private final InfusionSessionService infusionSessionService;
    private final PatientService patientService;
    private final PrescriptionService prescriptionService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPoles() {
        List<Pole> poles = poleService.getAllPoles();
        List<Map<String, Object>> polesWithPatientInfo = poles.stream()
            .map(this::convertPoleToResponse)
            .toList();
        return ResponseEntity.ok(polesWithPatientInfo);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActivePoles() {
        List<Pole> poles = poleService.getActivePoles();
        List<Map<String, Object>> polesWithPatientInfo = poles.stream()
            .map(this::convertPoleToResponse)
            .toList();
        return ResponseEntity.ok(polesWithPatientInfo);
    }

    @GetMapping("/online")
    public ResponseEntity<List<Map<String, Object>>> getOnlinePoles() {
        List<Pole> poles = poleService.getOnlinePoles();
        List<Map<String, Object>> polesWithPatientInfo = poles.stream()
            .map(this::convertPoleToResponse)
            .toList();
        return ResponseEntity.ok(polesWithPatientInfo);
    }

    @GetMapping("/available-online")
    public ResponseEntity<List<Pole>> getAvailableOnlinePoles() {
        List<Pole> poles = poleService.getAvailableOnlinePoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pole> getPoleById(@PathVariable String id) {
        Optional<Pole> pole = poleService.getPoleById(id);
        return pole.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/low-battery")
    public ResponseEntity<List<Pole>> getLowBatteryPoles(@RequestParam(defaultValue = "20") Integer threshold) {
        List<Pole> poles = poleService.getLowBatteryPoles(threshold);
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/maintenance-needed")
    public ResponseEntity<List<Pole>> getPolesNeedingMaintenance(@RequestParam(defaultValue = "20") Integer batteryThreshold) {
        List<Pole> poles = poleService.getPolesNeedingMaintenance(batteryThreshold);
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/count/active")
    public ResponseEntity<Long> getActivePoleCount() {
        Long count = poleService.countActivePoles();
        return ResponseEntity.ok(count);
    }

    @PostMapping
    public ResponseEntity<Pole> createPole(@RequestBody Pole pole) {
        try {
            Pole savedPole = poleService.savePole(pole);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPole);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Pole> updatePoleStatus(@PathVariable String id, @RequestParam String status) {
        try {
            Pole.PoleStatus poleStatus = Pole.PoleStatus.valueOf(status);
            Pole pole = poleService.updatePoleStatus(id, poleStatus);
            return ResponseEntity.ok(pole);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/battery")
    public ResponseEntity<Pole> updateBatteryLevel(@PathVariable String id, @RequestParam Integer batteryLevel) {
        try {
            if (batteryLevel < 0 || batteryLevel > 100) {
                return ResponseEntity.badRequest().build();
            }
            Pole pole = poleService.updateBatteryLevel(id, batteryLevel);
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/maintenance")
    public ResponseEntity<Pole> updateMaintenanceDate(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate maintenanceDate) {
        try {
            Pole pole = poleService.updateMaintenanceDate(id, maintenanceDate);
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePole(@PathVariable String id) {
        try {
            poleService.deletePole(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> poleExists(@PathVariable String id) {
        boolean exists = poleService.existsById(id);
        return ResponseEntity.ok(exists);
    }

    // Patient assignment endpoints
    @GetMapping("/available")
    public ResponseEntity<List<Pole>> getAvailablePoles() {
        List<Pole> poles = poleService.getAvailablePoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Pole>> getAssignedPoles() {
        List<Pole> poles = poleService.getAssignedPoles();
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Pole>> getPolesByPatient(@PathVariable Integer patientId) {
        List<Pole> poles = poleService.getPolesByPatient(patientId);
        return ResponseEntity.ok(poles);
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<Pole> getActivePoleByPatient(@PathVariable Integer patientId) {
        Optional<Pole> pole = poleService.getActivePoleByPatient(patientId);
        return pole.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}/assigned")
    public ResponseEntity<Boolean> isPatientAssignedToPole(@PathVariable Integer patientId) {
        boolean assigned = poleService.isPatientAssignedToPole(patientId);
        return ResponseEntity.ok(assigned);
    }

    @PostMapping("/{poleId}/assign/{patientId}")
    public ResponseEntity<Pole> assignPoleToPatient(@PathVariable String poleId, @PathVariable Integer patientId) {
        try {
            Pole pole = poleService.assignPoleToPatient(poleId, patientId);
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{poleId}/unassign")
    public ResponseEntity<Pole> unassignPole(@PathVariable String poleId) {
        try {
            Pole pole = poleService.unassignPole(poleId);
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/patient/{patientId}/unassign-all")
    public ResponseEntity<Void> unassignPatientFromAllPoles(@PathVariable Integer patientId) {
        try {
            poleService.unassignPatientFromAllPoles(patientId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Connect pole to patient (alternative endpoint for frontend compatibility)
     * Maps to assignPoleToPatient internally
     * Also creates InfusionSession if prescription exists but no session yet
     */
    @PostMapping("/{poleId}/connect")
    public ResponseEntity<Pole> connectPoleToPatient(
            @PathVariable String poleId,
            @RequestParam Integer patientId) {
        try {
            System.out.println("\n[POLE CONNECT] 폴대 연결 시작 - Pole: " + poleId + " → Patient: " + patientId);

            // 1. Update Pole table
            Pole pole = poleService.assignPoleToPatient(poleId, patientId);
            System.out.println("[POLE CONNECT] ✅ Pole 테이블 업데이트 완료");

            // 2. Check for existing InfusionSession
            Optional<InfusionSession> activeSession = infusionSessionService.getActiveSessionByPatient(patientId);

            if (activeSession.isPresent()) {
                // Case 1: InfusionSession already exists - just update pole ID
                InfusionSession session = activeSession.get();
                session.setIvPoleId(poleId);
                infusionSessionService.createSession(session);
                System.out.println("[POLE CONNECT] ✅ 기존 InfusionSession 업데이트 - Session ID: " + session.getSessionId());

                // Auto-send prescription to ESP8266
                System.out.println("[POLE CONNECT] 처방 정보 ESP8266 전송 시도...");
                boolean prescriptionSent = sendPrescriptionToESP(poleId, session);
                if (prescriptionSent) {
                    System.out.println("[POLE CONNECT] ✅ 처방 정보 전송 성공");
                } else {
                    System.out.println("[POLE CONNECT] ⚠️ 처방 정보 전송 실패 (ESP8266이 /api/esp/init로 가져감)");
                }
            } else {
                // Case 2: No InfusionSession - check if prescription exists
                System.out.println("[POLE CONNECT] InfusionSession 없음 - 처방 확인 중...");
                List<Prescription> activePrescriptions = prescriptionService.getActivePrescriptionsByPatient(patientId);

                if (!activePrescriptions.isEmpty()) {
                    // Prescription exists but no session - CREATE InfusionSession
                    Prescription prescription = activePrescriptions.get(0);
                    System.out.println("[POLE CONNECT] ✨ 활성 처방 발견 - Prescription ID: " + prescription.getId());
                    System.out.println("[POLE CONNECT] InfusionSession 자동 생성 중...");

                    try {
                        // Create new InfusionSession
                        InfusionSession newSession = new InfusionSession();
                        newSession.setPatientId(patientId);
                        newSession.setPrescriptionId(prescription.getId());
                        newSession.setDripId(prescription.getDrugTypeId());
                        newSession.setIvPoleId(poleId);
                        newSession.setTotalVolumeMl(prescription.getTotalVolumeMl());
                        newSession.setRemainingVolume(prescription.getTotalVolumeMl());
                        newSession.setFlowRate(new java.math.BigDecimal(prescription.getInfusionRateMlHr()));

                        // Calculate expected end time
                        double durationHours = prescription.getDurationHours();
                        LocalDateTime expectedEndTime = LocalDateTime.now().plusMinutes((long)(durationHours * 60));
                        newSession.setEndExpTime(expectedEndTime);

                        newSession.setStartTime(LocalDateTime.now());
                        newSession.setStatus(InfusionSession.SessionStatus.ACTIVE);

                        InfusionSession savedSession = infusionSessionService.createSession(newSession);
                        System.out.println("[POLE CONNECT] ✅ InfusionSession 생성 완료 - Session ID: " + savedSession.getSessionId());
                        System.out.println("[POLE CONNECT]    - Total Volume: " + savedSession.getTotalVolumeMl() + " mL");
                        System.out.println("[POLE CONNECT]    - Flow Rate: " + savedSession.getFlowRate() + " mL/hr");
                        System.out.println("[POLE CONNECT]    - Expected End: " + expectedEndTime);
                        System.out.println("[POLE CONNECT] 💡 ESP8266이 /api/esp/init로 처방 정보를 받을 수 있습니다");

                        // Auto-send prescription to ESP8266
                        boolean prescriptionSent = sendPrescriptionToESP(poleId, savedSession);
                        if (prescriptionSent) {
                            System.out.println("[POLE CONNECT] ✅ 처방 정보 전송 성공");
                        }

                    } catch (Exception e) {
                        System.err.println("[POLE CONNECT] ⚠️ InfusionSession 생성 실패: " + e.getMessage());
                        e.printStackTrace();
                        // Don't throw - pole connection succeeded
                    }
                } else {
                    System.out.println("[POLE CONNECT] ℹ️ 활성 처방 없음 - InfusionSession 생성 건너뜀");
                    System.out.println("[POLE CONNECT] 💡 간호사가 처방을 등록하면 InfusionSession이 생성됩니다");
                }
            }

            System.out.println("[POLE CONNECT] ✅ 폴대 연결 완료 - Pole " + poleId + " ↔ Patient " + patientId + "\n");
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            System.err.println("[POLE CONNECT] ❌ 에러: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Disconnect pole from patient (alternative endpoint for frontend compatibility)
     * Maps to unassignPole internally
     */
    @PostMapping("/{poleId}/disconnect")
    public ResponseEntity<Pole> disconnectPoleFromPatient(@PathVariable String poleId) {
        try {
            System.out.println("[POLE DISCONNECT] Disconnecting pole " + poleId);
            Pole pole = poleService.unassignPole(poleId);
            System.out.println("[POLE DISCONNECT] Success - Pole " + poleId + " disconnected");
            return ResponseEntity.ok(pole);
        } catch (RuntimeException e) {
            System.err.println("[POLE DISCONNECT] Error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Send prescription data to ESP8266 manually
     * POST /api/v1/poles/{poleId}/send-prescription
     */
    @PostMapping("/{poleId}/send-prescription")
    public ResponseEntity<Map<String, Object>> sendPrescriptionManually(@PathVariable String poleId) {
        try {
            System.out.println("[PRESCRIPTION SEND] Manual send requested for pole: " + poleId);

            // 1. Get pole and verify it's assigned to a patient
            Optional<Pole> poleOpt = poleService.getPoleById(poleId);
            if (poleOpt.isEmpty()) {
                System.out.println("[PRESCRIPTION SEND] Pole not found: " + poleId);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Pole not found");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Pole pole = poleOpt.get();
            if (pole.getPatientId() == null) {
                System.out.println("[PRESCRIPTION SEND] Pole not assigned to any patient: " + poleId);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Pole not assigned to any patient");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // 2. Get active infusion session
            Optional<InfusionSession> sessionOpt = infusionSessionService.getActiveSessionByPatient(pole.getPatientId());
            if (sessionOpt.isEmpty()) {
                System.out.println("[PRESCRIPTION SEND] No active session for patient: " + pole.getPatientId());
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "No active prescription found for this patient");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // 3. Send prescription to ESP8266
            boolean sent = sendPrescriptionToESP(poleId, sessionOpt.get());

            Map<String, Object> response = new HashMap<>();
            response.put("success", sent);
            response.put("message", sent ? "Prescription sent successfully" : "Failed to send prescription to ESP8266");
            response.put("poleId", poleId);
            response.put("patientId", pole.getPatientId());

            return sent ? ResponseEntity.ok(response) : ResponseEntity.status(500).body(response);

        } catch (Exception e) {
            System.err.println("[PRESCRIPTION SEND] Error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error sending prescription: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Helper method: Send prescription data to ESP8266
     * Returns true if successful, false if failed (non-blocking)
     */
    private boolean sendPrescriptionToESP(String poleId, InfusionSession session) {
        System.out.println("[ESP PUSH] Attempting to send prescription to ESP8266: " + poleId);

        // TODO: Implement actual HTTP request to ESP8266
        // For now, just log the attempt (ESP8266 will pull data via /api/esp/init)

        try {
            System.out.println("[ESP PUSH] Prescription data prepared for pole: " + poleId);
            System.out.println("  - Session ID: " + session.getSessionId());
            System.out.println("  - Patient ID: " + session.getPatientId());
            System.out.println("  - Total Volume: " + session.getTotalVolumeMl() + " mL");
            System.out.println("  - Flow Rate: " + session.getFlowRate() + " mL/hr");

            // In production, this would send HTTP POST to ESP8266 IP address
            // Example: http://192.168.1.xxx/prescription with JSON body
            // For now, ESP8266 pulls via /api/esp/init, so we just log success

            System.out.println("[ESP PUSH] ✅ Prescription ready for ESP8266 to pull via /api/esp/init");
            return true;

        } catch (Exception e) {
            System.err.println("[ESP PUSH] ❌ Failed to prepare prescription: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Convert Pole entity to response with patient information
     */
    private Map<String, Object> convertPoleToResponse(Pole pole) {
        Map<String, Object> response = new HashMap<>();
        response.put("poleId", pole.getPoleId());
        response.put("status", pole.getStatus());
        response.put("batteryLevel", pole.getBatteryLevel());
        response.put("lastMaintenance", pole.getLastMaintenance());
        response.put("createdAt", pole.getCreatedAt());
        response.put("updatedAt", pole.getUpdatedAt());
        response.put("patientId", pole.getPatientId());
        response.put("assignedAt", pole.getAssignedAt());
        response.put("lastPingAt", pole.getLastPingAt());
        response.put("isOnline", pole.getIsOnline());

        // Include patient information if assigned
        if (pole.getPatientId() != null) {
            Optional<Patient> patientOpt = patientService.getPatientById(pole.getPatientId());
            if (patientOpt.isPresent()) {
                Patient patient = patientOpt.get();
                Map<String, Object> patientInfo = new HashMap<>();
                patientInfo.put("patientId", patient.getPatientId());
                patientInfo.put("name", patient.getName());
                patientInfo.put("birthDate", patient.getBirthDate());
                patientInfo.put("gender", patient.getGender());
                response.put("patient", patientInfo);
            }
        }

        return response;
    }
}
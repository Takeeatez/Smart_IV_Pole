package com.example.smartpole.controller.mobile;

import com.example.smartpole.dto.ApiResponse;
import com.example.smartpole.entity.AlertLog;
import com.example.smartpole.entity.Patient;
import com.example.smartpole.repository.PatientRepository;
import com.example.smartpole.service.AlertLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/mobile/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173"})
public class MobileAlertController {

    private final AlertLogService alertLogService;
    private final PatientRepository patientRepository;

    /**
     * 간호사 호출 API (환자 앱에서 호출)
     * POST /api/v1/mobile/alerts/call-nurse
     */
    @PostMapping("/call-nurse")
    public ApiResponse<AlertLog> callNurse(@RequestBody Map<String, String> request) {
        try {
            String patientIdStr = request.get("patientId");
            String sessionIdStr = request.get("sessionId");

            if (patientIdStr == null) {
                return ApiResponse.error("patientId가 필요합니다");
            }

            Integer patientId = Integer.parseInt(patientIdStr);
            Integer sessionId = sessionIdStr != null ? Integer.parseInt(sessionIdStr) : null;

            // 환자 정보 조회
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + patientId));

            // 간호사 호출 알림 생성 (sessionId는 optional)
            AlertLog alert = alertLogService.createNurseCallAlert(
                    sessionId,
                    patientId,
                    patient.getName()
            );

            return ApiResponse.success(alert);
        } catch (NumberFormatException e) {
            return ApiResponse.error("잘못된 ID 형식입니다");
        } catch (Exception e) {
            return ApiResponse.error("간호사 호출 실패: " + e.getMessage());
        }
    }
}

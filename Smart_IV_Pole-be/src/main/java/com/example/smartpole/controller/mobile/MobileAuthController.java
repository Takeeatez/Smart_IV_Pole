package com.example.smartpole.controller.mobile;

import com.example.smartpole.dto.ApiResponse;
import com.example.smartpole.entity.Patient;
import com.example.smartpole.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/mobile/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MobileAuthController {

    private final PatientRepository patientRepository;

    /**
     * 환자 모바일 앱 로그인 (전화번호 + PIN)
     */
    @PostMapping("/patient-login")
    public ApiResponse<Map<String, Object>> patientLogin(@RequestBody LoginRequest request) {
        log.info("Patient login attempt: phone={}", request.getPhone());

        Patient patient = patientRepository.findByPhone(request.getPhone())
                .orElse(null);

        if (patient == null) {
            log.warn("Patient not found: phone={}", request.getPhone());
            return ApiResponse.error("등록되지 않은 전화번호입니다");
        }

        // PIN 검증 (테스트 중에는 모든 PIN 허용, 실제 배포 시 주석 해제)
        // if (!request.getPinCode().equals(patient.getPinCode())) {
        //     log.warn("Invalid PIN: phone={}", request.getPhone());
        //     return ApiResponse.error("PIN이 일치하지 않습니다");
        // }

        Map<String, Object> result = new HashMap<>();
        result.put("id", String.valueOf(patient.getPatientId()));
        result.put("name", patient.getName());
        result.put("phone", patient.getPhone());
        result.put("roomId", patient.getRoomId());
        result.put("bedNumber", patient.getBedNumber());

        log.info("Patient login successful: patientId={}, name={}", patient.getPatientId(), patient.getName());
        return ApiResponse.success(result);
    }

    @lombok.Data
    public static class LoginRequest {
        private String phone;
        private String pinCode;
    }
}

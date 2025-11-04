package com.example.smartpole.controller.esp;

import com.example.smartpole.entity.AlertLog;
import com.example.smartpole.entity.InfusionSession;
import com.example.smartpole.service.AlertLogService;
import com.example.smartpole.service.InfusionSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/esp")
@RequiredArgsConstructor
public class Esp8266Controller {

    private final InfusionSessionService infusionSessionService;
    private final AlertLogService alertLogService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * ESP8266에서 실시간 센서 데이터 수신
     * 4초마다 무게, 예측 시간, 상태를 전송받음
     */
    @PostMapping("/data")
    public Map<String, Object> receiveData(@RequestBody Map<String, Object> data) {
        try {
            // 1. 데이터 파싱
            String deviceId = (String) data.get("device_id");
            Double weight = parseDouble(data.get("weight"));
            Double predictedTime = parseDouble(data.get("predicted_time"));
            String state = (String) data.get("state");

            System.out.println("=== ESP8266 데이터 수신 ===");
            System.out.println("Device ID: " + deviceId);
            System.out.println("Weight: " + weight + "g");
            System.out.println("Predicted Time: " + predictedTime + "s");
            System.out.println("State: " + state);

            // 2. InfusionSession 찾기 (device_id = pole_id)
            Optional<InfusionSession> sessionOpt = infusionSessionService.getActiveSessionByPole(deviceId);

            if (sessionOpt.isEmpty()) {
                System.out.println("⚠️ No active session found for pole: " + deviceId);
                return createResponse("success", "Data received but no active session", data);
            }

            InfusionSession session = sessionOpt.get();

            // 3. InfusionSession 업데이트
            int remainingVolume = weight != null ? weight.intValue() : session.getRemainingVolume();
            session.setRemainingVolume(remainingVolume);

            // 예측 종료 시간 계산 및 저장
            if (predictedTime != null && predictedTime > 0) {
                LocalDateTime endExpTime = LocalDateTime.now().plusSeconds(predictedTime.longValue());
                session.setEndExpTime(endExpTime);
            }

            // DB 저장
            infusionSessionService.updateRemainingVolume(session.getSessionId(), remainingVolume);

            // 4. WebSocket으로 실시간 브로드캐스트
            Map<String, Object> wsMessage = new HashMap<>();
            wsMessage.put("device_id", deviceId);
            wsMessage.put("patient_id", session.getPatientId());
            wsMessage.put("session_id", session.getSessionId());
            wsMessage.put("weight", weight);
            wsMessage.put("predicted_time", predictedTime);
            wsMessage.put("remaining_volume", remainingVolume);
            wsMessage.put("percentage", (remainingVolume * 100.0) / session.getTotalVolumeMl());
            wsMessage.put("state", state);
            wsMessage.put("timestamp", LocalDateTime.now().toString());

            // 전체 클라이언트에게 브로드캐스트
            messagingTemplate.convertAndSend("/topic/pole/" + deviceId, wsMessage);
            messagingTemplate.convertAndSend("/topic/patient/" + session.getPatientId(), wsMessage);

            System.out.println("✅ 데이터 업데이트 및 브로드캐스트 완료");

            return createResponse("success", "Data processed successfully", wsMessage);

        } catch (Exception e) {
            System.err.println("❌ 데이터 처리 오류: " + e.getMessage());
            e.printStackTrace();
            return createResponse("error", "Failed to process data: " + e.getMessage(), data);
        }
    }

    /**
     * ESP8266에서 경고 알림 수신
     * 유속 이상 감지 시 호출됨
     */
    @PostMapping("/alert")
    public Map<String, Object> receiveAlert(@RequestBody Map<String, Object> data) {
        try {
            // 1. 데이터 파싱
            String deviceId = (String) data.get("device_id");
            String alertType = (String) data.get("alert_type");
            Double deviationPercent = parseDouble(data.get("deviation_percent"));
            Long timestamp = parseLong(data.get("timestamp"));

            System.out.println("=== ESP8266 경고 수신 ===");
            System.out.println("Device ID: " + deviceId);
            System.out.println("Alert Type: " + alertType);
            System.out.println("Deviation: " + deviationPercent + "%");

            // 2. InfusionSession 찾기
            Optional<InfusionSession> sessionOpt = infusionSessionService.getActiveSessionByPole(deviceId);

            if (sessionOpt.isEmpty()) {
                System.out.println("⚠️ No active session found for pole: " + deviceId);
                return createResponse("success", "Alert received but no active session", data);
            }

            InfusionSession session = sessionOpt.get();

            // 3. AlertLog 생성
            String message = String.format(
                "유속 이상 감지: 예상값과 %.1f%% 차이 (Pole: %s, Patient ID: %d)",
                deviationPercent,
                deviceId,
                session.getPatientId()
            );

            // severity: 15% 이상 = warning, 25% 이상 = critical
            String severity = deviationPercent > 25 ? "critical" : "warning";

            AlertLog alert = alertLogService.createAlert(
                session.getSessionId(),
                "flow_stopped",  // AlertType enum 값
                severity,
                message
            );

            System.out.println("✅ 경고 로그 생성 완료: Alert ID " + alert.getAlertId());

            // 4. WebSocket으로 경고 브로드캐스트
            Map<String, Object> wsAlert = new HashMap<>();
            wsAlert.put("alert_id", alert.getAlertId());
            wsAlert.put("device_id", deviceId);
            wsAlert.put("patient_id", session.getPatientId());
            wsAlert.put("session_id", session.getSessionId());
            wsAlert.put("alert_type", alertType);
            wsAlert.put("severity", severity);
            wsAlert.put("message", message);
            wsAlert.put("deviation_percent", deviationPercent);
            wsAlert.put("timestamp", LocalDateTime.now().toString());

            // 경고 전용 토픽으로 브로드캐스트
            messagingTemplate.convertAndSend("/topic/alerts", wsAlert);
            messagingTemplate.convertAndSend("/topic/pole/" + deviceId + "/alert", wsAlert);

            System.out.println("✅ 경고 브로드캐스트 완료");

            return createResponse("success", "Alert processed successfully", wsAlert);

        } catch (Exception e) {
            System.err.println("❌ 경고 처리 오류: " + e.getMessage());
            e.printStackTrace();
            return createResponse("error", "Failed to process alert: " + e.getMessage(), data);
        }
    }

    /**
     * ESP8266 연결 테스트 엔드포인트
     */
    @GetMapping("/test")
    public Map<String, Object> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "ESP8266 서버 정상 작동 중!");
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }

    /**
     * 구형 센서 데이터 엔드포인트 (하위 호환성)
     */
    @PostMapping("/sensor")
    public Map<String, Object> receiveSensorData(
        @RequestParam(required = false) String device_id,
        @RequestParam(required = false) String weight,
        @RequestParam(required = false) String predicted_time
    ) {
        Map<String, Object> data = new HashMap<>();
        data.put("device_id", device_id);
        data.put("weight", weight);
        data.put("predicted_time", predicted_time);

        return receiveData(data);
    }

    // ===== Helper Methods =====

    private Double parseDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long parseLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Map<String, Object> createResponse(String status, String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", status);
        response.put("message", message);
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
}

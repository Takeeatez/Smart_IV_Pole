package com.example.smartpole.dto.mqtt;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryMessage {
    private String poleId;
    private LocalDateTime timestamp;
    private TelemetryData telemetry;
    private SessionInfo session;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TelemetryData {
        private Double weight;                  // 현재 무게 (grams)
        private Double previousWeight;          // 이전 측정 무게 (grams)
        private Double weightChangeRate;        // 무게 변화율 (g/min)
        private Boolean isStable;              // 안정 상태 여부
        private Double stability;               // 안정도 (0-100%)
        private Double flowRate;               // 계산된 유속 (mL/min)
        private Double remaining;               // 남은 용량 (%)
        private Integer dripRate;              // 방울 수 (GTT)
        private LocalDateTime calculatedEndTime;  // 계산된 종료 시간
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionInfo {
        private String sessionId;
        private String patientId;

        // 간호사 초기 설정 정보
        private String drugType;               // 약품 종류
        private Double initialVolume;          // 초기 용량 (mL)
        private Double initialWeight;          // 초기 무게 (g)
        private Integer prescribedDuration;    // 의사 처방 시간 (분)
        private Integer prescribedDripRate;    // 처방된 방울 수 (GTT)
        private Integer gttFactor;            // GTT 계수 (20 or 60)

        // 세션 시간 정보
        private LocalDateTime startTime;       // 시작 시간
        private LocalDateTime prescribedEndTime;  // 처방된 종료 시간
        private String nurseId;               // 설정한 간호사 ID
    }
}
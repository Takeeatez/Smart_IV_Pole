package com.example.smartpole.dto.mqtt;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertMessage {
    private String alertId;
    private String poleId;
    private Severity severity;
    private AlertType type;
    private String message;
    private LocalDateTime timestamp;
    private Map<String, Object> data;

    public enum Severity {
        CRITICAL,
        WARNING,
        INFO
    }

    public enum AlertType {
        LOW_FLUID,
        EMPTY_FLUID,
        FLOW_ABNORMAL,
        DISCONNECTED,
        BATTERY_LOW,
        EMERGENCY_CALL
    }
}
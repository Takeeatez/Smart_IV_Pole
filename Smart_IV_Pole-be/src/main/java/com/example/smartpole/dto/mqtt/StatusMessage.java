package com.example.smartpole.dto.mqtt;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusMessage {
    private String poleId;
    private LocalDateTime timestamp;
    private DeviceStatus status;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceStatus {
        private Boolean online;
        private Integer battery;        // percentage
        private Boolean charging;
        private HardwareStatus hardware;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HardwareStatus {
        private String loadCell;
        private String display;
        private String wifi;
        private Integer signalStrength; // dBm
    }
}
package com.example.smartpole.scheduler;

import com.example.smartpole.entity.Pole;
import com.example.smartpole.service.PoleService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 폴대 상태 모니터링 스케줄러
 * - 60초마다 폴대 온라인 상태 확인
 * - 마지막 핑 이후 60초 이상 경과 시 오프라인 처리
 * - WebSocket을 통해 프론트엔드에 상태 변경 알림
 */
@Component
public class PoleScheduledTasks {

    private final PoleService poleService;
    private final SimpMessagingTemplate messagingTemplate;

    public PoleScheduledTasks(PoleService poleService, SimpMessagingTemplate messagingTemplate) {
        this.poleService = poleService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 60초마다 폴대 온라인 상태 확인
     * 마지막 핑 이후 60초 이상 경과 시 오프라인으로 표시
     */
    @Scheduled(fixedRate = 60000) // 60초마다 실행
    public void checkPoleOnlineStatus() {
        System.out.println("⏰ [Scheduler] 폴대 온라인 상태 확인 시작 - " + LocalDateTime.now());

        try {
            // 모든 폴대 조회
            List<Pole> allPoles = poleService.getAllPoles();
            int offlineCount = 0;

            for (Pole pole : allPoles) {
                // 이전 상태 저장
                boolean wasOnline = pole.getIsOnline();

                // 현재 온라인 상태 확인 (마지막 핑 기준 60초)
                boolean isOnlineNow = pole.isOnlineNow();

                // 상태 변경이 있는 경우
                if (wasOnline != isOnlineNow) {
                    if (!isOnlineNow) {
                        // 온라인 → 오프라인 전환
                        System.out.println("🔴 [Scheduler] 폴대 오프라인 감지: " + pole.getPoleId());
                        pole.markOffline();
                        poleService.savePole(pole);
                        offlineCount++;

                        // WebSocket으로 오프라인 알림 전송
                        Map<String, Object> wsMessage = new HashMap<>();
                        wsMessage.put("pole_id", pole.getPoleId());
                        wsMessage.put("is_online", false);
                        wsMessage.put("battery_level", pole.getBatteryLevel());
                        wsMessage.put("last_ping_at", pole.getLastPingAt() != null ? pole.getLastPingAt().toString() : null);
                        wsMessage.put("status_change", "offline");

                        messagingTemplate.convertAndSend("/topic/poles/status", wsMessage);
                    } else {
                        // 오프라인 → 온라인 전환 (자동 복구)
                        System.out.println("🟢 [Scheduler] 폴대 온라인 복구: " + pole.getPoleId());
                    }
                }
            }

            if (offlineCount > 0) {
                System.out.println("⚠️ [Scheduler] 총 " + offlineCount + "개 폴대 오프라인 처리됨");
            } else {
                System.out.println("✅ [Scheduler] 모든 폴대 정상 상태");
            }

        } catch (Exception e) {
            System.err.println("❌ [Scheduler] 폴대 상태 확인 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 10분마다 폴대 상태 통계 로깅
     */
    @Scheduled(fixedRate = 600000) // 10분마다 실행
    public void logPoleStatistics() {
        System.out.println("\n📊 [Scheduler] 폴대 상태 통계 - " + LocalDateTime.now());

        try {
            List<Pole> allPoles = poleService.getAllPoles();
            List<Pole> onlinePoles = poleService.getOnlinePoles();

            int totalPoles = allPoles.size();
            int onlineCount = onlinePoles.size();
            int offlineCount = totalPoles - onlineCount;

            // 배터리 통계
            int lowBatteryCount = (int) onlinePoles.stream()
                    .filter(pole -> pole.getBatteryLevel() != null && pole.getBatteryLevel() < 20)
                    .count();

            // 환자 연결 통계
            int connectedCount = (int) allPoles.stream()
                    .filter(pole -> pole.getPatientId() != null)
                    .count();

            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            System.out.println("총 폴대 수: " + totalPoles + "개");
            System.out.println("온라인: " + onlineCount + "개 | 오프라인: " + offlineCount + "개");
            System.out.println("환자 연결: " + connectedCount + "개");
            System.out.println("저배터리 (<20%): " + lowBatteryCount + "개");
            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        } catch (Exception e) {
            System.err.println("❌ [Scheduler] 통계 로깅 중 오류 발생: " + e.getMessage());
        }
    }
}

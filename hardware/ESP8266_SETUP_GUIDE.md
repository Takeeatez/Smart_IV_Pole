# ESP8266 핑 전송 및 고유 ID 설정 가이드

## 개요
각 ESP8266은 MAC 주소 기반의 고유 ID를 자동으로 생성하여 백엔드 서버에 30초마다 핑을 전송합니다.

## 고유 ID 시스템
- **형식**: `IV_POLE_AABBCCDD` (MAC 주소 마지막 4바이트)
- **자동 생성**: ESP8266 부팅 시 자동으로 MAC 주소 읽어서 생성
- **중복 방지**: 각 ESP의 MAC 주소가 다르므로 자동으로 고유 ID 보장

### 예시
```
ESP1의 MAC: A4:CF:12:AB:CD:EF → Device ID: IV_POLE_ABCDEF
ESP2의 MAC: A4:CF:12:12:34:56 → Device ID: IV_POLE_123456
ESP3의 MAC: A4:CF:12:78:9A:BC → Device ID: IV_POLE_789ABC
```

## 네트워크 설정

### 1. config.h 파일 생성
```bash
cd hardware/sketch_sep12a/
cp config.h.example config.h
```

### 2. config.h 편집
```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";         // WiFi 이름
const char* password = "YOUR_WIFI_PASSWORD"; // WiFi 비밀번호

// Server Configuration
const char* serverHost = "192.168.0.100";    // 서버 IP 주소
const uint16_t serverPort = 8081;
const char* serverPath = "/api/esp/data";
```

### 3. 서버 IP 주소 확인 방법

#### Windows
```cmd
ipconfig
```
→ IPv4 주소 확인 (예: 192.168.0.100)

#### Mac/Linux
```bash
ifconfig
```
→ inet 주소 확인 (예: 192.168.0.100)

### 4. 네트워크 요구사항
- ESP8266과 서버 PC가 **같은 WiFi 네트워크**에 연결되어야 함
- 방화벽에서 8081 포트 허용 필요
- 라우터에서 AP Isolation(클라이언트 격리) 기능 비활성화 필요

## 핑 전송 로직

### 전송 주기
- **30초마다** 자동 핑 전송
- WiFi 연결 끊김 시 30초마다 재연결 시도

### 전송 데이터
```json
{
  "device_id": "IV_POLE_ABCDEF",
  "battery_level": 95
}
```

### 백엔드 엔드포인트
```
POST http://{serverHost}:8081/api/esp/ping
Content-Type: application/json
```

## LED 상태 표시

ESP8266의 내장 LED가 핑 상태를 시각적으로 표시합니다:

### 정상 (성공)
- **1회 깜빡임** (100ms)
- 시리얼: `[PING] Success (Battery: 95%)`

### HTTP 오류 (서버 응답 오류)
- **3회 깜빡임** (200ms 간격)
- 시리얼: `[PING] HTTP Error: 404`
- 원인: 잘못된 엔드포인트, 서버 오류

### 연결 실패 (네트워크 오류)
- **5회 빠른 깜빡임** (100ms 간격)
- 시리얼: `[PING] Connection failed: Connection refused`
- 원인: 서버 IP 잘못됨, 서버 꺼짐, 방화벽 차단

## 시리얼 모니터 출력 예시

### 정상 동작
```
=== Smart IV Pole - Medical Grade Monitoring ===
[DEVICE] Unique ID: IV_POLE_ABCDEF

WiFi 연결 중...........
✅ WiFi 연결 성공
IP: 192.168.0.101

🚀 모니터링 시작!

[PING] Sending: {"device_id":"IV_POLE_ABCDEF","battery_level":100}
[PING] Success (Battery: 100%)
```

### 핑 전송 실패 (서버 IP 잘못됨)
```
[PING] Sending: {"device_id":"IV_POLE_ABCDEF","battery_level":100}
[PING] Connection failed: Connection refused
```

### 핑 전송 실패 (HTTP 오류)
```
[PING] Sending: {"device_id":"IV_POLE_ABCDEF","battery_level":100}
[PING] HTTP Error: 404
[PING] Response: {"error":"Not found"}
```

## 트러블슈팅

### 1. WiFi 연결 실패
**증상**: `❌ WiFi 연결 실패`

**해결방법**:
- config.h의 ssid, password 확인
- 2.4GHz WiFi인지 확인 (ESP8266은 5GHz 미지원)
- WiFi 신호 강도 확인

### 2. 핑 전송 실패 - Connection refused
**증상**: `[PING] Connection failed: Connection refused`

**해결방법**:
1. 서버 IP 주소 확인:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. 백엔드 서버 실행 확인:
   ```bash
   cd Smart_IV_Pole-be
   ./gradlew bootRun
   ```

3. 방화벽 설정 확인:
   - Windows: 제어판 → Windows Defender 방화벽 → 8081 포트 허용
   - Mac: 시스템 환경설정 → 보안 및 개인정보 보호 → 방화벽 → Java 허용

4. 같은 네트워크 확인:
   ```bash
   # ESP8266 IP에서 서버로 핑 테스트
   ping 192.168.0.100
   ```

### 3. 핑 전송 실패 - HTTP 404
**증상**: `[PING] HTTP Error: 404`

**해결방법**:
- config.h의 serverPath 확인: `/api/esp/ping` (올바름)
- 백엔드 Esp8266Controller 엔드포인트 확인
- 백엔드 재시작

### 4. 폴대가 프론트엔드에 표시되지 않음
**증상**: DeviceManagement 페이지에 폴대 없음

**확인사항**:
1. 시리얼 모니터에서 `[PING] Success` 메시지 확인
2. 백엔드 콘솔에서 `[ESP PING] Success` 로그 확인
3. 브라우저 콘솔에서 네트워크 오류 확인
4. 데이터베이스 poles 테이블 확인:
   ```sql
   SELECT * FROM poles;
   ```

## 백엔드 자동 등록 로직

ESP8266이 핑을 보내면 백엔드에서 자동으로 폴대를 등록합니다:

```java
// 1. 폴대 찾기
Pole pole = poleService.getPoleById(deviceId)
    .orElseGet(() -> {
        // 2. 없으면 자동 생성
        Pole newPole = new Pole();
        newPole.setPoleId(deviceId);  // IV_POLE_ABCDEF
        newPole.setStatus(Pole.PoleStatus.active);
        newPole.setBatteryLevel(100);
        newPole.setIsOnline(true);
        return poleService.savePole(newPole);
    });

// 3. 핑 시간 업데이트
pole.updatePing();
pole.setBatteryLevel(batteryLevel);
poleService.savePole(pole);

// 4. WebSocket 브로드캐스트 (프론트엔드 실시간 업데이트)
messagingTemplate.convertAndSend("/topic/poles/status", wsMessage);
```

## 프론트엔드 실시간 모니터링

DeviceManagement 페이지에서 폴대 상태를 실시간으로 확인할 수 있습니다:

- **자동 새로고침**: 30초마다 폴대 목록 갱신
- **WebSocket**: 핑 수신 시 즉시 UI 업데이트
- **상태 표시**: 온라인(녹색), 오프라인(회색), 배터리 레벨

## 다중 ESP8266 관리

여러 ESP8266을 동시에 사용할 수 있습니다:

1. 각 ESP8266에 sketch_sep12a.ino 업로드
2. config.h 파일은 각각 동일한 서버 IP 사용 가능
3. MAC 주소가 다르므로 자동으로 다른 ID 생성
4. 백엔드에서 자동으로 각각 등록

### 예시
```
ESP #1 → IV_POLE_ABCDEF → 301A-1번 침대
ESP #2 → IV_POLE_123456 → 301A-2번 침대
ESP #3 → IV_POLE_789ABC → 301A-3번 침대
```

## 보안 고려사항

1. **config.h 파일은 Git에 커밋 금지**
   - `.gitignore`에 이미 추가됨
   - WiFi 비밀번호와 서버 IP 노출 방지

2. **프로덕션 환경에서는 HTTPS 사용 권장**
   - ESP8266도 SSL/TLS 지원 가능
   - 추후 `WiFiClientSecure` 라이브러리 사용

3. **서버 인증 토큰 추가 고려**
   - 현재는 단순 POST 요청
   - 추후 API 키 또는 JWT 토큰 추가 가능

## 참고 문서
- [hardware/sketch_sep12a/sketch_sep12a.ino](sketch_sep12a/sketch_sep12a.ino) - 메인 펌웨어
- [hardware/config.h.example](config.h.example) - 설정 파일 템플릿
- [Smart_IV_Pole-be/.../Esp8266Controller.java](../Smart_IV_Pole-be/src/main/java/com/example/smartpole/controller/esp/Esp8266Controller.java) - 백엔드 API

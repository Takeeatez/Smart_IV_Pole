# ESP8266 하드웨어 연결 문제 해결 가이드

## 🔍 체크리스트

### 1. 하드웨어 연결 확인
- [ ] ESP8266 전원 연결 (USB 케이블)
- [ ] HX711 로드셀 모듈 연결
  - VCC → 3.3V 또는 5V
  - GND → GND
  - DT (Data) → D1 (GPIO5)
  - SCK (Clock) → D0 (GPIO16)
- [ ] 로드셀 4선 연결 (빨강, 검정, 흰색, 초록)

### 2. Arduino IDE 시리얼 모니터 확인

#### 시리얼 모니터 열기
1. Arduino IDE 메뉴 → `Tools` → `Serial Monitor` (Ctrl+Shift+M)
2. Baud Rate: **115200** 설정

#### 정상 출력 예시
```
=== Smart IV Pole - Enhanced Monitoring ===
센서 준비: YES
HX711 초기화 중...
✅ HX711 캘리브레이션 완료
테스트 측정: 123.4 g
WiFi 연결 중........
✅ WiFi 연결 성공
IP: 192.168.x.x
초기 무게: 450.2 g
🚀 모니터링 시작!
```

#### 에러 패턴별 해결

**📍 케이스 1: "센서 준비: NO"**
```
센서 준비: NO
❌ HX711 초기화 실패!
```
**원인**: HX711 배선 문제
**해결**:
1. D1(GPIO5) ↔ DT 연결 확인
2. D0(GPIO16) ↔ SCK 연결 확인
3. VCC/GND 연결 확인
4. HX711 모듈 LED 켜지는지 확인

---

**📍 케이스 2: "WiFi 연결 실패"**
```
WiFi 연결 중.............................
❌ WiFi 연결 실패
```
**원인**: WiFi 설정 문제
**해결**:
1. `sketch_sep12a.ino:5-6` WiFi 정보 확인
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";      // 실제 WiFi 이름으로 변경
   const char* password = "YOUR_PASSWORD";    // 실제 비밀번호로 변경
   ```
2. 2.4GHz WiFi 사용 확인 (5GHz 지원 안함)
3. 공유기에서 ESP8266 MAC 주소 허용 확인

---

**📍 케이스 3: WiFi 연결되었지만 데이터 전송 실패**
```
✅ WiFi 연결 성공
IP: 192.168.1.100
📤 데이터 전송: {...}
❌ 전송 실패: -1
```
**원인**: 서버 IP/포트 문제
**해결**:
1. **컴퓨터 IP 확인**:
   - Windows: `ipconfig` 실행 → IPv4 주소 확인
   - Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`

2. **서버 IP 변경**:
   ```cpp
   // sketch_sep12a.ino:7 수정
   const char* serverHost = "192.168.x.x";  // 컴퓨터 IP로 변경
   ```

3. **백엔드 서버 실행 확인**:
   ```bash
   # 터미널에서 실행
   curl http://localhost:8081/api/esp/test
   # 응답: {"status":"success", ...}
   ```

4. **방화벽 확인**:
   - Windows: 방화벽에서 포트 8081 허용
   - Mac: `시스템 환경설정` → `보안 및 개인정보` → `방화벽`

---

**📍 케이스 4: 데이터 전송 성공하지만 "No active session"**
```
✅ 전송 성공
```
백엔드 로그:
```
=== ESP8266 데이터 수신 ===
Device ID: IV_001
⚠️ No active session found for pole: IV_001
```

**원인**: DB에 활성 InfusionSession이 없음
**해결**:
1. 프론트엔드에서 환자 추가 (http://localhost:3000)
2. 또는 터미널에서 수동 생성:
   ```bash
   # 1. Pole 생성
   curl -X POST http://localhost:8081/api/v1/poles \
     -H 'Content-Type: application/json' \
     -d '{"poleId":"IV_001","patientId":10,"batteryLevel":100,"status":"active"}'

   # 2. Prescription 생성
   curl -X POST http://localhost:8081/api/v1/prescriptions \
     -H 'Content-Type: application/json' \
     -d '{"patientId":10,"drugTypeId":2,"totalVolumeMl":500,"durationHours":8,"gttFactor":20,"calculatedGtt":21,"infusionRateMlHr":62.5,"prescribedBy":"김의사"}'

   # 3. InfusionSession 생성
   curl -X POST http://localhost:8081/api/v1/infusions \
     -H 'Content-Type: application/json' \
     -d '{"patientId":10,"dripId":2,"ivPoleId":"IV_001","prescriptionId":7,"totalVolumeMl":500,"remainingVolume":500,"flowRate":62.5,"status":"ACTIVE"}'
   ```

---

**📍 케이스 5: "⚠️ 센서 읽기 오류"**
```
⚠️ 센서 읽기 오류
Sensor not ready
```
**원인**: 로드셀 안정화 필요 또는 배선 불량
**해결**:
1. ESP8266 리셋 (RST 버튼 또는 전원 재연결)
2. 로드셀 Tare(영점) 재설정 대기 (약 5초)
3. 로드셀 배선 재확인

---

### 3. 컴퓨터 IP 주소 확인 및 변경

#### Windows
```cmd
ipconfig
```
출력에서 `IPv4 주소` 확인 (예: 192.168.0.100)

#### Mac/Linux
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
또는
```bash
ipconfig getifaddr en0  # WiFi
ipconfig getifaddr en1  # 유선
```

#### ESP8266 코드 수정
```cpp
// sketch_sep12a.ino:7
const char* serverHost = "192.168.0.100";  // 위에서 확인한 IP로 변경
```

### 4. 백엔드 서버 외부 접속 허용

#### Spring Boot application.yml 확인
```yaml
server:
  port: 8081
  address: 0.0.0.0  # 모든 IP에서 접속 허용
```

#### 백엔드 재시작
```bash
cd Smart_IV_Pole-be
./gradlew bootRun
```

### 5. 네트워크 연결 테스트

#### ESP8266에서 서버 Ping 테스트
시리얼 모니터에서 확인:
```
WiFi 연결 성공
IP: 192.168.0.200  # ESP8266 IP
```

#### 컴퓨터에서 ESP8266 Ping
```bash
ping 192.168.0.200
```

#### 브라우저에서 백엔드 테스트
```
http://192.168.0.100:8081/api/esp/test
```

### 6. Device ID 확인

#### ESP8266 코드의 Device ID
```cpp
// sketch_sep12a.ino:203
json += "\"device_id\":\"IV_001\",";
```

#### DB의 Pole ID 일치 확인
```bash
curl http://localhost:8081/api/v1/poles | jq '.[] | {poleId, status}'
```

### 7. 실시간 디버깅

#### 시리얼 모니터 명령어
- `s`: 현재 상태 확인
- `q`: 프로그램 종료

#### 정상 작동 시 출력 (4초마다)
```
📊 무게: 450.2g | 예측: 120.5분
📤 데이터 전송: {"device_id":"IV_001","weight":450.2,...}
✅ 전송 성공
```

### 8. 캘리브레이션 값 조정

무게가 부정확하면 캘리브레이션 팩터 조정:
```cpp
// sketch_sep12a.ino:16
float calibration_factor = 400;  // 값 조정 (200~600 범위)
```

**조정 방법**:
1. 알려진 무게(예: 500g) 올려놓기
2. 시리얼 모니터에서 측정값 확인
3. calibration_factor 조정:
   - 측정값이 크면 → 값을 올림
   - 측정값이 작으면 → 값을 내림

## 🚀 빠른 체크 순서

1. **시리얼 모니터 먼저 확인** (115200 baud)
2. WiFi 연결 성공 확인
3. 서버 IP 확인 및 수정
4. 백엔드 `/api/esp/test` 테스트
5. InfusionSession 활성화 확인
6. ESP8266 리셋 후 재테스트

## 📞 추가 지원

현재 상태를 확인하려면:
1. 시리얼 모니터 출력 복사
2. 에러 메시지 확인
3. 위 체크리스트에서 해당하는 케이스 찾기

## 🔧 하드웨어 핀 배치 (NodeMCU)

```
ESP8266 NodeMCU    HX711
━━━━━━━━━━━━━━━━━━━━━━━━
D1 (GPIO5)   ────→ DT (Data)
D0 (GPIO16)  ────→ SCK (Clock)
3V3          ────→ VCC
GND          ────→ GND
```

## 📊 정상 작동 확인

프론트엔드 브라우저 Console(F12):
```
📡 WebSocket Status: {isConnected: true, ...}
📊 Pole Data Received: {device_id: "IV_001", weight: 450.2, ...}
```

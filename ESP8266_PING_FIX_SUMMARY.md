# ESP8266 핑 전송 문제 해결 및 고유 ID 시스템 구축 완료

## 해결된 문제

### 1. ✅ ESP8266 고유 ID 시스템 구현
- **이전**: 모든 ESP가 하드코딩된 `"IV_001"` 사용 → 여러 ESP 사용 시 충돌
- **현재**: MAC 주소 기반 고유 ID 자동 생성 (예: `IV_POLE_ABCDEF`)
- **장점**: 여러 ESP8266 동시 사용 가능, 자동 식별

### 2. ✅ 핑 전송 로직 개선
- HTTP 타임아웃 10초 설정
- 상세한 오류 로그 (HTTP 코드, 응답 내용)
- LED 시각적 피드백:
  - 성공: 1회 깜빡임 (100ms)
  - HTTP 오류: 3회 깜빡임 (200ms 간격)
  - 연결 실패: 5회 빠른 깜빡임 (100ms 간격)

### 3. ✅ 네트워크 설정 개선
- config.h에 상세한 주석 추가
- 로컬 개발 vs AWS 배포 환경 구분
- 서버 IP 확인 방법 가이드 추가

### 4. ✅ 프론트엔드 UI 개선
- 폴대 없을 때 "ESP8266 핑 대기 중" 메시지 표시
- 트러블슈팅 체크리스트 제공:
  1. ESP8266 WiFi 연결 확인
  2. config.h 서버 IP 확인
  3. 백엔드 서버 8081 포트 실행 확인
  4. 시리얼 모니터 "[PING] Success" 확인

### 5. ✅ 백엔드 로그 정리
- 이모티콘 제거: `📝`, `✅`, `❌` → `[INFO]`, `[ESP PING]`
- 간결한 로그 포맷: `[ESP PING] Device: IV_POLE_ABCDEF | Battery: 95%`

## 변경된 파일

### 하드웨어 (ESP8266)
1. **hardware/sketch_sep12a/sketch_sep12a.ino**
   - MAC 주소 기반 고유 ID 생성 (`setup()` 함수)
   - 모든 JSON에서 `deviceId` 변수 사용
   - 핑 전송 로직 개선 (타임아웃, 재시도, LED 피드백)

2. **hardware/sketch_sep12a/config.h** (사용자가 수정함)
   - 서버 IP: `192.168.156.173` (사용자의 로컬 네트워크)

3. **hardware/config.h.example**
   - 상세한 주석 추가 (로컬/AWS 환경 구분)
   - IP 확인 방법 가이드

4. **hardware/ESP8266_SETUP_GUIDE.md** (NEW)
   - 완전한 ESP8266 설정 및 트러블슈팅 가이드
   - 고유 ID 시스템 설명
   - 핑 전송 로직 설명
   - LED 상태 표시 가이드
   - 다중 ESP8266 관리 방법

### 백엔드
1. **Smart_IV_Pole-be/src/main/java/.../Esp8266Controller.java**
   - 로그 정리: `[ESP PING]` 형식으로 통일
   - 이모티콘 제거

### 프론트엔드
1. **frontend/src/pages/DeviceManagement.tsx**
   - 빈 상태 UI 추가 (폴대 없을 때 안내 메시지)
   - 트러블슈팅 체크리스트 UI
   - 로그 정리 (이모티콘 제거)

## 테스트 방법

### 1. 백엔드 서버 시작
```bash
cd Smart_IV_Pole-be
./gradlew bootRun
```

### 2. 프론트엔드 시작
```bash
cd frontend
npm run dev
# http://localhost:5173/devices 접속
```

### 3. ESP8266 업로드
```
1. Arduino IDE에서 hardware/sketch_sep12a/sketch_sep12a.ino 열기
2. config.h 파일 확인:
   - ssid, password: WiFi 정보
   - serverHost: 서버 PC의 로컬 IP (예: 192.168.0.100)
3. 보드: ESP8266, 포트 선택
4. 업로드
```

### 4. 시리얼 모니터 확인
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

### 5. 프론트엔드에서 확인
- DeviceManagement 페이지에 폴대가 자동으로 표시됨
- 폴대 ID: `IV_POLE_ABCDEF`
- 상태: 온라인 (녹색)
- 배터리: 100%

## 핑 전송 실패 시 트러블슈팅

### 증상 1: `[PING] Connection failed: Connection refused`

**원인**: 서버 IP가 잘못되었거나 서버가 실행되지 않음

**해결**:
1. 서버 IP 확인:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. config.h의 serverHost 수정

3. 백엔드 서버 실행 확인:
   ```bash
   curl http://192.168.0.100:8081/api/esp/ping
   ```

### 증상 2: `[PING] HTTP Error: 404`

**원인**: 엔드포인트 경로가 잘못됨

**해결**:
- config.h 확인: serverPath는 `/api/esp/data` (핑은 자동으로 `/api/esp/ping` 사용)
- 백엔드 재시작

### 증상 3: WiFi 연결 실패

**원인**: WiFi 정보가 잘못되었거나 2.4GHz가 아님

**해결**:
- config.h의 ssid, password 확인
- ESP8266은 2.4GHz WiFi만 지원 (5GHz 미지원)

## 다중 ESP8266 사용 예시

```
ESP #1 (MAC: ...ABCDEF) → IV_POLE_ABCDEF → 301A-1번 침대
ESP #2 (MAC: ...123456) → IV_POLE_123456 → 301A-2번 침대
ESP #3 (MAC: ...789ABC) → IV_POLE_789ABC → 301A-3번 침대
```

각 ESP는:
1. 자동으로 고유 ID 생성
2. 30초마다 개별적으로 핑 전송
3. 백엔드에서 자동 등록
4. 프론트엔드에서 개별 모니터링

## 다음 단계

1. **하드웨어 테스트**:
   - ESP8266에 펌웨어 업로드
   - 시리얼 모니터에서 "[PING] Success" 확인
   - LED 깜빡임 패턴 확인

2. **백엔드 확인**:
   - 콘솔에서 `[ESP PING] Success` 로그 확인
   - 데이터베이스 poles 테이블 확인

3. **프론트엔드 확인**:
   - DeviceManagement 페이지에서 폴대 표시 확인
   - 실시간 상태 업데이트 확인

4. **추가 ESP8266 추가**:
   - 동일한 펌웨어 업로드
   - 자동으로 다른 ID 생성됨
   - 동시에 여러 ESP 관리 가능

## 참고 문서
- [hardware/ESP8266_SETUP_GUIDE.md](hardware/ESP8266_SETUP_GUIDE.md) - 완전한 설정 가이드
- [hardware/config.h.example](hardware/config.h.example) - 설정 파일 템플릿

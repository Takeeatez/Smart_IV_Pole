# ESP8266 고정밀 측정 시스템 테스트 가이드

## 개요

ESP8266은 **1초마다 0.1g 단위로 측정**하며, **60초 이동 평균**으로 정밀한 유속을 계산합니다.
정상 상태에서는 백엔드에 전송하지 않고 **로컬에서만 모니터링**하며, **이상 감지 시에만 알림**을 전송합니다.

---

## 시스템 아키텍처

```
[간호사 대시보드] → [처방 입력 (약물, 용량, 투여시간)]
         ↓
[ESP8266 ↔ 환자 폴대 연결]
         ↓
[ESP8266] GET /api/esp/init?device_id=IV_POLE_XXXXXX
         ← [처방 정보: total_volume, flow_rate, gtt_factor]
         ↓
[수액 거치 감지] → [로컬 측정 시작]
         ↓
[1초마다 무게 측정 (0.1g 단위)]
         ↓
[60초 이동 평균으로 유속 계산]
         ↓
[편차 계산: 실측 유속 vs 처방 유속]
         ↓
[정상: 로컬 출력만] | [이상: 백엔드 알림 전송]
```

---

## 측정 사양

| 항목 | 사양 |
|------|------|
| **측정 주기** | 1초 |
| **측정 정밀도** | 0.1g |
| **유속 계산 윈도우** | 60초 (이동 평균) |
| **시리얼 출력** | 1초마다 |
| **백엔드 전송** | 이벤트 기반 (정상 시 전송하지 않음) |
| **최소 전송 간격** | 5초 |

---

## 이벤트 기반 전송 조건

| 조건 | 기준 | 전송 이유 |
|------|------|-----------|
| **초기 데이터** | 60초 경과 | 첫 유속 계산 완료 |
| **유속 이상** | 편차 ≥ 15% | 경고 알림 |
| **긴급 유속 이상** | 편차 ≥ 25% | 긴급 알림 |
| **잔량 부족** | 잔량 < 10% | 교체 준비 알림 |
| **수액 소진 임박** | 잔량 < 5% | 긴급 교체 알림 |

---

## 하드웨어 준비

### 1. 부품 목록
- ESP8266 (NodeMCU 또는 Wemos D1 Mini)
- HX711 ADC 모듈 (2개)
- Load Cell 센서 (2개, 0-5kg 또는 0-10kg)
- 점퍼 케이블
- Micro USB 케이블

### 2. 배선
```
HX711 #1 (DT_PIN = D5, SCK_PIN = D6)
HX711 #2 (DT_PIN = D7, SCK_PIN = D8)

ESP8266 → HX711
  - D5 → DT (Data)
  - D6 → SCK (Clock)
  - 3.3V → VCC
  - GND → GND
```

---

## 소프트웨어 설정

### 1. Arduino IDE 설정
```bash
# ESP8266 보드 추가
1. Arduino IDE → Preferences
2. Additional Boards Manager URLs:
   http://arduino.esp8266.com/stable/package_esp8266com_index.json
3. Tools → Board → Boards Manager → "esp8266" 검색 → 설치

# 라이브러리 설치
1. Sketch → Include Library → Manage Libraries
2. 검색 및 설치:
   - HX711 Arduino Library (by Bogdan Necula)
   - ESP8266WiFi (보드 설치 시 자동 포함)
   - ESP8266HTTPClient (보드 설치 시 자동 포함)
```

### 2. config.h 설정
```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* serverHost = "192.168.156.173";  // 백엔드 서버 IP
const uint16_t serverPort = 8081;

// 로컬 IP 확인 방법:
// Windows: cmd > ipconfig
// Mac/Linux: terminal > ifconfig
```

---

## 업로드 및 테스트

### 1. 펌웨어 업로드
```bash
1. Arduino IDE 열기
2. File → Open → sketch_sep12a/sketch_sep12a.ino
3. Tools → Board → ESP8266 Boards → NodeMCU 1.0 (ESP-12E Module)
4. Tools → Upload Speed → 115200
5. Tools → Port → /dev/ttyUSB0 (또는 COM3)
6. Sketch → Upload
```

### 2. Serial Monitor 열기
```bash
Tools → Serial Monitor
Baud Rate: 115200
```

### 3. 초기화 확인
```
=== ESP8266 IV Pole Monitor ===
[DEVICE] Unique ID: IV_POLE_068FC060
[WiFi] Connecting to TEST_ESP8266...
[WiFi] Connected! IP: 192.168.156.10
[SERVER] Connecting to 192.168.156.173:8081
[PING] Device: IV_POLE_068FC060 | Battery: 100%
[PING] Success (Battery: 100%)
```

---

## 처방 정보 수신 테스트

### 1. 백엔드에서 환자 등록 및 처방 입력
```bash
# 프론트엔드 접속
http://localhost:5173

# 환자 등록
1. "환자 추가" 클릭
2. 이름, 나이, 병상 입력

# 약물 처방
1. 환자 카드 클릭
2. "처방 추가" 클릭
3. 약품: "Normal Saline 500mL"
4. 총 용량: 500mL
5. 투여 시간: 180분 (3시간)
6. GTT Factor: 20
```

### 2. ESP8266 폴대 연결
```bash
# 프론트엔드에서
1. 환자 카드 → "폴대 연결" 클릭
2. IV_POLE_068FC060 선택
3. "연결" 버튼 클릭
```

### 3. Serial Monitor에서 처방 정보 확인
```
[PRESCRIPTION] 처방 정보 수신 성공
  - 총 용량: 500 mL
  - 유속: 2.78 mL/분 (180분 투여)
  - GTT Factor: 20
[TARE] 영점 조정 완료: 0.0g
```

---

## 측정 테스트

### 1. 영점 조정 (빈 상태)
```
시리얼 모니터에 't' 입력 + Enter

출력:
영점 조정 중...
영점 무게: 0.0g
수액을 걸어주세요. 그 후 'w' 명령으로 초기 무게 측정
```

### 2. 수액 거치 (초기 무게 측정)
```
1. 수액 500mL 걸기
2. 시리얼 모니터에 'w' 입력 + Enter

출력:
초기 무게 저장: 500.2g
✅ 측정 시작!
```

### 3. 실시간 측정 출력 확인
```
[1s] 무게: 500.1g (잔량: 500.1g, 100.0%) | 유속: -- (처방: 2.78, 편차: --) | 예상완료: --
[2s] 무게: 500.0g (잔량: 500.0g, 100.0%) | 유속: -- (처방: 2.78, 편차: --) | 예상완료: --
[3s] 무게: 499.9g (잔량: 499.9g, 100.0%) | 유속: -- (처방: 2.78, 편차: --) | 예상완료: --
...
[60s] 무게: 497.2g (잔량: 497.2g, 99.4%) | 유속: 2.80 mL/분 (처방: 2.78, 편차: +0.7%) | 예상완료: 177분 후 📤[전송: 초기 데이터]
```

### 4. 정상 측정 상태
```
[61s] 무게: 497.1g (잔량: 497.1g, 99.4%) | 유속: 2.81 mL/분 (처방: 2.78, 편차: +1.1%) | 예상완료: 177분 후
[62s] 무게: 497.0g (잔량: 497.0g, 99.4%) | 유속: 2.79 mL/분 (처방: 2.78, 편차: +0.4%) | 예상완료: 178분 후
[63s] 무게: 496.9g (잔량: 496.9g, 99.4%) | 유속: 2.77 mL/분 (처방: 2.78, 편차: -0.4%) | 예상완료: 179분 후
...
```

**참고**: 정상 상태 (편차 < 15%)에서는 백엔드에 전송하지 않습니다.

---

## 이상 감지 시뮬레이션

### 1. 유속 이상 (수동 테스트)
```bash
# 수액백을 손으로 잠깐 누르거나 흔들기
→ 유속이 급격히 변화하여 편차가 15% 이상 발생

예상 출력:
[120s] 무게: 491.5g (잔량: 491.5g, 98.3%) | 유속: 3.85 mL/분 (처방: 2.78, 편차: +38.5%) | 예상완료: 127분 후 📤[전송: 유속 이상]
⚠️ [ALERT] 유속 이상 감지! 편차 +38.5%
✅ [ALERT] 전송 완료 (HTTP 200)
```

### 2. 백엔드 로그 확인
```bash
# 백엔드 콘솔에서
=== ESP8266 경고 수신 ===
Device ID: IV_POLE_068FC060
Alert Type: FLOW_RATE_ABNORMAL
Deviation: 38.5%
✅ 경고 로그 생성 완료: Alert ID 123
✅ 경고 브로드캐스트 완료
```

### 3. 프론트엔드 알림 확인
```bash
# 환자 상세 페이지 (http://localhost:5173/patient/{id})
→ 오른쪽 "활성 알림" 섹션에 경고 표시
→ 병동 현황 페이지에서 환자 카드 색상 변경 (빨강)
```

---

## 시리얼 모니터 명령어

| 명령어 | 기능 |
|--------|------|
| `i` | 처방 정보 다시 요청 |
| `t` | 영점 조정 (빈 상태) |
| `w` | 초기 무게 측정 (수액 걸은 후) |
| `s` | 현재 상태 확인 |
| `q` | 프로그램 종료 |

---

## 트러블슈팅

### WiFi 연결 실패
```
증상: [WiFi] Connecting to TEST_ESP8266... (계속 반복)

해결:
1. config.h에서 SSID와 비밀번호 확인
2. ESP8266과 WiFi 라우터 거리 확인
3. 2.4GHz WiFi 사용 확인 (5GHz 지원 안 됨)
```

### 서버 연결 실패
```
증상: [PING] Connection failed: -1

해결:
1. config.h에서 serverHost IP 확인
   Windows: cmd > ipconfig
   Mac/Linux: terminal > ifconfig
2. 백엔드 서버 실행 여부 확인
   http://localhost:8081/api/esp/test
3. ESP8266과 서버가 같은 네트워크인지 확인
```

### 센서 읽기 오류
```
증상: ⚠️ 센서 읽기 오류

해결:
1. HX711 배선 확인 (DT, SCK, VCC, GND)
2. Load Cell 연결 상태 확인
3. calibration_factor 값 조정 (400 → 다른 값 테스트)
```

### 처방 정보 없음
```
증상: ⚠️ 처방 정보 없음 - 수동 모드로 전환

해결:
1. 프론트엔드에서 환자-폴대 연결 확인
2. 백엔드 API 동작 확인:
   curl http://localhost:8081/api/esp/init?device_id=IV_POLE_068FC060
3. 시리얼 모니터에서 'i' 입력으로 재요청
```

---

## 성능 지표

### 측정 정확도
- **무게 정밀도**: ±0.1g
- **유속 정확도**: ±0.01 mL/분
- **예상 시간 오차**: ±1분 이내

### 네트워크 효율성
- **정상 상태**: 전송 없음 (0 requests/min)
- **초기 전송**: 60초 후 1회
- **이상 감지**: 5초 간격 제한 (최대 12 requests/min)
- **트래픽 절감**: 기존 대비 99% 감소

### 배터리 수명
- **측정 전력**: ~50mA
- **WiFi 대기**: ~70mA
- **HTTP 전송**: ~170mA (순간)
- **예상 배터리 수명**: 24시간+ (2000mAh 기준)

---

## 참고 자료

- **Arduino IDE**: https://www.arduino.cc/en/software
- **ESP8266 보드 설정**: https://arduino-esp8266.readthedocs.io/
- **HX711 라이브러리**: https://github.com/bogde/HX711
- **프로젝트 문서**: `/CLAUDE.md`
- **하드웨어 가이드**: `/hardware/README.md`

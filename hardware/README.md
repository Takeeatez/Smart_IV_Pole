# Smart IV Pole - ESP8266 Hardware

ESP8266 기반 스마트 링거 폴대 하드웨어 펌웨어

## 하드웨어 구성

### 필요 부품
- ESP8266 (NodeMCU 또는 Wemos D1 Mini)
- HX711 로드셀 증폭기 모듈
- 로드셀 (50kg - 프로젝트 사양)
- LED (빨강, 초록)
- 푸시 버튼
- 저항 (330Ω x2, 10kΩ x1)

### 핀 연결

#### HX711 ↔ ESP8266
- VCC → 3.3V
- GND → GND
- DT (Data) → D2 (GPIO4)
- SCK (Clock) → D3 (GPIO0)

#### 로드셀 ↔ HX711
- Red (빨강) → E+
- Black (검정) → E-
- White (흰색) → A-
- Green (초록) → A+

#### LED & 버튼
- Red LED → D1 (GPIO5) + 330Ω 저항
- Green LED → D5 (GPIO14) + 330Ω 저항
- Call Button → D6 (GPIO12) + 10kΩ Pull-up

## 개발 환경 설정

### Arduino IDE 사용
1. Arduino IDE에서 ESP8266 보드 매니저 추가
   - File → Preferences → Additional Board Manager URLs:
   - `http://arduino.esp8266.com/stable/package_esp8266com_index.json`

2. 보드 설치
   - Tools → Board → Boards Manager → "esp8266" 검색 → 설치

3. 라이브러리 설치
   - Tools → Manage Libraries에서 설치:
   - **HX711 by Bogde** (로드셀 센서)
   - **ArduinoJson by Benoit Blanchon** (버전 6.x) - **필수**

4. 보드 설정
   - Board: NodeMCU 1.0 (ESP-12E Module)
   - Upload Speed: 115200
   - CPU Frequency: 80 MHz
   - Flash Size: 4MB (FS:2MB OTA:~1019KB)

### PlatformIO 사용 (권장)
```bash
# PlatformIO 설치
pip install platformio

# 프로젝트 초기화
cd hardware
pio init

# 컴파일 및 업로드
pio run -t upload

# 시리얼 모니터
pio device monitor
```

## 코드 설정

### WiFi 설정
```cpp
const char* ssid = "YourWiFiSSID";        // WiFi 이름
const char* password = "YourWiFiPassword"; // WiFi 비밀번호
```

### MQTT 서버 설정
```cpp
const char* mqtt_server = "192.168.1.100"; // MQTT 브로커 IP
const int mqtt_port = 1883;                // MQTT 포트
const char* device_id = "pole_001";        // 폴대 고유 ID
```

### 로드셀 캘리브레이션
```cpp
float calibration_factor = -90.0;  // 50kg 로드셀 예상값 (-80 ~ -120)
```

## 캘리브레이션 방법

1. 시리얼 모니터 열기 (115200 baud)
2. 로드셀에서 모든 무게 제거
3. MQTT로 캘리브레이션 명령 전송:
   ```json
   Topic: pole_001/command
   Payload: {"command": "calibrate"}
   ```
4. 알려진 무게(예: 1kg) 올려놓기
5. 캘리브레이션 팩터 확인 및 코드 수정

## MQTT Topics

### 발행 (Publish)
- `pole/{device_id}/weight` - 무게 데이터 (1초마다)
- `pole/{device_id}/status` - 온라인/오프라인 상태
- `pole/{device_id}/battery` - 배터리 상태
- `pole/{device_id}/button` - 버튼 이벤트
- `alert/{device_id}` - 경고 알림

### 구독 (Subscribe)
- `{device_id}/command` - 제어 명령 수신

## 데이터 형식

### 무게 데이터
```json
{
  "pole_id": "pole_001",
  "weight": 523.5,
  "fluid_percent": 85.3,
  "is_stable": true,
  "timestamp": 1234567890
}
```

### 알림
```json
{
  "type": "low",      // "low" | "empty" | "abnormal"
  "level": "warning"  // "warning" | "critical"
}
```

## 주요 기능

1. **무게 측정**: HX711을 통한 실시간 무게 측정
2. **안정성 검사**: 3초간 변화 없을 때만 정확한 측정
3. **이동 평균 필터**: 노이즈 제거를 위한 10회 평균
4. **수액 잔량 계산**: 초기 무게 대비 백분율
5. **경고 시스템**: 10% 미만시 경고, 0%시 긴급
6. **호출 버튼**: 간호사 호출 기능
7. **LED 표시**: 상태 시각화 (녹색: 정상, 빨강: 경고)

## 문제 해결

### WiFi 연결 실패
- SSID와 비밀번호 확인
- 2.4GHz 네트워크 사용 (5GHz 미지원)
- 라우터 거리 확인

### 로드셀 값 이상
- 배선 연결 확인 (특히 E+, E-, A+, A-)
- 캘리브레이션 재수행
- HX711 모듈 전원 확인 (3.3V)

### MQTT 연결 실패
- 브로커 IP 주소 확인
- 방화벽 설정 확인
- MQTT 브로커 실행 상태 확인

## 테스트

1. 시리얼 모니터로 디버그 메시지 확인
2. MQTT 클라이언트로 데이터 수신 확인:
   ```bash
   mosquitto_sub -h 192.168.1.100 -t "pole/+/weight"
   ```
3. LED 상태 확인
4. 버튼 동작 테스트
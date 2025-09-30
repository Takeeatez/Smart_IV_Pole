# Smart IV Pole MQTT System - Medical Workflow Implementation

## 🏥 Medical Workflow Overview

```
1. 간호사 → 처방 입력 (약품, 용량, 시간)
2. ESP8266 → 수액백 무게 측정 (안정성 감지)
3. 시스템 → 방울 속도 계산 & 예상 완료 시간
4. 대시보드 → 처방 시간 vs 계산된 시간 표시
```

## 🏗️ System Architecture

```
간호사 입력 → ESP8266 → MQTT Broker → Spring Boot → MariaDB
              (안정성감지)    (Mosquitto)     (의료계산)
                                ↓
                        WebSocket/REST API
                                ↓
                   간호사 대시보드 & 환자 앱
```

## 📦 Components

### 1. MQTT Broker (Mosquitto)
- **Port**: 1883 (TCP), 9001 (WebSocket)
- **Config**: `mqtt/config/mosquitto.conf`
- **Docker Container**: smart-iv-mqtt-broker

### 2. Spring Boot Backend
- **MQTT Integration**: Spring Integration MQTT
- **Medical Logic**: 안정성 감지, GTT 계산, 예상 시간
- **WebSocket**: 실시간 의료 데이터 전송
- **Port**: 8081

### 3. ESP8266 Simulator
- **Location**: `esp8266-simulator/`
- **Features**: 1대 실제 동작, 간호사 입력, 안정성 감지
- **CLI Interface**: 세션 시작, 움직임 시뮬레이션, 응급 호출

### 4. Frontend (React)
- **Medical Dashboard**: 처방 vs 계산 시간 표시
- **Port**: 3001

## 🚀 Quick Start

### Automated Setup
```bash
# Run the setup script
./start-mqtt-system.sh
```

### Manual Setup

#### 1. Start MQTT Broker & Database
```bash
docker-compose up -d
```

#### 2. Start Backend Server
```bash
cd Smart_IV_Pole-be
./gradlew bootRun
```

#### 3. Start Frontend
```bash
cd frontend
npm run dev
```

#### 4. Start ESP32 Simulator
```bash
cd esp32-simulator
npm install
npm start
```

## 📊 MQTT Topics Structure

### Publishing Topics (ESP32 → Broker)
- `hospital/pole/{poleId}/telemetry` - Real-time sensor data (1 sec)
- `hospital/pole/{poleId}/status` - Device status (30 sec)
- `hospital/alert/{severity}/{poleId}` - Medical alerts
- `hospital/nurse/call/{poleId}` - Emergency calls

### Subscribing Topics (Backend)
- `hospital/pole/+/telemetry` - All telemetry data
- `hospital/pole/+/status` - All device statuses
- `hospital/alert/#` - All alerts
- `hospital/nurse/call/+` - All nurse calls

## 📝 Message Formats

### Telemetry Message
```json
{
  "poleId": "POLE-301A-1",
  "timestamp": "2025-01-29T10:30:45Z",
  "telemetry": {
    "weight": 485.5,
    "flowRate": 2.5,
    "remaining": 35.5,
    "dripRate": 20,
    "estimatedEmpty": "2025-01-29T14:30:00Z"
  },
  "session": {
    "sessionId": "SES-20250129-001",
    "patientId": "PAT-12345",
    "drugType": "NS-500",
    "startTime": "2025-01-29T08:00:00Z",
    "targetDuration": 240
  }
}
```

### Alert Message
```json
{
  "alertId": "ALERT-20250129-001",
  "poleId": "POLE-301A-1",
  "severity": "CRITICAL",
  "type": "LOW_FLUID",
  "message": "잔여량 5% 미만",
  "timestamp": "2025-01-29T10:30:45Z",
  "data": {
    "remaining": 4.8,
    "estimatedEmpty": 5
  }
}
```

## 📡 API Endpoints

### Session Management
```bash
# 새 세션 시작
POST /api/v1/sessions/start
{
  "patientId": "PAT-12345",
  "poleId": "POLE-301A-1",
  "drugType": "Normal Saline 500mL",
  "initialVolume": 500.0,
  "initialWeight": 500.0,
  "prescribedDuration": 240,
  "prescribedDripRate": 42,
  "gttFactor": "20",
  "nurseId": "NURSE-001"
}

# 활성 세션 조회
GET /api/v1/sessions/active/POLE-301A-1

# 세션 중지
POST /api/v1/sessions/{sessionId}/stop?nurseId=NURSE-001&reason=completed

# 세션 현황
GET /api/v1/sessions/status/POLE-301A-1
```

## 🔍 Monitoring

### View MQTT Broker Logs
```bash
docker logs -f smart-iv-mqtt-broker
```

### View Database Logs
```bash
docker logs -f smart-iv-db
```

### Test MQTT Connection
```bash
# Install mosquitto clients
brew install mosquitto  # macOS
# or
apt-get install mosquitto-clients  # Linux

# Subscribe to all topics
mosquitto_sub -h localhost -p 1883 -t "hospital/#" -v

# Publish test message
mosquitto_pub -h localhost -p 1883 -t "hospital/test" -m "Hello MQTT"
```

## 🎯 Medical Workflow Testing

### 1. 간호사 세션 시작
```bash
cd esp8266-simulator
npm start

# CLI에서:
1. Connect to MQTT Broker
2. Start New Session (간호사 설정)
   - 환자 ID: PAT-12345
   - 약품: Normal Saline 500mL
   - 용량: 500mL
   - 처방 시간: 240분
```

### 2. 안정성 감지 테스트
```bash
# 시뮬레이터에서 움직임 시뮬레이션
3. Simulate Movement

# 결과:
- 불안정 상태로 전환 (빨간색 로그)
- 5초 후 자동으로 안정 상태 복구
- 안정 상태에서만 정확한 측정
```

### 3. 실시간 계산 확인
- **안정 상태**: 파란색 로그, 무게 정확 측정
- **계산된 시간**: 현재 속도 기반 예상 완료 시간
- **처방 시간**: 의사가 지시한 원래 시간
- **차이 비교**: 대시보드에서 시간 차이 확인

### 4. 응급 상황 테스트
```bash
# 응급 호출
4. Emergency Call

# 자동 알림:
- 잔여량 <10%: WARNING
- 잔여량 <5%: CRITICAL
```

## 🛠️ Troubleshooting

### MQTT Broker Not Starting
```bash
# Check if port 1883 is in use
lsof -i :1883

# Restart container
docker-compose restart mosquitto
```

### No Data in Frontend
1. Check WebSocket connection in browser console
2. Verify backend is subscribed to MQTT topics
3. Check ESP32 simulator is running

### Backend Not Receiving MQTT Messages
1. Check MQTT configuration in `application.yml`
2. Verify broker is running: `docker ps`
3. Check Spring Boot logs for MQTT connection status

## 📚 Additional Resources

- [Mosquitto Documentation](https://mosquitto.org/documentation/)
- [Spring Integration MQTT](https://docs.spring.io/spring-integration/reference/mqtt.html)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)

## 🔐 Security Notes (Production)

1. Enable authentication in `mosquitto.conf`
2. Use TLS/SSL for MQTT connections (port 8883)
3. Implement ACL for topic access control
4. Use environment variables for credentials
5. Enable MQTT over WSS for frontend
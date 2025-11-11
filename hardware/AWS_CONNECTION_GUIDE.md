# ESP32 AWS EC2 연결 가이드

ESP32를 AWS EC2에 배포된 백엔드 서버로 연결하는 방법입니다.

## 🎯 연결 흐름

```
ESP32 (WiFi) → 인터넷 → EC2 퍼블릭 IP → Spring Boot (port 8080)
```

---

## 📋 사전 준비

### 1. EC2 퍼블릭 IP 확인
AWS EC2 콘솔에서 인스턴스의 **퍼블릭 IPv4 주소** 또는 **Elastic IP** 확인

예시:
- 퍼블릭 IP: `13.125.123.45`
- Elastic IP: `54.180.99.88` (권장 - 재시작 시에도 유지됨)

### 2. 보안 그룹 설정
EC2 보안 그룹에서 **인바운드 규칙** 추가:

| 유형 | 프로토콜 | 포트 범위 | 소스 | 설명 |
|------|---------|----------|------|------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Nginx 프록시 |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Spring Boot (직접 접근 시) |

⚠️ **프로덕션 환경에서는** ESP32의 고정 IP만 허용하는 것이 보안상 안전합니다.

---

## 🔧 ESP32 코드 수정

### sketch_sep12a.ino 파일 수정

#### 변경 전 (로컬호스트):
```cpp
const char* serverHost = "192.0.0.2";
const uint16_t serverPort = 8081;
const char* serverPath = "/api/esp/data";
```

#### 변경 후 (AWS EC2):

**Option 1: HTTP 연결 (권장 - 간단함)**
```cpp
const char* serverHost = "13.125.123.45";  // EC2 퍼블릭 IP
const uint16_t serverPort = 80;             // Nginx 포트
const char* serverPath = "/api/v1/esp/data";  // API 경로
```

**Option 2: 도메인 사용 (SSL 인증서 있을 때)**
```cpp
const char* serverHost = "api.your-domain.com";  // 도메인
const uint16_t serverPort = 443;                  // HTTPS 포트
const char* serverPath = "/api/v1/esp/data";
```

**Option 3: Elastic IP 사용 (재시작 시에도 IP 유지)**
```cpp
const char* serverHost = "54.180.99.88";  // Elastic IP
const uint16_t serverPort = 80;
const char* serverPath = "/api/v1/esp/data";
```

---

## 🚀 배포 단계

### 1. ESP32 펌웨어 업로드

```bash
# Arduino IDE 또는 PlatformIO 사용
1. sketch_sep12a.ino 파일 열기
2. serverHost, serverPort, serverPath 수정
3. WiFi SSID/Password 확인
4. 컴파일 및 업로드
```

### 2. 시리얼 모니터 확인

```
=== Smart IV Pole - Medical Grade Monitoring ===
WiFi 연결 중...
✅ WiFi 연결 성공
IP: 192.168.1.100

📞 서버에서 처방 정보 요청 중...
✅ 처방 정보 초기화 완료!
총 용량: 500.0 mL
처방 유속: 100.0 mL/min

🚀 모니터링 시작!
```

### 3. 연결 테스트

ESP32 시리얼 모니터에서 다음 메시지 확인:

```
📤 [전송] 사유: 초기 데이터
📊 무게: 500.0g | 유속: 100.00 mL/min | 남은: 100.0%
✅ 전송 성공
```

---

## 🔍 문제 해결

### ❌ WiFi 연결 실패
```
WiFi 연결 중.......
❌ WiFi 연결 실패
```

**해결 방법**:
1. WiFi SSID/Password 확인
2. 2.4GHz WiFi 사용 확인 (ESP8266은 5GHz 미지원)
3. WiFi 신호 강도 확인

---

### ❌ 서버 연결 실패
```
❌ 전송 실패: -1
또는
❌ 전송 실패: 404
```

**해결 방법**:

**1. EC2 보안 그룹 확인**
```bash
# AWS CLI로 보안 그룹 규칙 확인
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
```

**2. EC2 서버 상태 확인**
```bash
# SSH로 EC2 접속
ssh ubuntu@your-ec2-ip

# Spring Boot 서비스 상태 확인
sudo systemctl status smartpole

# 로그 확인
sudo journalctl -u smartpole -f
```

**3. API 엔드포인트 테스트**
```bash
# 로컬에서 curl 테스트
curl -X POST http://your-ec2-ip/api/v1/esp/data \
  -H "Content-Type: application/json" \
  -d '{"device_id":"IV_001","current_weight":500}'

# 응답 예시:
# {"success":true,"message":"Data received"}
```

**4. Nginx 로그 확인**
```bash
# SSH로 EC2 접속 후
sudo tail -f /var/log/nginx/smartpole-error.log
sudo tail -f /var/log/nginx/smartpole-access.log
```

---

### ❌ HTTP 404 Not Found
```
❌ 전송 실패: 404
```

**원인**: API 경로가 잘못됨

**해결 방법**:
```cpp
// ❌ 잘못된 경로
const char* serverPath = "/api/esp/data";

// ✅ 올바른 경로
const char* serverPath = "/api/v1/esp/data";
```

---

### ❌ HTTP 502 Bad Gateway
```
❌ 전송 실패: 502
```

**원인**: Nginx는 작동하지만 Spring Boot가 응답하지 않음

**해결 방법**:
```bash
# Spring Boot 재시작
sudo systemctl restart smartpole

# 상태 확인
sudo systemctl status smartpole
```

---

## 📊 성능 최적화

### 1. Elastic IP 사용 (권장)
EC2 재시작 시에도 IP 주소 유지:
```bash
# AWS CLI로 Elastic IP 할당
aws ec2 allocate-address --domain vpc
aws ec2 associate-address --instance-id i-xxxxxxxxx --allocation-id eipalloc-xxxxxxxxx
```

### 2. Keep-Alive 연결 사용
ESP32 HTTP 클라이언트에서 연결 재사용:
```cpp
WiFiClient client;
HTTPClient http;

// setup()에서 한 번만 연결
http.begin(client, serverHost, serverPort, serverPath);
http.setReuse(true);  // 연결 재사용

// loop()에서 반복 사용
http.POST(json);  // 빠른 전송
```

### 3. DNS 캐싱 (도메인 사용 시)
ESP32에서 DNS 조회 시간 절약:
```cpp
#include <ESP8266WiFi.h>
IPAddress serverIP;

void setup() {
  // DNS 조회를 한 번만 수행
  WiFi.hostByName(serverHost, serverIP);

  // 이후 IP로 직접 연결
  http.begin(client, serverIP, serverPort, serverPath);
}
```

---

## 🔐 보안 고려사항

### 1. HTTPS 사용 (프로덕션 권장)
Let's Encrypt SSL 인증서 설정 후:
```cpp
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

WiFiClientSecure client;
client.setInsecure();  // 인증서 검증 생략 (테스트용)

// 또는 인증서 검증
client.setFingerprint("AA BB CC DD ...");
```

### 2. API 키 인증
ESP32 요청에 API 키 추가:
```cpp
String json = "{\"device_id\":\"IV_001\",\"api_key\":\"your-secret-key\",";
json += "\"current_weight\":" + String(currentWeight) + "}";
```

### 3. 보안 그룹 IP 제한
ESP32의 고정 IP만 허용:
```
소스: 123.45.67.89/32  # ESP32 공인 IP
```

---

## ✅ 체크리스트

배포 전 확인 사항:

- [ ] EC2 인스턴스 실행 중
- [ ] Spring Boot 서비스 정상 작동 (`systemctl status smartpole`)
- [ ] Nginx 정상 작동 (`systemctl status nginx`)
- [ ] 보안 그룹에서 포트 80/8080 허용
- [ ] EC2 퍼블릭 IP 또는 Elastic IP 확인
- [ ] ESP32 코드에서 `serverHost` 업데이트
- [ ] WiFi 연결 정보 정확함
- [ ] API 엔드포인트 curl 테스트 성공

---

## 📞 지원

문제 발생 시:
1. 시리얼 모니터 로그 확인
2. EC2 서버 로그 확인 (`journalctl -u smartpole -f`)
3. Nginx 로그 확인 (`tail -f /var/log/nginx/smartpole-error.log`)

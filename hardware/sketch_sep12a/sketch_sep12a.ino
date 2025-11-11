#include <ESP8266WiFi.h>
#include "HX711.h"
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>  // ArduinoJson 7.4.2

// WiFi and server credentials - loaded from config.h (not tracked by git)
#include "config.h"

// ESP8266 고유 ID (MAC 주소 기반)d
String deviceId = "";

// --- 측정 설정값 ---
const int   HISTORY_SIZE          = 60; // 60초 윈도우 (1분간 데이터)
const unsigned long CHECK_INTERVAL = 1000;  // 1초마다 상태 체크
const unsigned long MEASURE_INTERVAL = 1000; // 1초마다 측정 (고정밀)
const unsigned long SERIAL_PRINT_INTERVAL = 1000; // 1초마다 시리얼 출력
const unsigned long PING_INTERVAL = 30000;  // 30초마다 핑 전송
float calibration_factor = 400; // 로드셀 기본 캘리값

// --- 이벤트 기반 전송 설정 ---
const float DATA_SEND_DEVIATION_THRESHOLD = 15.0;  // 15% 이상 편차 시 전송
const float LOW_VOLUME_THRESHOLD = 10.0;  // 잔여량 10% 미만 시 전송
const unsigned long MIN_SEND_INTERVAL = 5000;  // 최소 5초 간격으로 전송 (중복 방지)

// --- 운동 감지 및 안정화 설정 ---
const float STABILITY_THRESHOLD = 100.0;  // ±100g 이내면 안정 상태
const unsigned long STABILITY_DURATION = 10000;  // 10초 안정 유지 필요 (큰 흔들림)
const int STABILITY_CHECK_COUNT = 1;  // 연속 1회 안정 확인
const float SMART_RECOVERY_THRESHOLD = 5.0;  // 스마트 복구: ±5g 이내면 샘플 유지
const unsigned long MIN_STABILIZATION_TIME = 2000;  // 최소 안정화 시간 (작은 흔들림)

// --- 예외 처리를 위한 설정값 ---
const unsigned long WIFI_RECONNECT_INTERVAL = 30000; // 30초
const unsigned long SENSOR_TIMEOUT          = 5000;  // 5초
const int           MAX_SENSOR_READ_ATTEMPTS = 3;
const float         SENSOR_ERROR_VALUE       = -999.0;
unsigned long lastWifiCheck   = 0;
bool          wifiConnected   = false;
int           sensorErrorCount = 0;

// --- 경고 시스템 설정 ---
const float DEVIATION_THRESHOLD = 0.15;  // 15% 이상 차이나면 경고

// --- 간호사 처방 정보 (서버에서 수신) ---
struct PrescriptionInfo {
  float totalVolume;          // 총 수액량 (mL)
  float prescribedRate;       // 처방 유속 (mL/min)
  int gttFactor;              // GTT 계수 (20 or 60)
  int calculatedGTT;          // 계산된 GTT/min
  bool isInitialized;         // 초기화 완료 여부
};

PrescriptionInfo prescription = {0, 0, 20, 0, false};

// --- 측정 상태 관리 ---
enum MeasurementState {
  WAITING_INIT,           // 초기화 대기 - 처방 정보 수신 전
  TARE_BASELINE,          // 영점 조정 - 수액 걸기 전
  INITIAL_WEIGHT,         // 초기 무게 측정 - 수액 걸은 직후
  STABLE,                 // 안정 상태 - 정상 측정 중
  UNSTABLE,              // 불안정 상태 - 운동 감지
  WAITING_STABILIZATION  // 안정화 대기 - 10초 대기 중
};

MeasurementState currentState = WAITING_INIT;
float initialWeight = 0;        // 수액 걸었을 때 전체 무게
float baselineWeight = 0;       // 영점 (빈 상태)
float lastStableWeight = 0;
unsigned long lastStableTime = 0;
unsigned long lastMeasureTime = 0;
unsigned long lastPingTime = 0;
unsigned long lastDataSendTime = 0;  // 마지막 데이터 전송 시간 (중복 방지)
unsigned long weightDetectedTime = 0;  // 수액 무게 감지 시작 시간
int stableCheckCount = 0;
bool initialDataSent = false;   // 초기 데이터 전송 여부
const unsigned long WEIGHT_DETECTION_DELAY = 5000;  // 5초 지연

// --- 유속 계산용 데이터 (슬라이딩 윈도우 방식) ---
float weightHistory60[60];      // 최근 60초간 무게 샘플 (1초마다)
bool sampleStability60[60];     // 각 샘플의 안정성 플래그 (true = 안정)
int weightIndex60 = 0;
bool weight60Full = false;      // 60개 샘플이 채워졌는지
unsigned long lastWeightSampleTime = 0;
const unsigned long WEIGHT_SAMPLE_INTERVAL = 1000;  // 1초마다 샘플링
float weightBeforeUnstable = 0; // 불안정 상태 진입 전 무게 (스마트 복구용)
unsigned long unstableStartTime = 0;  // 불안정 상태 시작 시간

// --- 데이터 저장 ---
float weightHistory[HISTORY_SIZE];
unsigned long timeHistory[HISTORY_SIZE];
int idx             = 0;
bool full           = false;
unsigned long startMillis;
bool completed      = false;
float currentWeight;

HX711 scale;
WiFiServer server(80);
WiFiClient client;
HTTPClient http;

// --- WiFi 상태 확인 및 재연결 ---
void checkAndReconnectWiFi() {
  unsigned long now = millis();
  if (now - lastWifiCheck >= WIFI_RECONNECT_INTERVAL) {
    lastWifiCheck = now;
    if (WiFi.status() != WL_CONNECTED) {
      wifiConnected = false;
      Serial.println("WiFi connection lost! Reconnecting...");
      WiFi.disconnect();
      delay(100);
      WiFi.begin(ssid, password);
      int attempts = 0;
      while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
        ESP.wdtFeed();
      }
      if (WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        Serial.println("\nWiFi reconnected!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
      } else {
        Serial.println("\nWiFi reconnect failed.");
      }
    } else {
      wifiConnected = true;
    }
  }
}

// --- 안전한 센서 읽기 with retry logic ---
float safeReadSensor() {
  // 센서 준비 확인 with timeout
  if (!scale.wait_ready_timeout(1000)) {
    Serial.println("[SENSOR ERROR] Sensor not ready after timeout");
    sensorErrorCount++;

    if (sensorErrorCount >= 5) {
      Serial.println("[SENSOR ERROR] Multiple failures detected - check hardware connection");
      sensorErrorCount = 0;  // Reset counter
    }

    return SENSOR_ERROR_VALUE;
  }

  // Retry logic for reading
  for (int attempt = 1; attempt <= MAX_SENSOR_READ_ATTEMPTS; attempt++) {
    scale.set_scale(calibration_factor);
    float weight = scale.get_units(10);  // 10회 평균

    // Sanity check: weight should be reasonable
    if (weight > -100 && weight < 10000) {
      sensorErrorCount = 0;  // Reset error counter on success
      return weight;
    }

    Serial.print("[SENSOR WARNING] Unusual reading: ");
    Serial.print(weight);
    Serial.print("g (attempt ");
    Serial.print(attempt);
    Serial.println("/3)");

    if (attempt < MAX_SENSOR_READ_ATTEMPTS) {
      delay(100);  // Short delay before retry
    }
  }

  Serial.println("[SENSOR ERROR] All read attempts failed");
  sensorErrorCount++;
  return SENSOR_ERROR_VALUE;
}

// --- 무게 안정성 확인 ---
bool isWeightStable(float newWeight) {
  if (lastStableWeight == 0) {
    lastStableWeight = newWeight;
    return true;
  }
  float diff = abs(newWeight - lastStableWeight);
  return diff <= STABILITY_THRESHOLD;
}

// --- 무게 샘플 추가 (1초마다 호출) - 안정성 플래그 포함 ---
void addWeightSample(float weight, bool isStable) {
  weightHistory60[weightIndex60] = weight;
  sampleStability60[weightIndex60] = isStable;
  weightIndex60++;
  if (weightIndex60 >= 60) {
    weightIndex60 = 0;
    weight60Full = true;  // 60개 샘플 채워짐
  }
}

// --- 유속 계산 (60초 슬라이딩 윈도우) - 안정된 샘플만 사용 ---
float calculateFlowRate() {
  // 60개 샘플이 채워지지 않았으면 계산 불가
  if (!weight60Full) {
    return -1;  // 아직 60초 대기 중
  }

  // 안정된 샘플만 선택하여 유속 계산
  int stableCount = 0;
  float totalWeight = 0;
  float firstStableWeight = -1;
  float lastStableWeight = -1;
  int firstStableIndex = -1;
  int lastStableIndex = -1;

  // 60개 샘플 중 안정된 샘플 찾기
  for (int i = 0; i < 60; i++) {
    if (sampleStability60[i]) {
      stableCount++;
      totalWeight += weightHistory60[i];

      if (firstStableWeight < 0) {
        firstStableWeight = weightHistory60[i];
        firstStableIndex = i;
      }
      lastStableWeight = weightHistory60[i];
      lastStableIndex = i;
    }
  }

  // 안정된 샘플이 30개 미만이면 신뢰도 낮음
  if (stableCount < 30) {
    return -1;  // 불안정한 상태, 유속 계산 불가
  }

  // 가장 오래된 안정 샘플과 최신 안정 샘플 간 시간 차이 계산
  int timeDiffSeconds = 0;
  if (lastStableIndex >= firstStableIndex) {
    timeDiffSeconds = lastStableIndex - firstStableIndex;
  } else {
    timeDiffSeconds = (60 - firstStableIndex) + lastStableIndex;
  }

  // 시간 차이가 20초 미만이면 유속 계산 불가
  if (timeDiffSeconds < 20) {
    return -1;
  }

  // 무게 감소량 계산
  float weightChange = firstStableWeight - lastStableWeight;

  // 비정상 값 체크
  if (weightChange < 0) {
    return 0;  // 무게 증가 (비정상)
  }

  // 유속 계산: (무게 감소량 g) / (시간 초) * 60 = mL/min
  float flowRate = (weightChange / (float)timeDiffSeconds) * 60.0;

  return flowRate;
}

// --- 남은 시간 계산 (측정 유속 기반) ---
float calculateRemainingTime(float remainingWeight, float measuredFlowRate) {
  if (measuredFlowRate <= 0 || remainingWeight <= 0) {
    return -1;
  }

  // 남은 무게(g) ÷ 유속(mL/min) = 남은 시간(분)
  // ⚠️ 분 단위로 반환 (초로 변환하지 않음!)
  return remainingWeight / measuredFlowRate;
}

// --- 유속 편차 계산 ---
float calculateFlowDeviation(float measuredRate) {
  if (!prescription.isInitialized || prescription.prescribedRate <= 0) {
    return 0;
  }

  float deviation = (measuredRate - prescription.prescribedRate) / prescription.prescribedRate;
  return deviation * 100.0;  // 퍼센트로 반환
}

// --- 이력 추가 ---
void addHistory(float weight, unsigned long ms) {
  weightHistory[idx] = weight;
  timeHistory[idx]   = ms;
  idx++;
  if (idx >= HISTORY_SIZE) {
    idx = 0;
    full = true;
  }
}

// --- 핑 전송 (30초마다) ---
void sendPing() {
  if (WiFi.status() != WL_CONNECTED) return;

  // 간단한 배터리 레벨 시뮬레이션 (실제로는 하드웨어에서 읽어야 함)
  static int batteryLevel = 100;
  if (millis() > 60000) {  // 1분 후부터 점진적 감소
    batteryLevel = max(20, 100 - (int)((millis() - 60000) / 600000));  // 10분당 1% 감소
  }

  // ✅ ArduinoJson을 사용한 JSON 생성
  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["battery_level"] = batteryLevel;

  String json;
  serializeJson(doc, json);

  http.begin(client, serverHost, serverPort, "/api/esp/ping");
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);  // 10초 타임아웃

  Serial.println("[PING] Sending: " + json);
  int code = http.POST(json);

  if (code == 200) {
    Serial.print("[PING] Success (Battery: ");
    Serial.print(batteryLevel);
    Serial.println("%)");
    digitalWrite(LED_BUILTIN, LOW);  // LED ON for success
    delay(100);
    digitalWrite(LED_BUILTIN, HIGH); // LED OFF
  } else if (code > 0) {
    Serial.print("[PING] HTTP Error: ");
    Serial.println(code);
    String response = http.getString();
    Serial.println("[PING] Response: " + response);
    // LED blink for HTTP error
    for (int i = 0; i < 3; i++) {
      digitalWrite(LED_BUILTIN, LOW);
      delay(200);
      digitalWrite(LED_BUILTIN, HIGH);
      delay(200);
    }
  } else {
    Serial.print("[PING] Connection failed: ");
    Serial.println(http.errorToString(code));
    // Fast LED blink for connection error
    for (int i = 0; i < 5; i++) {
      digitalWrite(LED_BUILTIN, LOW);
      delay(100);
      digitalWrite(LED_BUILTIN, HIGH);
      delay(100);
    }
  }
  http.end();
}

// --- 경고 전송 ---
void sendAlert(const char* alertType, float deviationPercent) {
  if (WiFi.status() != WL_CONNECTED) return;

  // ✅ ArduinoJson을 사용한 JSON 생성
  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["alert_type"] = alertType;
  doc["deviation_percent"] = deviationPercent;
  doc["timestamp"] = millis();

  String json;
  serializeJson(doc, json);

  http.begin(client, serverHost, serverPort, "/api/esp/alert");
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(json);

  if (code == 200) {
    Serial.println("✅ 경고 전송 성공");
  } else {
    Serial.println("❌ 경고 전송 실패");
  }
  http.end();
}

// --- 확장된 데이터 전송 ---
void send_data(float currentWeight, float measuredRate, float remainingTime,
               float deviation, const char* state) {

  float remainingWeight = currentWeight - baselineWeight;
  float consumedWeight = initialWeight - currentWeight;

  // ✅ ArduinoJson을 사용한 JSON 생성
  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["current_weight"] = currentWeight;
  doc["initial_weight"] = initialWeight;
  doc["baseline_weight"] = baselineWeight;
  doc["weight_consumed"] = consumedWeight;
  doc["weight_remaining"] = remainingWeight;
  doc["flow_rate_measured"] = measuredRate;
  doc["flow_rate_prescribed"] = prescription.prescribedRate;
  doc["remaining_time_sec"] = remainingTime;
  doc["deviation_percent"] = deviation;
  doc["state"] = state;
  doc["timestamp"] = millis();

  String json;
  serializeJson(doc, json);

  if (WiFi.status() == WL_CONNECTED) {
    http.begin(client, serverHost, serverPort, serverPath);
    http.addHeader("Content-Type", "application/json");

    Serial.println("📤 데이터 전송: " + json);

    int code = http.POST(json);
    if (code == 200) {
      Serial.println("✅ 전송 성공");
    } else {
      Serial.print("❌ 전송 실패: ");
      Serial.println(code);
    }
    http.end();
  } else {
    Serial.println("WiFi 연결 없음");
  }
}

// --- 처방 정보 요청 (서버에서 가져오기) ---
bool requestPrescriptionInfo() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi 연결 없음 - 처방 정보 요청 불가");
    return false;
  }

  String initUrl = "/api/esp/init?device_id=" + deviceId;
  http.begin(client, serverHost, serverPort, initUrl);
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("📥 처방 정보 수신: " + payload);

    // ✅ ArduinoJson 라이브러리를 사용한 안전한 파싱
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.print("❌ JSON 파싱 실패: ");
      Serial.println(error.c_str());
      http.end();
      return false;
    }

    // 백엔드 ApiResponse 구조: { status, message, data: {...} }
    // data 필드 존재 여부 확인
    if (doc.containsKey("data") && doc["data"].is<JsonObject>()) {
      JsonObject data = doc["data"].as<JsonObject>();

      // 필수 필드 확인 및 파싱
      if (data.containsKey("total_volume_ml") && data.containsKey("flow_rate_ml_min")) {
        prescription.totalVolume = data["total_volume_ml"].as<float>();
        prescription.prescribedRate = data["flow_rate_ml_min"].as<float>();

        // 선택적 필드 파싱
        if (data.containsKey("gtt_factor")) {
          prescription.gttFactor = data["gtt_factor"].as<int>();
        } else {
          prescription.gttFactor = 20; // 기본값
        }

        if (data.containsKey("calculated_gtt")) {
          prescription.calculatedGTT = data["calculated_gtt"].as<int>();
        } else {
          prescription.calculatedGTT = (int)(prescription.prescribedRate * prescription.gttFactor);
        }

        prescription.isInitialized = true;

        Serial.println("✅ 처방 정보 초기화 완료!");
        Serial.print("총 용량: ");
        Serial.print(prescription.totalVolume);
        Serial.println(" mL");
        Serial.print("처방 유속: ");
        Serial.print(prescription.prescribedRate);
        Serial.println(" mL/min");
        Serial.print("GTT Factor: ");
        Serial.println(prescription.gttFactor);
        Serial.print("계산된 GTT: ");
        Serial.print(prescription.calculatedGTT);
        Serial.println(" 방울/분");

        http.end();
        return true;
      } else {
        Serial.println("❌ 필수 필드 누락 (total_volume_ml, flow_rate_ml_min)");
        Serial.print("Available keys in data: ");
        for (JsonPair kv : data) {
          Serial.print(kv.key().c_str());
          Serial.print(" ");
        }
        Serial.println();
      }
    } else {
      Serial.println("❌ 'data' 필드 없음 또는 잘못된 형식");
      Serial.print("Response status: ");
      if (doc.containsKey("status")) {
        Serial.println(doc["status"].as<const char*>());
      }
      Serial.print("Response message: ");
      if (doc.containsKey("message")) {
        Serial.println(doc["message"].as<const char*>());
      }
    }
  } else {
    Serial.print("❌ 처방 정보 요청 실패: ");
    Serial.println(httpCode);
  }

  http.end();
  return false;
}

// --- 상태 문자열 변환 ---
const char* getStateString(MeasurementState state) {
  switch(state) {
    case WAITING_INIT: return "WAITING_INIT";
    case TARE_BASELINE: return "TARE_BASELINE";
    case INITIAL_WEIGHT: return "INITIAL_WEIGHT";
    case STABLE: return "STABLE";
    case UNSTABLE: return "UNSTABLE";
    case WAITING_STABILIZATION: return "WAITING";
    default: return "UNKNOWN";
  }
}

void setup() {
  delay(1000);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);

  ESP.wdtDisable();
  ESP.wdtEnable(8000);
  delay(1000);
  Serial.println("\n\n=== Smart IV Pole - Medical Grade Monitoring ===");

  // Generate unique device ID from MAC address
  uint8_t mac[6];
  WiFi.macAddress(mac);
  deviceId = "IV_POLE_";
  for (int i = 2; i < 6; i++) {  // Use last 4 bytes of MAC
    if (mac[i] < 16) deviceId += "0";
    deviceId += String(mac[i], HEX);
  }
  deviceId.toUpperCase();
  Serial.print("[DEVICE] Unique ID: ");
  Serial.println(deviceId);

  // HX711 초기화 with error handling
  Serial.println("[SENSOR] Initializing HX711...");
  scale.begin(D5, D6);
  delay(1000);

  // 센서 연결 확인 with timeout
  bool sensorReady = scale.wait_ready_timeout(1000);

  if (sensorReady) {
    Serial.println("[SENSOR] HX711 detected successfully");
    Serial.println("[SENSOR] Calibrating...");

    scale.set_scale();
    delay(2000);
    scale.tare();
    delay(2000);
    scale.set_scale(calibration_factor);

    float testWeight = scale.get_units(5);
    Serial.print("[SENSOR] Calibration complete | Test reading: ");
    Serial.print(testWeight);
    Serial.println(" g");
  } else {
    Serial.println("[SENSOR ERROR] HX711 not detected!");
    Serial.println("[SENSOR ERROR] Check wiring:");
    Serial.println("  - DT pin: D1 (GPIO5)");
    Serial.println("  - SCK pin: D0 (GPIO16)");
    Serial.println("  - VCC: 3.3V (NOT 5V)");
    Serial.println("  - GND: GND");
    Serial.println("[WARNING] Running in WiFi-only mode (no weight measurement)");
    Serial.println("[WARNING] Prescription retrieval will still work");
  }

  delay(2000);

  // WiFi 연결
  startMillis = millis();
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  WiFi.begin(ssid, password);

  Serial.print("WiFi 연결 중");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 60) {
    delay(500);
    Serial.print(".");
    attempts++;
    ESP.wdtFeed();
  }

  wifiConnected = (WiFi.status() == WL_CONNECTED);
  if (wifiConnected) {
    Serial.println("\n✅ WiFi 연결 성공");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    server.begin();

    // ✨ 처방 정보 자동 요청 제거 - 간호사 연결 후에만 수신
    Serial.println("\n⏳ 간호사 대시보드 연결 대기 중...");
    Serial.println("💡 간호사가 환자-폴대 연결 후 처방 정보를 받습니다");
    Serial.println("💡 수동으로 처방 정보를 받으려면 'i' 명령어를 입력하세요");
    currentState = WAITING_INIT;
  } else {
    Serial.println("\n❌ WiFi 연결 실패");
    currentState = WAITING_INIT;
  }

  lastStableTime = millis();
  lastMeasureTime = millis();
  lastWeightSampleTime = millis();

  Serial.println("\n🚀 모니터링 시작!");
  Serial.println("명령어:");
  Serial.println("  'i' - 처방 정보 다시 요청");
  Serial.println("  't' - 영점 조정 (빈 상태)");
  Serial.println("  'w' - 초기 무게 측정 (수액 걸은 후)");
  Serial.println("  's' - 현재 상태 확인");
  Serial.println("  'q' - 종료");

  ESP.wdtFeed();
}

void loop() {
  ESP.wdtFeed();
  if (completed) return;

  unsigned long now = millis();
  checkAndReconnectWiFi();

  // 30초마다 핑 전송
  if (now - lastPingTime >= PING_INTERVAL) {
    sendPing();
    lastPingTime = now;
  }

  // 시리얼 명령 처리
  if (Serial.available()) {
    char command = Serial.read();
    if (command == 'q') {
      Serial.println("프로그램 종료");
      completed = true;
      return;
    } else if (command == 'i') {
      Serial.println("처방 정보 재요청...");
      requestPrescriptionInfo();
    } else if (command == 't') {
      Serial.println("영점 조정 중...");
      baselineWeight = safeReadSensor();
      Serial.print("영점 무게: ");
      Serial.print(baselineWeight);
      Serial.println(" g");
      currentState = INITIAL_WEIGHT;
      Serial.println("수액을 걸어주세요. 그 후 'w' 명령으로 초기 무게 측정");
    } else if (command == 'w') {
      if (currentState == INITIAL_WEIGHT || currentState == TARE_BASELINE) {
        Serial.println("⏳ 5초 후 초기 무게 측정...");
        for (int i = 5; i > 0; i--) {
          Serial.print(i);
          Serial.print("... ");
          delay(1000);
          ESP.wdtFeed();
        }
        Serial.println();

        initialWeight = safeReadSensor();

        // ✅ 무게 샘플링 초기화
        weightIndex60 = 0;
        weight60Full = false;
        lastWeightSampleTime = now;

        // 안정성 플래그 배열 초기화
        for (int i = 0; i < 60; i++) {
          sampleStability60[i] = true;  // 초기에는 모두 안정
        }

        Serial.print("✅ 초기 무게 저장: ");
        Serial.print(initialWeight);
        Serial.println(" g");
        currentState = STABLE;
        Serial.println("✅ 측정 시작! (60초 후 유속 계산 시작)");
      } else {
        Serial.println("먼저 't' 명령으로 영점 조정하세요");
      }
    } else if (command == 's') {
      Serial.println("\n=== 현재 상태 ===");
      Serial.print("상태: ");
      Serial.println(getStateString(currentState));

      // 실시간 센서 읽기 (5회 연속)
      Serial.println("\n📊 센서 안정성 테스트 (5회 측정):");
      for (int i = 0; i < 5; i++) {
        float reading = safeReadSensor();
        Serial.print("  #");
        Serial.print(i + 1);
        Serial.print(": ");
        Serial.print(reading, 2);
        Serial.println(" g");
        delay(500);
      }

      Serial.print("\n현재 무게: ");
      Serial.print(currentWeight, 2);
      Serial.println(" g");
      Serial.print("초기 무게: ");
      Serial.print(initialWeight, 2);
      Serial.println(" g");
      Serial.print("영점 무게: ");
      Serial.print(baselineWeight, 2);
      Serial.println(" g");
      Serial.print("잔량: ");
      Serial.print(currentWeight - baselineWeight, 2);
      Serial.println(" g");

      // 60초 샘플 상태
      Serial.print("\n유속 계산 샘플: ");
      Serial.print(weight60Full ? 60 : weightIndex60);
      Serial.print("/60 (");
      Serial.print(weight60Full ? "준비됨" : "대기 중");
      Serial.println(")");

      if (prescription.isInitialized) {
        Serial.print("처방 유속: ");
        Serial.print(prescription.prescribedRate, 2);
        Serial.println(" mL/min");
        Serial.print("총 용량: ");
        Serial.print(prescription.totalVolume);
        Serial.println(" mL");
      } else {
        Serial.println("처방 정보 없음");
      }
    } else if (command == 'd') {
      // 디버그: 센서 연속 읽기 테스트 (10회)
      Serial.println("\n🔬 센서 연속 읽기 테스트 (10회, 1초 간격):");
      Serial.println("시간\t무게(g)\t변화량");
      Serial.println("--------------------------------");

      float prevWeight = safeReadSensor();
      Serial.print("0s\t");
      Serial.print(prevWeight, 2);
      Serial.println("\t-");

      for (int i = 1; i <= 10; i++) {
        delay(1000);
        float newWeight = safeReadSensor();
        float change = newWeight - prevWeight;

        Serial.print(i);
        Serial.print("s\t");
        Serial.print(newWeight, 2);
        Serial.print("\t");
        Serial.print(change > 0 ? "+" : "");
        Serial.println(change, 2);

        prevWeight = newWeight;
      }

      Serial.println("\n💡 변화량이 ±0.2g 이내면 정상, 계속 감소하면 센서 문제");
    }
  }

  // 초기화 대기 중이면 측정하지 않음
  if (currentState == WAITING_INIT) {
    delay(1000);
    return;
  }

  // 1초마다 무게 체크 및 상태 업데이트
  if (now - lastStableTime >= CHECK_INTERVAL) {
    currentWeight = safeReadSensor();

    if (currentWeight == SENSOR_ERROR_VALUE) {
      Serial.println("⚠️ 센서 읽기 오류");
      lastStableTime = now;
      return;
    }

    // 상태 머신 로직
    switch (currentState) {
      case TARE_BASELINE:
        // 영점 자동 측정
        if (stableCheckCount++ >= 3) {
          baselineWeight = currentWeight;
          Serial.print("📏 영점 자동 설정: ");
          Serial.print(baselineWeight);
          Serial.println(" g");
          Serial.println("수액을 걸어주세요. 안정되면 자동으로 측정 시작합니다.");
          currentState = INITIAL_WEIGHT;
          stableCheckCount = 0;
        }
        break;

      case INITIAL_WEIGHT:
        // 초기 무게 자동 감지 (영점보다 50g 이상 증가)
        if (currentWeight - baselineWeight > 50) {
          // 첫 감지 시각 기록
          if (weightDetectedTime == 0) {
            weightDetectedTime = now;
            Serial.print("🔍 수액 감지됨 (");
            Serial.print(currentWeight - baselineWeight);
            Serial.println(" g) - 5초 후 측정 시작...");
          }

          // 5초 경과 확인
          if (now - weightDetectedTime >= WEIGHT_DETECTION_DELAY) {
            // 5초 후에도 무게가 안정적인지 확인
            if (isWeightStable(currentWeight)) {
              if (stableCheckCount++ >= 3) {
                initialWeight = currentWeight;

                // ✅ 무게 샘플링 초기화
                weightIndex60 = 0;
                weight60Full = false;
                lastWeightSampleTime = now;

                // 안정성 플래그 배열 초기화
                for (int i = 0; i < 60; i++) {
                  sampleStability60[i] = true;  // 초기에는 모두 안정
                }

                Serial.print("✅ 초기 무게 자동 저장: ");
                Serial.print(initialWeight);
                Serial.println(" g");
                Serial.println("측정 시작! (60초 후 유속 계산 시작)");
                currentState = STABLE;
                stableCheckCount = 0;
                weightDetectedTime = 0;  // 리셋
              }
            } else {
              stableCheckCount = 0;
            }
          }
        } else {
          // 무게가 다시 줄어들면 리셋
          stableCheckCount = 0;
          weightDetectedTime = 0;
        }
        break;

      case STABLE:
        // 안정 상태에서 흔들림 감지
        if (!isWeightStable(currentWeight)) {
          currentState = UNSTABLE;
          stableCheckCount = 0;
          weightBeforeUnstable = lastStableWeight;  // 흔들림 전 무게 저장
          unstableStartTime = now;  // 불안정 시작 시간 기록
          Serial.println("\n⚠️ 운동 감지 - 측정 계속 (불안정 플래그)");
          digitalWrite(LED_BUILTIN, HIGH);  // LED ON
        } else {
          stableCheckCount++;

          // 1초마다 측정 (항상 수행)
          if (now - lastMeasureTime >= MEASURE_INTERVAL) {
            unsigned long elapsed = now - startMillis;
            addHistory(currentWeight, elapsed);

            // ✅ 1초마다 무게 샘플 추가 (슬라이딩 윈도우) - 안정 플래그 포함
            addWeightSample(currentWeight, true);  // STABLE 상태에서는 안정된 샘플

            // ✅ 유속 계산 (60초 슬라이딩 윈도우 기반)
            float flowRate = calculateFlowRate();

            // ✅ 크립 보정: 유속이 매우 낮으면 (<0.3 mL/분) 센서 드리프트로 판단하고 초기 무게 재조정
            if (flowRate >= 0 && flowRate < 0.3 && weight60Full) {
              // 60초 평균 무게 계산
              float avgWeight = 0;
              for (int i = 0; i < 60; i++) {
                avgWeight += weightHistory60[i];
              }
              avgWeight /= 60;

              // 초기 무게와 평균의 차이가 2g 이상이면 드리프트로 판단하고 보정
              float drift = initialWeight - avgWeight;
              if (drift > 2.0) {  // 2g 이상 드리프트
                Serial.print("\n⚙️ 센서 드리프트 감지 및 보정: ");
                Serial.print(initialWeight, 1);
                Serial.print("g → ");
                Serial.print(avgWeight, 1);
                Serial.print("g (드리프트: -");
                Serial.print(drift, 1);
                Serial.println("g)\n");
                initialWeight = avgWeight;  // 초기 무게 업데이트
              }
            }

            // 남은 시간 계산
            float remainingWeight = currentWeight - baselineWeight;
            float remainingTime = calculateRemainingTime(remainingWeight, flowRate);
            float percentage = (remainingWeight / (initialWeight - baselineWeight)) * 100.0;

            // 편차 계산
            float deviation = calculateFlowDeviation(flowRate);

            // === 1초마다 상세 시리얼 출력 (0.1g 단위 고정밀) - 항상 출력 ===
            Serial.print("[");
            Serial.print(millis() / 1000);
            Serial.print("s] ");

            // 무게 정보 (0.1g 단위)
            Serial.print("무게: ");
            Serial.print(currentWeight, 1);
            Serial.print("g (잔량: ");
            Serial.print(remainingWeight, 1);
            Serial.print("g, ");
            Serial.print(percentage, 1);
            Serial.print("%) | ");

            // 유속 비교 (0.01 mL/분 단위)
            if (flowRate > 0) {
              Serial.print("유속: ");
              Serial.print(flowRate, 2);
              Serial.print(" mL/분");

              if (prescription.isInitialized) {
                Serial.print(" (처방: ");
                Serial.print(prescription.prescribedRate, 2);
                Serial.print(", 편차: ");
                if (deviation >= 0) Serial.print("+");
                Serial.print(deviation, 1);
                Serial.print("%)");
              }

              // 60초 샘플 수 표시
              int sampleCount = weight60Full ? 60 : weightIndex60;
              Serial.print(" [");
              Serial.print(sampleCount);
              Serial.print("s]");
            } else {
              // 아직 60초 안됨
              int sampleCount = weightIndex60;
              Serial.print("유속: 측정 중... (");
              Serial.print(sampleCount);
              Serial.print("/60초)");
            }

            Serial.print(" | ");

            // 예상 종료 시간 (분 단위)
            if (remainingTime > 0 && flowRate > 0) {
              Serial.print("예상완료: ");
              if (remainingTime >= 60) {
                int hours = (int)(remainingTime / 60);
                int mins = (int)(remainingTime) % 60;
                Serial.print(hours);
                Serial.print("시간 ");
                Serial.print(mins);
                Serial.print("분");
              } else {
                Serial.print((int)remainingTime);
                Serial.print("분");
              }
              Serial.print(" 후");
            } else {
              Serial.print("예상완료: 계산 중...");
            }

            Serial.println();

            // 백엔드 전송 로직 (조건부)
            if (flowRate > 0 && prescription.isInitialized) {

              // 🔥 이벤트 기반 전송 로직
              bool shouldSendData = false;
              String sendReason = "";

              // 조건 1: 초기 데이터 (1회만)
              if (!initialDataSent) {
                shouldSendData = true;
                sendReason = "초기 데이터";
                initialDataSent = true;
              }
              // 조건 2: 유속 이상 (15% 이상 편차)
              else if (abs(deviation) > DATA_SEND_DEVIATION_THRESHOLD) {
                shouldSendData = true;
                sendReason = "유속 이상";
                sendAlert("FLOW_RATE_ABNORMAL", deviation);
              }
              // 조건 3: 잔여량 부족 (10% 미만)
              else if (percentage < LOW_VOLUME_THRESHOLD) {
                shouldSendData = true;
                sendReason = "잔여량 부족";
                sendAlert("LOW_VOLUME", percentage);
              }
              // 조건 4: 수액 소진 (5% 미만)
              else if (percentage < 5.0) {
                shouldSendData = true;
                sendReason = "수액 소진 임박";
                sendAlert("CRITICAL_LOW", percentage);
              }

              // 중복 전송 방지 (최소 5초 간격)
              if (shouldSendData && (now - lastDataSendTime >= MIN_SEND_INTERVAL)) {
                Serial.print("📤 [백엔드 전송] 사유: ");
                Serial.println(sendReason);
                send_data(currentWeight, flowRate, remainingTime * 60.0, deviation, getStateString(currentState));  // 시간을 초로 변환
                lastDataSendTime = now;
              }
            }

            lastMeasureTime = now;
            digitalWrite(LED_BUILTIN, LOW);  // LED OFF
          }
        }
        lastStableWeight = currentWeight;
        break;

      case UNSTABLE:
        // 불안정 상태에서도 무게 측정 계속 (불안정 플래그로 마킹)
        if (now - lastMeasureTime >= MEASURE_INTERVAL) {
          unsigned long elapsed = now - startMillis;
          addHistory(currentWeight, elapsed);

          // ✅ 불안정 상태에서도 샘플 추가 (안정 플래그 = false)
          addWeightSample(currentWeight, false);

          lastMeasureTime = now;

          // 시리얼 출력 (불안정 상태 표시)
          Serial.print("[");
          Serial.print(millis() / 1000);
          Serial.print("s] ⚠️ 불안정: ");
          Serial.print(currentWeight, 1);
          Serial.println("g (샘플링 계속 중...)");
        }

        // 불안정 상태에서 안정 확인
        if (isWeightStable(currentWeight)) {
          stableCheckCount++;

          if (stableCheckCount >= STABILITY_CHECK_COUNT) {
            currentState = WAITING_STABILIZATION;
            lastStableTime = now;
            stableCheckCount = 0;

            // 안정화 시간 계산 (출력용)
            float weightChange = abs(currentWeight - weightBeforeUnstable);
            unsigned long requiredTime = STABILITY_DURATION;  // 기본 10초
            if (weightChange < 50) {
              requiredTime = MIN_STABILIZATION_TIME;  // 2초
            } else if (weightChange < 200) {
              requiredTime = 5000;  // 5초
            }

            Serial.print("🔄 안정화 대기 시작 (목표: ");
            Serial.print(requiredTime / 1000);
            Serial.print("초, 무게변화: ");
            Serial.print(weightChange, 1);
            Serial.println("g)");
          }
        } else {
          stableCheckCount = 0;  // 다시 흔들리면 카운트 리셋
        }
        lastStableWeight = currentWeight;
        break;

      case WAITING_STABILIZATION:
        // 안정화 대기 중 - 무게 측정 계속 (안정 플래그로 마킹)
        if (now - lastMeasureTime >= MEASURE_INTERVAL) {
          unsigned long elapsed = now - startMillis;
          addHistory(currentWeight, elapsed);

          // ✅ 안정화 대기 중에도 샘플 추가 (안정 플래그 = true, 이미 안정됨)
          addWeightSample(currentWeight, true);

          lastMeasureTime = now;

          // ✅ 안정화 대기 중 상태 출력 (사용자 피드백)
          unsigned long elapsedTime = now - lastStableTime;
          float weightChange = abs(currentWeight - weightBeforeUnstable);
          unsigned long requiredTime = STABILITY_DURATION;  // 기본 10초
          if (weightChange < 50) {
            requiredTime = MIN_STABILIZATION_TIME;  // 2초
          } else if (weightChange < 200) {
            requiredTime = 5000;  // 5초
          }

          Serial.print("[");
          Serial.print(millis() / 1000);
          Serial.print("s] 🔄 안정화 대기: ");
          Serial.print(currentWeight, 1);
          Serial.print("g | 경과: ");
          Serial.print(elapsedTime / 1000);
          Serial.print("/");
          Serial.print(requiredTime / 1000);
          Serial.print("초 | 무게변화: ");
          Serial.print(weightChange, 1);
          Serial.println("g");
        }

        // 재흔들림 감지
        if (!isWeightStable(currentWeight)) {
          currentState = UNSTABLE;
          stableCheckCount = 0;
          Serial.println("⚠️ 재흔들림 감지");
        }
        // 스마트 샘플 복구 로직
        else {
          unsigned long unstableDuration = now - unstableStartTime;  // 불안정 지속 시간
          float weightChange = abs(currentWeight - weightBeforeUnstable);  // 무게 변화량

          // 예상 무게 변화량 계산 (처방 유속 기반)
          float expectedChange = 0;
          if (prescription.isInitialized && prescription.prescribedRate > 0) {
            expectedChange = (prescription.prescribedRate / 60.0) * (unstableDuration / 1000.0);  // mL/초 * 초
          }

          // 스마트 복구 조건: 무게 변화가 예상 범위(±5g) 내
          bool canSmartRecover = (abs(weightChange - expectedChange) <= SMART_RECOVERY_THRESHOLD);

          // 적응형 안정화 시간 계산
          unsigned long requiredStabilizationTime = STABILITY_DURATION;  // 기본 10초
          if (weightChange < 50) {
            requiredStabilizationTime = MIN_STABILIZATION_TIME;  // 작은 흔들림: 2초
          } else if (weightChange < 200) {
            requiredStabilizationTime = 5000;  // 중간 흔들림: 5초
          }

          // 안정화 시간 경과 확인
          if (now - lastStableTime >= requiredStabilizationTime) {
            currentState = STABLE;
            lastMeasureTime = now - MEASURE_INTERVAL;  // 즉시 측정 가능하도록

            if (canSmartRecover) {
              // ✅ 스마트 복구: 60초 샘플 유지 (리셋 안함)
              Serial.print("\n✅ 스마트 복구 완료 (샘플 유지) - 무게 변화: ");
              Serial.print(weightChange, 1);
              Serial.print("g, 예상: ");
              Serial.print(expectedChange, 1);
              Serial.print("g, 불안정 시간: ");
              Serial.print(unstableDuration / 1000);
              Serial.println("초");
              Serial.println("📊 측정 즉시 재개:");
            } else {
              // ❌ 큰 변화 감지: 60초 샘플 리셋
              weightIndex60 = 0;
              weight60Full = false;
              lastWeightSampleTime = now;

              // 안정성 플래그 배열 초기화
              for (int i = 0; i < 60; i++) {
                sampleStability60[i] = true;  // 리셋 시 모두 안정으로 초기화
              }

              Serial.print("\n⚠️ 큰 변화 감지 (샘플 리셋) - 무게 변화: ");
              Serial.print(weightChange, 1);
              Serial.print("g, 예상: ");
              Serial.print(expectedChange, 1);
              Serial.println("g");
              Serial.println("📊 60초 재측정 시작:");
            }

            digitalWrite(LED_BUILTIN, LOW);  // LED OFF
            unstableStartTime = 0;  // 리셋
            weightBeforeUnstable = 0;
          }
        }
        lastStableWeight = currentWeight;
        break;
    }

    lastStableTime = now;
  }

  delay(10);
}

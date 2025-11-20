#include <ESP8266WiFi.h>
#include "HX711.h"
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>  // ArduinoJson 7.4.2

// WiFi and server credentials - loaded from config.h (not tracked by git)
#include "config.h"

// ESP8266 고유 ID (MAC 주소 기반)
String deviceId = "";

// --- 측정 설정값 (0.5초 간격, 120 샘플) ---
const unsigned long MEASURE_INTERVAL = 500;  // 0.5초마다 측정 (120 샘플/분)
const unsigned long PING_INTERVAL = 30000;   // 30초마다 핑 전송
const int HISTORY_SIZE = 120;                // 120개 샘플 (60초 윈도우)
float calibration_factor = 400;              // 로드셀 기본 캘리값

// --- 자동 시작 설정 ---
const float WEIGHT_DETECTION_THRESHOLD = 50.0;  // 50g 이상 증가 시 수액 감지
const unsigned long AUTO_START_DELAY = 10000;   // 10초 대기 후 측정 시작

// --- 이벤트 기반 전송 설정 ---
const float DATA_SEND_DEVIATION_THRESHOLD = 15.0;  // 15% 이상 편차 시 전송
const float CRITICAL_DEVIATION_THRESHOLD = 25.0;   // 25% 이상 편차 시 긴급 전송
const float LOW_VOLUME_THRESHOLD = 10.0;           // 잔여량 10% 미만 시 전송
const unsigned long MIN_SEND_INTERVAL = 5000;      // 최소 5초 간격으로 전송

// --- 간호사 처방 정보 (서버에서 수신) ---
struct PrescriptionInfo {
  float totalVolume;          // 총 수액량 (mL)
  float prescribedRate;       // 처방 유속 (mL/min)
  int gttFactor;              // GTT 계수 (20 or 60)
  int calculatedGTT;          // 계산된 GTT/min
  bool isInitialized;         // 초기화 완료 여부
};

PrescriptionInfo prescription = {0, 0, 20, 0, false};

// --- 검증 데이터 (처방 정보 기반 자동 생성) ---
struct ValidationData {
  float expectedFlowRate;        // 예상 유속 (mL/min) - 처방값과 동일
  float minAcceptableRate;       // 최소 허용 유속 (85%)
  float maxAcceptableRate;       // 최대 허용 유속 (115%)
  float warningDeviationPercent; // 경고 편차 (15%)
  float criticalDeviationPercent;// 긴급 편차 (25%)
  float totalDurationMin;        // 총 투여 시간 (분)
  unsigned long startTimeMs;     // 측정 시작 시각
};

ValidationData validation = {0, 0, 0, 15.0, 25.0, 0, 0};

// --- 측정 상태 관리 (단순화된 4-state 머신) ---
enum SystemState {
  IDLE_NO_PRESCRIPTION,  // 처방 대기 - 간호사 연결 전
  WAITING_WEIGHT,        // 무게 대기 - 수액 걸기 전
  MEASURING,             // 측정 중 - 0.5초마다 120 샘플 수집
  COMPLETED              // 완료 - 수액 소진
};

SystemState currentState = IDLE_NO_PRESCRIPTION;

// --- 무게 측정 데이터 ---
float baselineWeight = 0;       // 영점 (빈 상태)
float initialWeight = 0;        // 수액 걸었을 때 전체 무게
float currentWeight = 0;        // 현재 무게
unsigned long weightDetectedTime = 0;  // 수액 무게 감지 시작 시간
unsigned long measureStartTime = 0;    // 측정 시작 시각

// --- 유속 계산용 슬라이딩 윈도우 (120 샘플, 60초) ---
float weightHistory120[120];    // 최근 120개 샘플 (0.5초마다)
int weightIndex120 = 0;
bool weight120Full = false;     // 120개 샘플이 채워졌는지
unsigned long lastMeasureTime = 0;

// --- 이벤트 기반 전송 제어 ---
unsigned long lastDataSendTime = 0;  // 마지막 데이터 전송 시간
bool initialDataSent = false;        // 초기 데이터 전송 여부 (60초 후 1회)

// --- 핑 제어 ---
unsigned long lastPingTime = 0;

// --- WiFi 상태 ---
const unsigned long WIFI_RECONNECT_INTERVAL = 30000;
unsigned long lastWifiCheck = 0;
bool wifiConnected = false;

// --- 센서 에러 처리 ---
const float SENSOR_ERROR_VALUE = -999.0;
const int MAX_SENSOR_READ_ATTEMPTS = 3;
int sensorErrorCount = 0;

HX711 scale;
WiFiClient client;
HTTPClient http;

// ==================== 유틸리티 함수 ====================

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
  if (!scale.wait_ready_timeout(1000)) {
    Serial.println("[SENSOR ERROR] Sensor not ready after timeout");
    sensorErrorCount++;
    if (sensorErrorCount >= 5) {
      Serial.println("[SENSOR ERROR] Multiple failures - check hardware connection");
      sensorErrorCount = 0;
    }
    return SENSOR_ERROR_VALUE;
  }

  for (int attempt = 1; attempt <= MAX_SENSOR_READ_ATTEMPTS; attempt++) {
    scale.set_scale(calibration_factor);
    float weight = scale.get_units(10);  // 10회 평균

    if (weight > -100 && weight < 10000) {
      sensorErrorCount = 0;
      return weight;
    }

    Serial.print("[SENSOR WARNING] Unusual reading: ");
    Serial.print(weight);
    Serial.print("g (attempt ");
    Serial.print(attempt);
    Serial.println("/3)");

    if (attempt < MAX_SENSOR_READ_ATTEMPTS) {
      delay(100);
    }
  }

  Serial.println("[SENSOR ERROR] All read attempts failed");
  sensorErrorCount++;
  return SENSOR_ERROR_VALUE;
}

// --- 무게 샘플 추가 (0.5초마다 호출) ---
void addWeightSample(float weight) {
  weightHistory120[weightIndex120] = weight;
  weightIndex120++;
  if (weightIndex120 >= 120) {
    weightIndex120 = 0;
    weight120Full = true;
  }
}

// --- 유속 계산 (120 샘플, 60초 윈도우) ---
// 가장 오래된 샘플 - 가장 최신 샘플 = 60초간 감소량 = mL/min
float calculateFlowRate() {
  if (!weight120Full) {
    return -1;  // 아직 60초 대기 중
  }

  float oldest = weightHistory120[0];        // 가장 오래된 샘플
  float newest = weightHistory120[119];      // 가장 최신 샘플
  float weightChange = oldest - newest;

  // 비정상 값 체크 (무게 증가는 비정상)
  if (weightChange < 0) {
    return 0;
  }

  // 60초간 감소량 = mL/min (1g = 1mL 가정)
  return weightChange;
}

// --- 남은 시간 계산 (분 단위) ---
float calculateRemainingTime(float remainingWeight, float measuredFlowRate) {
  if (measuredFlowRate <= 0 || remainingWeight <= 0) {
    return -1;
  }
  return remainingWeight / measuredFlowRate;  // 분 단위
}

// --- 유속 편차 계산 (%) ---
float calculateFlowDeviation(float measuredRate) {
  if (!prescription.isInitialized || prescription.prescribedRate <= 0) {
    return 0;
  }
  float deviation = (measuredRate - prescription.prescribedRate) / prescription.prescribedRate;
  return deviation * 100.0;
}

// --- 검증 데이터 생성 (처방 정보 기반) ---
void generateValidationData() {
  if (!prescription.isInitialized) {
    Serial.println("❌ 처방 정보 없음 - 검증 데이터 생성 불가");
    return;
  }

  validation.expectedFlowRate = prescription.prescribedRate;
  validation.minAcceptableRate = prescription.prescribedRate * 0.85;  // 85%
  validation.maxAcceptableRate = prescription.prescribedRate * 1.15;  // 115%
  validation.warningDeviationPercent = 15.0;
  validation.criticalDeviationPercent = 25.0;
  validation.totalDurationMin = prescription.totalVolume / prescription.prescribedRate;
  validation.startTimeMs = millis();

  Serial.println("\n✅ 검증 데이터 생성 완료:");
  Serial.print("  예상 유속: ");
  Serial.print(validation.expectedFlowRate, 2);
  Serial.println(" mL/min");
  Serial.print("  허용 범위: ");
  Serial.print(validation.minAcceptableRate, 2);
  Serial.print(" ~ ");
  Serial.print(validation.maxAcceptableRate, 2);
  Serial.println(" mL/min");
  Serial.print("  총 투여 시간: ");
  Serial.print(validation.totalDurationMin, 1);
  Serial.println(" 분");
  Serial.print("  GTT: ");
  Serial.print(prescription.calculatedGTT);
  Serial.println(" 방울/분");
}

// ==================== 네트워크 함수 ====================

// --- 핑 전송 (30초마다) ---
void sendPing() {
  if (WiFi.status() != WL_CONNECTED) return;

  static int batteryLevel = 100;
  if (millis() > 60000) {
    batteryLevel = max(20, 100 - (int)((millis() - 60000) / 600000));
  }

  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["battery_level"] = batteryLevel;

  String json;
  serializeJson(doc, json);

  http.begin(client, serverHost, serverPort, "/api/esp/ping");
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);

  Serial.println("[PING] Sending: " + json);
  int code = http.POST(json);

  if (code == 200) {
    String response = http.getString();
    Serial.print("[PING] Success (Battery: ");
    Serial.print(batteryLevel);
    Serial.println("%)");

    // ✅ 응답 JSON 파싱
    JsonDocument responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);

    if (!error && responseDoc.containsKey("prescription_available")) {
      bool prescriptionAvailable = responseDoc["prescription_available"] | false;

      // ✅ 처방 정보 있고, 현재 대기 상태면 즉시 요청
      if (prescriptionAvailable && currentState == IDLE_NO_PRESCRIPTION) {
        Serial.println("🔔 처방 정보 감지! 자동 요청 중...");

        if (requestPrescriptionInfo()) {
          Serial.println("✅ 처방 정보 수신 완료 - 수액 대기 상태로 전환");
          currentState = WAITING_WEIGHT;
        } else {
          Serial.println("⚠️ 처방 정보 요청 실패 - 다음 핑에서 재시도");
        }
      } else if (!prescriptionAvailable && currentState == IDLE_NO_PRESCRIPTION) {
        Serial.println("⏳ 처방 대기 중... (간호사가 환자 연결 및 처방 입력 필요)");
      }
    }

    digitalWrite(LED_BUILTIN, LOW);
    delay(100);
    digitalWrite(LED_BUILTIN, HIGH);
  } else if (code > 0) {
    Serial.print("[PING] HTTP Error: ");
    Serial.println(code);
  } else {
    Serial.print("[PING] Connection failed: ");
    Serial.println(http.errorToString(code));
  }
  http.end();
}

// --- 경고 전송 ---
void sendAlert(const char* alertType, float deviationPercent) {
  if (WiFi.status() != WL_CONNECTED) return;

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

// --- 데이터 전송 ---
void sendData(float currentWeight, float measuredRate, float remainingTime,
              float deviation, const char* state) {

  float remainingWeight = currentWeight - baselineWeight;
  float consumedWeight = initialWeight - currentWeight;

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

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.print("❌ JSON 파싱 실패: ");
      Serial.println(error.c_str());
      http.end();
      return false;
    }

    if (doc.containsKey("data") && doc["data"].is<JsonObject>()) {
      JsonObject data = doc["data"].as<JsonObject>();

      if (data.containsKey("total_volume_ml") && data.containsKey("flow_rate_ml_min")) {
        prescription.totalVolume = data["total_volume_ml"].as<float>();
        prescription.prescribedRate = data["flow_rate_ml_min"].as<float>();

        if (data.containsKey("gtt_factor")) {
          prescription.gttFactor = data["gtt_factor"].as<int>();
        } else {
          prescription.gttFactor = 20;
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

        // 검증 데이터 자동 생성
        generateValidationData();

        http.end();
        return true;
      } else {
        Serial.println("❌ 필수 필드 누락 (total_volume_ml, flow_rate_ml_min)");
      }
    } else {
      Serial.println("❌ 'data' 필드 없음 또는 잘못된 형식");
    }
  } else {
    Serial.print("❌ 처방 정보 요청 실패: ");
    Serial.println(httpCode);
  }

  http.end();
  return false;
}

// --- 상태 문자열 변환 ---
const char* getStateString(SystemState state) {
  switch(state) {
    case IDLE_NO_PRESCRIPTION: return "IDLE_NO_PRESCRIPTION";
    case WAITING_WEIGHT: return "WAITING_WEIGHT";
    case MEASURING: return "MEASURING";
    case COMPLETED: return "COMPLETED";
    default: return "UNKNOWN";
  }
}

// ==================== 초기화 ====================

void setup() {
  delay(1000);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);

  ESP.wdtDisable();
  ESP.wdtEnable(8000);
  delay(1000);
  Serial.println("\n\n=== Smart IV Pole - Simplified Monitoring System ===");

  // Generate unique device ID from MAC address
  uint8_t mac[6];
  WiFi.macAddress(mac);
  deviceId = "IV_POLE_";
  for (int i = 2; i < 6; i++) {
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

    baselineWeight = testWeight;  // 영점 자동 설정
    Serial.print("[SENSOR] Baseline weight set: ");
    Serial.print(baselineWeight);
    Serial.println(" g");
  } else {
    Serial.println("[SENSOR ERROR] HX711 not detected!");
    Serial.println("[SENSOR ERROR] Check wiring:");
    Serial.println("  - DT pin: D5");
    Serial.println("  - SCK pin: D6");
    Serial.println("  - VCC: 3.3V (NOT 5V)");
    Serial.println("  - GND: GND");
  }

  delay(2000);

  // WiFi 연결
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

    Serial.println("\n⏳ 간호사 대시보드 연결 대기 중...");
    Serial.println("💡 간호사가 환자-폴대 연결 후 처방 정보를 받습니다");
    currentState = IDLE_NO_PRESCRIPTION;
  } else {
    Serial.println("\n❌ WiFi 연결 실패");
    currentState = IDLE_NO_PRESCRIPTION;
  }

  lastMeasureTime = millis();
  lastPingTime = millis();

  Serial.println("\n🚀 시스템 준비 완료!");
  Serial.println("명령어:");
  Serial.println("  'i' - 처방 정보 다시 요청");
  Serial.println("  's' - 현재 상태 확인");

  ESP.wdtFeed();
}

// ==================== 메인 루프 ====================

void loop() {
  ESP.wdtFeed();
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
    if (command == 'i') {
      Serial.println("처방 정보 재요청...");
      if (requestPrescriptionInfo()) {
        currentState = WAITING_WEIGHT;
      }
    } else if (command == 's') {
      Serial.println("\n=== 현재 상태 ===");
      Serial.print("상태: ");
      Serial.println(getStateString(currentState));
      Serial.print("현재 무게: ");
      Serial.print(currentWeight, 2);
      Serial.println(" g");
      Serial.print("영점 무게: ");
      Serial.print(baselineWeight, 2);
      Serial.println(" g");

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

      if (currentState == MEASURING) {
        Serial.print("측정 샘플: ");
        Serial.print(weight120Full ? 120 : weightIndex120);
        Serial.print("/120 (");
        Serial.print(weight120Full ? "준비됨" : "대기 중");
        Serial.println(")");
      }
    }
  }

  // ==================== 상태 머신 ====================

  switch (currentState) {

    // --- 상태 1: 처방 대기 ---
    case IDLE_NO_PRESCRIPTION:
      // 처방 정보를 받을 때까지 대기
      // 간호사가 대시보드에서 연결하면 자동으로 처방 정보 수신
      delay(1000);
      break;

    // --- 상태 2: 무게 대기 (수액 걸기 전) ---
    case WAITING_WEIGHT:
      // 무게 감지: 영점보다 50g 이상 증가
      currentWeight = safeReadSensor();

      if (currentWeight == SENSOR_ERROR_VALUE) {
        delay(1000);
        break;
      }

      if (currentWeight - baselineWeight > WEIGHT_DETECTION_THRESHOLD) {
        // 첫 감지
        if (weightDetectedTime == 0) {
          weightDetectedTime = now;
          Serial.print("🔍 수액 감지됨 (");
          Serial.print(currentWeight - baselineWeight);
          Serial.println(" g) - 10초 후 측정 시작...");
        }

        // 10초 경과 확인
        if (now - weightDetectedTime >= AUTO_START_DELAY) {
          initialWeight = currentWeight;
          measureStartTime = now;

          // 샘플링 초기화
          weightIndex120 = 0;
          weight120Full = false;
          lastMeasureTime = now;

          Serial.print("✅ 초기 무게 자동 저장: ");
          Serial.print(initialWeight);
          Serial.println(" g");
          Serial.println("📊 측정 시작! (60초 후 유속 계산 시작)");

          currentState = MEASURING;
          weightDetectedTime = 0;
        }
      } else {
        // 무게가 줄어들면 리셋
        weightDetectedTime = 0;
      }

      delay(500);
      break;

    // --- 상태 3: 측정 중 (0.5초마다 샘플링) ---
    case MEASURING:
      // 0.5초마다 측정
      if (now - lastMeasureTime >= MEASURE_INTERVAL) {
        currentWeight = safeReadSensor();

        if (currentWeight == SENSOR_ERROR_VALUE) {
          lastMeasureTime = now;
          break;
        }

        // 샘플 추가
        addWeightSample(currentWeight);

        // 유속 계산 (60초 후부터)
        float flowRate = calculateFlowRate();
        float remainingWeight = currentWeight - baselineWeight;
        float remainingTime = calculateRemainingTime(remainingWeight, flowRate);
        float percentage = 0;
        if (initialWeight - baselineWeight > 0) {
          percentage = (remainingWeight / (initialWeight - baselineWeight)) * 100.0;
        }
        float deviation = calculateFlowDeviation(flowRate);

        // 1초 간격으로 상세 출력 (0.5초마다 측정하지만 2번에 1번만 출력)
        if (weightIndex120 % 2 == 0) {
          Serial.print("[");
          Serial.print(now / 1000);
          Serial.print("s] 무게: ");
          Serial.print(currentWeight, 1);
          Serial.print("g (잔량: ");
          Serial.print(remainingWeight, 1);
          Serial.print("g, ");
          Serial.print(percentage, 1);
          Serial.print("%) | ");

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
          } else {
            Serial.print("유속: 측정 중... (");
            Serial.print(weightIndex120);
            Serial.print("/120)");
          }

          Serial.print(" | ");

          if (remainingTime > 0 && flowRate > 0) {
            Serial.print("예상완료: ");
            Serial.print((int)remainingTime);
            Serial.print("분 후");
          } else {
            Serial.print("예상완료: 계산 중...");
          }

          Serial.println();
        }

        // 이벤트 기반 전송 로직
        if (flowRate > 0 && prescription.isInitialized) {
          bool shouldSendData = false;
          String sendReason = "";

          // 조건 1: 초기 데이터 (60초 후 1회만)
          if (!initialDataSent && weight120Full) {
            shouldSendData = true;
            sendReason = "초기 데이터 (60초 경과)";
            initialDataSent = true;
          }
          // 조건 2: 긴급 편차 (25% 이상)
          else if (abs(deviation) > CRITICAL_DEVIATION_THRESHOLD) {
            shouldSendData = true;
            sendReason = "긴급 유속 이상";
            sendAlert("FLOW_RATE_CRITICAL", deviation);
          }
          // 조건 3: 경고 편차 (15% 이상)
          else if (abs(deviation) > DATA_SEND_DEVIATION_THRESHOLD) {
            shouldSendData = true;
            sendReason = "유속 이상";
            sendAlert("FLOW_RATE_ABNORMAL", deviation);
          }
          // 조건 4: 잔여량 부족 (10% 미만)
          else if (percentage < LOW_VOLUME_THRESHOLD) {
            shouldSendData = true;
            sendReason = "잔여량 부족";
            sendAlert("LOW_VOLUME", percentage);
          }
          // 조건 5: 수액 소진 (5% 미만)
          else if (percentage < 5.0) {
            shouldSendData = true;
            sendReason = "수액 소진 임박";
            sendAlert("CRITICAL_LOW", percentage);
          }

          // 중복 전송 방지 (최소 5초 간격)
          if (shouldSendData && (now - lastDataSendTime >= MIN_SEND_INTERVAL)) {
            Serial.print("📤 [백엔드 전송] 사유: ");
            Serial.println(sendReason);
            sendData(currentWeight, flowRate, remainingTime * 60.0, deviation, getStateString(currentState));
            lastDataSendTime = now;
          }
        }

        // 완료 조건: 잔여량 1% 미만
        if (percentage < 1.0 && flowRate > 0) {
          Serial.println("\n✅ 수액 투여 완료!");
          currentState = COMPLETED;
        }

        lastMeasureTime = now;
      }
      break;

    // --- 상태 4: 완료 ---
    case COMPLETED:
      Serial.println("측정 종료됨");
      delay(5000);
      break;
  }

  delay(10);
}

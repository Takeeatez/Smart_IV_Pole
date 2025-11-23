#include <ESP8266WiFi.h>
#include "HX711.h"
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#include "config.h"

String deviceId = "";

// --- 측정 모드 선택 ---
enum MeasurementMode {
  PRODUCTION_MODE,  // 실제 운영 모드 (다중 주기 통합)
  TEST_MODE         // 테스트 모드 (주기 변경 가능)
};

MeasurementMode currentMode = PRODUCTION_MODE;

// ========== 운영 모드 - 다중 주기 변수 ==========
const int NUM_INTERVALS = 4;
unsigned long INTERVALS[NUM_INTERVALS] = {40000, 50000, 60000, 70000};  // 40, 50, 60, 70초
String intervalNames[NUM_INTERVALS] = {"40초", "50초", "60초", "70초"};

struct IntervalData {
  unsigned long lastMeasureTime;
  float previousWeight;
  float currentFlowRate;
  float totalFlowSum;
  int measurementCount;
  float minFlowRate;
  float maxFlowRate;
};

// 서버에 전송된 데이터 유무
struct ServerLastData {
  float lastFlowRate;
  int lastRemainingVolume;
  float lastDeviation;
  bool hasData;
};

ServerLastData serverLastData = {0, 0, 0, false};

IntervalData intervalData[NUM_INTERVALS];
float combinedAverageFlowRate = 0;
int totalCombinedMeasurements = 0;

const unsigned long PING_INTERVAL = 30000;
const unsigned long PRESCRIPTION_REQUEST_INTERVAL = 60000;
float calibration_factor = 400;

const float WEIGHT_DETECTION_THRESHOLD = 50.0;
const unsigned long AUTO_START_DELAY = 10000;

const float EMPTY_BAG_WEIGHT = 100.0;  // 빈 수액팩 무게
const float WARNING_DEVIATION_THRESHOLD = 10.0;   // 10% 이상 주의 (전송)
const float CRITICAL_DEVIATION_THRESHOLD = 20.0;  // 20% 이상 위험
const float LOW_VOLUME_THRESHOLD = 10.0;
const unsigned long MIN_SEND_INTERVAL = 5000;

struct PrescriptionInfo {
  float totalVolume;
  float prescribedRate;
  int gttFactor;
  int calculatedGTT;
  bool isInitialized;
};

PrescriptionInfo prescription = {0, 0, 20, 0, false};

struct ValidationData {
  float expectedFlowRate;
  float minAcceptableRate;
  float maxAcceptableRate;
  float warningDeviationPercent;
  float criticalDeviationPercent;
  float totalDurationMin;
  unsigned long startTimeMs;
};

ValidationData validation = {0, 0, 0, 15.0, 25.0, 0, 0};

enum SystemState {
  WAITING_WEIGHT,
  MEASURING,
  COMPLETED
};

SystemState currentState = WAITING_WEIGHT;

float baselineWeight = 0;
float initialWeight = 0;
float currentWeight = 0;
unsigned long weightDetectedTime = 0;
unsigned long measureStartTime = 0;

unsigned long lastDataSendTime = 0;
bool initialDataSent = false;

unsigned long lastPingTime = 0;
unsigned long lastPrescriptionRequestTime = 0;
bool prescriptionRequestFailed = false;  // ✅ 추가: 실패 여부 플래그

const unsigned long WIFI_RECONNECT_INTERVAL = 30000;
unsigned long lastWifiCheck = 0;
bool wifiConnected = false;

const float SENSOR_ERROR_VALUE = -999.0;
const int MAX_SENSOR_READ_ATTEMPTS = 3;
int sensorErrorCount = 0;

// ========== 테스트 모드 변수 ==========
unsigned long TEST_MEASURE_INTERVAL = 60000;
unsigned long lastTestMeasureTime = 0;
float testPreviousWeight = 0;
float testCurrentFlowRate = 0;
float testTotalFlowSum = 0;
int testMeasurementCount = 0;
float testMinFlowRate = 99999;
float testMaxFlowRate = -99999;

HX711 scale;
WiFiClient client;
HTTPClient http;

// ==================== 센서 함수 ====================

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
      }
    } else {
      wifiConnected = true;
    }
  }
}

float safeReadSensor() {
  if (!scale.wait_ready_timeout(1000)) {
    Serial.println("[SENSOR ERROR] Sensor not ready");
    sensorErrorCount++;
    return SENSOR_ERROR_VALUE;
  }

  for (int attempt = 1; attempt <= MAX_SENSOR_READ_ATTEMPTS; attempt++) {
    scale.set_scale(calibration_factor);
    float weight = scale.get_units(10);

    if (weight > -100 && weight < 10000) {
      sensorErrorCount = 0;
      return weight;
    }

    if (attempt < MAX_SENSOR_READ_ATTEMPTS) {
      delay(100);
    }
  }

  Serial.println("[SENSOR ERROR] All read attempts failed");
  sensorErrorCount++;
  return SENSOR_ERROR_VALUE;
}

// ==================== 운영 모드 - 다중 주기 함수 ====================

float calculateFlowRate(float prevWeight, float currWeight, unsigned long intervalMs) {
  if (prevWeight <= 0 || currWeight <= 0) {
    return 0;
  }
  
  float weightChange = prevWeight - currWeight;
  
  if (weightChange < 0) {
    return 0;
  }
  
  if (weightChange < 0.1) {
    return 0;
  }
  
  float actualInterval = intervalMs / 1000.0;
  float flowRatePerMin = (weightChange / actualInterval) * 60.0;
  
  return flowRatePerMin;
}

void calculateCombinedAverage() {
  float sum = 0;
  int count = 0;
  
  for (int i = 0; i < NUM_INTERVALS; i++) {
    if (intervalData[i].measurementCount > 0) {
      float avg = intervalData[i].totalFlowSum / intervalData[i].measurementCount;
      sum += avg;
      count++;
    }
  }
  
  if (count > 0) {
    combinedAverageFlowRate = sum / count;
    totalCombinedMeasurements = count;
  }
}

void configureIntervals() {
  Serial.println("\n╔════════════════════════════════════════════════════════════╗");
  Serial.println("║            측정 주기 설정 (4개)                          ║");
  Serial.println("╚════════════════════════════════════════════════════════════╝");
  Serial.println();
  Serial.println("4개의 측정 주기를 초 단위로 입력하세요 (5~300초)");
  Serial.println("예시: 40,50,60,70  →  40초, 50초, 60초, 70초");
  Serial.println();
  Serial.print("입력: ");
  
  while (!Serial.available()) {
    delay(100);
  }
  
  String input = Serial.readStringUntil('\n');
  input.trim();
  Serial.println(input);
  
  int values[NUM_INTERVALS];
  int valueCount = 0;
  int startIndex = 0;
  
  for (int i = 0; i <= input.length(); i++) {
    if (i == input.length() || input.charAt(i) == ',') {
      String token = input.substring(startIndex, i);
      token.trim();
      
      if (token.length() > 0 && valueCount < NUM_INTERVALS) {
        values[valueCount] = token.toInt();
        valueCount++;
      }
      startIndex = i + 1;
    }
  }
  
  if (valueCount == NUM_INTERVALS) {
    bool allValid = true;
    for (int i = 0; i < NUM_INTERVALS; i++) {
      if (values[i] < 5 || values[i] > 300) {
        allValid = false;
        break;
      }
    }
    
    if (allValid) {
      for (int i = 0; i < NUM_INTERVALS; i++) {
        INTERVALS[i] = values[i] * 1000;
        intervalNames[i] = String(values[i]) + "초";
      }
      
      Serial.println("\n측정 주기 설정 완료:");
      for (int i = 0; i < NUM_INTERVALS; i++) {
        Serial.print("  주기 ");
        Serial.print(i + 1);
        Serial.print(": ");
        Serial.println(intervalNames[i]);
      }
    } else {
      Serial.println("\n오류: 각 주기는 5~300초 사이여야 합니다");
      Serial.println("기본값 유지: 40초, 50초, 60초, 70초");
    }
  } else {
    Serial.print("\n오류: 정확히 4개의 값을 입력해야 합니다 (입력된 값: ");
    Serial.print(valueCount);
    Serial.println("개)");
    Serial.println("기본값 유지: 40초, 50초, 60초, 70초");
  }
  
  Serial.println();
}

void printMultiStatistics() {
  Serial.println("\n╔════════════════════════════════════════════════════════════╗");
  Serial.println("║          📊 다중 주기 측정 통합 통계                      ║");
  Serial.println("╚════════════════════════════════════════════════════════════╝");
  
  for (int i = 0; i < NUM_INTERVALS; i++) {
    Serial.println();
    Serial.print("┌─ ");
    Serial.print(intervalNames[i]);
    Serial.println(" 주기 ─────────────────────────────");
    
    if (intervalData[i].measurementCount > 0) {
      float avg = intervalData[i].totalFlowSum / intervalData[i].measurementCount;
      float range = intervalData[i].maxFlowRate - intervalData[i].minFlowRate;
      float variability = (avg > 0) ? (range / avg) * 100.0 : 0;
      
      Serial.print("│ 측정 횟수: ");
      Serial.println(intervalData[i].measurementCount);
      Serial.print("│ 평균 유속: ");
      Serial.print(avg, 2);
      Serial.println(" mL/분");
      Serial.print("│ 최소 유속: ");
      Serial.print(intervalData[i].minFlowRate, 2);
      Serial.println(" mL/분");
      Serial.print("│ 최대 유속: ");
      Serial.print(intervalData[i].maxFlowRate, 2);
      Serial.println(" mL/분");
      Serial.print("│ 범위: ");
      Serial.print(range, 2);
      Serial.println(" mL/분");
      Serial.print("│ 변동성: ");
      Serial.print(variability, 1);
      Serial.println(" %");
    } else {
      Serial.println("│ 측정 데이터 없음");
    }
    
    Serial.println("└───────────────────────────────────────────");
  }
  
  Serial.println();
  Serial.println("╔════════════════════════════════════════════════════════════╗");
  Serial.println("║                 통합 평균 유속 (4개 주기 평균)               ║");
  Serial.println("╚════════════════════════════════════════════════════════════╝");
  
  if (totalCombinedMeasurements > 0) {
    Serial.print("  활성 주기: ");
    Serial.print(totalCombinedMeasurements);
    Serial.print("/");
    Serial.println(NUM_INTERVALS);
    Serial.print("  📌 통합 평균 유속: ");
    Serial.print(combinedAverageFlowRate, 2);
    Serial.println(" mL/분");
    
    Serial.println("\n  계산 방식:");
    for (int i = 0; i < NUM_INTERVALS; i++) {
      if (intervalData[i].measurementCount > 0) {
        float avg = intervalData[i].totalFlowSum / intervalData[i].measurementCount;
        Serial.print("    - ");
        Serial.print(intervalNames[i]);
        Serial.print(": ");
        Serial.print(avg, 2);
        Serial.println(" mL/분");
      }
    }
  } else {
    Serial.println("  아직 측정 데이터 없음");
  }
  
  Serial.println("╚════════════════════════════════════════════════════════════╝\n");
}

float calculateRemainingTime(float remainingWeight, float measuredFlowRate) {
  if (measuredFlowRate <= 0 || remainingWeight <= 0) {
    return -1;
  }
  return remainingWeight / measuredFlowRate;
}

float calculateFlowDeviation(float measuredRate) {
  if (!prescription.isInitialized || prescription.prescribedRate <= 0) {
    return 0;
  }
  float deviation = (measuredRate - prescription.prescribedRate) / prescription.prescribedRate;
  return deviation * 100.0;
}

String getDeviationStatus(float deviation) {
  float absDeviation = abs(deviation);
  if (absDeviation < WARNING_DEVIATION_THRESHOLD) {
    return "✅ 정상";
  } else if (absDeviation < CRITICAL_DEVIATION_THRESHOLD) {
    return "⚠️ 주의";
  } else {
    return "🚨 위험";
  }
}

void generateValidationData() {
  if (!prescription.isInitialized) {
    return;
  }

  validation.expectedFlowRate = prescription.prescribedRate;
  validation.minAcceptableRate = prescription.prescribedRate * 0.85;
  validation.maxAcceptableRate = prescription.prescribedRate * 1.15;
  validation.warningDeviationPercent = 15.0;
  validation.criticalDeviationPercent = 25.0;
  validation.totalDurationMin = prescription.totalVolume / prescription.prescribedRate;
  validation.startTimeMs = millis();

  Serial.println("\n✅ 검증 데이터 생성 완료:");
  Serial.print("  예상 유속: ");
  Serial.print(validation.expectedFlowRate, 2);
  Serial.println(" mL/min");
}

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

  int code = http.POST(json);

  if (code == 200) {
    // ✅ 응답 파싱하여 서버의 최근 데이터 저장
    String payload = http.getString();
    
    JsonDocument responseDoc;
    DeserializationError error = deserializeJson(responseDoc, payload);
    
    if (!error && responseDoc.containsKey("last_data")) {
      JsonObject lastData = responseDoc["last_data"].as<JsonObject>();
      
      if (!lastData.isNull()) {
        serverLastData.lastFlowRate = lastData["flow_rate"].as<float>();
        serverLastData.lastRemainingVolume = lastData["remaining_volume"].as<int>();
        serverLastData.lastDeviation = lastData["deviation"].as<float>();
        serverLastData.hasData = true;
        
        Serial.println("[PING] 서버 최근 데이터:");
        Serial.print("  유속: ");
        Serial.print(serverLastData.lastFlowRate, 2);
        Serial.println(" mL/분");
        Serial.print("  잔량: ");
        Serial.print(serverLastData.lastRemainingVolume);
        Serial.println(" mL");
      } else {
        serverLastData.hasData = false;
      }
    }
    
    digitalWrite(LED_BUILTIN, LOW);
    delay(100);
    digitalWrite(LED_BUILTIN, HIGH);
  }
  http.end();
}

// ========== 데이터 전송 전 중복 확인 함수 추가 ==========
bool shouldSendData(float currentFlowRate, int currentRemaining, float currentDeviation) {
  // 서버에 데이터가 없으면 무조건 전송
  if (!serverLastData.hasData) {
    return true;
  }
  
  // 변화량 임계값 설정
  const float FLOW_RATE_THRESHOLD = 1.0;      // 1 mL/분 이상 차이
  const int REMAINING_THRESHOLD = 5;          // 5 mL 이상 차이
  const float DEVIATION_THRESHOLD = 2.0;      // 2% 이상 차이
  
  // 유속 변화 확인
  float flowRateDiff = abs(currentFlowRate - serverLastData.lastFlowRate);
  if (flowRateDiff >= FLOW_RATE_THRESHOLD) {
    Serial.print("📊 유속 변화 감지: ");
    Serial.print(flowRateDiff, 2);
    Serial.println(" mL/분");
    return true;
  }
  
  // 잔량 변화 확인
  int remainingDiff = abs(currentRemaining - serverLastData.lastRemainingVolume);
  if (remainingDiff >= REMAINING_THRESHOLD) {
    Serial.print("📊 잔량 변화 감지: ");
    Serial.print(remainingDiff);
    Serial.println(" mL");
    return true;
  }
  
  // 편차 변화 확인
  float deviationDiff = abs(currentDeviation - serverLastData.lastDeviation);
  if (deviationDiff >= DEVIATION_THRESHOLD) {
    Serial.print("📊 편차 변화 감지: ");
    Serial.print(deviationDiff, 2);
    Serial.println(" %");
    return true;
  }
  
  Serial.println("📊 변화 없음 - 전송 생략");
  return false;
}

void sendAlert(const char* alertType, float value) {
  if (WiFi.status() != WL_CONNECTED) return;

  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["alert_type"] = alertType;
  doc["value"] = value;
  doc["deviation_percent"] = value;  // ✅ 서버 호환성
  doc["timestamp"] = millis();

  String json;
  serializeJson(doc, json);

  http.begin(client, serverHost, serverPort, "/api/esp/alert");
  http.addHeader("Content-Type", "application/json");
  http.POST(json);
  http.end();
}

void sendData(float currentWeight, float measuredRate, float remainingTime,
              float deviation, const char* state) {

  float remainingLiquidWeight = currentWeight - EMPTY_BAG_WEIGHT - baselineWeight;
  float initialLiquidWeight = initialWeight - EMPTY_BAG_WEIGHT - baselineWeight;
  float consumedWeight = initialLiquidWeight - remainingLiquidWeight;

  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["current_weight"] = currentWeight;
  doc["initial_weight"] = initialWeight;
  doc["baseline_weight"] = baselineWeight;
  doc["weight_consumed"] = consumedWeight;
  doc["weight_remaining"] = remainingLiquidWeight;
  doc["flow_rate_measured"] = measuredRate;
  doc["flow_rate_prescribed"] = prescription.isInitialized ? prescription.prescribedRate : 0;
  doc["remaining_time_sec"] = remainingTime;
  doc["deviation_percent"] = deviation;
  doc["state"] = state;
  doc["prescription_available"] = prescription.isInitialized;
  doc["timestamp"] = millis();

  String json;
  serializeJson(doc, json);

  if (WiFi.status() == WL_CONNECTED) {
    http.begin(client, serverHost, serverPort, serverPath);
    http.addHeader("Content-Type", "application/json");

    Serial.println("📤 데이터 전송");

    int code = http.POST(json);
    if (code == 200) {
      Serial.println("✅ 전송 성공");
    } else {
      Serial.print("❌ 전송 실패: ");
      Serial.println(code);
    }
    http.end();
  }
}

void requestPrescriptionInfo() {
  unsigned long now = millis();
  
  // ✅ 이미 초기화되었으면 주기적으로만 재요청
  if (prescription.isInitialized) {
    if (now - lastPrescriptionRequestTime < PRESCRIPTION_REQUEST_INTERVAL) {
      return;
    }
  }
  
  // ✅ 실패했으면 재요청하지 않음 (한번만 시도)
  if (prescriptionRequestFailed) {
    return;
  }

  if (WiFi.status() != WL_CONNECTED) {
    return;
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

    if (!error && doc.containsKey("data")) {
      JsonObject data = doc["data"].as<JsonObject>();

      if (data.containsKey("total_volume_ml") && data.containsKey("flow_rate_ml_min")) {
        prescription.totalVolume = data["total_volume_ml"].as<float>();
        prescription.prescribedRate = data["flow_rate_ml_min"].as<float>();
        prescription.gttFactor = data.containsKey("gtt_factor") ? data["gtt_factor"].as<int>() : 20;
        prescription.calculatedGTT = data.containsKey("calculated_gtt") ? 
                                      data["calculated_gtt"].as<int>() : 
                                      (int)(prescription.prescribedRate * prescription.gttFactor);
        prescription.isInitialized = true;
        prescriptionRequestFailed = false;  // ✅ 성공 시 플래그 리셋

        Serial.println("\n╔════════════════════════════════════════════════════════════╗");
        Serial.println("║           ✅ 처방 정보 수신 완료!                        ║");
        Serial.println("╚════════════════════════════════════════════════════════════╝");
        Serial.print("  📌 총 투여량: ");
        Serial.print(prescription.totalVolume, 0);
        Serial.println(" mL");
        Serial.print("  📌 처방 유속: ");
        Serial.print(prescription.prescribedRate, 2);
        Serial.println(" mL/분");
        Serial.print("  📌 GTT Factor: ");
        Serial.println(prescription.gttFactor);
        Serial.print("  📌 계산된 GTT: ");
        Serial.print(prescription.calculatedGTT);
        Serial.println(" 방울/분");
        Serial.print("  📌 예상 시간: ");
        float expectedTime = prescription.totalVolume / prescription.prescribedRate;
        Serial.print(expectedTime, 1);
        Serial.print(" 분 (");
        Serial.print(expectedTime / 60.0, 1);
        Serial.println(" 시간)");
        Serial.println("────────────────────────────────────────────────────────────");
        Serial.println("  💡 이제 측정값과 처방값을 비교하여 편차를 모니터링합니다.");
        Serial.println("╚════════════════════════════════════════════════════════════╝\n");

        generateValidationData();
        lastPrescriptionRequestTime = now;

        http.end();
        return;
      }
    }
  } else if (httpCode > 0) {
    // ✅ 실패 시 한번만 출력
    if (!prescriptionRequestFailed) {
      Serial.print("⚠️ 처방 정보 요청 실패: HTTP ");
      Serial.println(httpCode);
      prescriptionRequestFailed = true;  // ✅ 플래그 설정
    }
  }

  lastPrescriptionRequestTime = now;
  http.end();
}

const char* getStateString(SystemState state) {
  switch(state) {
    case WAITING_WEIGHT: return "WAITING_WEIGHT";
    case MEASURING: return "MEASURING";
    case COMPLETED: return "COMPLETED";
    default: return "UNKNOWN";
  }
}

// ✅ 추가: 시스템 리셋 함수
void resetSystemForNewSession() {
  Serial.println("\n╔════════════════════════════════════════════════════════════╗");
  Serial.println("║           🔄 새 세션 준비 중...                          ║");
  Serial.println("╚════════════════════════════════════════════════════════════╝\n");
  
  // 영점 재설정
  Serial.println("수액팩을 완전히 제거해주세요...");
  delay(3000);
  
  scale.tare();
  delay(2000);
  baselineWeight = scale.get_units(10);
  Serial.print("✅ 새 영점: ");
  Serial.print(baselineWeight);
  Serial.println(" g\n");
  
  // 통계 리셋
  for (int i = 0; i < NUM_INTERVALS; i++) {
    intervalData[i].totalFlowSum = 0;
    intervalData[i].measurementCount = 0;
    intervalData[i].minFlowRate = 99999;
    intervalData[i].maxFlowRate = -99999;
  }
  
  // 상태 리셋
  initialDataSent = false;
  weightDetectedTime = 0;
  
  // 처방 정보는 유지 (같은 환자일 수 있음)
  
  Serial.println("✅ 시스템 리셋 완료");
  Serial.println("새 링거를 걸어주세요...\n");
  
  // 대기 상태로 전환
  currentState = WAITING_WEIGHT;
}

// ==================== 테스트 모드 함수 ====================

float calculateTestFlowRate(float prevWeight, float currWeight, unsigned long intervalMs) {
  if (prevWeight <= 0 || currWeight <= 0) {
    return 0;
  }
  
  float weightChange = prevWeight - currWeight;
  
  if (weightChange < 0) {
    Serial.println("  [WARNING] 무게 증가 감지");
    return 0;
  }
  
  if (weightChange < 0.1) {
    return 0;
  }
  
  float actualInterval = intervalMs / 1000.0;
  float flowRatePerMin = (weightChange / actualInterval) * 60.0;
  
  return flowRatePerMin;
}

void printTestStatistics() {
  if (testMeasurementCount == 0) {
    Serial.println("아직 측정 데이터 없음");
    return;
  }
  
  float avgFlowRate = testTotalFlowSum / testMeasurementCount;
  float range = testMaxFlowRate - testMinFlowRate;
  float variability = (avgFlowRate > 0) ? (range / avgFlowRate) * 100.0 : 0;
  
  Serial.println("\n========================================");
  Serial.println("       테스트 모드 측정 통계");
  Serial.println("========================================");
  Serial.print("측정 주기: ");
  Serial.print(TEST_MEASURE_INTERVAL / 1000);
  Serial.println(" 초");
  Serial.print("측정 횟수: ");
  Serial.println(testMeasurementCount);
  Serial.print("평균 유속: ");
  Serial.print(avgFlowRate, 2);
  Serial.println(" mL/분");
  Serial.print("최소 유속: ");
  Serial.print(testMinFlowRate, 2);
  Serial.println(" mL/분");
  Serial.print("최대 유속: ");
  Serial.print(testMaxFlowRate, 2);
  Serial.println(" mL/분");
  Serial.print("범위: ");
  Serial.print(range, 2);
  Serial.println(" mL/분");
  Serial.print("변동성: ");
  Serial.print(variability, 1);
  Serial.println(" %");
  Serial.println("========================================\n");
}

// ==================== 초기화 ====================

void setup() {
  delay(1000);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);

  ESP.wdtDisable();
  ESP.wdtEnable(8000);
  
  Serial.println("\n\n╔════════════════════════════════════════════════════════════╗");
  Serial.println("║       Smart IV Pole - 통합 시스템                        ║");
  Serial.println("╚════════════════════════════════════════════════════════════╝\n");
  
  // 모드 선택
  Serial.println("실행 모드를 선택하세요:");
  Serial.println("  1 - 운영 모드 (다중 주기 통합 측정)");
  Serial.println("  2 - 테스트 모드 (단일 주기 테스트)");
  Serial.print("\n입력 (1 또는 2): ");
  
  unsigned long modeSelectStart = millis();
  while (!Serial.available() && (millis() - modeSelectStart < 10000)) {
    delay(100);
    ESP.wdtFeed();
  }
  
  if (Serial.available()) {
    String modeInput = Serial.readStringUntil('\n');
    modeInput.trim();
    Serial.println(modeInput);
    
    if (modeInput == "2") {
      currentMode = TEST_MODE;
      Serial.println("\n✅ 테스트 모드 선택\n");
    } else {
      currentMode = PRODUCTION_MODE;
      Serial.println("\n✅ 운영 모드 선택\n");
    }
  } else {
    currentMode = PRODUCTION_MODE;
    Serial.println("\n(시간 초과 - 운영 모드로 자동 시작)\n");
  }

  // Device ID 생성
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

  // HX711 초기화
  Serial.println("[SENSOR] Initializing HX711...");
  scale.begin(D0, D1);
  delay(1000);

  bool sensorReady = scale.wait_ready_timeout(1000);

  if (sensorReady) {
    Serial.println("[OK] HX711 감지됨");
    
    Serial.println("\n폴대에서 링거를 완전히 제거하세요!");
    Serial.println("3초 후 영점을 설정합니다...\n");
    delay(3000);
    
    scale.set_scale();
    delay(2000);
    scale.tare();
    delay(2000);
    scale.set_scale(calibration_factor);

    baselineWeight = scale.get_units(10);
    Serial.print("[OK] 영점 설정: ");
    Serial.print(baselineWeight);
    Serial.println(" g\n");
  } else {
    Serial.println("[ERROR] HX711 감지 실패!");
    Serial.println("배선 확인: DT=D0, SCK=D1, VCC=3.3V, GND=GND\n");
  }

  delay(2000);

  // WiFi 연결 (운영 모드만)
  if (currentMode == PRODUCTION_MODE) {
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
      
      Serial.println("\n⏳ 처방 정보 요청 중... (선택사항)");
      requestPrescriptionInfo();
    } else {
      Serial.println("\n❌ WiFi 연결 실패");
    }
    
    Serial.println("💡 처방 정보가 없어도 측정은 진행됩니다\n");
    
    currentState = WAITING_WEIGHT;
  }

  // 초기 무게 읽기
  Serial.println("이제 링거를 걸어주세요...");
  delay(5000);
  
  currentWeight = safeReadSensor();
  Serial.print("링거 무게: ");
  Serial.print(currentWeight - baselineWeight);
  Serial.print("g (절대값: ");
  Serial.print(currentWeight);
  Serial.println("g)\n");

  // 모드별 초기화
  if (currentMode == TEST_MODE) {
    testPreviousWeight = currentWeight;
    lastTestMeasureTime = millis();
    
    Serial.println("════════════════════════════════════════════════════════════");
    Serial.println("           테스트 모드 명령어");
    Serial.println("════════════════════════════════════════════════════════════");
    Serial.println("숫자 - 측정 주기 변경 (초 단위, 5~300)");
    Serial.println("s - 통계 출력");
    Serial.println("r - 통계 리셋");
    Serial.println("t - 영점 재설정");
    Serial.println("════════════════════════════════════════════════════════════\n");
    
    Serial.print("테스트 측정 시작: ");
    Serial.print(TEST_MEASURE_INTERVAL / 1000);
    Serial.println("초 주기\n");
  } else {
    // 다중 주기 초기화
    unsigned long now = millis();
    for (int i = 0; i < NUM_INTERVALS; i++) {
      intervalData[i].previousWeight = currentWeight;
      intervalData[i].lastMeasureTime = now;
      intervalData[i].currentFlowRate = 0;
      intervalData[i].totalFlowSum = 0;
      intervalData[i].measurementCount = 0;
      intervalData[i].minFlowRate = 99999;
      intervalData[i].maxFlowRate = -99999;
    }
    
    lastPingTime = millis();
    lastPrescriptionRequestTime = millis();
    
    Serial.println("════════════════════════════════════════════════════════════");
    Serial.println("           운영 모드 명령어");
    Serial.println("════════════════════════════════════════════════════════════");
    Serial.println("s - 상세 통계 출력");
    Serial.println("c - 측정 주기 변경");
    Serial.println("r - 통계 리셋");
    Serial.println("t - 영점 재설정");
    Serial.println("════════════════════════════════════════════════════════════\n");
    
    Serial.print("다중 주기 측정 시작: ");
    for (int i = 0; i < NUM_INTERVALS; i++) {
      Serial.print(intervalNames[i]);
      if (i < NUM_INTERVALS - 1) Serial.print(", ");
    }
    Serial.println();
    Serial.println("측정 즉시 계산 및 출력");
    Serial.println("편차 10% 이상일 때 서버 전송\n");
  }

  ESP.wdtFeed();
}

// ==================== 메인 루프 ====================

void loop() {
  ESP.wdtFeed();
  unsigned long now = millis();

  // ========== 테스트 모드 ==========
  if (currentMode == TEST_MODE) {
    if (Serial.available()) {
      String input = Serial.readStringUntil('\n');
      input.trim();

      if (input.length() > 0 && isDigit(input[0])) {
        int newInterval = input.toInt();
        
        if (newInterval >= 5 && newInterval <= 300) {
          TEST_MEASURE_INTERVAL = newInterval * 1000;
          
          Serial.print("\n✅ 측정 주기 변경: ");
          Serial.print(newInterval);
          Serial.println(" 초\n");
          
          testPreviousWeight = safeReadSensor();
          lastTestMeasureTime = now;
          testMeasurementCount = 0;
          testTotalFlowSum = 0;
          testMinFlowRate = 99999;
          testMaxFlowRate = -99999;
          
          Serial.println("통계 리셋 - 새 주기로 측정 시작\n");
        } else {
          Serial.println("\n⚠️ 유효 범위: 5~300초\n");
        }
      }
      else if (input == "s" || input == "S") {
        printTestStatistics();
      }
      else if (input == "r" || input == "R") {
        testMeasurementCount = 0;
        testTotalFlowSum = 0;
        testMinFlowRate = 99999;
        testMaxFlowRate = -99999;
        Serial.println("\n✅ 통계 리셋 완료\n");
      }
      else if (input == "t" || input == "T") {
        Serial.println("\n링거를 제거하세요!");
        delay(3000);
        
        scale.tare();
        delay(2000);
        baselineWeight = scale.get_units(10);
        Serial.print("✅ 새 영점: ");
        Serial.print(baselineWeight);
        Serial.println(" g\n");
        
        Serial.println("링거를 다시 걸어주세요...");
        delay(5000);
        
        testPreviousWeight = safeReadSensor();
        lastTestMeasureTime = now;
        testMeasurementCount = 0;
        testTotalFlowSum = 0;
        testMinFlowRate = 99999;
        testMaxFlowRate = -99999;
        
        Serial.print("새 시작 무게: ");
        Serial.print(testPreviousWeight - baselineWeight);
        Serial.println(" g\n");
      }
    }

    if (now - lastTestMeasureTime >= TEST_MEASURE_INTERVAL) {
      currentWeight = safeReadSensor();

      if (currentWeight != SENSOR_ERROR_VALUE) {
        testCurrentFlowRate = calculateTestFlowRate(
          testPreviousWeight,
          currentWeight,
          TEST_MEASURE_INTERVAL
        );
        testMeasurementCount++;

        if (testCurrentFlowRate > 0) {
          testTotalFlowSum += testCurrentFlowRate;
          if (testCurrentFlowRate < testMinFlowRate) {
            testMinFlowRate = testCurrentFlowRate;
          }
          if (testCurrentFlowRate > testMaxFlowRate) {
            testMaxFlowRate = testCurrentFlowRate;
          }
        }

        float netWeight = currentWeight - baselineWeight;
        float consumed = testPreviousWeight - currentWeight;

        Serial.println("\n========================================");
        Serial.print("측정 #");
        Serial.print(testMeasurementCount);
        Serial.print(" (주기: ");
        Serial.print(TEST_MEASURE_INTERVAL / 1000);
        Serial.println("초)");
        Serial.println("========================================");
        Serial.print("이전 무게: ");
        Serial.print(testPreviousWeight, 2);
        Serial.println(" g");
        Serial.print("현재 무게: ");
        Serial.print(currentWeight, 2);
        Serial.println(" g");
        Serial.print("감소량: ");
        Serial.print(consumed, 2);
        Serial.println(" g");
        Serial.println("----------------------------------------");
        Serial.print("측정 유속: ");
        Serial.print(testCurrentFlowRate, 2);
        Serial.println(" mL/분");
        Serial.println("----------------------------------------");
        Serial.print("잔여량: ");
        Serial.print(netWeight, 1);
        Serial.println(" g");

        if (testMeasurementCount > 0) {
          float avgFlowRate = testTotalFlowSum / testMeasurementCount;
          Serial.print("평균 유속: ");
          Serial.print(avgFlowRate, 2);
          Serial.println(" mL/분");
        }

        Serial.println("========================================\n");

        testPreviousWeight = currentWeight;
      }

      lastTestMeasureTime = now;
    }
    
    delay(10);
    return;
  }

  // ========== 운영 모드 - 다중 주기 ==========
  checkAndReconnectWiFi();

  if (now - lastPingTime >= PING_INTERVAL) {
    sendPing();
    lastPingTime = now;
  }

  requestPrescriptionInfo();

  if (Serial.available()) {
    char command = Serial.read();
    
    if (command == 's' || command == 'S') {
      printMultiStatistics();
    }
    else if (command == 'c' || command == 'C') {
      configureIntervals();
      
      float newWeight = safeReadSensor();
      for (int i = 0; i < NUM_INTERVALS; i++) {
        intervalData[i].previousWeight = newWeight;
        intervalData[i].lastMeasureTime = now;
        intervalData[i].totalFlowSum = 0;
        intervalData[i].measurementCount = 0;
        intervalData[i].minFlowRate = 99999;
        intervalData[i].maxFlowRate = -99999;
      }
      
      Serial.println("✅ 새 주기로 측정을 시작합니다\n");
    }
    else if (command == 'r' || command == 'R') {
      for (int i = 0; i < NUM_INTERVALS; i++) {
        intervalData[i].totalFlowSum = 0;
        intervalData[i].measurementCount = 0;
        intervalData[i].minFlowRate = 99999;
        intervalData[i].maxFlowRate = -99999;
      }
      Serial.println("\n✅ 모든 통계 리셋 완료\n");
    }
    else if (command == 't' || command == 'T') {
      Serial.println("\n링거를 제거하세요!");
      delay(3000);
      
      scale.tare();
      delay(2000);
      baselineWeight = scale.get_units(10);
      Serial.print("✅ 새 영점: ");
      Serial.print(baselineWeight);
      Serial.println(" g\n");
      
      Serial.println("링거를 다시 걸어주세요...");
      delay(15000);
      
      float newWeight = safeReadSensor();
      
      for (int i = 0; i < NUM_INTERVALS; i++) {
        intervalData[i].previousWeight = newWeight;
        intervalData[i].lastMeasureTime = now;
        intervalData[i].totalFlowSum = 0;
        intervalData[i].measurementCount = 0;
        intervalData[i].minFlowRate = 99999;
        intervalData[i].maxFlowRate = -99999;
      }
      
      Serial.print("새 시작 무게: ");
      Serial.print(newWeight - baselineWeight);
      Serial.println(" g\n");
    }
  }

  switch (currentState) {
    case WAITING_WEIGHT:
      currentWeight = safeReadSensor();

      if (currentWeight == SENSOR_ERROR_VALUE) {
        delay(1000);
        break;
      }

      if (currentWeight - baselineWeight > WEIGHT_DETECTION_THRESHOLD) {
        if (weightDetectedTime == 0) {
          weightDetectedTime = now;
          Serial.print("💧 수액 감지됨 (");
          Serial.print(currentWeight - baselineWeight);
          Serial.println(" g) - 10초 후 측정 시작...");
        }

        if (now - weightDetectedTime >= AUTO_START_DELAY) {
          initialWeight = currentWeight;
          measureStartTime = now;

          for (int i = 0; i < NUM_INTERVALS; i++) {
            intervalData[i].previousWeight = currentWeight;
            intervalData[i].lastMeasureTime = now;
          }

          Serial.print("✅ 초기 무게: ");
          Serial.print(initialWeight);
          Serial.println(" g");
          Serial.println("🚀 다중 주기 측정 시작! (즉시 계산 모드)");

          currentState = MEASURING;
          weightDetectedTime = 0;
        }
      } else {
        weightDetectedTime = 0;
      }

      delay(500);
      break;

    // ========== MEASURING 케이스 내부 수정 ==========

case MEASURING:
  {
    bool anyMeasurement = false;
    bool allIntervalsCompleted = false;
    
    for (int i = 0; i < NUM_INTERVALS; i++) {
      if (now - intervalData[i].lastMeasureTime >= INTERVALS[i]) {
        float freshWeight = safeReadSensor();
        
        if (freshWeight == SENSOR_ERROR_VALUE) {
          intervalData[i].lastMeasureTime = now;
          continue;
        }
        
        float flowRate = calculateFlowRate(
          intervalData[i].previousWeight,
          freshWeight,
          INTERVALS[i]
        );
        
        intervalData[i].currentFlowRate = flowRate;
        intervalData[i].measurementCount++;
        
        if (flowRate > 0) {
          intervalData[i].totalFlowSum += flowRate;
          if (flowRate < intervalData[i].minFlowRate) {
            intervalData[i].minFlowRate = flowRate;
          }
          if (flowRate > intervalData[i].maxFlowRate) {
            intervalData[i].maxFlowRate = flowRate;
          }
        }
        
        float weightChange = intervalData[i].previousWeight - freshWeight;
        
        Serial.print("[");
        Serial.print(intervalNames[i]);
        Serial.print(" #");
        Serial.print(intervalData[i].measurementCount);
        Serial.print("] ");
        Serial.print(intervalData[i].previousWeight, 1);
        Serial.print("g → ");
        Serial.print(freshWeight, 1);
        Serial.print("g (");
        
        if (weightChange >= 0) {
          Serial.print(weightChange, 2);
          Serial.print("g 감소");
        } else {
          Serial.print("+");
          Serial.print(abs(weightChange), 2);
          Serial.print("g 증가");
        }
        
        Serial.print(") → 유속: ");
        Serial.print(flowRate, 2);
        Serial.println(" mL/분");
        
        intervalData[i].previousWeight = freshWeight;
        intervalData[i].lastMeasureTime = now;
        currentWeight = freshWeight;
        
        anyMeasurement = true;
        
        allIntervalsCompleted = true;
        for (int j = 0; j < NUM_INTERVALS; j++) {
          if (intervalData[j].measurementCount == 0) {
            allIntervalsCompleted = false;
            break;
          }
        }
        
        delay(200);
      }
    }
    
    if (anyMeasurement && allIntervalsCompleted) {
      calculateCombinedAverage();
      
      Serial.println("\n════════════════════════════════════════════════════════════");
      Serial.println("          📊 4개 주기 측정 완료 - 통합 결과");
      Serial.println("════════════════════════════════════════════════════════════");
      
      for (int i = 0; i < NUM_INTERVALS; i++) {
        if (intervalData[i].measurementCount > 0) {
          float avg = intervalData[i].totalFlowSum / intervalData[i].measurementCount;
          Serial.print("  ");
          Serial.print(intervalNames[i]);
          Serial.print(" 평균: ");
          Serial.print(avg, 2);
          Serial.print(" mL/분 (");
          Serial.print(intervalData[i].measurementCount);
          Serial.println("회 측정)");
        }
      }
      
      Serial.println("────────────────────────────────────────────────────────────");
      Serial.print("  📌 통합 평균 유속: ");
      Serial.print(combinedAverageFlowRate, 2);
      Serial.println(" mL/분");
      
      if (prescription.isInitialized) {
        float deviation = calculateFlowDeviation(combinedAverageFlowRate);
        String status = getDeviationStatus(deviation);
        
        Serial.print("  🎯 처방 유속: ");
        Serial.print(prescription.prescribedRate, 2);
        Serial.print(" mL/분");
        Serial.print(" | 편차: ");
        if (deviation >= 0) Serial.print("+");
        Serial.print(deviation, 1);
        Serial.print("% ");
        Serial.println(status);
      }
      Serial.println("════════════════════════════════════════════════════════════\n");
      
      if (combinedAverageFlowRate > 0) {
        // ✅ 올바른 순서로 변수 선언
        float remainingLiquidWeight = currentWeight - EMPTY_BAG_WEIGHT - baselineWeight;
        float initialLiquidWeight = initialWeight - EMPTY_BAG_WEIGHT - baselineWeight;
        float consumedLiquidWeight = initialLiquidWeight - remainingLiquidWeight;
        
        float percentage = 0;
        if (initialLiquidWeight > 0) {
          percentage = (remainingLiquidWeight / initialLiquidWeight) * 100.0;
        }
        
        int remainingVolume = (int)remainingLiquidWeight;
        float remainingTime = calculateRemainingTime(remainingLiquidWeight, combinedAverageFlowRate);
        float deviation = calculateFlowDeviation(combinedAverageFlowRate);
        
        bool shouldSend = false;
        String sendReason = "";
        
        if (!initialDataSent && totalCombinedMeasurements == NUM_INTERVALS) {
          shouldSend = true;
          sendReason = "초기 데이터";
          initialDataSent = true;
        }
        else if (shouldSendData(combinedAverageFlowRate, remainingVolume, deviation)) {
          shouldSend = true;
          sendReason = "데이터 변화 감지";
        }
        else if (prescription.isInitialized && abs(deviation) >= WARNING_DEVIATION_THRESHOLD) {
          shouldSend = true;
          if (abs(deviation) >= CRITICAL_DEVIATION_THRESHOLD) {
            sendReason = "🚨 편차 20% 이상 (위험)";
            sendAlert("FLOW_RATE_CRITICAL", deviation);
          } else {
            sendReason = "⚠️ 편차 10% 이상 (주의)";
            sendAlert("FLOW_RATE_WARNING", deviation);
          }
        }
        else if (percentage < LOW_VOLUME_THRESHOLD && percentage > 0) {
          shouldSend = true;
          sendReason = "💧 잔여량 부족 (10% 미만)";
          sendAlert("LOW_VOLUME", percentage);
        }
        
        if (shouldSend && (now - lastDataSendTime >= MIN_SEND_INTERVAL)) {
          Serial.print("📤 [서버 전송] ");
          Serial.println(sendReason);
          sendData(currentWeight, combinedAverageFlowRate, remainingTime * 60.0, deviation, getStateString(currentState));
          
          serverLastData.lastFlowRate = combinedAverageFlowRate;
          serverLastData.lastRemainingVolume = remainingVolume;
          serverLastData.lastDeviation = deviation;
          serverLastData.hasData = true;
          
          lastDataSendTime = now;
        }
        
        if (remainingLiquidWeight <= 0) {
          Serial.println("\n╔════════════════════════════════════════╗");
          Serial.println("║      ✅ 수액 투여 완료!              ║");
          Serial.println("║      (수액팩이 비어 제거됨)          ║");
          Serial.println("╚════════════════════════════════════════╝");
          Serial.print("총 소비량: ");
          Serial.print(consumedLiquidWeight, 2);
          Serial.println(" mL");
          Serial.print("완료 시간: ");
          Serial.print((now - measureStartTime) / 1000.0);
          Serial.println(" 초\n");
          
          sendAlert("INFUSION_COMPLETE", consumedLiquidWeight);
          sendData(currentWeight, combinedAverageFlowRate, 0, deviation, "COMPLETED");
          
          currentState = COMPLETED;
        }
        else if (remainingLiquidWeight < 5.0 && remainingLiquidWeight > 0) {
          Serial.println("\n⚠️ 경고: 수액이 거의 다 나갔습니다 (5mL 미만)");
          Serial.print("남은 수액: ");
          Serial.print(remainingLiquidWeight, 2);
          Serial.println(" mL\n");
          sendAlert("LOW_LIQUID_WARNING", remainingLiquidWeight);
        }
      }
    }
    else if (anyMeasurement && !allIntervalsCompleted) {
      Serial.println("  ⏳ 다른 주기 측정 대기 중...\n");
    }
  }
  break;



    case COMPLETED:
      // ✅ 한번만 출력하고 자동으로 리셋
      static bool completedMessageShown = false;
      
      if (!completedMessageShown) {
        Serial.println("✅ 측정 종료됨");
        completedMessageShown = true;
        
        delay(3000);
        
        // ✅ 자동으로 새 세션 준비
        resetSystemForNewSession();
        completedMessageShown = false;  // 다음 세션을 위해 리셋
      }
      break;
  }

  delay(10);
}

#include <ESP8266WiFi.h>
#include "HX711.h"
#include <ESP8266HTTPClient.h>
// ArduinoJson 제거 - 수동 JSON 생성/파싱 사용

// WiFi and server credentials - loaded from config.h (not tracked by git)
#include "config.h"

// --- 측정 설정값 ---
const int   HISTORY_SIZE          = 30; // 30개로 증가 (더 정밀한 측정)
const unsigned long CHECK_INTERVAL = 1000;  // 1초마다 상태 체크
const unsigned long MEASURE_INTERVAL = 3000; // 안정 시 3초마다 측정
const unsigned long PING_INTERVAL = 30000;  // 30초마다 핑 전송
float calibration_factor = 400; // 로드셀 기본 캘리값

// --- 이벤트 기반 전송 설정 ---
const float DATA_SEND_DEVIATION_THRESHOLD = 15.0;  // 15% 이상 편차 시 전송
const float LOW_VOLUME_THRESHOLD = 10.0;  // 잔여량 10% 미만 시 전송
const unsigned long MIN_SEND_INTERVAL = 5000;  // 최소 5초 간격으로 전송 (중복 방지)

// --- 운동 감지 및 안정화 설정 ---
const float STABILITY_THRESHOLD = 2.0;  // ±2g 이내면 안정 상태
const unsigned long STABILITY_DURATION = 10000;  // 10초 안정 유지 필요
const int STABILITY_CHECK_COUNT = 3;  // 연속 3회 안정 확인

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
int stableCheckCount = 0;
bool initialDataSent = false;   // 초기 데이터 전송 여부

// --- 유속 계산용 데이터 ---
float flowRateHistory[10];      // 최근 10개 유속 측정값
int flowRateIndex = 0;
bool flowRateFull = false;
float lastFlowRateWeight = 0;
unsigned long lastFlowRateTime = 0;
const unsigned long FLOW_RATE_WINDOW = 5000;  // 5초 윈도우

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

// --- 안전한 센서 읽기 ---
float safeReadSensor() {
  if (!scale.is_ready()) {
    Serial.println("Sensor not ready");
    return SENSOR_ERROR_VALUE;
  }
  scale.set_scale(calibration_factor);
  float weight = scale.get_units(10);  // 10회 평균으로 증가
  return weight;
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

// --- 유속 계산 (이동 평균) ---
float calculateFlowRate(float currentWeight, unsigned long currentTime) {
  // 5초 이상 경과 시 유속 계산
  if (currentTime - lastFlowRateTime < FLOW_RATE_WINDOW) {
    return -1;  // 아직 계산 불가
  }

  float weightChange = lastFlowRateWeight - currentWeight;  // 감소량 (g)
  float timeElapsed = (currentTime - lastFlowRateTime) / 1000.0;  // 초

  if (timeElapsed <= 0 || weightChange <= 0) {
    return -1;  // 비정상 값
  }

  // g/s → mL/min (1g ≈ 1mL)
  float flowRate = (weightChange / timeElapsed) * 60.0;

  // 이동 평균에 추가
  flowRateHistory[flowRateIndex] = flowRate;
  flowRateIndex++;
  if (flowRateIndex >= 10) {
    flowRateIndex = 0;
    flowRateFull = true;
  }

  // 다음 측정 준비
  lastFlowRateWeight = currentWeight;
  lastFlowRateTime = currentTime;

  return flowRate;
}

// --- 평균 유속 계산 ---
float getAverageFlowRate() {
  int count = flowRateFull ? 10 : flowRateIndex;
  if (count == 0) return 0;

  float sum = 0;
  for (int i = 0; i < count; i++) {
    sum += flowRateHistory[i];
  }
  return sum / count;
}

// --- 남은 시간 계산 (측정 유속 기반) ---
float calculateRemainingTime(float remainingWeight, float measuredFlowRate) {
  if (measuredFlowRate <= 0 || remainingWeight <= 0) {
    return -1;
  }

  // 남은 무게(g) ÷ 유속(mL/min) = 남은 시간(분) → 초로 변환
  return (remainingWeight / measuredFlowRate) * 60.0;
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

  // ArduinoJson v6/v7 호환 코드
  String json = "{\"device_id\":\"IV_001\",\"battery_level\":" + String(batteryLevel) + "}";

  http.begin(client, serverHost, serverPort, "/api/esp/ping");
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(json);

  if (code == 200) {
    Serial.print("💓 핑 전송 성공 (배터리: ");
    Serial.print(batteryLevel);
    Serial.println("%)");
  } else {
    Serial.print("❌ 핑 전송 실패: ");
    Serial.println(code);
  }
  http.end();
}

// --- 경고 전송 ---
void sendAlert(const char* alertType, float deviationPercent) {
  if (WiFi.status() != WL_CONNECTED) return;

  // ArduinoJson 없이 수동으로 JSON 생성
  String json = "{\"device_id\":\"IV_001\",\"alert_type\":\"" + String(alertType) +
                "\",\"deviation_percent\":" + String(deviationPercent) +
                ",\"timestamp\":" + String(millis()) + "}";

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

  // ArduinoJson 없이 수동으로 JSON 생성
  String json = "{\"device_id\":\"IV_001\"";
  json += ",\"current_weight\":" + String(currentWeight);
  json += ",\"initial_weight\":" + String(initialWeight);
  json += ",\"baseline_weight\":" + String(baselineWeight);
  json += ",\"weight_consumed\":" + String(consumedWeight);
  json += ",\"weight_remaining\":" + String(remainingWeight);
  json += ",\"flow_rate_measured\":" + String(measuredRate);
  json += ",\"flow_rate_prescribed\":" + String(prescription.prescribedRate);
  json += ",\"remaining_time_sec\":" + String(remainingTime);
  json += ",\"deviation_percent\":" + String(deviation);
  json += ",\"state\":\"" + String(state) + "\"";
  json += ",\"timestamp\":" + String(millis());
  json += "}";

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

  http.begin(client, serverHost, serverPort, "/api/esp/init?device_id=IV_001");
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("📥 처방 정보 수신: " + payload);

    // 간단한 JSON 파싱 (ArduinoJson 없이)
    int totalVolumeIdx = payload.indexOf("\"total_volume_ml\":");
    int flowRateIdx = payload.indexOf("\"flow_rate_ml_min\":");
    int gttFactorIdx = payload.indexOf("\"gtt_factor\":");
    int calculatedGttIdx = payload.indexOf("\"calculated_gtt\":");

    if (totalVolumeIdx > 0 && flowRateIdx > 0) {
      // total_volume_ml 파싱
      int start = totalVolumeIdx + 18;
      int end = payload.indexOf(',', start);
      if (end < 0) end = payload.indexOf('}', start);
      prescription.totalVolume = payload.substring(start, end).toFloat();

      // flow_rate_ml_min 파싱
      start = flowRateIdx + 20;
      end = payload.indexOf(',', start);
      if (end < 0) end = payload.indexOf('}', start);
      prescription.prescribedRate = payload.substring(start, end).toFloat();

      // gtt_factor 파싱
      if (gttFactorIdx > 0) {
        start = gttFactorIdx + 13;
        end = payload.indexOf(',', start);
        if (end < 0) end = payload.indexOf('}', start);
        prescription.gttFactor = payload.substring(start, end).toInt();
      }

      // calculated_gtt 파싱
      if (calculatedGttIdx > 0) {
        start = calculatedGttIdx + 17;
        end = payload.indexOf(',', start);
        if (end < 0) end = payload.indexOf('}', start);
        prescription.calculatedGTT = payload.substring(start, end).toInt();
      }

      prescription.isInitialized = true;

      Serial.println("✅ 처방 정보 초기화 완료!");
      Serial.print("총 용량: ");
      Serial.print(prescription.totalVolume);
      Serial.println(" mL");
      Serial.print("처방 유속: ");
      Serial.print(prescription.prescribedRate);
      Serial.println(" mL/min");

      http.end();
      return true;
    } else {
      Serial.println("❌ JSON 파싱 실패");
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
  Serial.begin(115200);

  ESP.wdtDisable();
  ESP.wdtEnable(8000);
  delay(1000);
  Serial.println("\n\n=== Smart IV Pole - Medical Grade Monitoring ===");

  // HX711 초기화
  scale.begin(D1, D0);
  delay(1000);
  Serial.print("센서 준비: ");
  Serial.println(scale.is_ready() ? "YES" : "NO");
  delay(200);

  if (scale.is_ready()) {
    Serial.println("HX711 초기화 중...");
    scale.set_scale();
    delay(2000);
    scale.tare();
    delay(2000);
    scale.set_scale(calibration_factor);
    Serial.println("✅ HX711 캘리브레이션 완료");

    float testWeight = scale.get_units(5);
    Serial.print("테스트 측정: ");
    Serial.print(testWeight);
    Serial.println(" g");
  } else {
    Serial.println("❌ HX711 초기화 실패!");
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

    // 처방 정보 요청
    Serial.println("\n📞 서버에서 처방 정보 요청 중...");
    if (requestPrescriptionInfo()) {
      currentState = TARE_BASELINE;
      Serial.println("\n🎯 영점 조정 준비 - 수액 걸기 전 상태");
    } else {
      Serial.println("\n⚠️ 처방 정보 없음 - 수동 모드로 전환");
      currentState = WAITING_INIT;
    }
  } else {
    Serial.println("\n❌ WiFi 연결 실패");
    currentState = WAITING_INIT;
  }

  lastStableTime = millis();
  lastMeasureTime = millis();
  lastFlowRateTime = millis();

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
        initialWeight = safeReadSensor();
        lastFlowRateWeight = initialWeight;
        lastFlowRateTime = now;
        Serial.print("초기 무게 저장: ");
        Serial.print(initialWeight);
        Serial.println(" g");
        currentState = STABLE;
        Serial.println("✅ 측정 시작!");
      } else {
        Serial.println("먼저 't' 명령으로 영점 조정하세요");
      }
    } else if (command == 's') {
      Serial.println("\n=== 현재 상태 ===");
      Serial.print("상태: ");
      Serial.println(getStateString(currentState));
      Serial.print("현재 무게: ");
      Serial.print(currentWeight);
      Serial.println(" g");
      Serial.print("초기 무게: ");
      Serial.print(initialWeight);
      Serial.println(" g");
      Serial.print("영점 무게: ");
      Serial.print(baselineWeight);
      Serial.println(" g");
      if (prescription.isInitialized) {
        Serial.print("처방 유속: ");
        Serial.print(prescription.prescribedRate);
        Serial.println(" mL/min");
        Serial.print("총 용량: ");
        Serial.print(prescription.totalVolume);
        Serial.println(" mL");
      } else {
        Serial.println("처방 정보 없음");
      }
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
        if (currentWeight - baselineWeight > 50 && isWeightStable(currentWeight)) {
          if (stableCheckCount++ >= 3) {
            initialWeight = currentWeight;
            lastFlowRateWeight = initialWeight;
            lastFlowRateTime = now;
            Serial.print("✅ 초기 무게 자동 저장: ");
            Serial.print(initialWeight);
            Serial.println(" g");
            Serial.println("측정 시작!");
            currentState = STABLE;
            stableCheckCount = 0;
          }
        } else {
          stableCheckCount = 0;
        }
        break;

      case STABLE:
        // 안정 상태에서 흔들림 감지
        if (!isWeightStable(currentWeight)) {
          currentState = UNSTABLE;
          stableCheckCount = 0;
          Serial.println("\n⚠️ 운동 감지 - 측정 중단");
          digitalWrite(LED_BUILTIN, HIGH);  // LED ON
        } else {
          stableCheckCount++;

          // 3초 안정 상태 유지 시 측정 (항상 수행)
          if (now - lastMeasureTime >= MEASURE_INTERVAL) {
            unsigned long elapsed = now - startMillis;
            addHistory(currentWeight, elapsed);

            // 유속 계산 (항상 수행)
            float measuredRate = calculateFlowRate(currentWeight, now);
            float avgRate = getAverageFlowRate();

            if (avgRate > 0 && prescription.isInitialized) {
              // 남은 시간 계산
              float remainingWeight = currentWeight - baselineWeight;
              float remainingTime = calculateRemainingTime(remainingWeight, avgRate);
              float percentage = (remainingWeight / (initialWeight - baselineWeight)) * 100.0;

              // 편차 계산
              float deviation = calculateFlowDeviation(avgRate);

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
                Serial.print("📤 [전송] 사유: ");
                Serial.println(sendReason);
                send_data(currentWeight, avgRate, remainingTime, deviation, getStateString(currentState));
                lastDataSendTime = now;
              }

              // 로컬 로그는 항상 출력 (서버 전송 여부와 무관)
              Serial.print("📊 무게: ");
              Serial.print(currentWeight, 1);
              Serial.print("g | 유속: ");
              Serial.print(avgRate, 2);
              Serial.print(" mL/min");

              if (prescription.isInitialized) {
                Serial.print(" (처방: ");
                Serial.print(prescription.prescribedRate, 2);
                Serial.print(")");
              }

              Serial.print(" | 남은: ");
              Serial.print(percentage, 1);
              Serial.print("%");

              if (abs(deviation) > 10.0) {
                Serial.print(" ⚠️ 편차: ");
                Serial.print(deviation, 1);
                Serial.print("%");
              }

              if (shouldSendData && (now - lastDataSendTime < MIN_SEND_INTERVAL)) {
                Serial.print(" [전송 대기중]");
              }

              Serial.println();
            }

            lastMeasureTime = now;
            digitalWrite(LED_BUILTIN, LOW);  // LED OFF
          }
        }
        lastStableWeight = currentWeight;
        break;

      case UNSTABLE:
        // 불안정 상태에서 안정 확인
        if (isWeightStable(currentWeight)) {
          stableCheckCount++;

          if (stableCheckCount >= STABILITY_CHECK_COUNT) {
            currentState = WAITING_STABILIZATION;
            lastStableTime = now;
            stableCheckCount = 0;
            Serial.println("🔄 안정화 대기 중... (10초)");
          }
        } else {
          stableCheckCount = 0;  // 다시 흔들리면 카운트 리셋
        }
        lastStableWeight = currentWeight;
        break;

      case WAITING_STABILIZATION:
        // 안정화 대기 중
        if (!isWeightStable(currentWeight)) {
          currentState = UNSTABLE;
          stableCheckCount = 0;
          Serial.println("⚠️ 재흔들림 감지");
        } else if (now - lastStableTime >= STABILITY_DURATION) {
          currentState = STABLE;
          lastMeasureTime = now - MEASURE_INTERVAL;  // 즉시 측정 가능하도록
          // 유속 측정 재시작
          lastFlowRateWeight = currentWeight;
          lastFlowRateTime = now;
          Serial.println("✅ 측정 재개");
          digitalWrite(LED_BUILTIN, LOW);  // LED OFF
        }
        lastStableWeight = currentWeight;
        break;
    }

    lastStableTime = now;
  }

  delay(10);
}

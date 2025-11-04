#include <ESP8266WiFi.h>
#include "HX711.h"
#include <ESP8266HTTPClient.h>

const char* ssid = "TEST_ESP8266";          // WiFi 이름
const char* password = "02091611h";
const char* serverHost = "192.168.235.2";
const uint16_t serverPort = 8081;
const char* serverPath = "/api/esp/data";


// --- 측정 설정값 ---
const int   HISTORY_SIZE          = 20; // 측정 이력 저장 개수
const unsigned long CHECK_INTERVAL = 1000;  // 1초마다 상태 체크
const unsigned long MEASURE_INTERVAL = 4000; // 안정 시 4초마다 측정
float calibration_factor = 400; // 로드셀 기본 캘리값

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

// --- 측정 상태 관리 ---
enum MeasurementState {
  STABLE,                  // 안정 상태 - 정상 측정 중
  UNSTABLE,               // 불안정 상태 - 운동 감지
  WAITING_STABILIZATION   // 안정화 대기 - 10초 대기 중
};

MeasurementState currentState = STABLE;
float lastStableWeight = 0;
unsigned long lastStableTime = 0;
unsigned long lastMeasureTime = 0;
int stableCheckCount = 0;

// --- 데이터 저장 ---
float weightHistory[HISTORY_SIZE];
unsigned long timeHistory[HISTORY_SIZE];
int idx             = 0;
bool full           = false;
unsigned long startMillis;
bool completed      = false;
float initialTotalPredictionSec = -1;
bool predictionCaptured        = false;
float predicted;
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
  float weight = scale.get_units(5);  // 5회 평균
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

// --- 개선된 선형 회귀 예측 함수 (최근 10개 값 사용) ---
float improvedLinearCal(float w[], unsigned long t[], int n) {
  if (n < 5) return -1;  // 최소 5개 데이터 필요

  // 최근 10개 또는 전체 데이터 사용
  int useCount = (n < 10) ? n : 10;
  float sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (int i = 0; i < useCount; i++) {
    int index = (idx - useCount + i + HISTORY_SIZE) % HISTORY_SIZE;
    float x = t[index] / 1000.0;  // 초 단위 변환
    float y = w[index];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  // 선형 회귀 계산: y = slope * x + intercept
  float denominator = (useCount * sumX2 - sumX * sumX);
  if (abs(denominator) < 0.0001) return -1;  // 0으로 나누기 방지

  float slope = (useCount * sumXY - sumX * sumY) / denominator;

  if (slope >= 0) return -1;  // 무게가 증가하면 비정상

  // 현재 무게에서 0g까지 도달 시간 계산
  int lastIndex = (idx - 1 + HISTORY_SIZE) % HISTORY_SIZE;
  float lastWeight = w[lastIndex];
  float lastTime = t[lastIndex] / 1000.0;

  // intercept = (sumY - slope * sumX) / useCount
  float intercept = (sumY - slope * sumX) / useCount;

  // 0 = slope * time + intercept -> time = -intercept / slope
  float timeToEmpty = -intercept / slope;
  float currentTime = t[lastIndex] / 1000.0;
  float remainingTime = timeToEmpty - currentTime;

  return remainingTime > 0 ? remainingTime : -1;
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

// --- 경고 확인 (예측값 편차 체크) ---
void checkDeviation(float currentPrediction) {
  if (currentPrediction <= 0) return;

  // 초기 예측값 저장 (처음 안정화된 예측값)
  if (!predictionCaptured) {
    initialTotalPredictionSec = currentPrediction;
    predictionCaptured = true;
    Serial.print("📌 초기 예측 시간: ");
    Serial.print(initialTotalPredictionSec / 60.0, 1);
    Serial.println(" 분");
    return;
  }

  // 현재 예측값과 초기값 비교
  float deviation = abs(currentPrediction - initialTotalPredictionSec) / initialTotalPredictionSec;

  if (deviation > DEVIATION_THRESHOLD) {
    Serial.print("🚨 경고: 유속 이상 감지! 편차: ");
    Serial.print(deviation * 100, 1);
    Serial.println("%");

    // 서버로 경고 전송
    sendAlert("FLOW_RATE_ABNORMAL", deviation);
  }
}

// --- 경고 전송 ---
void sendAlert(const char* alertType, float deviationPercent) {
  if (WiFi.status() != WL_CONNECTED) return;

  String json = "{";
  json += "\"device_id\":\"IV_001\",";
  json += "\"alert_type\":\"" + String(alertType) + "\",";
  json += "\"deviation_percent\":" + String(deviationPercent * 100, 2) + ",";
  json += "\"timestamp\":" + String(millis());
  json += "}";

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
void send_data(float wei, float time, const char* state) {
  String json = "{";
  json += "\"device_id\":\"IV_001\",";
  json += "\"weight\":" + String(wei, 2) + ",";
  json += "\"predicted_time\":" + String(time, 2) + ",";
  json += "\"state\":\"" + String(state) + "\"";
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

// --- 상태 문자열 변환 ---
const char* getStateString(MeasurementState state) {
  switch(state) {
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
  Serial.println("=== Smart IV Pole - Enhanced Monitoring ===");

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

    float testWeight = scale.get_units(3);
    Serial.print("테스트 측정: ");
    Serial.print(testWeight);
    Serial.println(" g");
  } else {
    Serial.println("❌ HX711 초기화 실패!");
  }

  delay(2000);

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
  } else {
    Serial.println("\n❌ WiFi 연결 실패");
  }

  Serial.println("초기 무게 측정 중...");
  float initialWeight = safeReadSensor();
  lastStableWeight = initialWeight;
  addHistory(initialWeight, 0);
  lastStableTime = millis();
  lastMeasureTime = millis();

  Serial.print("초기 무게: ");
  Serial.print(initialWeight);
  Serial.println(" g");
  Serial.println("\n🚀 모니터링 시작!");

  ESP.wdtFeed();
}

void loop() {
  ESP.wdtFeed();
  if (completed) return;

  unsigned long now = millis();
  checkAndReconnectWiFi();

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
      case STABLE:
        // 안정 상태에서 흔들림 감지
        if (!isWeightStable(currentWeight)) {
          currentState = UNSTABLE;
          stableCheckCount = 0;
          Serial.println("\n⚠️ 운동 감지 - 측정 중단");
          digitalWrite(LED_BUILTIN, HIGH);  // LED ON
        } else {
          stableCheckCount++;

          // 4초 안정 상태 유지 시 측정 및 전송
          if (now - lastMeasureTime >= MEASURE_INTERVAL) {
            unsigned long elapsed = now - startMillis;
            addHistory(currentWeight, elapsed);

            int count = full ? HISTORY_SIZE : idx;
            predicted = improvedLinearCal(weightHistory, timeHistory, count);

            // 경고 체크
            checkDeviation(predicted);

            // 데이터 전송
            send_data(currentWeight, predicted, getStateString(currentState));

            Serial.print("📊 무게: ");
            Serial.print(currentWeight, 1);
            Serial.print("g | 예측: ");
            Serial.print(predicted / 60.0, 1);
            Serial.println("분");

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
          Serial.println("✅ 측정 재개");
          digitalWrite(LED_BUILTIN, LOW);  // LED OFF
        }
        lastStableWeight = currentWeight;
        break;
    }

    lastStableTime = now;
  }

  // 시리얼 명령 처리
  if (Serial.available()) {
    char command = Serial.read();
    if (command == 'q') {
      Serial.println("프로그램 종료");
      completed = true;
    } else if (command == 's') {
      Serial.print("현재 상태: ");
      Serial.println(getStateString(currentState));
      Serial.print("무게: ");
      Serial.print(currentWeight, 1);
      Serial.println("g");
    }
  }

  delay(10);
}

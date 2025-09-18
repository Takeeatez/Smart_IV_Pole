#include <ESP8266WiFi.h>
#include "HX711.h"
#define STASSID
#define STASSID "WiFi_NAME"
#define STAPSK "WiFi_PASSWORD"
const char* ssid = STASSID;
const char* password = STAPSK;

WiFiServer server(80);
// --- 시뮬레이션을 위한 설정값 추가 ---
const float SIM_START_WEIGHT = 1100.0; // 시뮬레이션 시작 무게
const float SIM_END_WEIGHT = 3.0;    // 시뮬레이션 종료 무게
const float SIM_TOTAL_DURATION_SEC = 60; // 시뮬레이션 총 소요 시간 (초), 예: 1시간
const int HISTORY_SIZE = 20; // 데이터 기록 이력 크기 20개 측정 포인트
const unsigned long INTERVAL = 2000; // 측정 주기 2s

float weightHistory[HISTORY_SIZE]; // 무게 측정 이력
unsigned long timeHistory[HISTORY_SIZE]; // 시간 측정 이력
int idx = 0; // 측정 횟수
bool full = false;
unsigned long startMillis;
bool completed = false; // 완료 여부
float initialTotalPredictionSec = -1;
bool predictionCaptured = false;
float loadcellValue = 166.0;

HX711 scale;
// 선형 예측 함수
float linearCal(float weight[], unsigned long time[], int n) {
if (n < 2) return -1;							// 2개 이력이 2개 미만이면 계산 X
  float deltaW = weight[n-1] - weight[0];					// 무게 변화량
  unsigned long deltaT = time[n-1] - time[0];			// 시간 변화량
  if (deltaT == 0) return -1;					// 시간이 흐르지 않았다면 계산 X
  
  float rate = deltaW / (deltaT / 1000.0);      // g/sec
  float remaining = weight[n-1] - SIM_END_WEIGHT;        // 남은 수액(g)
  if (rate >= 0) return -1;                     // 오류: 무게 증가
  
  return remaining / (-rate);
}

//==============================================================================
// 이력에 추가
//==============================================================================
void addHistory(float weight, unsigned long ms) {
  weightHistory[idx] = weight;
  timeHistory[idx]   = ms;
  idx++;
  if (idx >= HISTORY_SIZE) {
    idx = 0;
    full = true;
  }
}

void printResult(float current, float sec, int count) {
  static unsigned long lastPrintTime = 0; // 마지막으로 출력한 시간을 기억 (static으로 선언해야 값이 유지됨)
  const int printInterval = 1000; // 출력 간격 1 = 1초
  unsigned long currentTime = millis();
	
  // 마지막으로 출력한 후 1초 이상 지났는지 확인
  if (currentTime - lastPrintTime >= printInterval) {
    lastPrintTime = currentTime; // 마지막 출력 시간을 현재 시간으로 업데이트
  
  if (sec > 0) {
    int m = sec / 60;
    int s = int(sec) % 60;
    digitalWrite(LED_BUILTIN, LOW);
  delay(300);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(300);
  digitalWrite(LED_BUILTIN, LOW);
  delay(300);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(2000);
    Serial.print("current weight : ");
  Serial.print(current, 1);
  Serial.print(" g");
    
    Serial.print(" | predict finish: ");
    Serial.print(m);
    Serial.print("min ");
    Serial.print(s);
    Serial.print("sec");
    Serial.println();
   
  } else {
    // Serial.print(" | predict: calculate...");
  }
  }
  // Serial.println();
}

//==============================================================================
// Setup
//==============================================================================
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  scale.begin(D1, D0);
  delay(200);
  Serial.print("read: \t\t\t");
	Serial.println(scale.read());

	delay(100);

	// 스케일 설정
	scale.set_scale(loadcellValue);
	
	// 오프셋 설정(10회 측정 후 평균값 적용) - 저울 위에 아무것도 없는 상태를 0g으로 정하는 기준점 설정(저울 위에 아무것도 올려두지 않은 상태여야 합니다.)   
	scale.tare(10);    

	// 설정된 오프셋 및 스케일 값 확인
	Serial.print("Offset value :\t\t");
	Serial.println(scale.get_offset());
	Serial.print("Scale value :\t\t");
	Serial.println(scale.get_scale());

	// (read - offset) 값 확인 (scale 미적용)
	Serial.print("(read - offset) value: \t");  
	Serial.println(scale.get_value());
	delay(2000);
  while (!Serial);
  startMillis = millis();
  Serial.print(F("Connecting to "));
  Serial.print(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(F("."));
  }
  Serial.println();
  Serial.println(F("WiFi connected"));

  server.begin();
  Serial.println(F("started"));

  Serial.println(WiFi.localIP());
  Serial.println("=== IV Simulation: predict vs real time ===");
  Serial.println("----------------------------------------");
  
  // 초기 이력에 첫 데이터

  addHistory(SIM_START_WEIGHT, 0);
}

void loop() {
  if (completed) return;
  static unsigned long last = 0;
  unsigned long now = millis();

  if (now - last >= INTERVAL) {
    unsigned long elapsedMillis = now - startMillis;

    // --- 가상 무게 계산 로직 ---
    float progress = (float)elapsedMillis / (SIM_TOTAL_DURATION_SEC * 1000.0);
    if (progress > 1.0) {
      progress = 1.0;
    }
    // 현재 진행률에 따라 선형적으로 무게 감소
    // float weight = SIM_START_WEIGHT - (SIM_START_WEIGHT - SIM_END_WEIGHT) * progress;
    float weight = scale.get_units(5);
    // 2) 이력 저장
    
    addHistory(weight, elapsedMillis);
    
   	int count = full ? HISTORY_SIZE : idx;
    float predictedRemainingSec = linearCal(weightHistory, timeHistory, count);
     
    // --- 4. 초기 전체 예측 시간 캡처 (핵심 로직) ---
    // 아직 캡처 안했고, 데이터가 5개 쌓였으며, 예측이 유효할 때
    if (!predictionCaptured && idx == 5 && predictedRemainingSec > 0) {
      float elapsedSec = elapsedMillis / 1000.0;
      // 초기 전체 예측 시간 = (경과 시간) + (예측된 남은 시간)
      initialTotalPredictionSec = elapsedSec + predictedRemainingSec;
      predictionCaptured = true; // 다시 캡처하지 않도록 플래그 설정
    }

    // --- 5. 현재 상태 출력 ---
    printResult(weight, predictedRemainingSec, count);

    // --- 6. 완료 감지 및 최종 비교 ---
    if (weight <= SIM_END_WEIGHT) {
      completed = true;
      float actualSec = elapsedMillis / 1000.0;

      Serial.println("\n>>> Simulation Finished <<<");
      
      // 실제 소요 시간 출력
      Serial.print("Actual Total Time : ");
      Serial.print(int(actualSec / 60));
      Serial.print(" min ");
      Serial.print(int(actualSec) % 60);
      Serial.println(" sec");

      // 초기 예측 시간과 비교
      if (initialTotalPredictionSec > 0) {
        Serial.print("Initial Predicted Total Time : ");
        Serial.print(int(initialTotalPredictionSec / 60));
        Serial.print(" min ");
        Serial.print(int(initialTotalPredictionSec) % 60);
        Serial.println(" sec");
      } else {
        Serial.println("Initial prediction was not captured.");
     		 } // else
  	 	 } // 완료감지

	} // if interval
} // loop
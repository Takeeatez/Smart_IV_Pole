/*
 * Smart IV Pole - 로드셀 캘리브레이션 프로그램
 * 
 * 이 프로그램으로 로드셀의 calibration_factor를 찾습니다.
 * 
 * 사용법:
 * 1. 이 코드를 ESP8266에 업로드
 * 2. 시리얼 모니터 열기 (115200 baud)
 * 3. 안내에 따라 캘리브레이션 진행
 */

#include <HX711.h>

// HX711 핀 설정 (메인 코드와 동일)
const int LOADCELL_DOUT_PIN = 4;  // D2
const int LOADCELL_SCK_PIN = 0;   // D3

HX711 scale;

float calibration_factor = -90;     // 50kg 로드셀 초기값 (조정 필요)
float known_weight = 5000.0;       // 알려진 무게 (그램 단위) - 5kg (50kg 로드셀에 적합)

void setup() {
  Serial.begin(115200);
  Serial.println("========================================");
  Serial.println("    로드셀 캘리브레이션 프로그램");
  Serial.println("========================================");
  Serial.println();
  
  // HX711 초기화
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  
  Serial.println("HX711 초기화 완료!");
  Serial.println();
  Serial.println("시리얼 모니터에서 다음 명령을 사용하세요:");
  Serial.println("----------------------------------------");
  Serial.println("  t : 영점 조정 (Tare) - 로드셀 비우고 실행");
  Serial.println("  c : 캘리브레이션 시작");
  Serial.println("  + : calibration_factor 100 증가");
  Serial.println("  - : calibration_factor 100 감소");
  Serial.println("  1 : calibration_factor 10 증가");
  Serial.println("  2 : calibration_factor 10 감소");
  Serial.println("  w : 알려진 무게 설정 (기본 1000g)");
  Serial.println("  r : 현재 무게 읽기");
  Serial.println("  s : 현재 설정 저장하고 종료");
  Serial.println("----------------------------------------");
  Serial.println();
  
  // 초기 설정
  scale.set_scale(calibration_factor);
  scale.tare();  // 영점 조정
  
  Serial.println("준비 완료! 명령을 입력하세요.");
  Serial.println();
}

void loop() {
  // 현재 무게 표시
  scale.set_scale(calibration_factor);
  float current_weight = scale.get_units(10);  // 10회 평균
  
  Serial.print("현재 무게: ");
  Serial.print(current_weight);
  Serial.print(" g");
  Serial.print("   |   Calibration Factor: ");
  Serial.print(calibration_factor);
  Serial.print("   |   Raw: ");
  Serial.println(scale.read_average(10));
  
  // 시리얼 입력 처리
  if (Serial.available()) {
    char temp = Serial.read();
    
    switch(temp) {
      case 't':
      case 'T':
        tare();
        break;
        
      case 'c':
      case 'C':
        calibrate();
        break;
        
      case '+':
        calibration_factor += 100;
        Serial.print("새 Calibration Factor: ");
        Serial.println(calibration_factor);
        break;
        
      case '-':
        calibration_factor -= 100;
        Serial.print("새 Calibration Factor: ");
        Serial.println(calibration_factor);
        break;
        
      case '1':
        calibration_factor += 10;
        Serial.print("새 Calibration Factor: ");
        Serial.println(calibration_factor);
        break;
        
      case '2':
        calibration_factor -= 10;
        Serial.print("새 Calibration Factor: ");
        Serial.println(calibration_factor);
        break;
        
      case 'w':
      case 'W':
        setKnownWeight();
        break;
        
      case 'r':
      case 'R':
        readWeight();
        break;
        
      case 's':
      case 'S':
        saveAndExit();
        break;
    }
  }
  
  delay(100);
}

// 영점 조정
void tare() {
  Serial.println();
  Serial.println("========================================");
  Serial.println("영점 조정 시작...");
  Serial.println("로드셀에서 모든 무게를 제거하세요!");
  Serial.println("3초 후 영점 조정을 시작합니다...");
  
  delay(3000);
  
  scale.tare();
  
  Serial.println("영점 조정 완료!");
  Serial.println("========================================");
  Serial.println();
}

// 캘리브레이션 수행
void calibrate() {
  Serial.println();
  Serial.println("========================================");
  Serial.println("캘리브레이션 시작!");
  Serial.println();
  Serial.println("단계 1: 로드셀 비우기");
  Serial.println("로드셀에서 모든 무게를 제거하고 Enter를 누르세요...");
  
  while(!Serial.available());
  while(Serial.available()) Serial.read();  // 버퍼 비우기
  
  scale.set_scale();
  scale.tare();
  
  Serial.println("영점 설정 완료!");
  Serial.println();
  Serial.print("단계 2: 알려진 무게 올리기 (");
  Serial.print(known_weight);
  Serial.println("g)");
  Serial.println("무게를 올리고 Enter를 누르세요...");
  
  while(!Serial.available());
  while(Serial.available()) Serial.read();  // 버퍼 비우기
  
  // Raw 값 읽기
  long raw_reading = scale.read_average(20);
  
  // Calibration factor 계산
  calibration_factor = raw_reading / known_weight;
  
  Serial.println();
  Serial.println("캘리브레이션 완료!");
  Serial.print("계산된 Calibration Factor: ");
  Serial.println(calibration_factor);
  Serial.println();
  Serial.println("미세 조정이 필요하면 +/- 또는 1/2 키를 사용하세요.");
  Serial.println("========================================");
  Serial.println();
  
  scale.set_scale(calibration_factor);
}

// 알려진 무게 설정
void setKnownWeight() {
  Serial.println();
  Serial.println("새로운 기준 무게를 입력하세요 (그램 단위):");
  
  while(!Serial.available());
  known_weight = Serial.parseFloat();
  
  Serial.print("기준 무게가 ");
  Serial.print(known_weight);
  Serial.println("g 으로 설정되었습니다.");
  Serial.println();
}

// 현재 무게 읽기
void readWeight() {
  Serial.println();
  Serial.println("========================================");
  Serial.println("무게 측정 중... (20회 평균)");
  
  float weight = scale.get_units(20);
  
  Serial.print("측정된 무게: ");
  Serial.print(weight);
  Serial.println(" g");
  Serial.print("Raw 값: ");
  Serial.println(scale.read_average(20));
  Serial.println("========================================");
  Serial.println();
}

// 설정 저장 및 종료
void saveAndExit() {
  Serial.println();
  Serial.println("========================================");
  Serial.println("최종 Calibration Factor:");
  Serial.println(calibration_factor);
  Serial.println();
  Serial.println("이 값을 메인 코드의 calibration_factor 변수에");
  Serial.println("복사해서 사용하세요!");
  Serial.println();
  Serial.println("예시:");
  Serial.print("float calibration_factor = ");
  Serial.print(calibration_factor);
  Serial.println(";");
  Serial.println("========================================");
  
  // 무한 루프로 프로그램 정지
  while(1);
}
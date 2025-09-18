/*
 * Smart IV Pole - ESP8266 Weight Measurement System
 * Load Cell HX711 + ESP8266 (NodeMCU/Wemos D1 Mini)
 * 
 * Hardware Connections:
 * HX711 -> ESP8266
 * VCC -> 3.3V
 * GND -> GND  
 * DT (Data) -> D2 (GPIO4)
 * SCK (Clock) -> D3 (GPIO0)
 * 
 * Load Cell -> HX711
 * Red -> E+
 * Black -> E-
 * White -> A-
 * Green -> A+
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <HX711.h>
#include <ArduinoJson.h>

// WiFi Configuration
const char* ssid = "YourWiFiSSID";
const char* password = "YourWiFiPassword";

// MQTT Configuration
const char* mqtt_server = "192.168.1.100";  // MQTT 브로커 IP
const int mqtt_port = 1883;
const char* mqtt_user = "";  // MQTT 사용자명 (필요시)
const char* mqtt_password = "";  // MQTT 비밀번호 (필요시)
const char* device_id = "pole_001";  // 폴대 고유 ID

// MQTT Topics
char topic_weight[50];
char topic_status[50];
char topic_battery[50];
char topic_alert[50];
char topic_button[50];

// HX711 Pins
const int LOADCELL_DOUT_PIN = 4;  // D2
const int LOADCELL_SCK_PIN = 0;   // D3

// LED & Button Pins
const int LED_RED = 5;     // D1 - 경고 LED
const int LED_GREEN = 14;  // D5 - 정상 LED
const int BUTTON_PIN = 12; // D6 - 호출 버튼

// HX711 Instance
HX711 scale;

// WiFi & MQTT Clients
WiFiClient espClient;
PubSubClient client(espClient);

// Calibration factor (adjust based on your load cell)
float calibration_factor = -90.0;  // 50kg 로드셀 예상값, 캘리브레이션 필요

// Variables
float current_weight = 0;
float previous_weight = 0;
float initial_weight = 0;
float fluid_remaining_percent = 100;
unsigned long last_msg = 0;
unsigned long last_stable_time = 0;
bool is_stable = false;
const float STABLE_THRESHOLD = 2.0;  // 안정 상태 판단 임계값 (g)
const unsigned long STABLE_TIME = 3000;  // 3초간 안정 필요

// Moving average filter
const int NUM_READINGS = 10;
float readings[NUM_READINGS];
int readIndex = 0;
float total = 0;
float average = 0;

// Button debounce
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;
int buttonState;
int lastButtonState = LOW;

// Setup WiFi Connection
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_RED, !digitalRead(LED_RED));  // Blink red LED
  }
  
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, HIGH);
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

// MQTT Callback
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // Handle commands from server
  if (String(topic) == String(device_id) + "/command") {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      const char* cmd = doc["command"];
      
      if (strcmp(cmd, "calibrate") == 0) {
        calibrateScale();
      } else if (strcmp(cmd, "tare") == 0) {
        scale.tare();
        Serial.println("Scale tared");
      } else if (strcmp(cmd, "reset") == 0) {
        initial_weight = current_weight;
        Serial.println("Initial weight reset");
      }
    }
  }
}

// Reconnect to MQTT
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    String clientId = "ESP8266-" + String(device_id);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("connected");
      
      // Publish online status
      client.publish(topic_status, "{\"status\":\"online\"}");
      
      // Subscribe to command topic
      char cmd_topic[50];
      snprintf(cmd_topic, 50, "%s/command", device_id);
      client.subscribe(cmd_topic);
      
      digitalWrite(LED_GREEN, HIGH);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      digitalWrite(LED_RED, HIGH);
      delay(5000);
      digitalWrite(LED_RED, LOW);
    }
  }
}

// Calibrate scale
void calibrateScale() {
  Serial.println("Starting calibration...");
  Serial.println("Remove all weight from scale");
  delay(5000);
  
  scale.set_scale();
  scale.tare();
  
  Serial.println("Place known weight on scale");
  delay(5000);
  
  float known_weight = 5000.0;  // 5kg calibration weight (50kg 로드셀에 적합)
  calibration_factor = scale.get_units(10) / known_weight;
  scale.set_scale(calibration_factor);
  
  Serial.print("Calibration factor: ");
  Serial.println(calibration_factor);
}

// Read weight with moving average filter
float readFilteredWeight() {
  total = total - readings[readIndex];
  readings[readIndex] = scale.get_units();
  total = total + readings[readIndex];
  readIndex = readIndex + 1;
  
  if (readIndex >= NUM_READINGS) {
    readIndex = 0;
  }
  
  average = total / NUM_READINGS;
  return average;
}

// Check if weight is stable
bool checkStability() {
  float diff = abs(current_weight - previous_weight);
  
  if (diff < STABLE_THRESHOLD) {
    if (millis() - last_stable_time > STABLE_TIME) {
      return true;
    }
  } else {
    last_stable_time = millis();
  }
  
  return false;
}

// Calculate fluid remaining percentage
void calculateFluidRemaining() {
  if (initial_weight > 0) {
    fluid_remaining_percent = (current_weight / initial_weight) * 100;
    if (fluid_remaining_percent < 0) fluid_remaining_percent = 0;
    if (fluid_remaining_percent > 100) fluid_remaining_percent = 100;
  }
}

// Send weight data via MQTT
void sendWeightData() {
  StaticJsonDocument<200> doc;
  doc["pole_id"] = device_id;
  doc["weight"] = current_weight;
  doc["fluid_percent"] = fluid_remaining_percent;
  doc["is_stable"] = is_stable;
  doc["timestamp"] = millis();
  
  char buffer[256];
  serializeJson(doc, buffer);
  
  client.publish(topic_weight, buffer);
  
  // Check for alerts
  if (fluid_remaining_percent < 10 && fluid_remaining_percent > 0) {
    client.publish(topic_alert, "{\"type\":\"low\",\"level\":\"warning\"}");
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
  } else if (fluid_remaining_percent <= 0) {
    client.publish(topic_alert, "{\"type\":\"empty\",\"level\":\"critical\"}");
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_GREEN, LOW);
  } else {
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_GREEN, HIGH);
  }
}

// Handle button press
void handleButton() {
  int reading = digitalRead(BUTTON_PIN);
  
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }
  
  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;
      
      if (buttonState == LOW) {  // Button pressed (pull-up)
        Serial.println("Call button pressed");
        client.publish(topic_button, "{\"event\":\"pressed\"}");
        
        // Blink LEDs as feedback
        for (int i = 0; i < 3; i++) {
          digitalWrite(LED_RED, HIGH);
          digitalWrite(LED_GREEN, HIGH);
          delay(100);
          digitalWrite(LED_RED, LOW);
          digitalWrite(LED_GREEN, LOW);
          delay(100);
        }
      }
    }
  }
  
  lastButtonState = reading;
}

void setup() {
  Serial.begin(115200);
  Serial.println("Smart IV Pole - ESP8266 Starting...");
  
  // Initialize pins
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  digitalWrite(LED_RED, HIGH);  // Red on during setup
  digitalWrite(LED_GREEN, LOW);
  
  // Initialize topics
  snprintf(topic_weight, 50, "pole/%s/weight", device_id);
  snprintf(topic_status, 50, "pole/%s/status", device_id);
  snprintf(topic_battery, 50, "pole/%s/battery", device_id);
  snprintf(topic_alert, 50, "alert/%s", device_id);
  snprintf(topic_button, 50, "pole/%s/button", device_id);
  
  // Initialize HX711
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  
  Serial.println("Initializing scale...");
  scale.set_scale(calibration_factor);
  scale.tare();  // Reset to 0
  
  // Initialize moving average
  for (int i = 0; i < NUM_READINGS; i++) {
    readings[i] = 0;
  }
  
  // Connect to WiFi
  setup_wifi();
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Get initial weight reading
  delay(2000);
  initial_weight = scale.get_units(10);
  Serial.print("Initial weight: ");
  Serial.println(initial_weight);
  
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, HIGH);
}

void loop() {
  // Maintain MQTT connection
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read weight
  previous_weight = current_weight;
  current_weight = readFilteredWeight();
  
  // Check stability
  is_stable = checkStability();
  
  // Calculate fluid remaining
  if (is_stable) {
    calculateFluidRemaining();
  }
  
  // Send data every 1 second
  unsigned long now = millis();
  if (now - last_msg > 1000) {
    last_msg = now;
    
    sendWeightData();
    
    // Send battery level (mock for now - would read actual battery)
    float battery_voltage = analogRead(A0) * (3.3 / 1023.0) * 2;  // Voltage divider
    float battery_percent = map(battery_voltage * 100, 320, 420, 0, 100);
    
    StaticJsonDocument<100> battery_doc;
    battery_doc["battery_percent"] = battery_percent;
    battery_doc["voltage"] = battery_voltage;
    
    char battery_buffer[128];
    serializeJson(battery_doc, battery_buffer);
    client.publish(topic_battery, battery_buffer);
    
    // Debug output
    Serial.print("Weight: ");
    Serial.print(current_weight);
    Serial.print(" g | Fluid: ");
    Serial.print(fluid_remaining_percent);
    Serial.print("% | Stable: ");
    Serial.println(is_stable ? "Yes" : "No");
  }
  
  // Handle button
  handleButton();
  
  // Small delay
  delay(10);
}
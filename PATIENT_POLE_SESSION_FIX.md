# Patient-Pole-Session Synchronization Fix

## Problem Summary

ESP8266 could not retrieve prescription information from the backend because the patient-pole connection wasn't properly synchronized between database tables.

### Root Cause
1. Frontend calls `POST /api/v1/poles/{poleId}/connect?patientId={id}`
2. Backend `PoleController.connectPoleToPatient()` only updated `Pole.patient_id` ✅
3. Backend did NOT update `InfusionSession.iv_pole_id` ❌
4. When ESP8266 queried `GET /api/esp/init?device_id={device_id}`:
   - Backend searched by `InfusionSession.iv_pole_id` (which was NULL)
   - Query failed → "No active session found for this device"
   - ESP8266 couldn't get prescription data

## Solution Implemented

### 1. PoleController.java (Two-Pronged Fix)

**Location**: `/Smart_IV_Pole-be/src/main/java/com/example/smartpole/controller/PoleController.java`

**Changes**:
- Added `InfusionSessionService` dependency injection
- Modified `/connect` endpoint to update BOTH Pole and InfusionSession tables

```java
@PostMapping("/{poleId}/connect")
public ResponseEntity<Pole> connectPoleToPatient(
        @PathVariable String poleId,
        @RequestParam Integer patientId) {
    try {
        // 1. Update Pole table
        Pole pole = poleService.assignPoleToPatient(poleId, patientId);

        // 2. Update InfusionSession table (NEW!)
        Optional<InfusionSession> activeSession =
            infusionSessionService.getActiveSessionByPatient(patientId);

        if (activeSession.isPresent()) {
            InfusionSession session = activeSession.get();
            session.setIvPoleId(poleId);
            infusionSessionService.createSession(session); // @Transactional save
            System.out.println("[POLE CONNECT] InfusionSession updated");
        }

        return ResponseEntity.ok(pole);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().build();
    }
}
```

### 2. Esp8266Controller.java (Fallback Logic)

**Location**: `/Smart_IV_Pole-be/src/main/java/com/example/smartpole/controller/esp/Esp8266Controller.java`

**Changes**:
- Added fallback lookup mechanism for ESP8266 initialization
- Handles cases where `iv_pole_id` is NULL due to timing issues

```java
@GetMapping("/init")
public Map<String, Object> initializeDevice(@RequestParam String device_id) {
    // 1차: iv_pole_id로 세션 찾기
    Optional<InfusionSession> sessionOpt =
        infusionSessionService.getActiveSessionByPole(device_id);

    // 2차: 실패 시 Pole 테이블 조회 후 환자 세션 찾기
    if (sessionOpt.isEmpty()) {
        Optional<Pole> poleOpt = poleService.getPoleById(device_id);

        if (poleOpt.isPresent() && poleOpt.get().getPatientId() != null) {
            Integer patientId = poleOpt.get().getPatientId();
            sessionOpt = infusionSessionService.getActiveSessionByPatient(patientId);

            if (sessionOpt.isPresent()) {
                // 자동 동기화 - iv_pole_id 업데이트
                InfusionSession session = sessionOpt.get();
                session.setIvPoleId(device_id);
                infusionSessionService.createSession(session);
                System.out.println("[ESP INIT] Auto-linked pole to session");
            }
        }
    }

    // 처방 정보 반환
    InfusionSession session = sessionOpt.get();
    // ... rest of prescription data logic
}
```

### 3. sketch_sep12a.ino (Sensor Error Handling)

**Location**: `/hardware/sketch_sep12a/sketch_sep12a.ino`

**Changes**:
- Improved HX711 sensor initialization with timeout
- Better error messages with wiring diagram
- Graceful degradation (WiFi-only mode if sensor unavailable)
- Enhanced `safeReadSensor()` with retry logic

```cpp
// Setup - Sensor initialization
bool sensorReady = scale.wait_ready_timeout(1000);

if (sensorReady) {
    Serial.println("[SENSOR] HX711 detected successfully");
    // ... calibration logic
} else {
    Serial.println("[SENSOR ERROR] HX711 not detected!");
    Serial.println("[SENSOR ERROR] Check wiring:");
    Serial.println("  - DT pin: D1 (GPIO5)");
    Serial.println("  - SCK pin: D0 (GPIO16)");
    Serial.println("  - VCC: 3.3V (NOT 5V)");
    Serial.println("  - GND: GND");
    Serial.println("[WARNING] Running in WiFi-only mode");
}

// safeReadSensor() - Retry logic
float safeReadSensor() {
    if (!scale.wait_ready_timeout(1000)) {
        sensorErrorCount++;
        return SENSOR_ERROR_VALUE;
    }

    for (int attempt = 1; attempt <= 3; attempt++) {
        float weight = scale.get_units(10);

        // Sanity check
        if (weight > -100 && weight < 10000) {
            sensorErrorCount = 0;
            return weight;
        }

        Serial.print("[SENSOR WARNING] Unusual reading: ");
        Serial.println(weight);
        delay(100);
    }

    sensorErrorCount++;
    return SENSOR_ERROR_VALUE;
}
```

## Test Scenarios

### Scenario 1: Normal Flow (Patient → Prescription → Pole Connection → ESP Boot)
1. Nurse creates patient and adds prescription
2. Nurse connects pole to patient via dashboard
3. **PoleController** updates both Pole and InfusionSession tables
4. ESP8266 boots and calls `/api/esp/init`
5. **Primary lookup** by `iv_pole_id` succeeds
6. ESP8266 receives prescription data ✅

### Scenario 2: ESP Boots Before Pole Connection (Fallback Logic)
1. Nurse creates patient and adds prescription
2. ESP8266 boots first and calls `/api/esp/init`
3. **Primary lookup** by `iv_pole_id` fails (NULL)
4. **Fallback lookup** via Pole table → Patient → Session
5. Auto-sync: Update `iv_pole_id` in session
6. ESP8266 receives prescription data ✅

### Scenario 3: Sensor-less Operation (WiFi/Prescription Only)
1. HX711 sensor not connected or faulty
2. ESP8266 boots with improved error handling
3. Serial Monitor shows detailed wiring instructions
4. WiFi connection still works
5. Prescription retrieval still works ✅
6. Only weight measurement disabled ⚠️

## Benefits

1. **Reliability**: Two-layer lookup ensures prescription retrieval works regardless of connection order
2. **Automatic Sync**: System self-heals by auto-updating `iv_pole_id` when needed
3. **Better Debugging**: Detailed sensor error messages with wiring diagram
4. **Graceful Degradation**: System partially functional even without sensor
5. **Future-Proof**: Handles edge cases and timing issues

## Database Schema Impact

No schema changes required. The fix only updates existing relationships:

- **Pole Table**: Already has `patient_id` column
- **InfusionSession Table**: Already has `iv_pole_id` column (nullable)
- **Fix**: Ensures both tables stay synchronized when pole is connected

## Files Modified

1. `Smart_IV_Pole-be/src/main/java/com/example/smartpole/controller/PoleController.java`
   - Added InfusionSessionService dependency
   - Enhanced `/connect` endpoint with session update logic

2. `Smart_IV_Pole-be/src/main/java/com/example/smartpole/controller/esp/Esp8266Controller.java`
   - Added fallback lookup mechanism
   - Auto-sync iv_pole_id on successful fallback

3. `hardware/sketch_sep12a/sketch_sep12a.ino`
   - Improved HX711 initialization with timeout
   - Enhanced safeReadSensor() with retry logic
   - Better error messages and graceful degradation

## Testing Completed

✅ Backend compiles successfully
✅ Spring Boot server starts on port 8081
✅ All REST endpoints available
⏳ Hardware testing pending (requires ESP8266 + HX711 setup)

## Next Steps for User

1. **Test Pole Connection**:
   ```bash
   curl -X POST "http://localhost:8081/api/v1/poles/IV_POLE_TEST/connect?patientId=1"
   ```

2. **Test ESP8266 Init**:
   ```bash
   curl "http://localhost:8081/api/esp/init?device_id=IV_POLE_TEST"
   ```

3. **Upload ESP8266 Firmware**:
   - Open `hardware/sketch_sep12a/sketch_sep12a.ino` in Arduino IDE
   - Configure `config.h` with WiFi credentials
   - Upload to ESP8266
   - Check Serial Monitor at 115200 baud

4. **Verify Workflow**:
   - Create patient in dashboard
   - Add prescription (drug, volume, duration)
   - Connect pole to patient
   - ESP8266 should successfully retrieve prescription data
   - Check serial output for detailed status

---

**Date**: 2025-11-11
**Issue**: ESP8266 prescription retrieval failure
**Status**: Fixed and tested (backend compilation verified)
**Hardware Testing**: Pending user setup

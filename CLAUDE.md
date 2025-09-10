# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart IV Pole (스마트 링거 폴대) is an IoT-based medical device graduation project that transforms standard IV poles into intelligent monitoring systems. The system uses sensors and communication modules to monitor IV fluid administration status, reducing nursing workload and enabling real-time monitoring for patients and caregivers.

## System Architecture

The project follows a modular retrofit design with these main components:

### Hardware Components
- **Load Cell Sensors (2x)**: Weight measurement for fluid level tracking using HX711 ADC modules with ESP32
  - Measurement algorithm: Nurse input as primary, supplemented by load cell for accuracy
  - Only measures when stable (3+ seconds without movement) to avoid irregular readings
  - Calculates expected depletion time based on weight reduction rate
- **Display/Tablet**: Patient interface showing fluid status and call button
- **Call Button & Status LEDs**: Emergency communication and visual status indicators
- **MCU (ESP32)**: Central processing unit for sensor data and communication
- **Battery System**: Rechargeable power with 24+ hour operation

### Software Architecture
- **Embedded Firmware**: Real-time sensor processing, infusion rate calculation, anomaly detection
- **Mobile App (Flutter)**: Patient/caregiver interface for real-time monitoring and alerts
- **Web Dashboard**: Nurse monitoring system for ward-wide IV status management
  - Real-time monitoring with color-coded status (Green: >30%, Orange: 10-30%, Red: <10%, Gray: Offline)
  - Priority-based alert management with quick action buttons
  - Patient-specific detailed management and automated nursing records
  - Role-based access control (head nurse vs general nurse)
  - Mobile/tablet optimized views for ward rounds
  - WebSocket-based real-time updates (1-second intervals)
- **Pole UI**: Built-in display for direct patient interaction

### Communication Flow
```
[Sensors] → [MCU + BLE/Wi-Fi] → [Cloud/Hospital Server] → [Apps/Dashboard]
```

## Key Algorithms

### Infusion Rate Calculation
- Primary input from nurse's manual entry for accuracy
- Load cell measurements as supplementary accuracy enhancement
- Stable value detection (3+ seconds without movement) before measurement
- Weight-based flow rate monitoring (mL/min) when stable
- Moving average filters for noise reduction
- Real-time consumption tracking with depletion time calculation

### Predictive Modeling  
- Remaining time estimation based on stable weight reduction trends
- Linear regression for depletion forecasting during stable periods
- Adaptive thresholds for patient-specific patterns

### Anomaly Detection
- Flow rate change detection
- Infusion stoppage monitoring
- Low fluid level alerts (10% threshold for warnings)
- Sensor malfunction detection

## Technology Stack (확정)

### Backend
- **Framework**: Spring Boot (Java)
- **Database**: MariaDB
- **Message Broker**: MQTT (Eclipse Mosquitto)
- **Build Tool**: Maven/Gradle

### Frontend (간호사 대시보드)
- **Framework**: React
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Real-time**: MQTT.js (WebSocket over MQTT)

### Mobile App
- **Framework**: Flutter
- **Language**: Dart
- **State Management**: Provider/Riverpod
- **MQTT Client**: mqtt_client package

### Hardware
- **MCU**: ESP32
- **MQTT Library**: PubSubClient
- **Sensors**: HX711 (Load Cell), LED, Button
- **Development**: Arduino IDE / PlatformIO

## Development Commands

### Backend (Spring Boot)
- **Location**: `Smart_IV_Pole-be/` directory
- **Port**: Runs on port 8081 (configured in `application.properties`)
```bash
cd Smart_IV_Pole-be/
./gradlew bootRun         # 개발 서버 실행 (port 8081)
./gradlew test            # 테스트 실행
./gradlew build          # 빌드
./gradlew clean build    # 클린 빌드
```

### Frontend (React)
- **Location**: `frontend/` directory  
- **Port**: Development server on port 5173 (Vite default)
- **Build System**: Vite with TypeScript and React 19
```bash
cd frontend/
npm install               # 의존성 설치
npm run dev              # 개발 서버 (Vite) - http://localhost:5173
npm run build            # TypeScript 컴파일 + Vite 프로덕션 빌드
npm run lint             # ESLint 코드 검사
npm run preview          # 빌드 결과 미리보기
```

### Database & MQTT
```bash
# MariaDB 컨테이너 실행 (if using Docker)
docker-compose up -d mariadb    

# MQTT 브로커 실행 (if using Docker)  
docker-compose up -d mosquitto  
```

### Mobile (Flutter)
```bash
flutter pub get           # 의존성 설치
flutter run              # 개발 실행
flutter build apk        # Android 빌드
flutter build ios        # iOS 빌드
```

## Project Structure

```
Smart_IV_Pole/
├── Smart_IV_Pole-be/    # Spring Boot 서버 (port 8081)
│   ├── src/main/java/
│   ├── src/main/resources/
│   │   └── application.properties  # 서버 포트 8081 설정
│   └── build.gradle                # Gradle 빌드 설정
├── frontend/            # React 간호사 대시보드 (port 5173)
│   ├── src/
│   │   ├── components/  # 재사용 가능한 컴포넌트
│   │   │   ├── layout/  # 레이아웃 컴포넌트
│   │   │   ├── ward/    # 병동 관련 컴포넌트
│   │   │   └── patient/ # 환자 관련 컴포넌트
│   │   ├── hooks/       # 커스텀 훅 (MQTT 연결 등)
│   │   ├── services/    # API 서비스 & localStorage 관리
│   │   │   ├── api.ts              # 백엔드 API 연동
│   │   │   └── storageService.ts   # 로컬 데이터 영속성
│   │   ├── stores/      # Zustand 상태 관리
│   │   │   └── wardStore.ts        # 중앙 상태 관리
│   │   ├── types/       # TypeScript 타입 정의
│   │   ├── utils/       # 유틸리티 (GTT 계산기 등)
│   │   └── pages/       # 페이지 컴포넌트
│   ├── public/
│   ├── package.json
│   └── CLAUDE.md        # 프론트엔드 전용 가이드
├── mobile/              # Flutter 앱 (계획)
├── hardware/            # ESP32 펌웨어 (계획)
├── DB/                  # 데이터베이스 스키마
└── README.md            # 프로젝트 전체 개요
```

## Security & Privacy Considerations

- Location tracking limited to hospital premises
- Caregiver app requires QR code/access code authentication
- All communications encrypted with TLS/SSL
- Minimal patient data storage with anonymization
- Role-based access control (admin/nurse/caregiver permissions)
- Medical device compliance preparation (KC certification, medical device approval)

## MQTT Topic Structure

### Device Topics
- `pole/{poleId}/status` - 폴대 온라인/오프라인 상태
- `pole/{poleId}/weight` - 로드셀 무게 데이터 (실시간)
- `pole/{poleId}/battery` - 배터리 잔량
- `pole/{poleId}/button` - 호출 버튼 이벤트

### Alert Topics
- `alert/{poleId}/low` - 수액 부족 알림 (10% 미만)
- `alert/{poleId}/empty` - 수액 소진 알림
- `alert/{poleId}/abnormal` - 비정상 상태 감지

### Dashboard Topics
- `dashboard/update` - 대시보드 전체 업데이트
- `nurse/{nurseId}/alert` - 간호사별 알림
- `ward/{wardId}/status` - 병동별 상태 업데이트

## Database Schema

### Core Tables
- **patients** - 환자 정보 (id, name, room, bed)
- **iv_poles** - 폴대 장치 정보 (id, status, battery_level)
- **iv_sessions** - 수액 투여 세션 (id, patient_id, pole_id, start_time, volume)
- **measurements** - 센서 측정값 시계열 데이터 (timestamp, pole_id, weight, flow_rate)
- **alerts** - 알림 이력 (id, type, pole_id, timestamp, acknowledged)
- **nurses** - 간호사 정보 (id, name, ward, role)

## Development Workflow

### Phase 1: API 설계 & Mock 구현 (1-2주)
1. Spring Boot REST API 설계
2. MariaDB 스키마 설계
3. MQTT 토픽 구조 정의
4. Mock 데이터 생성

### Phase 2: 핵심 기능 개발 (3-4주)
1. Spring Boot API 구현
2. React 대시보드 UI 구현
3. MQTT 통신 연동
4. ESP32 시뮬레이터 개발

### Phase 3: 통합 & 테스트 (2-3주)
1. 실제 하드웨어 연동
2. Flutter 앱 개발
3. 전체 시스템 테스트

## Core Medical Algorithm

### GTT (점적수) Calculation System
The most critical component is the **GTT calculator** that bridges manual nurse input with real-time sensor data:

- **Primary Input**: Nurse manual entry for medication volume, duration, and GTT factor
- **Formula**: `(총 용량 × GTT factor) / 투여 시간(분)` where GTT factor is 20 (macro) or 60 (micro)
- **Real-time Monitoring**: ESP32 load cell data provides accuracy verification
- **Status Algorithm**: Compare expected vs. actual depletion rates:
  - **정상 (Normal)**: Actual rate within ±10% of calculated rate  
  - **주의 (Warning)**: 10-20% deviation from expected rate
  - **응급 (Critical)**: >20% deviation - major discrepancy requiring immediate attention

This algorithm is the **core differentiator** - providing intelligent early warning when actual IV consumption significantly deviates from nurse's initial calculations.

## Frontend Architecture

### State Management with Data Persistence
- **wardStore.ts**: Central Zustand store managing all ward data with localStorage persistence
- **storageService.ts**: Handles local data persistence - prevents data loss on refresh/navigation
- **Real-time Updates**: Mock MQTT simulation with persistent state across sessions

### API Integration
- **Backend Connection**: Automatically connects to Spring Boot server on port 8081
- **Offline Mode**: Falls back to localStorage when backend unavailable
- **Data Synchronization**: Server data takes priority, with local persistence as fallback

### Component Architecture
- **WardOverview**: Main dashboard with 6-bed grid and real-time status monitoring
- **PatientList**: Comprehensive patient management with search and detailed IV tracking
- **PatientModal**: Patient registration/editing with GTT prescription calculator
- **Real-time Navigation**: Data persists across all routes and page refreshes

### Data Flow Architecture
```
ESP32 Sensors → MQTT → Backend (port 8081) → Frontend API calls → wardStore → localStorage
                                                                      ↓
                                                            UI Components (persistent)
```

### Key Features Implemented
- ✅ **Data Persistence**: localStorage prevents data loss on navigation/refresh
- ✅ **Backend Integration**: Automatic server connection with offline fallback
- ✅ **Patient Management**: Full CRUD operations with GTT prescription calculator
- ✅ **Ward Monitoring**: 6-bed dashboard with color-coded real-time status
- ✅ **Alert System**: Priority-based notifications with acknowledgment tracking
- ✅ **GTT Calculator**: Medical-grade IV infusion rate calculations
- 🚧 Individual patient detail pages (planned)
- 🚧 ESP32 hardware integration (in development)

## Notes for Implementation

- Focus on modular design for easy integration with existing hospital infrastructure
- Prioritize user-friendly interfaces for medical staff adoption
- Implement robust error handling and fallback mechanisms for critical alerts
- Plan for scalability to support multiple concurrent pole monitoring
- Consider integration points with existing hospital EMR and call systems

## Nurse Dashboard Specific Requirements

### UI/UX Principles
- **3-Click Rule**: All major functions accessible within 3 clicks
- **Color Standardization**: Red (Emergency), Orange (Warning), Green (Normal), Gray (Inactive)
- **Touch-Friendly Design**: Minimum touch area of 44px × 44px for mobile/tablet use
- **Real-time Updates**: 1-second interval refresh via WebSocket

### Key Features to Implement
1. **Main Dashboard**: Ward-wide status overview with visual gauge bars
2. **Alert Management**: Priority-sorted alerts with quick acknowledgment
3. **Patient Details**: Quick patient info cards with action buttons
4. **Patient Registration**: Simplified form for new patient IV setup
5. **Work Efficiency Tools**: Nurse workload distribution and scheduling
6. **Automated Records**: 5R checklist automation and hourly logs
7. **Statistics/Reports**: Daily performance metrics and trend analysis
8. **Mobile Optimization**: Responsive design for tablet use during rounds

### Data Integration Notes
- ESP32 load cell values must be received and displayed in real-time
- Gray status indicators when hardware is disconnected or under development
- Nurse manual input takes priority over sensor readings for accuracy

## Development Guidelines

### Frontend Development
- **Entry Point**: `frontend/src/App.tsx` - currently renders WardOverview as main page
- **Adding Components**: Place reusable components in `src/components/` with appropriate subdirectories
- **State Updates**: Use wardStore methods for consistent state management across components
- **Styling**: Tailwind CSS 4.0 with `@import "tailwindcss"` syntax in index.css
- **Icons**: Use Lucide React icons for consistency

### MQTT Integration Patterns
- Use `useMQTT()` hook for real-time data connections
- Mock data automatically simulates hardware scenarios during development
- Follow MQTT topic structure: `pole/{poleId}/weight`, `alert/{poleId}/low`, etc.
- Gray status automatically shows when hardware is offline or under development

### Color Coding Standards
- 🟢 Green (30%+ fluid): Normal operation
- 🟡 Orange (10-30% fluid): Attention needed
- 🔴 Red (<10% fluid): Critical/Emergency
- ⚫ Gray: Offline or hardware disconnected
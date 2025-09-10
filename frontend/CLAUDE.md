# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Smart IV Pole (스마트 링거 폴대) Frontend - A React TypeScript application for monitoring IV fluid administration in hospitals. This is the nurse dashboard component of a larger IoT medical device system that transforms standard IV poles into intelligent monitoring systems.

## Development Commands

### Core Development
```bash
npm run dev        # Start development server (Vite)
npm run build      # Build for production (TypeScript compilation + Vite build)
npm run preview    # Preview production build locally
npm run lint       # Run ESLint for code quality
```

### Development Notes
- Uses Vite for fast development and building
- TypeScript with strict type checking enabled
- ESLint configured for React + TypeScript
- No test framework currently configured

## Architecture Overview

### State Management Architecture
The application uses **Zustand** as the primary state management solution with a centralized store pattern:

- **wardStore.ts**: Central state store managing patients, beds, pole data, alerts, and ward statistics
- **Real-time Data Flow**: Mock MQTT simulation (`useMQTT.ts`) → Zustand store → React components
- **Data Persistence**: Currently in-memory only; store initializes with mock data for development

### Medical Domain Architecture
The core business logic revolves around **GTT (점적 수) calculations** for IV fluid administration:

- **GTT Calculation**: `(총 용량 × GTT factor) / 투여 시간(분)` where GTT factor is 20 (macro drip) or 60 (micro drip)
- **Flow Rate Calculation**: `(총 용량 × 60) / 투여 시간(분) = mL/hr`
- **Real-time Progress Tracking**: Continuous calculation of remaining time, progress percentage, and completion estimates
- **Medical Workflow**: Nurse receives doctor prescription → inputs medication details → system calculates dosing → monitors progress

### Component Architecture
```
src/
├── components/
│   ├── ward/          # Ward-level components (bed overview, cards)
│   ├── patient/       # Patient-specific components (modal, forms)
│   └── layout/        # Common layout components
├── pages/             # Route-level page components
├── stores/            # Zustand state management
├── hooks/             # Custom React hooks (MQTT, etc.)
├── utils/             # Business logic utilities (GTT calculator)
└── types/             # TypeScript type definitions
```

### Navigation Architecture
Uses **React Router v7** with route-based code splitting:
- `/` - Ward overview with bed grid and real-time alerts
- `/patients` - Patient list with search/filter capabilities  
- `/patient/:id` - Individual patient detail with IV monitoring

### Data Types Architecture
Core medical data structures:
- **Patient**: Basic patient info + current IV prescription + medical history
- **IVPrescription**: Complete prescription with calculated GTT/flow rates
- **PoleData**: Real-time sensor data from ESP32 hardware (weight, battery, flow rates)
- **Alert**: Medical alerts with severity levels (info/warning/critical)
- **BedInfo**: Hospital bed with associated patient and pole data

## Key Technical Concepts

### GTT Calculator System
Located in `src/utils/gttCalculator.ts` - implements medical formulas for IV fluid administration:
- Supports both macro drip (20 GTT/mL) and micro drip (60 GTT/mL) calculations
- Includes common medications and duration presets for nurse workflow
- Provides real-time progress tracking and completion estimation
- Handles flow rate deviation detection and alert generation

### MQTT Simulation System
Located in `src/hooks/useMQTT.ts` - simulates real-time hardware data:
- Mock implementation for development (hardware under development)
- Simulates ESP32 load cell data, battery levels, and patient interactions
- Generates realistic alert scenarios (low fluid, critical levels, button presses)
- Includes connection simulation with disconnection/reconnection scenarios

### Patient Management Workflow
The system implements a complete patient lifecycle:
1. **Registration**: Add patient to empty bed with basic info + IV prescription
2. **Monitoring**: Real-time tracking of IV progress with GTT calculations
3. **Alerts**: Automatic generation of medical alerts based on pole data
4. **Completion**: Progress tracking until IV administration complete

### Medical Data Validation
All medical calculations follow hospital protocols:
- GTT calculations rounded to 1 decimal place for nursing accuracy
- Flow rate deviation alerts (>10% warning, >20% critical)
- Battery level monitoring (>30% normal, 15-30% warning, <15% critical)
- Fluid level alerts (>30% normal, 10-30% warning, <10% critical)

## Technology Stack Integration

### Core Dependencies
- **React 19** + **TypeScript** for type-safe UI development
- **Tailwind CSS** for utility-first styling with custom medical theme
- **Zustand** for predictable state management
- **React Router v7** for navigation
- **Lucide React** for consistent medical iconography

### UI Component Strategy
- **Radix UI** primitives for accessible medical interfaces
- **shadcn/ui** patterns for consistent design system
- **Framer Motion** for subtle animations (medication progress, alerts)
- **React Query** for future API integration with backend

### Development Tooling
- **Vite** for fast development and optimized builds
- **ESLint** with React + TypeScript rules
- **PostCSS** + **Autoprefixer** for CSS processing
- **TypeScript ~5.8** with strict configuration

## Medical Compliance Considerations

### Data Accuracy
- All GTT calculations use medically-approved formulas
- Time-based progress tracking uses precise minute calculations
- Flow rate monitoring includes deviation detection for patient safety

### User Experience for Medical Staff
- 3-click rule: All major functions accessible within 3 clicks
- Color standardization: Red (Emergency), Orange (Warning), Green (Normal), Gray (Inactive)
- Touch-friendly design: Minimum 44px touch targets for tablet use during rounds
- Real-time updates: 1-second interval refresh for critical monitoring

### Alert Management
- Priority-based alert system with severity levels
- Alert acknowledgment tracking with nurse identification
- Critical alerts require immediate attention and cannot be dismissed easily
- Visual and contextual alert indicators throughout the interface

## Integration Points

### Future Hardware Integration
The codebase is structured for easy transition from mock data to real hardware:
- `useMQTT.ts` contains both mock and real MQTT implementations
- `useRealMQTT` function prepared for actual ESP32 communication
- MQTT topic structure documented in main project CLAUDE.md
- Pole data structure matches expected ESP32 sensor output format

### Backend API Readiness
State management and data types designed for REST API integration:
- All Zustand actions can be easily adapted to API calls
- TypeScript interfaces match expected database schema
- Patient management functions ready for backend synchronization
- Alert system prepared for real-time WebSocket integration
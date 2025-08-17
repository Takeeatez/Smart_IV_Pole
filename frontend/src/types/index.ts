// Smart IV Pole - Type Definitions

export interface Patient {
  id: string;
  name: string;
  room: string;
  bed: string;
  nurseId: string;
  nurseName: string;
  admissionDate: Date;
  age: number;
  gender: 'male' | 'female';
}

export interface PoleData {
  poleId: string;
  patientId?: string;
  weight: number;          // ESP32 로드셀 값 (g)
  capacity: number;        // 수액 총 용량 (ml)
  currentVolume: number;   // 현재 잔량 (ml)
  percentage: number;      // 잔량 퍼센트 (%)
  battery: number;         // 배터리 잔량 (%)
  status: 'online' | 'offline' | 'error';
  flowRate: number;        // 계산된 유량 (mL/h)
  prescribedRate: number;  // 처방된 유량 (mL/h)
  estimatedTime: number;   // 예상 완료시간 (분)
  lastUpdate: Date;
  isButtonPressed: boolean; // 호출 버튼 상태
}

export interface IVSession {
  id: string;
  patientId: string;
  poleId: string;
  medicationType: string;
  volume: number;
  prescribedRate: number;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'paused' | 'stopped';
  nurseName: string;
  doctorName: string;
}

export interface Alert {
  id: string;
  poleId: string;
  patientId?: string;
  type: 'low' | 'empty' | 'abnormal' | 'button_pressed' | 'battery_low' | 'offline';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface Ward {
  id: string;
  name: string;
  totalBeds: number;
  occupiedBeds: number;
  nurseInCharge: string;
}

export interface BedInfo {
  bedNumber: string;
  room: string;
  patient?: Patient;
  poleData?: PoleData;
  ivSession?: IVSession;
  status: 'occupied' | 'empty' | 'maintenance';
}

export type StatusColor = 'normal' | 'warning' | 'critical' | 'offline';

export interface WardStats {
  total: number;
  normal: number;
  warning: number;
  critical: number;
  offline: number;
}
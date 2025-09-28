// API 서비스 레이어 - 백엔드와 통신을 위한 함수들
// DB 스키마와 일치하는 데이터 구조 사용

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// DB 스키마에 맞춘 타입 정의 (실제 DB 스키마 반영)
export interface PatientDB {
  patientId?: number;
  name: string;
  phone: string; // 필수 필드 추가
  birthDate: string; // DB에서 birth_date 필드 사용
  gender: 'male' | 'female';
  weightKg?: number; // DB에서 weight_kg 필드 사용
  heightCm?: number; // DB에서 height_cm 필드 사용
  address?: string; // DB에 address 필드 추가
  roomId?: string; // DB에서 room_id 필드 사용
  bedNumber?: string; // DB에서 bed_number 필드 사용
  createdAt?: string;
}

export interface DripDB {
  dripId?: number;
  dripName: string;
}

export interface IVSessionDB {
  sessionId?: number;
  patientId: number;
  dripId: number;
  startTime: string;
  endTime?: string;
  endExpTime?: string;
  remainingVolume: number;
  flowRate: number;
  ivPoleId: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  totalVolumeMl: number;
}

export interface NurseDB {
  nurse_id?: number;
  name: string;
  employee_id: string;
  password?: string;
  role: 'Root' | 'Admin';
}

export interface WardDB {
  ward_id: string;
  ward_name: string;
}

export interface RoomDB {
  room_id: string;
  ward_id: string;
  patient_id?: number;
  room_number: string;
  room_person: number;
}

export interface PoleDB {
  pole_id: string;
  ward_id: string;
  status: 'active' | 'maintenance' | 'inactive';
  battery_level: number;
  last_maintenance?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AlertLogDB {
  alert_id?: number;
  session_id: number;
  alert_type: 'low_volume' | 'flow_stopped' | 'pole_fall' | 'battery_low' | 'system_error';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at?: string;
}

// API 헬퍼 함수
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // 백엔드에서 이미 ApiResponse 형태로 오므로 그대로 반환
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 환자 관련 API
export const patientAPI = {
  // 모든 환자 조회
  async getPatients(): Promise<ApiResponse<PatientDB[]>> {
    return apiRequest<PatientDB[]>('/patients');
  },

  // 특정 환자 조회
  async getPatient(patientId: number): Promise<ApiResponse<PatientDB>> {
    return apiRequest<PatientDB>(`/patients/${patientId}`);
  },

  // 환자 생성
  async createPatient(patient: Omit<PatientDB, 'patientId' | 'createdAt'>): Promise<ApiResponse<PatientDB>> {
    return apiRequest<PatientDB>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  },

  // 환자 정보 수정
  async updatePatient(patientId: number, patient: Partial<PatientDB>): Promise<ApiResponse<PatientDB>> {
    return apiRequest<PatientDB>(`/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  },

  // 환자 삭제
  async deletePatient(patientId: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/patients/${patientId}`, {
      method: 'DELETE',
    });
  },
};

// 수액 관련 API (Drug Types)
export const dripAPI = {
  // 모든 수액 조회
  async getDrips(): Promise<ApiResponse<DripDB[]>> {
    return apiRequest<DripDB[]>('/drips');
  },

  // 특정 수액 조회
  async getDrip(dripId: number): Promise<ApiResponse<DripDB>> {
    return apiRequest<DripDB>(`/drips/${dripId}`);
  },

  // 수액 추가
  async createDrip(drip: Omit<DripDB, 'dripId'>): Promise<ApiResponse<DripDB>> {
    return apiRequest<DripDB>('/drips', {
      method: 'POST',
      body: JSON.stringify(drip),
    });
  },

  // 수액 정보 수정
  async updateDrip(dripId: number, drip: Partial<DripDB>): Promise<ApiResponse<DripDB>> {
    return apiRequest<DripDB>(`/drips/${dripId}`, {
      method: 'PUT',
      body: JSON.stringify(drip),
    });
  },

  // 수액 삭제
  async deleteDrip(dripId: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/drips/${dripId}`, {
      method: 'DELETE',
    });
  },

  // 수액 존재 여부 확인
  async dripExists(dripId: number): Promise<ApiResponse<boolean>> {
    return apiRequest<boolean>(`/drips/${dripId}/exists`);
  },
};

// 수액 투여 세션 관련 API
export const ivSessionAPI = {
  // 현재 활성 세션 조회
  async getActiveSessions(): Promise<ApiResponse<IVSessionDB[]>> {
    return apiRequest<IVSessionDB[]>('/infusions/active');
  },

  // 특정 환자의 현재 세션 조회
  async getPatientSession(patientId: number): Promise<ApiResponse<IVSessionDB>> {
    return apiRequest<IVSessionDB>(`/infusions/patient/${patientId}`);
  },

  // 새로운 세션 시작
  async createSession(session: Omit<IVSessionDB, 'sessionId'>): Promise<ApiResponse<IVSessionDB>> {
    return apiRequest<IVSessionDB>('/infusions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  },

  // 세션 업데이트
  async updateSession(sessionId: number, updates: Partial<IVSessionDB>): Promise<ApiResponse<IVSessionDB>> {
    return apiRequest<IVSessionDB>(`/infusions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // 세션 종료
  async endSession(sessionId: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/infusions/${sessionId}/end`, {
      method: 'POST',
    });
  },
};

// 병동/병실 관련 API
export const wardAPI = {
  // 모든 병동 조회
  async getWards(): Promise<ApiResponse<WardDB[]>> {
    return apiRequest<WardDB[]>('/wards');
  },

  // 특정 병동의 병실 조회
  async getRooms(wardId: string): Promise<ApiResponse<RoomDB[]>> {
    return apiRequest<RoomDB[]>(`/wards/${wardId}/rooms`);
  },

  // 병실 정보 업데이트
  async updateRoom(roomId: string, updates: Partial<RoomDB>): Promise<ApiResponse<RoomDB>> {
    return apiRequest<RoomDB>(`/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// 폴대 관련 API
export const poleAPI = {
  // 모든 폴대 조회
  async getPoles(): Promise<ApiResponse<PoleDB[]>> {
    return apiRequest<PoleDB[]>('/poles');
  },

  // 특정 병동의 폴대 조회
  async getWardPoles(wardId: string): Promise<ApiResponse<PoleDB[]>> {
    return apiRequest<PoleDB[]>(`/wards/${wardId}/poles`);
  },

  // 폴대 상태 업데이트
  async updatePoleStatus(poleId: string, status: Partial<PoleDB>): Promise<ApiResponse<PoleDB>> {
    return apiRequest<PoleDB>(`/poles/${poleId}`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
  },
};

// 알림 관련 API
export const alertAPI = {
  // 활성 알림 조회
  async getActiveAlerts(): Promise<ApiResponse<AlertLogDB[]>> {
    return apiRequest<AlertLogDB[]>('/alerts/active');
  },

  // 특정 세션의 알림 조회
  async getSessionAlerts(sessionId: number): Promise<ApiResponse<AlertLogDB[]>> {
    return apiRequest<AlertLogDB[]>(`/alerts/session/${sessionId}`);
  },

  // 알림 생성
  async createAlert(alert: Omit<AlertLogDB, 'alert_id' | 'created_at'>): Promise<ApiResponse<AlertLogDB>> {
    return apiRequest<AlertLogDB>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  },

  // 알림 확인
  async acknowledgeAlert(alertId: number, nurseId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ acknowledged_by: nurseId }),
    });
  },
};

// 간호사 관련 API
export const nurseAPI = {
  // 로그인
  async login(employeeId: string, password: string): Promise<ApiResponse<NurseDB>> {
    return apiRequest<NurseDB>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ employee_id: employeeId, password }),
    });
  },

  // 간호사 정보 조회
  async getNurse(nurseId: number): Promise<ApiResponse<NurseDB>> {
    return apiRequest<NurseDB>(`/nurses/${nurseId}`);
  },

  // 모든 간호사 조회
  async getNurses(): Promise<ApiResponse<NurseDB[]>> {
    return apiRequest<NurseDB[]>('/nurses');
  },
};

// 모니터링 데이터 API
export const monitoringAPI = {
  // 실시간 모니터링 데이터 조회
  async getMonitoringData(sessionId: number): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/monitoring/session/${sessionId}`);
  },

  // 모니터링 데이터 저장
  async saveMonitoringData(data: any): Promise<ApiResponse<void>> {
    return apiRequest<void>('/monitoring', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Mock 데이터 사용 여부 확인 및 폴백
export const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3초 타임아웃
    });
    return response.ok;
  } catch (error) {
    console.warn('Server connection failed, using mock data');
    return false;
  }
};
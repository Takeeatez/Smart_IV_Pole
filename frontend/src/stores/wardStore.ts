import { create } from 'zustand';
import { Patient, PoleData, Alert, BedInfo, WardStats, StatusColor, IVPrescription } from '../types';
import { createIVPrescription } from '../utils/gttCalculator';
import { patientAPI, ivSessionAPI, checkServerConnection, PatientDB, IVSessionDB } from '../services/api';
import storageService from '../services/storageService';

interface WardStore {
  // State
  beds: BedInfo[];
  alerts: Alert[];
  patients: Patient[];
  poleData: Map<string, PoleData>;
  wardStats: WardStats;
  selectedPatientId: string | null;
  isLoading: boolean;
  error: string | null;
  isServerConnected: boolean;
  patientBedMapping: Map<string, string>; // patientId -> bedNumber mapping
  
  // Actions
  updatePoleData: (poleId: string, data: Partial<PoleData>) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string, nurseId: string) => void;
  removeAlert: (alertId: string) => void;
  setSelectedPatient: (patientId: string | null) => void;
  updateWardStats: () => void;
  initializeMockData: () => void;
  loadStoredData: () => boolean;
  saveToStorage: () => void;
  
  // Patient Management (with API integration)
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id'>, bedNumber: string, prescription?: Omit<IVPrescription, 'id'>) => Promise<void>;
  updatePatient: (patientId: string, updates: Partial<Patient>) => Promise<void>;
  removePatient: (patientId: string) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  endIVSession: (patientId: string) => Promise<void>;
  addIVPrescription: (patientId: string, prescription: Omit<IVPrescription, 'id'>) => void;
  updateIVPrescription: (patientId: string, prescription: Partial<IVPrescription>) => void;
  
  // Getters
  getBedStatus: (bedNumber: string) => StatusColor;
  getActiveAlerts: () => Alert[];
  getCriticalAlerts: () => Alert[];
  getPatientById: (patientId: string) => Patient | undefined;
  getBedByNumber: (bedNumber: string) => BedInfo | undefined;
  
  // Server connection
  checkConnection: () => Promise<void>;
}

// Helper function to determine status color based on pole data
const getStatusColor = (poleData?: PoleData): StatusColor => {
  if (!poleData || poleData.status === 'offline') return 'offline';
  if (poleData.status === 'error') return 'critical';
  if (poleData.percentage < 10) return 'critical';
  if (poleData.percentage <= 30) return 'warning';
  return 'normal';
};

// Helper function to convert DB patient to frontend Patient type
// 매핑 테이블을 사용하여 올바른 침대 할당
const convertDBPatientToFrontend = (dbPatient: PatientDB, existingPatient?: Patient, patientBedMapping?: Map<string, string>): Patient => {
  const patientId = `P${dbPatient.patientId}`;

  // 🔄 NEW: DB에서 침대 정보를 직접 사용 (매핑 시스템보다 우선)
  // 1. DB에서 침대 정보 사용 (최우선)
  // 2. 없으면 매핑 테이블에서 침대 정보 찾기
  // 3. 없으면 기존 환자 정보 사용
  // 4. 모두 없으면 기본값 사용
  let room = '301A';
  let bed = '1';

  if (dbPatient.roomId && dbPatient.bedNumber) {
    // DB에 침대 정보가 있으면 우선 사용
    room = dbPatient.roomId;
    bed = dbPatient.bedNumber;
    console.log(`🏥 Using DB bed info for ${dbPatient.name}: ${room}-${bed}`);
  } else if (patientBedMapping?.has(patientId)) {
    // DB에 없으면 매핑 테이블 사용
    const bedNumber = patientBedMapping.get(patientId)!;
    const [roomPart, bedPart] = bedNumber.split('-');
    room = roomPart;
    bed = bedPart;
    console.log(`🗺️ Using bed mapping for ${dbPatient.name}: ${patientId} → ${bedNumber}`);
  } else if (existingPatient) {
    // 매핑도 없으면 기존 환자 정보 사용
    room = existingPatient.room;
    bed = existingPatient.bed;
    console.log(`👤 Using existing patient data for ${dbPatient.name}: ${room}-${bed}`);
  } else {
    // 모든 정보가 없으면 기본값
    console.log(`🏥 Using default bed for ${dbPatient.name}: ${room}-${bed}`);
  }

  const nurseId = existingPatient?.nurseId || 'N001';
  const nurseName = existingPatient?.nurseName || '김수연';

  return {
    id: patientId,
    name: dbPatient.name,
    room: room,
    bed: bed,
    nurseId: nurseId,
    nurseName: nurseName,
    admissionDate: new Date(dbPatient.createdAt || Date.now()),
    age: dbPatient.birthDate ? new Date().getFullYear() - new Date(dbPatient.birthDate).getFullYear() : 0,
    gender: dbPatient.gender,
    weight: dbPatient.weightKg,
    height: dbPatient.heightCm,
    allergies: existingPatient?.allergies || undefined,
    medicalHistory: existingPatient?.medicalHistory || [],
    currentPrescription: existingPatient?.currentPrescription,
    phone: dbPatient.phone
  };
};

// Helper function to convert frontend Patient to DB PatientDB type
const convertFrontendPatientToDB = (patient: Omit<Patient, 'id'>, bedNumber: string, phone?: string): Omit<PatientDB, 'patientId' | 'createdAt'> => {
  // 생년월일 계산 (나이에서 추정)
  const currentYear = new Date().getFullYear();
  const birthYear = patient.age ? currentYear - patient.age : currentYear - 30; // 기본값 30세
  const birthDate = `${birthYear}-01-01`; // 간단하게 1월 1일로 설정

  // 침대 번호에서 방 번호와 침대 번호 분리 (예: "301A-2" → roomId: "301A", bedNumber: "2")
  const [roomId, bedNum] = bedNumber.split('-');

  return {
    name: patient.name,
    phone: phone || '010-0000-0000', // 필수 필드 - 기본값 제공
    birthDate: birthDate,
    gender: patient.gender,
    weightKg: patient.weight ? Math.round(patient.weight) : undefined, // 정수로 변환
    heightCm: patient.height ? Math.round(patient.height) : undefined, // 정수로 변환
    address: undefined, // 주소는 추후 추가 가능
    roomId: roomId, // DB에 침대 정보 저장
    bedNumber: bedNum // DB에 침대 번호 저장
  };
};

export const useWardStore = create<WardStore>((set, get) => ({
  // Initial State
  beds: [],
  alerts: [],
  patients: [],
  poleData: new Map(),
  wardStats: { total: 0, normal: 0, warning: 0, critical: 0, offline: 0 },
  selectedPatientId: null,
  isLoading: false,
  error: null,
  isServerConnected: false,
  patientBedMapping: new Map(),

  // Actions
  updatePoleData: (poleId: string, data: Partial<PoleData>) => {
    set((state) => {
      const newPoleData = new Map(state.poleData);
      const existing = newPoleData.get(poleId);
      
      if (existing) {
        newPoleData.set(poleId, { ...existing, ...data, lastUpdate: new Date() });
      } else {
        // Create new pole data with defaults
        newPoleData.set(poleId, {
          poleId,
          weight: 0,
          capacity: 500,
          currentVolume: 0,
          percentage: 0,
          battery: 100,
          status: 'offline',
          flowRate: 0,
          prescribedRate: 100,
          estimatedTime: 0,
          lastUpdate: new Date(),
          isButtonPressed: false,
          ...data,
        } as PoleData);
      }

      // Update beds with new pole data
      const updatedBeds = state.beds.map(bed => {
        if (bed.poleData?.poleId === poleId) {
          return {
            ...bed,
            poleData: newPoleData.get(poleId)
          };
        }
        return bed;
      });

      return {
        poleData: newPoleData,
        beds: updatedBeds
      };
    });
    
    // Update ward stats after pole data change
    get().updateWardStats();
    
    // Save to localStorage
    get().saveToStorage();
  },

  addAlert: (alert: Alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts]
    }));
    get().saveToStorage();
  },

  acknowledgeAlert: (alertId: string, nurseId: string) => {
    set((state) => ({
      alerts: state.alerts.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedBy: nurseId,
              acknowledgedAt: new Date()
            }
          : alert
      )
    }));
    get().saveToStorage();
  },

  removeAlert: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== alertId)
    }));
    get().saveToStorage();
  },

  setSelectedPatient: (patientId: string | null) => {
    set({ selectedPatientId: patientId });
  },

  updateWardStats: () => {
    const { beds } = get();
    const stats = beds.reduce(
      (acc, bed) => {
        acc.total++;
        const status = getStatusColor(bed.poleData);
        acc[status]++;
        return acc;
      },
      { total: 0, normal: 0, warning: 0, critical: 0, offline: 0 }
    );
    
    set({ wardStats: stats });
  },

  getBedStatus: (bedNumber: string) => {
    const { beds } = get();
    const bed = beds.find(b => b.bedNumber === bedNumber);
    return getStatusColor(bed?.poleData);
  },

  getActiveAlerts: () => {
    const { alerts } = get();
    return alerts.filter(alert => !alert.acknowledged);
  },

  getCriticalAlerts: () => {
    const { alerts } = get();
    return alerts.filter(alert => !alert.acknowledged && alert.severity === 'critical');
  },

  getPatientById: (patientId: string) => {
    const { patients } = get();
    return patients.find(patient => patient.id === patientId);
  },

  getBedByNumber: (bedNumber: string) => {
    const { beds } = get();
    return beds.find(bed => bed.bedNumber === bedNumber);
  },

  // Server connection check
  checkConnection: async () => {
    const isConnected = await checkServerConnection();
    set({ isServerConnected: isConnected });
    
    if (isConnected) {
      // 서버 연결 성공 시 백엔드 데이터 로드
      await get().fetchPatients();
    } else {
      // 서버 연결 실패 시 저장된 데이터나 목업 데이터 사용
      if (!get().loadStoredData()) {
        get().initializeMockData();
      }
    }
  },

  // Fetch patients from server
  fetchPatients: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await patientAPI.getPatients();

      if (response.success && response.data) {
        // response.data가 배열인지 확인
        const patientsArray = Array.isArray(response.data) ? response.data : [response.data];

        // 기존 환자 정보 유지를 위해 현재 patients 배열 참조
        const existingPatients = get().patients;

        const patients: Patient[] = patientsArray.map(dbPatient => {
          // 기존 환자 찾기 (ID로 매칭)
          const existingPatient = existingPatients.find(p => p.id === `P${dbPatient.patientId}`);
          return convertDBPatientToFrontend(dbPatient, existingPatient, get().patientBedMapping);
        });
        
        // 🔄 Critical Fix: Assign patients to beds for ward display
        set((state) => {
          console.log('📋 Assigning patients to beds:', patients);

          // Create updated beds array with database patients assigned
          const updatedBeds = state.beds.map(bed => {
            // Find patient that matches this bed's room and bed number
            // 침대 번호 형식: "301A-1" -> room: "301A", bed: "1"
            const matchingPatient = patients.find(patient =>
              patient.room === bed.room && patient.bed === bed.bedNumber.split('-')[1]
            );

            if (matchingPatient) {
              console.log(`🛏️ Bed ${bed.bedNumber}: ${matchingPatient.name}`);
              return {
                ...bed,
                patient: matchingPatient,
                status: 'occupied' as const
              };
            } else {
              // Clear bed if no patient matches (patient may have been discharged)
              console.log(`🛏️ Bed ${bed.bedNumber}: Empty`);
              return {
                ...bed,
                patient: undefined,
                status: 'empty' as const
              };
            }
          });

          return {
            patients,
            beds: updatedBeds,
            isLoading: false
          };
        });
      } else {
        throw new Error(response.error || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
      // 오류 시 목업 데이터 사용
      get().initializeMockData();
    }
  },

  // Patient Management Methods (with API)
  addPatient: async (patientData: Omit<Patient, 'id'>, bedNumber: string, prescription?: Omit<IVPrescription, 'id'>) => {
    set({ isLoading: true, error: null });

    try {
      // 먼저 서버 연결 상태 확인
      const isConnected = await checkServerConnection();
      set({ isServerConnected: isConnected });

      if (isConnected) {
        // 서버에 환자 추가 - 변환 함수 사용 (침대 정보 포함)
        const dbPatient = convertFrontendPatientToDB(patientData, bedNumber, patientData.phone);

        const response = await patientAPI.createPatient(dbPatient);

        console.log('🔍 Patient API Response:', response);
        console.log('🔍 Response data structure:', {
          responseData: response.data,
          patientId: response.data?.patientId,
          dataType: typeof response.data
        });

        if (response.success && response.data) {
          const newPatient: Patient = {
            ...patientData,
            id: `P${response.data.patientId}`,
          };

          // 🗺️ Store bed mapping for this patient and update patient object immediately
          set((state) => {
            const newMapping = new Map(state.patientBedMapping);
            newMapping.set(newPatient.id, bedNumber);
            console.log(`🗺️ Storing bed mapping: ${newPatient.id} → ${bedNumber}`);

            // ✨ CRITICAL: Update patient object with correct room/bed immediately
            const bedParts = bedNumber.split('-');
            newPatient.room = bedParts[0];
            newPatient.bed = bedParts[1];
            console.log(`🔄 Updated patient object: ${newPatient.name} → room: ${newPatient.room}, bed: ${newPatient.bed}`);

            return { patientBedMapping: newMapping };
          });

          // 🔄 처방전이 있으면 IV 세션도 생성
          if (prescription) {
            try {
              const ivSession: Omit<IVSessionDB, 'sessionId'> = {
                patientId: response.data.patientId!,
                dripId: 2, // Normal Saline (기본값)
                startTime: new Date().toISOString(),
                remainingVolume: prescription.totalVolume,
                flowRate: prescription.calculatedFlowRate,
                ivPoleId: `POLE-${patientData.room}-${patientData.bed}`,
                status: 'ACTIVE',
                totalVolumeMl: prescription.totalVolume,
                endExpTime: new Date(Date.now() + prescription.duration * 60000).toISOString()
              };

              console.log('🔄 IV 세션 생성 시도 중:', {
                patientId: response.data.patientId,
                medication: prescription.medicationName,
                volume: prescription.totalVolume,
                duration: prescription.duration
              });

              const sessionResponse = await ivSessionAPI.createSession(ivSession);
              if (sessionResponse.success) {
                // 처방전 정보를 환자 객체에 추가
                newPatient.currentPrescription = {
                  ...prescription,
                  id: `RX${Date.now()}`,
                };
                console.log('✅ IV 세션 생성 성공:', {
                  sessionId: sessionResponse.data?.sessionId,
                  medication: prescription.medicationName,
                  patientName: newPatient.name
                });
              } else {
                console.error('❌ IV 세션 생성 실패:', {
                  error: sessionResponse.error,
                  patientId: response.data.patientId,
                  medication: prescription.medicationName,
                  message: '환자는 등록되었지만 처방전 정보가 저장되지 않았습니다.'
                });
                // 사용자에게 알리기 위한 에러 상태 설정
                set({ error: `환자 ${newPatient.name}이(가) 등록되었지만 처방전 정보 저장에 실패했습니다: ${sessionResponse.error}` });
              }
            } catch (error) {
              console.error('❌ IV 세션 생성 중 예외 발생:', {
                error: error instanceof Error ? error.message : error,
                patientId: response.data.patientId,
                medication: prescription.medicationName,
                stack: error instanceof Error ? error.stack : undefined
              });
              // 환자는 생성되었으니 처방전 오류는 로그만 남기고 진행하되 사용자에게 알림
              set({ error: `환자 ${newPatient.name}이(가) 등록되었지만 처방전 정보 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` });
            }
          }

          set((state) => ({
            patients: [...state.patients, newPatient],
            beds: state.beds.map(bed =>
              bed.bedNumber === bedNumber
                ? { ...bed, patient: newPatient, status: 'occupied' as const }
                : bed
            ),
            isLoading: false
          }));

          // 🔄 CRITICAL: Save mapping immediately after patient addition
          get().saveToStorage();
          console.log(`💾 Saved patient and bed mapping to localStorage immediately`);

          // ❌ REMOVED: setTimeout fetchPatients - causes race condition
          // Mapping is already applied to patient object, no need to re-fetch
        }
      } else {
        // 오프라인 모드 - 로컬에만 추가
        const newPatient: Patient = {
          ...patientData,
          id: `P${Date.now()}`,
          currentPrescription: prescription ? {
            ...prescription,
            id: `RX${Date.now()}`,
          } : undefined,
        };

        // 🗺️ Store bed mapping for offline patient and update object immediately
        set((state) => {
          const newMapping = new Map(state.patientBedMapping);
          newMapping.set(newPatient.id, bedNumber);
          console.log(`🗺️ Storing offline bed mapping: ${newPatient.id} → ${bedNumber}`);

          // ✨ CRITICAL: Update offline patient object with correct room/bed immediately
          const bedParts = bedNumber.split('-');
          newPatient.room = bedParts[0];
          newPatient.bed = bedParts[1];
          console.log(`🔄 Updated offline patient: ${newPatient.name} → room: ${newPatient.room}, bed: ${newPatient.bed}`);

          return { patientBedMapping: newMapping };
        });

        set((state) => ({
          patients: [...state.patients, newPatient],
          beds: state.beds.map(bed => 
            bed.bedNumber === bedNumber 
              ? { ...bed, patient: newPatient, status: 'occupied' as const }
              : bed
          ),
          isLoading: false
        }));
        
        get().saveToStorage();
      }
    } catch (error) {
      console.error('Failed to add patient:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  updatePatient: async (patientId: string, updates: Partial<Patient>) => {
    set({ isLoading: true, error: null });
    
    try {
      if (get().isServerConnected) {
        // 서버에 업데이트
        const numericId = parseInt(patientId.replace('P', ''));
        const dbUpdates: Partial<PatientDB> = {
          name: updates.name,
          gender: updates.gender,
          weightKg: updates.weight ? Math.round(updates.weight) : undefined,
          heightCm: updates.height ? Math.round(updates.height) : undefined
        };
        
        const response = await patientAPI.updatePatient(numericId, dbUpdates);
        
        if (response.success) {
          set((state) => ({
            patients: state.patients.map(patient =>
              patient.id === patientId ? { ...patient, ...updates } : patient
            ),
            beds: state.beds.map(bed => {
              if (bed.patient?.id === patientId) {
                return {
                  ...bed,
                  patient: { ...bed.patient, ...updates }
                };
              }
              return bed;
            }),
            isLoading: false
          }));

          get().saveToStorage();

          // 실시간 동기화: 데이터베이스에서 최신 환자 목록 다시 가져오기
          await get().fetchPatients();
        }
      } else {
        // 오프라인 모드 - 로컬에만 업데이트
        set((state) => ({
          patients: state.patients.map(patient =>
            patient.id === patientId ? { ...patient, ...updates } : patient
          ),
          beds: state.beds.map(bed => {
            if (bed.patient?.id === patientId) {
              return {
                ...bed,
                patient: { ...bed.patient, ...updates }
              };
            }
            return bed;
          }),
          isLoading: false
        }));
        
        get().saveToStorage();
      }
    } catch (error) {
      console.error('Failed to update patient:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  removePatient: async (patientId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      if (get().isServerConnected) {
        // 서버에서 삭제
        const numericId = parseInt(patientId.replace('P', ''));
        const response = await patientAPI.deletePatient(numericId);
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to delete patient');
        }
      }
      
      // 로컬 상태 업데이트
      set((state) => {
        const updatedPatients = state.patients.filter(patient => patient.id !== patientId);
        const updatedBeds = state.beds.map(bed => {
          if (bed.patient?.id === patientId) {
            return {
              ...bed,
              patient: undefined,
              poleData: undefined,
              status: 'empty' as const
            };
          }
          return bed;
        });

        // Remove pole data for this patient
        const newPoleData = new Map(state.poleData);
        for (const [poleId, data] of newPoleData.entries()) {
          if (data.patientId === patientId) {
            newPoleData.delete(poleId);
          }
        }

        return {
          patients: updatedPatients,
          beds: updatedBeds,
          poleData: newPoleData,
          isLoading: false
        };
      });

      // Save to localStorage
      get().saveToStorage();

      // 실시간 동기화: 데이터베이스에서 최신 환자 목록 다시 가져오기
      if (get().isServerConnected) {
        await get().fetchPatients();
      }
    } catch (error) {
      console.error('Failed to remove patient:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  addIVPrescription: (patientId: string, prescriptionData: Omit<IVPrescription, 'id'>) => {
    const prescription = createIVPrescription(
      prescriptionData.medicationName,
      prescriptionData.totalVolume,
      prescriptionData.duration,
      prescriptionData.gttFactor,
      prescriptionData.prescribedBy,
      prescriptionData.notes
    );

    get().updatePatient(patientId, { currentPrescription: prescription });
  },

  updateIVPrescription: (patientId: string, prescriptionUpdates: Partial<IVPrescription>) => {
    const patient = get().getPatientById(patientId);
    if (patient?.currentPrescription) {
      const updatedPrescription = {
        ...patient.currentPrescription,
        ...prescriptionUpdates
      };
      get().updatePatient(patientId, { currentPrescription: updatedPrescription });
    }
  },

  // Delete patient (remove completely from system)
  deletePatient: async (patientId: string) => {
    await get().removePatient(patientId);
  },

  // End IV session (stop current infusion)
  endIVSession: async (patientId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Update patient to remove current prescription
      await get().updatePatient(patientId, {
        currentPrescription: undefined
      });

      // Clear pole data for this patient
      set((state) => {
        const newPoleData = new Map(state.poleData);
        for (const [poleId, data] of newPoleData.entries()) {
          if (data.patientId === patientId) {
            newPoleData.set(poleId, {
              ...data,
              status: 'offline',
              flowRate: 0,
              currentVolume: 0,
              percentage: 0,
              estimatedTime: 0
            });
          }
        }

        return {
          poleData: newPoleData,
          isLoading: false
        };
      });

      // Add completion alert
      get().addAlert({
        id: `ALERT_${Date.now()}`,
        poleId: '',
        patientId,
        type: 'custom',
        severity: 'info',
        message: `${get().getPatientById(patientId)?.name}: 수액 투여가 종료되었습니다`,
        timestamp: new Date(),
        acknowledged: false
      });

      get().saveToStorage();
    } catch (error) {
      console.error('Failed to end IV session:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  // Load stored data from localStorage
  loadStoredData: () => {
    console.log('📂 Loading stored data from localStorage...');
    const storedState = storageService.loadWardState();

    if (storedState.patients && storedState.beds) {
      const mappingSize = storedState.patientBedMapping?.size || 0;
      console.log(`✅ Found stored data: ${storedState.patients.length} patients, ${storedState.beds.length} beds, ${mappingSize} bed mappings`);

      set({
        patients: storedState.patients,
        beds: storedState.beds,
        alerts: storedState.alerts || [],
        poleData: storedState.poleData || new Map(),
        patientBedMapping: storedState.patientBedMapping || new Map()
      });

      if (storedState.patientBedMapping && storedState.patientBedMapping.size > 0) {
        console.log('🗺️ Loaded patient bed mappings:', Array.from(storedState.patientBedMapping.entries()));
      }

      get().updateWardStats();
      return true; // 저장된 데이터 로드 성공
    }

    console.log('❌ No stored data found');
    return false; // 저장된 데이터 없음
  },

  // Save current state to localStorage
  saveToStorage: () => {
    const { patients, beds, alerts, poleData, patientBedMapping } = get();
    storageService.saveWardState(patients, beds, alerts, poleData, patientBedMapping);
  },

  // Initialize empty data for clean startup
  initializeMockData: () => {
    // 기존 localStorage 데이터 완전 삭제 (목업 데이터 잔여물 제거)
    localStorage.removeItem('wardState');
    localStorage.removeItem('wardPatients');
    localStorage.removeItem('wardBeds');
    localStorage.removeItem('wardAlerts');
    localStorage.removeItem('wardPoleData');

    // 빈 데이터로 초기화 - 301A 병실 6개 침대
    const emptyBeds: BedInfo[] = [
      { bedNumber: '301A-1', room: '301A', status: 'empty' },
      { bedNumber: '301A-2', room: '301A', status: 'empty' },
      { bedNumber: '301A-3', room: '301A', status: 'empty' },
      { bedNumber: '301A-4', room: '301A', status: 'empty' },
      { bedNumber: '301A-5', room: '301A', status: 'empty' },
      { bedNumber: '301A-6', room: '301A', status: 'empty' }
    ];

    set({
      patients: [], // 빈 환자 배열
      beds: emptyBeds, // 빈 침대만
      alerts: [], // 빈 알림 배열
      poleData: new Map(), // 빈 폴대 데이터
      patientBedMapping: new Map() // 빈 환자-침대 매핑
    });

    // Calculate initial ward stats (모두 0)
    get().updateWardStats();

    console.log('✅ 목업 데이터 완전 제거됨 - 깨끗한 초기 상태');
  }
}));
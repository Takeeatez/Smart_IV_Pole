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
  addPatient: (patient: Omit<Patient, 'id'>, bedNumber: string) => Promise<void>;
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
const convertDBPatientToFrontend = (dbPatient: PatientDB): Omit<Patient, 'id' | 'room' | 'bed' | 'nurseId' | 'nurseName' | 'admissionDate'> => ({
  name: dbPatient.name,
  age: new Date().getFullYear() - new Date(dbPatient.birth_date).getFullYear(),
  gender: dbPatient.gender,
  weight: dbPatient.weight,
  height: dbPatient.height,
  allergies: dbPatient.allergies ? dbPatient.allergies.split(',').map(a => a.trim()) : undefined,
  medicalHistory: []
});

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
        const patients: Patient[] = response.data.map(dbPatient => ({
          id: `P${dbPatient.patient_id}`,
          name: dbPatient.name,
          room: '301A', // TODO: Get from room data
          bed: '1', // TODO: Get from room data
          nurseId: 'N001', // TODO: Get from session or assignment
          nurseName: '김수연', // TODO: Get from nurse data
          admissionDate: new Date(dbPatient.created_at || Date.now()),
          age: new Date().getFullYear() - new Date(dbPatient.birth_date).getFullYear(),
          gender: dbPatient.gender,
          weight: dbPatient.weight,
          height: dbPatient.height,
          allergies: dbPatient.allergies ? dbPatient.allergies.split(',').map(a => a.trim()) : undefined,
          medicalHistory: []
        }));
        
        set({ patients, isLoading: false });
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
  addPatient: async (patientData: Omit<Patient, 'id'>, bedNumber: string) => {
    set({ isLoading: true, error: null });
    
    try {
      if (get().isServerConnected) {
        // 서버에 환자 추가
        const dbPatient: Omit<PatientDB, 'patient_id' | 'created_at'> = {
          name: patientData.name,
          phone: '010-0000-0000', // TODO: Add phone field to form
          birth_date: new Date(new Date().getFullYear() - patientData.age, 0, 1).toISOString().split('T')[0],
          gender: patientData.gender,
          weight: patientData.weight,
          height: patientData.height,
          allergies: patientData.allergies?.join(', ')
        };
        
        const response = await patientAPI.createPatient(dbPatient);
        
        if (response.success && response.data) {
          const newPatient: Patient = {
            ...patientData,
            id: `P${response.data.patient_id}`,
          };
          
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
      } else {
        // 오프라인 모드 - 로컬에만 추가
        const newPatient: Patient = {
          ...patientData,
          id: `P${Date.now()}`,
        };

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
          weight: updates.weight,
          height: updates.height,
          allergies: updates.allergies?.join(', ')
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
    const storedState = storageService.loadWardState();
    
    if (storedState.patients && storedState.beds) {
      set({
        patients: storedState.patients,
        beds: storedState.beds,
        alerts: storedState.alerts || [],
        poleData: storedState.poleData || new Map()
      });
      
      get().updateWardStats();
      return true; // 저장된 데이터 로드 성공
    }
    
    return false; // 저장된 데이터 없음
  },

  // Save current state to localStorage
  saveToStorage: () => {
    const { patients, beds, alerts, poleData } = get();
    storageService.saveWardState(patients, beds, alerts, poleData);
  },

  // Initialize empty data for clean startup
  initializeMockData: () => {
    // 기존 localStorage 데이터 완전 삭제 (목업 데이터 잔여물 제거)
    localStorage.removeItem('wardState');
    localStorage.removeItem('wardPatients');
    localStorage.removeItem('wardBeds');
    localStorage.removeItem('wardAlerts');
    localStorage.removeItem('wardPoleData');

    // 빈 데이터로 초기화 - 목업 데이터 완전 제거
    const emptyBeds: BedInfo[] = [
      { bedNumber: '301A-1', room: '301A', status: 'empty' },
      { bedNumber: '301A-2', room: '301A', status: 'empty' },
      { bedNumber: '301B-1', room: '301B', status: 'empty' },
      { bedNumber: '301B-2', room: '301B', status: 'empty' },
      { bedNumber: '302A-1', room: '302A', status: 'empty' },
      { bedNumber: '302A-2', room: '302A', status: 'empty' }
    ];

    set({
      patients: [], // 빈 환자 배열
      beds: emptyBeds, // 빈 침대만
      alerts: [], // 빈 알림 배열
      poleData: new Map() // 빈 폴대 데이터
    });

    // Calculate initial ward stats (모두 0)
    get().updateWardStats();

    console.log('✅ 목업 데이터 완전 제거됨 - 깨끗한 초기 상태');
  }
}));
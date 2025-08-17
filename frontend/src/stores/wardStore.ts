import { create } from 'zustand';
import { Patient, PoleData, Alert, BedInfo, WardStats, StatusColor } from '../types';

interface WardStore {
  // State
  beds: BedInfo[];
  alerts: Alert[];
  patients: Patient[];
  poleData: Map<string, PoleData>;
  wardStats: WardStats;
  selectedPatientId: string | null;
  
  // Actions
  updatePoleData: (poleId: string, data: Partial<PoleData>) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string, nurseId: string) => void;
  removeAlert: (alertId: string) => void;
  setSelectedPatient: (patientId: string | null) => void;
  updateWardStats: () => void;
  initializeMockData: () => void;
  
  // Getters
  getBedStatus: (bedNumber: string) => StatusColor;
  getActiveAlerts: () => Alert[];
  getCriticalAlerts: () => Alert[];
}

// Helper function to determine status color based on pole data
const getStatusColor = (poleData?: PoleData): StatusColor => {
  if (!poleData || poleData.status === 'offline') return 'offline';
  if (poleData.status === 'error') return 'critical';
  if (poleData.percentage < 10) return 'critical';
  if (poleData.percentage <= 30) return 'warning';
  return 'normal';
};

export const useWardStore = create<WardStore>((set, get) => ({
  // Initial State
  beds: [],
  alerts: [],
  patients: [],
  poleData: new Map(),
  wardStats: { total: 0, normal: 0, warning: 0, critical: 0, offline: 0 },
  selectedPatientId: null,

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
  },

  addAlert: (alert: Alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts]
    }));
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
  },

  removeAlert: (alertId: string) => {
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== alertId)
    }));
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

  // Initialize with mock data for development
  initializeMockData: () => {
    const mockPatients: Patient[] = [
      {
        id: 'P001',
        name: '김민지',
        room: '301A',
        bed: '1',
        nurseId: 'N001',
        nurseName: '이간호사',
        admissionDate: new Date('2025-08-15'),
        age: 28,
        gender: 'female'
      },
      {
        id: 'P002',
        name: '박서준',
        room: '301A',
        bed: '2',
        nurseId: 'N001',
        nurseName: '이간호사',
        admissionDate: new Date('2025-08-16'),
        age: 35,
        gender: 'male'
      },
      {
        id: 'P003',
        name: '최유진',
        room: '301B',
        bed: '1',
        nurseId: 'N002',
        nurseName: '김간호사',
        admissionDate: new Date('2025-08-17'),
        age: 42,
        gender: 'female'
      },
      {
        id: 'P004',
        name: '정도현',
        room: '301B',
        bed: '2',
        nurseId: 'N002',
        nurseName: '김간호사',
        admissionDate: new Date('2025-08-17'),
        age: 29,
        gender: 'male'
      }
    ];

    const mockPoleData: PoleData[] = [
      {
        poleId: 'POLE001',
        patientId: 'P001',
        weight: 425,
        capacity: 500,
        currentVolume: 425,
        percentage: 85,
        battery: 88,
        status: 'online',
        flowRate: 98,
        prescribedRate: 100,
        estimatedTime: 260,
        lastUpdate: new Date(),
        isButtonPressed: false
      },
      {
        poleId: 'POLE002',
        patientId: 'P002',
        weight: 75,
        capacity: 500,
        currentVolume: 75,
        percentage: 15,
        battery: 45,
        status: 'online',
        flowRate: 102,
        prescribedRate: 100,
        estimatedTime: 44,
        lastUpdate: new Date(),
        isButtonPressed: false
      },
      {
        poleId: 'POLE003',
        patientId: 'P003',
        weight: 30,
        capacity: 1000,
        currentVolume: 30,
        percentage: 3,
        battery: 92,
        status: 'online',
        flowRate: 95,
        prescribedRate: 100,
        estimatedTime: 19,
        lastUpdate: new Date(),
        isButtonPressed: true
      },
      {
        poleId: 'POLE004',
        patientId: 'P004',
        weight: 0,
        capacity: 500,
        currentVolume: 0,
        percentage: 0,
        battery: 12,
        status: 'offline',
        flowRate: 0,
        prescribedRate: 100,
        estimatedTime: 0,
        lastUpdate: new Date(Date.now() - 300000), // 5 minutes ago
        isButtonPressed: false
      }
    ];

    const mockBeds: BedInfo[] = [
      {
        bedNumber: '301A-1',
        room: '301A',
        patient: mockPatients[0],
        poleData: mockPoleData[0],
        status: 'occupied'
      },
      {
        bedNumber: '301A-2',
        room: '301A',
        patient: mockPatients[1],
        poleData: mockPoleData[1],
        status: 'occupied'
      },
      {
        bedNumber: '301B-1',
        room: '301B',
        patient: mockPatients[2],
        poleData: mockPoleData[2],
        status: 'occupied'
      },
      {
        bedNumber: '301B-2',
        room: '301B',
        patient: mockPatients[3],
        poleData: mockPoleData[3],
        status: 'occupied'
      },
      {
        bedNumber: '302A-1',
        room: '302A',
        status: 'empty'
      },
      {
        bedNumber: '302A-2',
        room: '302A',
        status: 'empty'
      }
    ];

    const mockAlerts: Alert[] = [
      {
        id: 'A001',
        poleId: 'POLE003',
        patientId: 'P003',
        type: 'empty',
        severity: 'critical',
        message: '301B-1 최유진: 수액 소진 임박 (19분 후)',
        timestamp: new Date(),
        acknowledged: false
      },
      {
        id: 'A002',
        poleId: 'POLE003',
        patientId: 'P003',
        type: 'button_pressed',
        severity: 'warning',
        message: '301B-1 최유진: 환자 호출 요청',
        timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        acknowledged: false
      },
      {
        id: 'A003',
        poleId: 'POLE002',
        patientId: 'P002',
        type: 'low',
        severity: 'warning',
        message: '301A-2 박서준: 수액 교체 준비 필요 (44분 후)',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        acknowledged: false
      }
    ];

    // Create pole data map
    const poleDataMap = new Map();
    mockPoleData.forEach(pole => {
      poleDataMap.set(pole.poleId, pole);
    });

    set({
      patients: mockPatients,
      beds: mockBeds,
      alerts: mockAlerts,
      poleData: poleDataMap
    });

    // Calculate initial ward stats
    get().updateWardStats();
  }
}));
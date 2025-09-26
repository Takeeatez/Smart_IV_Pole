// localStorage 관리 서비스 - 데이터 영속성 제공
import { Patient, BedInfo, Alert, PoleData } from '../types';

const STORAGE_KEYS = {
  PATIENTS: 'smart_iv_pole_patients',
  BEDS: 'smart_iv_pole_beds',
  ALERTS: 'smart_iv_pole_alerts',
  POLE_DATA: 'smart_iv_pole_pole_data',
  PATIENT_BED_MAPPING: 'smart_iv_pole_patient_bed_mapping',
  VERSION: 'smart_iv_pole_version'
} as const;

const CURRENT_VERSION = '1.0.0';

// 로컬 저장소 유틸리티 클래스
class StorageService {
  // 버전 체크 및 마이그레이션
  private checkVersion(): void {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (storedVersion !== CURRENT_VERSION) {
      // 버전이 다르면 초기화 (향후 마이그레이션 로직 확장 가능)
      this.clearAll();
      localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    }
  }

  // 데이터 존재 여부 확인
  hasStoredData(): boolean {
    this.checkVersion();
    return localStorage.getItem(STORAGE_KEYS.PATIENTS) !== null;
  }

  // 환자 데이터 저장/로드
  savePatients(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }

  loadPatients(): Patient[] | null {
    this.checkVersion();
    const stored = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (!stored) return null;

    try {
      const patients = JSON.parse(stored) as Patient[];
      // 날짜 객체 복원
      return patients.map(patient => ({
        ...patient,
        admissionDate: new Date(patient.admissionDate),
        currentPrescription: patient.currentPrescription ? {
          ...patient.currentPrescription,
          prescribedAt: new Date(patient.currentPrescription.prescribedAt)
        } : undefined
      }));
    } catch (error) {
      console.error('Failed to load patients from storage:', error);
      return null;
    }
  }

  // 침대 데이터 저장/로드
  saveBeds(beds: BedInfo[]): void {
    localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
  }

  loadBeds(): BedInfo[] | null {
    this.checkVersion();
    const stored = localStorage.getItem(STORAGE_KEYS.BEDS);
    if (!stored) return null;

    try {
      const beds = JSON.parse(stored) as BedInfo[];
      // 날짜 객체 복원
      return beds.map(bed => ({
        ...bed,
        patient: bed.patient ? {
          ...bed.patient,
          admissionDate: new Date(bed.patient.admissionDate),
          currentPrescription: bed.patient.currentPrescription ? {
            ...bed.patient.currentPrescription,
            prescribedAt: new Date(bed.patient.currentPrescription.prescribedAt)
          } : undefined
        } : undefined,
        poleData: bed.poleData ? {
          ...bed.poleData,
          lastUpdate: new Date(bed.poleData.lastUpdate)
        } : undefined
      }));
    } catch (error) {
      console.error('Failed to load beds from storage:', error);
      return null;
    }
  }

  // 알림 데이터 저장/로드
  saveAlerts(alerts: Alert[]): void {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }

  loadAlerts(): Alert[] | null {
    this.checkVersion();
    const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!stored) return null;

    try {
      const alerts = JSON.parse(stored) as Alert[];
      // 날짜 객체 복원
      return alerts.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
        acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to load alerts from storage:', error);
      return null;
    }
  }

  // 폴대 데이터 저장/로드
  savePoleData(poleDataMap: Map<string, PoleData>): void {
    const poleDataArray = Array.from(poleDataMap.entries());
    localStorage.setItem(STORAGE_KEYS.POLE_DATA, JSON.stringify(poleDataArray));
  }

  loadPoleData(): Map<string, PoleData> | null {
    this.checkVersion();
    const stored = localStorage.getItem(STORAGE_KEYS.POLE_DATA);
    if (!stored) return null;

    try {
      const poleDataArray = JSON.parse(stored) as [string, PoleData][];
      const poleDataMap = new Map<string, PoleData>();

      poleDataArray.forEach(([key, value]) => {
        poleDataMap.set(key, {
          ...value,
          lastUpdate: new Date(value.lastUpdate)
        });
      });

      return poleDataMap;
    } catch (error) {
      console.error('Failed to load pole data from storage:', error);
      return null;
    }
  }

  // 환자-침대 매핑 저장/로드
  savePatientBedMapping(mappingMap: Map<string, string>): void {
    const mappingArray = Array.from(mappingMap.entries());
    console.log('💾 Saving patient bed mapping:', mappingArray);
    localStorage.setItem(STORAGE_KEYS.PATIENT_BED_MAPPING, JSON.stringify(mappingArray));
    console.log('✅ Patient bed mapping saved to localStorage');
  }

  loadPatientBedMapping(): Map<string, string> | null {
    this.checkVersion();
    const stored = localStorage.getItem(STORAGE_KEYS.PATIENT_BED_MAPPING);
    if (!stored) return null;

    try {
      const mappingArray = JSON.parse(stored) as [string, string][];
      const mappingMap = new Map<string, string>();

      mappingArray.forEach(([patientId, bedNumber]) => {
        mappingMap.set(patientId, bedNumber);
      });

      console.log('🗺️ Loaded patient bed mapping:', Array.from(mappingMap.entries()));
      return mappingMap;
    } catch (error) {
      console.error('Failed to load patient bed mapping from storage:', error);
      return null;
    }
  }

  // 전체 상태 저장 (wardStore에서 호출)
  saveWardState(patients: Patient[], beds: BedInfo[], alerts: Alert[], poleData: Map<string, PoleData>, patientBedMapping: Map<string, string>): void {
    try {
      this.savePatients(patients);
      this.saveBeds(beds);
      this.saveAlerts(alerts);
      this.savePoleData(poleData);
      this.savePatientBedMapping(patientBedMapping);
    } catch (error) {
      console.error('Failed to save ward state:', error);
    }
  }

  // 전체 상태 로드
  loadWardState(): {
    patients: Patient[] | null;
    beds: BedInfo[] | null;
    alerts: Alert[] | null;
    poleData: Map<string, PoleData> | null;
    patientBedMapping: Map<string, string> | null;
  } {
    return {
      patients: this.loadPatients(),
      beds: this.loadBeds(),
      alerts: this.loadAlerts(),
      poleData: this.loadPoleData(),
      patientBedMapping: this.loadPatientBedMapping()
    };
  }

  // 모든 데이터 삭제
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // 특정 환자 데이터 삭제 (환자 삭제 시 호출)
  removePatient(patientId: string): void {
    const patients = this.loadPatients();
    if (patients) {
      const updatedPatients = patients.filter(p => p.id !== patientId);
      this.savePatients(updatedPatients);
    }

    const beds = this.loadBeds();
    if (beds) {
      const updatedBeds = beds.map(bed => {
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
      this.saveBeds(updatedBeds);
    }

    const poleData = this.loadPoleData();
    if (poleData) {
      const updatedPoleData = new Map(poleData);
      for (const [poleId, data] of updatedPoleData.entries()) {
        if (data.patientId === patientId) {
          updatedPoleData.delete(poleId);
        }
      }
      this.savePoleData(updatedPoleData);
    }
  }
}

// 싱글톤 인스턴스 생성
export const storageService = new StorageService();
export default storageService;
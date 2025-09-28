import React, { useState, useEffect } from 'react';
import { X, Calculator, Pill, Clock, Loader } from 'lucide-react';
import { Patient, IVPrescription, DripDB } from '../../types';
import { calculateGTT, calculateFlowRate, COMMON_DURATIONS } from '../../utils/gttCalculator';
import { useWardStore } from '../../stores/wardStore';
import { dripAPI } from '../../services/api';

interface DrugPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

const DrugPrescriptionModal: React.FC<DrugPrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  const { addIVPrescription, fetchPatients } = useWardStore();

  // Available drug types from backend
  const [availableDrugs, setAvailableDrugs] = useState<DripDB[]>([]);
  const [loadingDrugs, setLoadingDrugs] = useState(false);

  // IV Prescription form state
  const [prescriptionForm, setPrescriptionForm] = useState({
    medicationName: '',
    totalVolume: '',
    duration: '',
    gttFactor: 20 as 20 | 60,
    prescribedBy: '',
    notes: ''
  });

  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    gtt: 0,
    flowRate: 0
  });

  // Load available drug types from backend
  useEffect(() => {
    const loadDrugTypes = async () => {
      setLoadingDrugs(true);
      try {
        const response = await dripAPI.getDrips();
        if (response.success && response.data) {
          setAvailableDrugs(response.data);
        } else {
          console.error('Failed to load drug types:', response.error);
          // Fallback to empty array if backend is not available
          setAvailableDrugs([]);
        }
      } catch (error) {
        console.error('Error loading drug types:', error);
        setAvailableDrugs([]);
      } finally {
        setLoadingDrugs(false);
      }
    };

    if (isOpen) {
      loadDrugTypes();
    }
  }, [isOpen]);

  // Initialize form data when patient changes
  useEffect(() => {
    if (patient?.currentPrescription) {
      setPrescriptionForm({
        medicationName: patient.currentPrescription.medicationName,
        totalVolume: patient.currentPrescription.totalVolume.toString(),
        duration: patient.currentPrescription.duration.toString(),
        gttFactor: patient.currentPrescription.gttFactor,
        prescribedBy: patient.currentPrescription.prescribedBy,
        notes: patient.currentPrescription.notes || ''
      });
    }
  }, [patient]);

  // Calculate GTT and flow rate when form values change
  useEffect(() => {
    const volume = parseFloat(prescriptionForm.totalVolume) || 0;
    const duration = parseFloat(prescriptionForm.duration) || 0;

    if (volume > 0 && duration > 0) {
      const gtt = calculateGTT(volume, duration, prescriptionForm.gttFactor);
      const flowRate = calculateFlowRate(volume, duration);

      setCalculatedValues({
        gtt: Math.round(gtt * 10) / 10,
        flowRate: Math.round(flowRate * 10) / 10
      });
    } else {
      setCalculatedValues({ gtt: 0, flowRate: 0 });
    }
  }, [prescriptionForm.totalVolume, prescriptionForm.duration, prescriptionForm.gttFactor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!prescriptionForm.medicationName) {
      alert('약품을 선택해주세요.');
      return;
    }
    if (!prescriptionForm.totalVolume || !prescriptionForm.duration) {
      alert('총 용량과 투여 시간을 입력해주세요.');
      return;
    }

    // Create prescription
    const prescription: Omit<IVPrescription, 'id'> = {
      medicationName: prescriptionForm.medicationName,
      totalVolume: parseFloat(prescriptionForm.totalVolume),
      duration: parseFloat(prescriptionForm.duration),
      gttFactor: prescriptionForm.gttFactor,
      prescribedBy: prescriptionForm.prescribedBy,
      notes: prescriptionForm.notes,
      calculatedGTT: calculatedValues.gtt,
      calculatedFlowRate: calculatedValues.flowRate,
      prescribedAt: new Date()
    };

    // Add prescription to patient
    addIVPrescription(patient.id, prescription);

    // Refresh patient data
    setTimeout(() => {
      fetchPatients();
    }, 1000);

    // Close modal and reset form
    handleClose();
  };

  const resetForm = () => {
    setPrescriptionForm({
      medicationName: '',
      totalVolume: '',
      duration: '',
      gttFactor: 20,
      prescribedBy: '',
      notes: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-green-600" />
            약품 처방 - {patient.name} ({patient.room}-{patient.bed})
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Patient Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">환자명:</span>
                <span className="ml-2 text-gray-900">{patient.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">침대:</span>
                <span className="ml-2 text-gray-900">{patient.room}-{patient.bed}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">나이/성별:</span>
                <span className="ml-2 text-gray-900">{patient.age}세 / {patient.gender === 'male' ? '남성' : '여성'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">담당간호사:</span>
                <span className="ml-2 text-gray-900">{patient.nurseName}</span>
              </div>
            </div>
          </div>

          {/* IV Prescription */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">IV 처방 정보</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                약품명 *
              </label>
              {loadingDrugs ? (
                <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-gray-500">약품 목록을 불러오는 중...</span>
                </div>
              ) : (
                <select
                  value={prescriptionForm.medicationName}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medicationName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">약품 선택</option>
                  {availableDrugs.map((drug) => (
                    <option key={drug.dripId} value={drug.dripName}>
                      {drug.dripName}
                    </option>
                  ))}
                </select>
              )}
              {!loadingDrugs && availableDrugs.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  ⚠️ 백엔드 서버에서 약품 목록을 불러올 수 없습니다.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  총 용량 (mL) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={prescriptionForm.totalVolume}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, totalVolume: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투여 시간 (분) *
                </label>
                <select
                  value={prescriptionForm.duration}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">시간 선택</option>
                  {COMMON_DURATIONS.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GTT Factor
                </label>
                <select
                  value={prescriptionForm.gttFactor}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, gttFactor: parseInt(e.target.value) as 20 | 60 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value={20}>20 GTT/mL (Macro drip)</option>
                  <option value={60}>60 GTT/mL (Micro drip)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  처방의사
                </label>
                <input
                  type="text"
                  value={prescriptionForm.prescribedBy}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, prescribedBy: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="김의사"
                />
              </div>
            </div>

            {/* GTT Calculation Results */}
            {prescriptionForm.totalVolume && prescriptionForm.duration && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">자동 계산 결과</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {calculatedValues.gtt}
                    </div>
                    <div className="text-sm text-green-700">GTT/min (분당 방울 수)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {calculatedValues.flowRate}
                    </div>
                    <div className="text-sm text-green-700">mL/hr (시간당 투여량)</div>
                  </div>
                </div>
                <div className="border-t border-green-200 pt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <div className="text-sm">
                      <span className="font-medium text-green-900">예상 투여 종료 시간: </span>
                      <span className="text-green-700">
                        {(() => {
                          const endTime = new Date();
                          endTime.setMinutes(endTime.getMinutes() + parseInt(prescriptionForm.duration));
                          return endTime.toLocaleString('ko-KR', {
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        })()}
                      </span>
                      <span className="text-green-600 ml-2">
                        ({Math.floor(parseInt(prescriptionForm.duration) / 60)}시간 {parseInt(prescriptionForm.duration) % 60}분 후)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                특이사항
              </label>
              <textarea
                value={prescriptionForm.notes}
                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="투여 시 주의사항이나 특이사항을 입력하세요"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Pill className="w-4 h-4" />
              처방 시작
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DrugPrescriptionModal;
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Patient, IVPrescription } from '../../types';
import { useWardStore } from '../../stores/wardStore';
import { calculateGTT, calculateFlowRate } from '../../utils/gttCalculator';

interface PatientEditModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
}

const PatientEditModal: React.FC<PatientEditModalProps> = ({ patient, isOpen, onClose }) => {
  const { updatePatient, deletePatient, endIVSession } = useWardStore();

  // 환자 기본 정보
  const [name, setName] = useState(patient.name);
  const [age, setAge] = useState(patient.age);
  const [gender, setGender] = useState(patient.gender);
  const [height, setHeight] = useState(patient.height || 0);
  const [weight, setWeight] = useState(patient.weight || 0);
  const [allergies, setAllergies] = useState(patient.allergies?.join(', ') || '');
  const [nurseName, setNurseName] = useState(patient.nurseName);

  // 수액 처방 정보
  const [medicationName, setMedicationName] = useState(patient.currentPrescription?.medicationName || '');
  const [totalVolume, setTotalVolume] = useState(patient.currentPrescription?.totalVolume || 500);
  const [duration, setDuration] = useState(patient.currentPrescription?.duration || 60);
  const [gttFactor, setGttFactor] = useState(patient.currentPrescription?.gttFactor || 20);
  const [prescribedBy, setPrescribedBy] = useState(patient.currentPrescription?.prescribedBy || '');
  const [notes, setNotes] = useState(patient.currentPrescription?.notes || '');

  // 삭제 확인 상태
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 계산된 값들
  const calculatedGTT = calculateGTT(totalVolume, duration, gttFactor);
  const calculatedFlowRate = calculateFlowRate(totalVolume, duration);

  useEffect(() => {
    if (patient.currentPrescription) {
      setMedicationName(patient.currentPrescription.medicationName);
      setTotalVolume(patient.currentPrescription.totalVolume);
      setDuration(patient.currentPrescription.duration);
      setGttFactor(patient.currentPrescription.gttFactor);
      setPrescribedBy(patient.currentPrescription.prescribedBy);
      setNotes(patient.currentPrescription.notes || '');
    }
  }, [patient]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedPatient: Patient = {
      ...patient,
      name,
      age,
      gender,
      height: height || undefined,
      weight: weight || undefined,
      allergies: allergies ? allergies.split(',').map(a => a.trim()).filter(a => a) : [],
      nurseName,
      currentPrescription: medicationName ? {
        id: patient.currentPrescription?.id || `presc_${Date.now()}`,
        medicationName,
        totalVolume,
        duration,
        gttFactor,
        calculatedGTT,
        calculatedFlowRate,
        prescribedBy,
        prescribedAt: patient.currentPrescription?.prescribedAt || new Date(),
        notes: notes || undefined
      } : undefined
    };

    updatePatient(patient.id, updatedPatient);
    onClose();
  };

  const handleDelete = () => {
    if (patient.currentPrescription) {
      // 현재 투여 중인 세션이 있으면 먼저 종료
      endIVSession(patient.id);
    }
    deletePatient(patient.id);
    onClose();
  };

  const handleDischarge = () => {
    // 환자 퇴원 처리 (세션 종료 + 침대에서 제거)
    if (patient.currentPrescription) {
      endIVSession(patient.id);
    }
    // 환자를 침대에서 제거하지만 데이터는 유지 (히스토리용)
    const dischargedPatient = {
      ...patient,
      discharged: true,
      dischargedAt: new Date()
    };
    updatePatient(patient.id, dischargedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">환자 정보 수정</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* 기본 정보 섹션 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  환자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  나이 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="150"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  성별 <span className="text-red-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당 간호사 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nurseName}
                  onChange={(e) => setNurseName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  키 (cm)
                </label>
                <input
                  type="number"
                  value={height || ''}
                  onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value) : 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  체중 (kg)
                </label>
                <input
                  type="number"
                  value={weight || ''}
                  onChange={(e) => setWeight(e.target.value ? parseInt(e.target.value) : 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="300"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  알레르기 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 페니실린, 아스피린"
                />
              </div>
            </div>
          </div>

          {/* 수액 처방 정보 섹션 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">수액 처방 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  약품명
                </label>
                <input
                  type="text"
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: Normal Saline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  총 용량 (mL)
                </label>
                <input
                  type="number"
                  value={totalVolume}
                  onChange={(e) => setTotalVolume(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="50"
                  max="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  투여 시간 (분)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="10"
                  max="1440"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GTT Factor
                </label>
                <select
                  value={gttFactor}
                  onChange={(e) => setGttFactor(parseInt(e.target.value) as 20 | 60)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="20">20 (Macro drip)</option>
                  <option value="60">60 (Micro drip)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  처방의사
                </label>
                <input
                  type="text"
                  value={prescribedBy}
                  onChange={(e) => setPrescribedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="의사명"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  계산된 GTT
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  <span className="font-semibold text-blue-600">
                    {calculatedGTT.toFixed(1)} GTT/min
                  </span>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  특이사항
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="특이사항을 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 계산 결과 표시 */}
          {medicationName && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">계산 결과</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">GTT 속도:</span>
                  <span className="ml-2 font-semibold">{calculatedGTT.toFixed(1)} GTT/min</span>
                </div>
                <div>
                  <span className="text-blue-700">유속:</span>
                  <span className="ml-2 font-semibold">{calculatedFlowRate.toFixed(0)} mL/hr</span>
                </div>
                <div>
                  <span className="text-blue-700">예상 소요 시간:</span>
                  <span className="ml-2 font-semibold">
                    {Math.floor(duration / 60)}시간 {duration % 60}분
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              환자 삭제
            </button>
            <button
              onClick={handleDischarge}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              퇴원 처리
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">환자 삭제 확인</h3>
                  <p className="text-sm text-gray-600">
                    {patient.name} 환자의 모든 정보가 삭제됩니다.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                이 작업은 되돌릴 수 없습니다. 정말 삭제하시겠습니까?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientEditModal;
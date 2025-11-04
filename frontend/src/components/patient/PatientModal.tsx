import React, { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { Patient } from '../../types';
import { useWardStore } from '../../stores/wardStore';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  bedNumber: string;
  patient?: Patient; // For editing existing patient
}

const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  bedNumber,
  patient
}) => {
  const { addPatient, updatePatient, fetchPatients, beds } = useWardStore();

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    pinCode: '', // 모바일 앱 로그인용 6자리 PIN
    age: '',
    gender: 'female' as 'male' | 'female',
    weight: '',
    height: '',
    allergies: '',
    nurseId: 'N001',
    nurseName: '김수연'
  });

  // Selected bed state for when bedNumber is not provided
  const [selectedBed, setSelectedBed] = useState<string>(bedNumber || '');


  // Initialize form data when editing
  useEffect(() => {
    if (patient) {
      setPatientForm({
        name: patient.name,
        phone: patient.phone || '',
        pinCode: '', // 수정 시에는 PIN 재입력 (보안상 표시하지 않음)
        age: patient.age.toString(),
        gender: patient.gender,
        weight: patient.weight?.toString() || '',
        height: patient.height?.toString() || '',
        allergies: patient.allergies?.join(', ') || '',
        nurseId: patient.nurseId,
        nurseName: patient.nurseName
      });

    }
  }, [patient]);

  // Update selectedBed when bedNumber prop changes
  useEffect(() => {
    setSelectedBed(bedNumber || '');
  }, [bedNumber]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use selectedBed if bedNumber is not provided
    const finalBedNumber = bedNumber || selectedBed;

    // Validation: bed must be selected
    if (!finalBedNumber) {
      alert('침대를 선택해주세요.');
      return;
    }

    // 🔄 Fix room/bed mapping to match database structure
    // bedNumber format: "301A-1" -> room: "301A", bed: "1"
    const [roomPart, bedPart] = finalBedNumber.split('-');

    const patientData: Omit<Patient, 'id'> = {
      name: patientForm.name,
      phone: patientForm.phone || undefined,
      room: roomPart,           // "301A", "301B", etc.
      bed: bedPart,             // "1", "2", etc.
      age: parseInt(patientForm.age),
      gender: patientForm.gender,
      weight: patientForm.weight ? parseFloat(patientForm.weight) : undefined,
      height: patientForm.height ? parseFloat(patientForm.height) : undefined,
      allergies: patientForm.allergies ? patientForm.allergies.split(',').map(a => a.trim()) : undefined,
      nurseId: patientForm.nurseId,
      nurseName: patientForm.nurseName,
      admissionDate: new Date(),
      medicalHistory: [],
      prescriptionHistory: []   // 필수 프로퍼티 추가
    };

    if (patient) {
      // Update existing patient
      await updatePatient(patient.id, patientData);
    } else {
      // Add new patient (patient registration only)
      await addPatient(patientData, finalBedNumber);
    }

    // ✅ RESTORED: fetchPatients call (localStorage 처방 데이터는 wardStore에서 보존됨)
    // 환자 추가/수정 후 데이터 동기화
    setTimeout(() => {
      fetchPatients();
    }, 500); // 짧은 지연으로 백엔드 업데이트 완료 대기

    onClose();
  };

  const resetForm = () => {
    setPatientForm({
      name: '',
      phone: '',
      pinCode: '',
      age: '',
      gender: 'female',
      weight: '',
      height: '',
      allergies: '',
      nurseId: 'N001',
      nurseName: '김수연'
    });
  };

  // 랜덤 6자리 PIN 생성
  const generateRandomPIN = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setPatientForm(prev => ({ ...prev, pinCode: pin }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            {patient ? '환자 정보 수정' : '신규 환자 등록'} {bedNumber && `- ${bedNumber}`}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Bed Selection - Show only when bedNumber is not provided */}
          {!bedNumber && !patient && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                침대 선택 *
              </label>
              <select
                value={selectedBed}
                onChange={(e) => setSelectedBed(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">침대를 선택하세요</option>
                {beds
                  .filter(bed => bed.status === 'empty' || !bed.patient)
                  .map(bed => (
                    <option key={bed.bedNumber} value={bed.bedNumber}>
                      {bed.bedNumber} - 빈 침대
                    </option>
                  ))}
              </select>
              {beds.filter(bed => bed.status === 'empty' || !bed.patient).length === 0 && (
                <p className="mt-2 text-sm text-red-600">현재 사용 가능한 빈 침대가 없습니다.</p>
              )}
            </div>
          )}

          {/* Show current bed for existing patient */}
          {bedNumber && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">배정된 침대</div>
              <div className="text-lg font-semibold text-gray-900">{bedNumber}</div>
            </div>
          )}

          {/* Patient Information */}
          <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">환자 기본 정보</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    환자명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientForm.name}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="환자 이름"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="010-0000-0000"
                  />
                </div>
              </div>

              {/* PIN 번호 입력 (모바일 앱 로그인용) */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  모바일 앱 로그인 PIN (6자리) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={patientForm.pinCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // 숫자만 허용
                      setPatientForm(prev => ({ ...prev, pinCode: value }));
                    }}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                    placeholder="123456"
                  />
                  <button
                    type="button"
                    onClick={generateRandomPIN}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    자동 생성
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  ℹ️ 환자가 모바일 앱에서 로그인할 때 사용하는 PIN 번호입니다
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    나이 *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="150"
                    value={patientForm.age}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="나이"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성별 *
                  </label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="female">여성</option>
                    <option value="male">남성</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    체중 (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={patientForm.weight}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="체중"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    신장 (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={patientForm.height}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, height: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="신장"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  알레르기 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={patientForm.allergies}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, allergies: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="페니실린, 요오드 등"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당 간호사
                </label>
                <input
                  type="text"
                  value={patientForm.nurseName}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, nurseName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="담당 간호사"
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
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {patient ? '정보 수정' : '환자 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
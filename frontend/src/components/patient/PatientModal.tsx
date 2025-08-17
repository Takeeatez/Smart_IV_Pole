import React, { useState, useEffect } from 'react';
import { X, Calculator, User, Pill, Clock } from 'lucide-react';
import { Patient, IVPrescription } from '../../types';
import { calculateGTT, calculateFlowRate, COMMON_MEDICATIONS, COMMON_DURATIONS } from '../../utils/gttCalculator';
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
  const { addPatient, updatePatient, addIVPrescription } = useWardStore();
  
  // Patient form state
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'female' as 'male' | 'female',
    weight: '',
    height: '',
    allergies: '',
    nurseId: 'N001',
    nurseName: '김수연'
  });

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

  // Initialize form data when editing
  useEffect(() => {
    if (patient) {
      setPatientForm({
        name: patient.name,
        age: patient.age.toString(),
        gender: patient.gender,
        weight: patient.weight?.toString() || '',
        height: patient.height?.toString() || '',
        allergies: patient.allergies?.join(', ') || '',
        nurseId: patient.nurseId,
        nurseName: patient.nurseName
      });

      if (patient.currentPrescription) {
        setPrescriptionForm({
          medicationName: patient.currentPrescription.medicationName,
          totalVolume: patient.currentPrescription.totalVolume.toString(),
          duration: patient.currentPrescription.duration.toString(),
          gttFactor: patient.currentPrescription.gttFactor,
          prescribedBy: patient.currentPrescription.prescribedBy,
          notes: patient.currentPrescription.notes || ''
        });
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const patientData: Omit<Patient, 'id'> = {
      name: patientForm.name,
      room: bedNumber.split('-')[0],
      bed: bedNumber,
      age: parseInt(patientForm.age),
      gender: patientForm.gender,
      weight: patientForm.weight ? parseFloat(patientForm.weight) : undefined,
      height: patientForm.height ? parseFloat(patientForm.height) : undefined,
      allergies: patientForm.allergies ? patientForm.allergies.split(',').map(a => a.trim()) : undefined,
      nurseId: patientForm.nurseId,
      nurseName: patientForm.nurseName,
      admissionDate: new Date(),
      medicalHistory: []
    };

    if (patient) {
      // Update existing patient
      updatePatient(patient.id, patientData);
      
      // Update IV prescription if provided
      if (prescriptionForm.medicationName && prescriptionForm.totalVolume && prescriptionForm.duration) {
        addIVPrescription(patient.id, {
          medicationName: prescriptionForm.medicationName,
          totalVolume: parseFloat(prescriptionForm.totalVolume),
          duration: parseFloat(prescriptionForm.duration),
          gttFactor: prescriptionForm.gttFactor,
          prescribedBy: prescriptionForm.prescribedBy,
          notes: prescriptionForm.notes,
          calculatedGTT: calculatedValues.gtt,
          calculatedFlowRate: calculatedValues.flowRate,
          prescribedAt: new Date()
        });
      }
    } else {
      // Add new patient
      addPatient(patientData, bedNumber);
      
      // Add IV prescription if provided
      if (prescriptionForm.medicationName && prescriptionForm.totalVolume && prescriptionForm.duration) {
        // Since we don't have the patient ID yet, we'll need to get it after creation
        setTimeout(() => {
          const beds = useWardStore.getState().beds;
          const bed = beds.find(b => b.bedNumber === bedNumber);
          if (bed?.patient) {
            addIVPrescription(bed.patient.id, {
              medicationName: prescriptionForm.medicationName,
              totalVolume: parseFloat(prescriptionForm.totalVolume),
              duration: parseFloat(prescriptionForm.duration),
              gttFactor: prescriptionForm.gttFactor,
              prescribedBy: prescriptionForm.prescribedBy,
              notes: prescriptionForm.notes,
              calculatedGTT: calculatedValues.gtt,
              calculatedFlowRate: calculatedValues.flowRate,
              prescribedAt: new Date()
            });
          }
        }, 100);
      }
    }

    onClose();
  };

  const resetForm = () => {
    setPatientForm({
      name: '',
      age: '',
      gender: 'female',
      weight: '',
      height: '',
      allergies: '',
      nurseId: 'N001',
      nurseName: '김수연'
    });
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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            {patient ? '환자 정보 수정' : '신규 환자 등록'} - {bedNumber}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              </div>

              <div className="grid grid-cols-3 gap-4">
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

            {/* IV Prescription */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">IV 처방 정보</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  약품명
                </label>
                <select
                  value={prescriptionForm.medicationName}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medicationName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">약품 선택</option>
                  {COMMON_MEDICATIONS.map((med) => (
                    <option key={med.id} value={med.name}>
                      {med.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    총 용량 (mL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prescriptionForm.totalVolume}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, totalVolume: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    투여 시간 (분)
                  </label>
                  <select
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="김의사"
                  />
                </div>
              </div>

              {/* GTT Calculation Results */}
              {prescriptionForm.totalVolume && prescriptionForm.duration && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">자동 계산 결과</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculatedValues.gtt}
                      </div>
                      <div className="text-sm text-blue-700">GTT/min</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculatedValues.flowRate}
                      </div>
                      <div className="text-sm text-blue-700">mL/hr</div>
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="투여 시 주의사항이나 특이사항을 입력하세요"
                />
              </div>
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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Edit, UserPlus, ArrowLeft, Settings, Droplet, Battery, Clock, Trash2, AlertCircle } from 'lucide-react';
import { useWardStore } from '../stores/wardStore';
import { calculateProgress, calculateRemainingTime } from '../utils/gttCalculator';
import PatientModal from '../components/patient/PatientModal';

const PatientList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { patients, beds, poleData, removePatient } = useWardStore();

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.bed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.nurseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientBed = (patientId: string) => {
    return beds.find(bed => bed.patient?.id === patientId);
  };

  const getPatientPoleData = (patientId: string) => {
    const bed = getPatientBed(patientId);
    return bed?.poleData;
  };

  const getStatusBadge = (patientId: string) => {
    const poleData = getPatientPoleData(patientId);
    
    if (!poleData || poleData.status === 'offline') {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">오프라인</span>;
    }
    
    if (poleData.percentage < 10) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">응급</span>;
    }
    
    if (poleData.percentage <= 30) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">주의</span>;
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">정상</span>;
  };

  const formatTime = (minutes: number): string => {
    if (minutes <= 0) return '완료';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const handleEditPatient = (patientId: string) => {
    setSelectedPatient(patientId);
  };

  const handleDeletePatient = (patientId: string) => {
    setPatientToDelete(patientId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      removePatient(patientToDelete);
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
    }
  };

  const getEditPatient = () => {
    return selectedPatient ? patients.find(p => p.id === selectedPatient) : undefined;
  };

  const getEditBedNumber = () => {
    if (!selectedPatient) return '';
    const bed = getPatientBed(selectedPatient);
    return bed?.bedNumber || '';
  };

  const getDeletePatient = () => {
    return patientToDelete ? patients.find(p => p.id === patientToDelete) : null;
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 text-white">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">IV</span>
              </div>
              <span className="font-semibold text-lg">SMART POLE</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6">
            <div className="px-4 space-y-2">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer text-left"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-xs">📊</span>
                </div>
                <span>병동 전체</span>
              </button>
              <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                <div className="w-5 h-5 bg-blue-400 rounded-sm flex items-center justify-center">
                  <span className="text-xs">📋</span>
                </div>
                <span>환자 목록</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-xs">🏥</span>
                </div>
                <span>IV 폴대</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-xs">📈</span>
                </div>
                <span>모니터링</span>
              </div>
              <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-xs">🔔</span>
                </div>
                <span>알림</span>
              </div>
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <span>설정</span>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 bg-gray-400 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  김
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">김수연 간호사</div>
                <div className="text-xs text-slate-400">A병동 책임간호사</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">환자 목록</h1>
                <p className="text-gray-600 mt-1">A병동 전체 환자 ({patients.length}명)</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              환자 등록
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="환자명, 침대번호, 담당간호사로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              필터
            </button>
          </div>

          {/* Patient Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">환자 정보</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">침대</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">IV 정보</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">진행률</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">담당간호사</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? '검색 결과가 없습니다.' : '등록된 환자가 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const poleData = getPatientPoleData(patient.id);
                    const prescription = patient.currentPrescription;
                    const progress = prescription ? calculateProgress(prescription.prescribedAt, prescription.duration) : 0;
                    const remainingTime = prescription ? calculateRemainingTime(prescription.prescribedAt, prescription.duration) : 0;

                    return (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-cyan-600">{patient.name.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{patient.name}</div>
                              <div className="text-sm text-gray-500">
                                {patient.age}세 • {patient.gender === 'female' ? '여성' : '남성'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{patient.bed}</div>
                          <div className="text-sm text-gray-500">{patient.room}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(patient.id)}
                        </td>
                        <td className="px-6 py-4">
                          {prescription ? (
                            <div>
                              <div className="font-medium text-gray-900">{prescription.medicationName}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Droplet className="w-3 h-3" />
                                  {poleData ? `${poleData.percentage.toFixed(0)}%` : '0%'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Battery className="w-3 h-3" />
                                  {poleData ? `${poleData.battery}%` : '0%'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">처방 없음</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {prescription ? (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      progress >= 90 ? 'bg-green-500' :
                                      progress >= 70 ? 'bg-blue-500' :
                                      progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-600">
                                  {progress.toFixed(0)}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(remainingTime)} 남음
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{patient.nurseName}</div>
                          <div className="text-sm text-gray-500">
                            입원일: {patient.admissionDate.toLocaleDateString('ko-KR')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewPatient(patient.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="상세 보기"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditPatient(patient.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="정보 수정"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePatient(patient.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Stats */}
          {patients.length > 0 && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-gray-900">{patients.length}</div>
                <div className="text-sm text-gray-600">총 환자 수</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-green-600">
                  {patients.filter(p => {
                    const poleData = getPatientPoleData(p.id);
                    return poleData && poleData.percentage > 30;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">정상 상태</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {patients.filter(p => {
                    const poleData = getPatientPoleData(p.id);
                    return poleData && poleData.percentage <= 30 && poleData.percentage >= 10;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">주의 필요</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                <div className="text-2xl font-bold text-red-600">
                  {patients.filter(p => {
                    const poleData = getPatientPoleData(p.id);
                    return poleData && poleData.percentage < 10;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">응급 상황</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={showAddModal || !!selectedPatient}
        onClose={() => {
          setShowAddModal(false);
          setSelectedPatient(null);
        }}
        bedNumber={getEditBedNumber()}
        patient={getEditPatient()}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">환자 정보 삭제</h3>
                <p className="text-sm text-gray-600">이 작업은 되돌릴 수 없습니다.</p>
              </div>
            </div>
            
            {getDeletePatient() && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">환자명:</span>
                    <span className="font-medium text-gray-900">{getDeletePatient()?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">침대:</span>
                    <span className="font-medium text-gray-900">{getDeletePatient()?.bed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">담당간호사:</span>
                    <span className="font-medium text-gray-900">{getDeletePatient()?.nurseName}</span>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-700 mb-6">
              정말로 <span className="font-semibold">{getDeletePatient()?.name}</span> 환자의 정보를 삭제하시겠습니까?
              삭제된 정보는 복구할 수 없습니다.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPatientToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientList;
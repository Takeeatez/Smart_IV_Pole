import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Download, Droplet, Activity, Battery, Clock, AlertTriangle, Phone, Settings } from 'lucide-react';
import { useWardStore } from '../stores/wardStore';
import { useMQTT } from '../hooks/useMQTT';
import { calculateProgress, calculateRemainingTime, calculateEstimatedEndTime } from '../utils/gttCalculator';
import PatientEditModal from '../components/patient/PatientEditModal';

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    getPatientById,
    beds,
    poleData,
    getActiveAlerts,
    getCriticalAlerts
  } = useWardStore();

  const { isConnected } = useMQTT();
  
  const patient = id ? getPatientById(id) : undefined;
  const patientBed = beds.find(bed => bed.patient?.id === id);
  const patientPoleData = patientBed?.poleData;
  const activeAlerts = getActiveAlerts().filter(alert => alert.patientId === id);
  const criticalAlerts = getCriticalAlerts().filter(alert => alert.patientId === id);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">환자를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-4">요청하신 환자 정보가 존재하지 않습니다.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            병동 현황으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const prescription = patient.currentPrescription;
  const progress = prescription ? calculateProgress(prescription.prescribedAt, prescription.duration, currentTime) : 0;
  const remainingTime = prescription ? calculateRemainingTime(prescription.prescribedAt, prescription.duration, currentTime) : 0;
  const estimatedEndTime = prescription ? calculateEstimatedEndTime(prescription.prescribedAt, prescription.duration) : null;

  const getStatusColor = () => {
    if (!patientPoleData || patientPoleData.status === 'offline') return 'text-gray-500';
    if (patientPoleData.percentage < 10) return 'text-red-500';
    if (patientPoleData.percentage <= 30) return 'text-orange-500';
    return 'text-green-500';
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

  return (
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
            <button
              onClick={() => navigate('/patients')}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer text-left"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-xs">📋</span>
              </div>
              <span>환자 목록</span>
            </button>
            <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
              <div className="w-5 h-5 bg-blue-400 rounded-sm flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
              <span>환자 상세</span>
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
              <h1 className="text-3xl font-bold text-gray-900">{patient.name} 환자</h1>
              <p className="text-gray-600 mt-1">{patientBed?.bedNumber} | {patient.nurseName} 담당</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Alert Bell */}
            <div className="relative">
              <Bell className={`w-6 h-6 ${criticalAlerts.length > 0 ? 'text-red-500' : 'text-gray-600'}`} />
              {activeAlerts.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{activeAlerts.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Content */}
          <div className="col-span-8">
            {/* Status Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* IV Fluid Level */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">수액 잔량</h3>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {patientPoleData ? `${patientPoleData.currentVolume.toFixed(0)}/${patientPoleData.capacity}mL` : '데이터 없음'}
                </div>
                <div className={`text-xs flex items-center gap-1 ${getStatusColor()}`}>
                  <span className="w-2 h-2 bg-current rounded-full"></span>
                  <span>
                    {patientPoleData 
                      ? patientPoleData.percentage < 10 ? '즉시 교체 필요' 
                      : patientPoleData.percentage <= 30 ? '교체 준비' 
                      : '정상 범위'
                      : '연결 끊김'}
                  </span>
                </div>
              </div>

              {/* Flow Rate */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">투여 속도</h3>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {patientPoleData ? `${patientPoleData.flowRate.toFixed(0)} mL/h` : '0 mL/h'}
                </div>
                <div className="text-xs text-gray-600">
                  처방: {prescription ? `${prescription.calculatedFlowRate.toFixed(0)} mL/h` : '미설정'}
                </div>
              </div>

              {/* Battery Level */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Battery className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">배터리</h3>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {patientPoleData ? `${patientPoleData.battery}%` : '0%'}
                </div>
                <div className={`text-xs flex items-center gap-1 ${
                  patientPoleData && patientPoleData.battery > 30 ? 'text-green-500' :
                  patientPoleData && patientPoleData.battery > 15 ? 'text-orange-500' : 'text-red-500'
                }`}>
                  <span className="w-2 h-2 bg-current rounded-full"></span>
                  <span>
                    {patientPoleData && patientPoleData.battery > 30 ? '정상' :
                     patientPoleData && patientPoleData.battery > 15 ? '주의' : '교체 필요'}
                  </span>
                </div>
              </div>
            </div>

            {/* IV Progress Chart */}
            {prescription && (
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">투여 진행 상황</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>
                      시작: {prescription.prescribedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">진행률</span>
                    <span className="text-sm font-bold text-gray-900">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        progress >= 90 ? 'bg-green-500' :
                        progress >= 70 ? 'bg-blue-500' :
                        progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatTime(remainingTime)}
                    </div>
                    <div className="text-sm text-gray-600">남은 시간</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {prescription.calculatedGTT.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">GTT/min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {estimatedEndTime?.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) || '미정'}
                    </div>
                    <div className="text-sm text-gray-600">예상 완료</div>
                  </div>
                </div>
              </div>
            )}

            {/* Prescription Details */}
            {prescription && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">처방 정보</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">약품명:</span>
                        <span className="font-medium">{prescription.medicationName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 용량:</span>
                        <span className="font-medium">{prescription.totalVolume} mL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">투여 시간:</span>
                        <span className="font-medium">{formatTime(prescription.duration)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">GTT Factor:</span>
                        <span className="font-medium">{prescription.gttFactor} GTT/mL</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">처방의사:</span>
                        <span className="font-medium">{prescription.prescribedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">처방 시간:</span>
                        <span className="font-medium">
                          {prescription.prescribedAt.toLocaleDateString('ko-KR')} {prescription.prescribedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {prescription.notes && (
                        <div>
                          <span className="text-gray-600">특이사항:</span>
                          <p className="text-sm text-gray-800 mt-1">{prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4">
            {/* Patient Profile */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-cyan-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-cyan-400">
                  <span className="text-2xl font-bold text-cyan-600">
                    {patient.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{patient.name}</h3>
                <p className="text-gray-600">{patientBed?.bedNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-cyan-500">{patient.gender === 'female' ? '♀' : '♂'}</span>
                    <span className="text-sm text-gray-600">성별</span>
                  </div>
                  <div className="font-semibold">{patient.gender === 'female' ? '여성' : '남성'}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-cyan-500">👤</span>
                    <span className="text-sm text-gray-600">나이</span>
                  </div>
                  <div className="font-semibold">{patient.age}세</div>
                </div>
                {patient.height && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-cyan-500">📏</span>
                      <span className="text-sm text-gray-600">키</span>
                    </div>
                    <div className="font-semibold">{patient.height} cm</div>
                  </div>
                )}
                {patient.weight && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-cyan-500">⚖️</span>
                      <span className="text-sm text-gray-600">체중</span>
                    </div>
                    <div className="font-semibold">{patient.weight} kg</div>
                  </div>
                )}
              </div>

              {patient.allergies && patient.allergies.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">알레르기</h4>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  정보 수정
                </button>
                <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                  상세 기록 보기
                </button>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">활성 알림</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">알림이 없습니다</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === 'critical'
                          ? 'bg-red-50 border-red-500'
                          : alert.severity === 'warning'
                          ? 'bg-orange-50 border-orange-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            alert.severity === 'critical'
                              ? 'text-red-800'
                              : alert.severity === 'warning'
                              ? 'text-orange-800'
                              : 'text-blue-800'
                          }`}>
                            {alert.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {alert.timestamp.toLocaleTimeString('ko-KR')}
                          </div>
                        </div>
                        <div className={`ml-3 text-lg ${
                          alert.severity === 'critical'
                            ? 'text-red-500'
                            : alert.severity === 'warning'
                            ? 'text-orange-500'
                            : 'text-blue-500'
                        }`}>
                          {alert.type === 'button_pressed' ? <Phone className="w-4 h-4" /> :
                           alert.type === 'empty' || alert.type === 'low' ? <Droplet className="w-4 h-4" /> :
                           alert.type === 'battery_low' ? <Battery className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Edit Modal */}
      {patient && (
        <PatientEditModal
          patient={patient}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default PatientDetail;
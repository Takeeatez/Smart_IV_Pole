import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Wifi, WifiOff, Activity, Users, AlertTriangle, Bed, UserCheck, UserPlus, CheckCircle, FileText, ArrowRight, Pill } from 'lucide-react';
import { useWardStore } from '../../stores/wardStore';
import { Patient } from '../../types';
import { useMQTT } from '../../hooks/useMQTT';
import BedCard from './BedCard';
import PatientModal from '../patient/PatientModal';
import DrugPrescriptionModal from '../patient/DrugPrescriptionModal';
import AlertCenter from '../alert/AlertCenter';
import Sidebar from '../layout/Sidebar';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const WardOverview: React.FC = () => {
  const navigate = useNavigate();
  const {
    beds,
    wardStats,
    alerts,
    setSelectedPatient,
    getActiveAlerts,
    getCriticalAlerts,
    fetchPatients,
    fetchAlerts
  } = useWardStore();

  const { isConnected, connectionStatus } = useMQTT();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedBedNumber, setSelectedBedNumber] = useState('');
  const [showAlertCenter, setShowAlertCenter] = useState(false);
  const [showDrugPrescriptionModal, setShowDrugPrescriptionModal] = useState(false);
  const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState<Patient | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // ✅ RESTORED: 환자 데이터 자동 새로고침 (localStorage 처방 데이터는 wardStore에서 보존)
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // 🔔 실시간 알림 폴링 (5초마다 자동 새로고침)
  useEffect(() => {
    // 초기 알림 로드
    fetchAlerts();

    // 5초마다 알림 폴링
    const alertPollingInterval = setInterval(() => {
      fetchAlerts();
    }, 5000);

    return () => clearInterval(alertPollingInterval);
  }, [fetchAlerts]);

  const activeAlerts = getActiveAlerts();
  const criticalAlerts = getCriticalAlerts();

  const handleBedClick = (bedNumber: string) => {
    const bed = beds.find(b => b.bedNumber === bedNumber);
    if (bed?.patient) {
      // Navigate to patient detail page
      navigate(`/patient/${bed.patient.id}`);
    } else {
      // Show add patient modal for empty bed
      setSelectedBedNumber(bedNumber);
      setShowPatientModal(true);
    }
  };

  const handleDrugPrescription = () => {
    // Find first patient that needs prescription (for quick action)
    const patientWithoutPrescription = beds.find(bed =>
      bed.patient && !bed.patient.currentPrescription
    )?.patient;

    if (patientWithoutPrescription) {
      setSelectedPatientForPrescription(patientWithoutPrescription);
      setShowDrugPrescriptionModal(true);
    } else {
      alert('처방이 필요한 환자가 없습니다.');
    }
  };

  const getStatusText = (count: number, total: number) => {
    if (total === 0) return '0개';
    return `${count}개`;
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="mb-3 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">병동 현황</h1>
              <p className="text-gray-600 mt-1">
                {currentTime.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })} {currentTime.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
                {isConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">실시간 연결</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-500 font-medium">연결 끊김</span>
                  </>
                )}
              </div>

              {/* Alert Button */}
              <Button
                onClick={() => setShowAlertCenter(true)}
                variant={criticalAlerts.length > 0 ? 'danger' : 'ghost'}
                size="icon"
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {activeAlerts.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{activeAlerts.length}</span>
                  </div>
                )}
              </Button>
          </div>
        </div>

          {/* Key Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">전체 환자</p>
                    <p className="text-2xl font-bold text-gray-900">{beds.filter(bed => bed.patient).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">현재 입원 중</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">정상 상태</p>
                    <p className="text-2xl font-bold text-green-500">{wardStats.normal}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 text-sm">●</span>
                  <span className="text-gray-600 ml-1">안전</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">주의 필요</p>
                    <p className="text-2xl font-bold text-yellow-500">{wardStats.warning}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-yellow-500 text-sm">●</span>
                  <span className="text-gray-600 ml-1">모니터링</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">응급 상태</p>
                    <p className="text-2xl font-bold text-red-500">{wardStats.critical}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-500 text-sm">●</span>
                  <span className="text-gray-600 ml-1">즉시 대응</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">병상 이용률</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((beds.filter(bed => bed.patient).length / beds.length) * 100)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Bed className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">{beds.length - beds.filter(bed => bed.patient).length}개 공석</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Bed Grid */}
          <div className="lg:col-span-2 min-h-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle>병실 현황 - 301A호</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <div className="grid grid-cols-3 gap-4">
                  {beds.map((bed) => (
                    <BedCard
                      key={bed.bedNumber}
                      bed={bed}
                      onClick={() => handleBedClick(bed.bedNumber)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Alerts and Quick Actions */}
          <div className="lg:col-span-1 min-h-0 flex flex-col">
            <Card className="mb-3 flex-1 min-h-0 flex flex-col">
              <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle>실시간 알림</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <div className="space-y-3 h-full overflow-y-auto">
                  {activeAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>알림이 없습니다</p>
                    </div>
                  ) : (
                    activeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          alert.severity === 'critical'
                            ? 'bg-error-50 border-error-500'
                            : alert.severity === 'warning'
                            ? 'bg-warning-50 border-warning-500'
                            : 'bg-secondary-50 border-secondary-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${
                              alert.severity === 'critical'
                                ? 'text-red-800'
                                : alert.severity === 'warning'
                                ? 'text-yellow-800'
                                : 'text-blue-800'
                            }`}>
                              {alert.message}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {alert.timestamp.toLocaleTimeString('ko-KR')}
                            </div>
                          </div>
                          <div className={`ml-3 text-xl ${
                            alert.severity === 'critical'
                              ? 'text-red-500'
                              : alert.severity === 'warning'
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                          }`}>
                            {alert.type === 'button_pressed' ? '📞' :
                             alert.type === 'empty' || alert.type === 'low' ? '💧' :
                             alert.type === 'battery_low' ? '🔋' : '⚠️'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="flex-shrink-0 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  빠른 작업
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {/* 신규 환자 등록 */}
                  <div
                    onClick={() => navigate('/patients')}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs">신규 환자 등록</div>
                          <div className="text-xs text-blue-100">새로운 IV 투여 시작</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
                  </div>

                  {/* 모든 알림 확인 */}
                  <div className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl p-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs">모든 알림 확인</div>
                          <div className="text-xs text-green-100">일괄 처리</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
                  </div>

                  {/* 일일 보고서 */}
                  <div className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl p-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs">일일 보고서</div>
                          <div className="text-xs text-purple-100">오늘의 활동 요약</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
                  </div>
                  {/* 약품 처방 */}
                  <div
                    onClick={handleDrugPrescription}
                    className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl p-3 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs">약품 처방</div>
                          <div className="text-xs text-orange-100">신속 처방 시작</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={showPatientModal}
        onClose={() => {
          setShowPatientModal(false);
          setSelectedBedNumber('');
        }}
        bedNumber={selectedBedNumber}
      />

      {/* Drug Prescription Modal */}
      {selectedPatientForPrescription && (
        <DrugPrescriptionModal
          isOpen={showDrugPrescriptionModal}
          onClose={() => {
            setShowDrugPrescriptionModal(false);
            setSelectedPatientForPrescription(null);
          }}
          patient={selectedPatientForPrescription}
        />
      )}

      {/* Alert Center */}
      <AlertCenter
        isOpen={showAlertCenter}
        onClose={() => setShowAlertCenter(false)}
      />
    </div>
  );
};

export default WardOverview;
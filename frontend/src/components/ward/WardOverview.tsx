import React, { useEffect, useState } from 'react';
import { Bell, Wifi, WifiOff, Activity } from 'lucide-react';
import { useWardStore } from '../../stores/wardStore';
import { useMQTT } from '../../hooks/useMQTT';
import BedCard from './BedCard';

const WardOverview: React.FC = () => {
  const { 
    beds, 
    wardStats, 
    alerts, 
    setSelectedPatient, 
    getActiveAlerts, 
    getCriticalAlerts 
  } = useWardStore();
  
  const { isConnected, connectionStatus } = useMQTT();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const activeAlerts = getActiveAlerts();
  const criticalAlerts = getCriticalAlerts();

  const handleBedClick = (bedNumber: string) => {
    const bed = beds.find(b => b.bedNumber === bedNumber);
    if (bed?.patient) {
      setSelectedPatient(bed.patient.id);
      // Navigate to patient detail page - will implement routing later
      console.log('Navigate to patient:', bed.patient.id);
    }
  };

  const getStatusText = (count: number, total: number) => {
    if (total === 0) return '0개';
    return `${count}개`;
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
            <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
              <div className="w-5 h-5 bg-blue-400 rounded-sm flex items-center justify-center">
                <span className="text-xs">📊</span>
              </div>
              <span>병동 전체</span>
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center">
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
              {activeAlerts.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {activeAlerts.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center">
                <span className="text-xs">📝</span>
              </div>
              <span>보고서</span>
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer">
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-xs">⚙️</span>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">A병동 현황</h1>
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
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600">실시간 연결</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600">연결 끊김</span>
                </>
              )}
            </div>
            
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

        {/* Status Summary */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">전체</h3>
                <p className="text-2xl font-bold text-gray-900">{getStatusText(wardStats.total, wardStats.total)}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">정상</h3>
                <p className="text-2xl font-bold text-green-600">{getStatusText(wardStats.normal, wardStats.total)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">주의</h3>
                <p className="text-2xl font-bold text-orange-600">{getStatusText(wardStats.warning, wardStats.total)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">⚠</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">응급</h3>
                <p className="text-2xl font-bold text-red-600">{getStatusText(wardStats.critical, wardStats.total)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">오프라인</h3>
                <p className="text-2xl font-bold text-gray-600">{getStatusText(wardStats.offline, wardStats.total)}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-xl">●</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Bed Grid */}
          <div className="col-span-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">병실 현황</h2>
            <div className="grid grid-cols-3 gap-6">
              {beds.map((bed) => (
                <BedCard
                  key={bed.bedNumber}
                  bed={bed}
                  onClick={() => handleBedClick(bed.bedNumber)}
                />
              ))}
            </div>
          </div>

          {/* Real-time Alerts Panel */}
          <div className="col-span-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">실시간 알림</h2>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>알림이 없습니다</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
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
                        <div className={`ml-3 text-xl ${
                          alert.severity === 'critical'
                            ? 'text-red-500'
                            : alert.severity === 'warning'
                            ? 'text-orange-500'
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
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
              <div className="space-y-3">
                <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="font-medium text-blue-800">신규 환자 등록</div>
                  <div className="text-sm text-blue-600">새로운 IV 투여 시작</div>
                </button>
                <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="font-medium text-green-800">모든 알림 확인</div>
                  <div className="text-sm text-green-600">일괄 처리</div>
                </button>
                <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="font-medium text-purple-800">일일 보고서</div>
                  <div className="text-sm text-purple-600">오늘의 활동 요약</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardOverview;
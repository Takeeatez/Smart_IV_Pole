import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, Droplet, AlertTriangle, Battery,
  Clock, Download, Calendar, Filter
} from 'lucide-react';
import { useWardStore } from '../stores/wardStore';
import Sidebar from '../components/layout/Sidebar';

const Statistics: React.FC = () => {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [selectedWard, setSelectedWard] = useState<string>('all');

  const {
    beds,
    patients,
    alerts,
    poleData,
    wardStats,
    getActiveAlerts,
    getCriticalAlerts
  } = useWardStore();

  // 통계 계산
  const activePatients = beds.filter(bed => bed.patient && bed.poleData?.status === 'online').length;
  const totalAlerts = alerts.length;
  const criticalAlerts = getCriticalAlerts().length;
  const avgBatteryLevel = Array.from(poleData.values()).reduce((acc, pole) => acc + pole.battery, 0) / poleData.size || 0;

  // 시간별 수액 사용량 데이터 (Mock)
  const hourlyUsageData = [
    { hour: '00:00', usage: 320 },
    { hour: '04:00', usage: 280 },
    { hour: '08:00', usage: 450 },
    { hour: '12:00', usage: 520 },
    { hour: '16:00', usage: 480 },
    { hour: '20:00', usage: 380 },
    { hour: '24:00', usage: 340 },
  ];

  // 상태별 환자 분포
  const statusDistribution = [
    { name: '정상', value: wardStats.normal, color: '#10b981' },
    { name: '주의', value: wardStats.warning, color: '#f59e0b' },
    { name: '위험', value: wardStats.critical, color: '#ef4444' },
    { name: '오프라인', value: wardStats.offline, color: '#6b7280' },
  ];

  // 알림 유형별 통계
  const alertTypeStats = alerts.reduce((acc, alert) => {
    const type = alert.type === 'low' ? '낮은 수액' :
                 alert.type === 'empty' ? '수액 소진' :
                 alert.type === 'button_pressed' ? '호출 버튼' :
                 alert.type === 'battery_low' ? '배터리 부족' :
                 alert.type === 'offline' ? '연결 끊김' : '기타';

    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alertTypeData = Object.entries(alertTypeStats).map(([type, count]) => ({
    type,
    count
  }));

  // 일별 수액 사용량 트렌드 (Mock)
  const dailyTrendData = [
    { date: '12/8', totalVolume: 12500, patients: 24 },
    { date: '12/9', totalVolume: 13200, patients: 26 },
    { date: '12/10', totalVolume: 11800, patients: 23 },
    { date: '12/11', totalVolume: 14500, patients: 28 },
    { date: '12/12', totalVolume: 13900, patients: 27 },
    { date: '12/13', totalVolume: 15200, patients: 29 },
    { date: '12/14', totalVolume: 14800, patients: 28 },
  ];

  // CSV 내보내기 함수
  const exportToCSV = () => {
    const csvData = patients.map(patient => {
      const bed = beds.find(b => b.patient?.id === patient.id);
      const pole = bed?.poleData;

      return {
        '환자명': patient.name,
        '병실': bed?.bedNumber || '',
        '나이': patient.age,
        '성별': patient.gender === 'male' ? '남성' : '여성',
        '수액 잔량(%)': pole?.percentage || 0,
        '배터리(%)': pole?.battery || 0,
        '상태': pole?.status === 'online' ? '온라인' : '오프라인',
        '담당간호사': patient.nurseName
      };
    });

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `ward_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">통계 및 리포트</h1>
              <p className="text-gray-600 mt-1">병동 운영 현황 및 분석 데이터</p>
            </div>
            <div className="flex gap-4">
              {/* Date Range Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDateRange('today')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    dateRange === 'today'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  오늘
                </button>
                <button
                  onClick={() => setDateRange('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    dateRange === 'week'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  주간
                </button>
                <button
                  onClick={() => setDateRange('month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    dateRange === 'month'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  월간
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV 내보내기
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">+12%</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{activePatients}</div>
              <div className="text-sm text-gray-600">활성 환자</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium">정상</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">14.8L</div>
              <div className="text-sm text-gray-600">일일 사용량</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-sm text-red-600 font-medium">{criticalAlerts} 긴급</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalAlerts}</div>
              <div className="text-sm text-gray-600">활성 알림</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Battery className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-gray-600 font-medium">평균</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{avgBatteryLevel.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">배터리 잔량</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* 시간별 수액 사용량 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">시간별 수액 사용량</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="usage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="사용량 (mL)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 환자 상태 분포 */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">환자 상태 분포</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 일별 트렌드 */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일별 수액 사용 트렌드</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalVolume" fill="#3b82f6" name="총 사용량 (mL)" />
                <Bar yAxisId="right" dataKey="patients" fill="#10b981" name="환자 수" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 알림 유형별 통계 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 유형별 발생 현황</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={alertTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" name="발생 건수" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">병실별 현황</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">병실</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">환자 수</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">평균 잔량</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">알림</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {['301A', '301B', '302A'].map(room => {
                    const roomBeds = beds.filter(bed => bed.room === room);
                    const occupiedBeds = roomBeds.filter(bed => bed.patient);
                    const avgVolume = occupiedBeds.reduce((acc, bed) =>
                      acc + (bed.poleData?.percentage || 0), 0) / occupiedBeds.length || 0;
                    const roomAlerts = alerts.filter(alert =>
                      occupiedBeds.some(bed => bed.patient?.id === alert.patientId)
                    ).length;

                    return (
                      <tr key={room} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">{room}</td>
                        <td className="py-3 px-4 text-sm">{occupiedBeds.length}/{roomBeds.length}</td>
                        <td className="py-3 px-4 text-sm">{avgVolume.toFixed(0)}%</td>
                        <td className="py-3 px-4 text-sm">
                          {roomAlerts > 0 && (
                            <span className="text-orange-600 font-medium">{roomAlerts}건</span>
                          )}
                          {roomAlerts === 0 && <span className="text-gray-400">-</span>}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            avgVolume > 30 ? 'bg-green-100 text-green-700' :
                            avgVolume > 10 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {avgVolume > 30 ? '정상' : avgVolume > 10 ? '주의' : '위험'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, RotateCcw, Bell, Eye, Monitor, Shield, Clock,
  Volume2, VolumeX, Smartphone, Settings as SettingsIcon, Download,
  Upload, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import { useWardStore } from '../stores/wardStore';
import Sidebar from '../components/layout/Sidebar';

interface SettingsState {
  // Alert Settings
  lowFluidThreshold: number;
  criticalFluidThreshold: number;
  batteryWarningThreshold: number;
  batteryCriticalThreshold: number;
  alertSoundEnabled: boolean;
  autoAcknowledgeTimeout: number;

  // Display Settings
  autoRefreshInterval: number;
  showBatteryStatus: boolean;
  showFlowRate: boolean;
  darkMode: boolean;
  compactView: boolean;

  // Notification Settings
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  priorityAlertsOnly: boolean;

  // System Settings
  dataRetentionDays: number;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  maxConcurrentUsers: number;

  // Ward Settings
  wardName: string;
  bedCount: number;
  nurseStationPhone: string;
  emergencyContact: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { wardStats } = useWardStore();

  const [settings, setSettings] = useState<SettingsState>({
    // Alert Settings - Default medical thresholds
    lowFluidThreshold: 30,
    criticalFluidThreshold: 10,
    batteryWarningThreshold: 30,
    batteryCriticalThreshold: 15,
    alertSoundEnabled: true,
    autoAcknowledgeTimeout: 30,

    // Display Settings
    autoRefreshInterval: 1,
    showBatteryStatus: true,
    showFlowRate: true,
    darkMode: false,
    compactView: false,

    // Notification Settings
    pushNotificationsEnabled: true,
    emailNotificationsEnabled: false,
    smsNotificationsEnabled: false,
    priorityAlertsOnly: false,

    // System Settings
    dataRetentionDays: 90,
    autoBackup: true,
    backupFrequency: 'daily',
    maxConcurrentUsers: 10,

    // Ward Settings
    wardName: 'A병동',
    bedCount: 6,
    nurseStationPhone: '02-123-4567',
    emergencyContact: '응급실: 02-123-1119'
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'display' | 'notifications' | 'system' | 'ward'>('alerts');

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // In a real app, this would save to backend
    localStorage.setItem('wardSettings', JSON.stringify(settings));
    setHasChanges(false);

    // Show success message
    alert('설정이 저장되었습니다.');
  };

  const resetToDefaults = () => {
    setSettings({
      lowFluidThreshold: 30,
      criticalFluidThreshold: 10,
      batteryWarningThreshold: 30,
      batteryCriticalThreshold: 15,
      alertSoundEnabled: true,
      autoAcknowledgeTimeout: 30,
      autoRefreshInterval: 1,
      showBatteryStatus: true,
      showFlowRate: true,
      darkMode: false,
      compactView: false,
      pushNotificationsEnabled: true,
      emailNotificationsEnabled: false,
      smsNotificationsEnabled: false,
      priorityAlertsOnly: false,
      dataRetentionDays: 90,
      autoBackup: true,
      backupFrequency: 'daily',
      maxConcurrentUsers: 10,
      wardName: 'A병동',
      bedCount: 6,
      nurseStationPhone: '02-123-4567',
      emergencyContact: '응급실: 02-123-1119'
    });
    setHasChanges(true);
    setShowResetConfirm(false);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ward_settings_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        setHasChanges(true);
        alert('설정을 가져왔습니다.');
      } catch (error) {
        alert('설정 파일을 읽을 수 없습니다.');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'alerts', name: '알림 설정', icon: Bell },
    { id: 'display', name: '화면 설정', icon: Monitor },
    { id: 'notifications', name: '알림 방식', icon: Smartphone },
    { id: 'system', name: '시스템', icon: Shield },
    { id: 'ward', name: '병동 정보', icon: SettingsIcon }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

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
              <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
              <p className="text-gray-600 mt-1">Smart IV Pole 시스템 환경 설정</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportSettings}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              내보내기
            </button>
            <label className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              가져오기
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Tab Navigation */}
          <div className="w-64">
            <nav className="bg-white rounded-lg shadow-sm p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            {/* Alert Settings */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">알림 임계값 설정</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수액 주의 임계값 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.lowFluidThreshold}
                        onChange={(e) => handleSettingChange('lowFluidThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">수액이 이 값 이하로 떨어지면 주의 알림</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수액 응급 임계값 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.criticalFluidThreshold}
                        onChange={(e) => handleSettingChange('criticalFluidThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">수액이 이 값 이하로 떨어지면 응급 알림</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        배터리 주의 임계값 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.batteryWarningThreshold}
                        onChange={(e) => handleSettingChange('batteryWarningThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">배터리가 이 값 이하로 떨어지면 교체 알림</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        배터리 응급 임계값 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.batteryCriticalThreshold}
                        onChange={(e) => handleSettingChange('batteryCriticalThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">배터리가 이 값 이하로 떨어지면 즉시 교체 알림</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">알림 동작 설정</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">알림 사운드</label>
                        <p className="text-xs text-gray-500">새로운 알림 발생 시 사운드 재생</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('alertSoundEnabled', !settings.alertSoundEnabled)}
                        className={`p-2 rounded-lg transition-colors ${
                          settings.alertSoundEnabled
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {settings.alertSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        자동 확인 시간 (분)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={settings.autoAcknowledgeTimeout}
                        onChange={(e) => handleSettingChange('autoAcknowledgeTimeout', parseInt(e.target.value))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">0으로 설정하면 자동 확인 비활성화</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Display Settings */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">화면 표시 설정</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        자동 새로고침 간격 (초)
                      </label>
                      <select
                        value={settings.autoRefreshInterval}
                        onChange={(e) => handleSettingChange('autoRefreshInterval', parseInt(e.target.value))}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={1}>1초</option>
                        <option value={5}>5초</option>
                        <option value={10}>10초</option>
                        <option value={30}>30초</option>
                        <option value={60}>1분</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">실시간 데이터 업데이트 빈도</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">배터리 상태 표시</label>
                          <p className="text-xs text-gray-500">환자 목록에서 배터리 레벨 표시</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.showBatteryStatus}
                          onChange={(e) => handleSettingChange('showBatteryStatus', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">유속 정보 표시</label>
                          <p className="text-xs text-gray-500">환자 목록에서 유속 정보 표시</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.showFlowRate}
                          onChange={(e) => handleSettingChange('showFlowRate', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">컴팩트 보기</label>
                          <p className="text-xs text-gray-500">환자 카드를 작게 표시하여 더 많은 정보 보기</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.compactView}
                          onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">다크 모드</label>
                          <p className="text-xs text-gray-500">야간 근무 시 어두운 테마 사용</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.darkMode}
                          onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-400">다크 모드는 향후 업데이트에서 지원 예정</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">알림 방식 설정</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">푸시 알림</label>
                        <p className="text-xs text-gray-500">브라우저 푸시 알림으로 즉시 알림 수신</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.pushNotificationsEnabled}
                        onChange={(e) => handleSettingChange('pushNotificationsEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">이메일 알림</label>
                        <p className="text-xs text-gray-500">중요한 알림을 이메일로 수신</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.emailNotificationsEnabled}
                        onChange={(e) => handleSettingChange('emailNotificationsEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">SMS 알림</label>
                        <p className="text-xs text-gray-500">응급 상황 시 SMS로 알림 수신</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.smsNotificationsEnabled}
                        onChange={(e) => handleSettingChange('smsNotificationsEnabled', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">우선순위 알림만</label>
                        <p className="text-xs text-gray-500">응급 및 주의 알림만 수신 (정보 알림 제외)</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.priorityAlertsOnly}
                        onChange={(e) => handleSettingChange('priorityAlertsOnly', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">알림 설정 안내</p>
                        <p className="text-xs text-blue-700 mt-1">
                          이메일 및 SMS 알림 기능은 병원 시스템 연동 후 사용 가능합니다.
                          현재는 브라우저 푸시 알림만 지원됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">시스템 관리</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        데이터 보관 기간 (일)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={settings.dataRetentionDays}
                        onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">이 기간이 지난 데이터는 자동 삭제</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        최대 동시 사용자 수
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.maxConcurrentUsers}
                        onChange={(e) => handleSettingChange('maxConcurrentUsers', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">동시에 접속 가능한 사용자 수 제한</p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">자동 백업</label>
                        <p className="text-xs text-gray-500">시스템 데이터 자동 백업 활성화</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {settings.autoBackup && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          백업 주기
                        </label>
                        <select
                          value={settings.backupFrequency}
                          onChange={(e) => handleSettingChange('backupFrequency', e.target.value as any)}
                          className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="daily">매일</option>
                          <option value="weekly">매주</option>
                          <option value="monthly">매월</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Ward Settings */}
            {activeTab === 'ward' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">병동 정보</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        병동명
                      </label>
                      <input
                        type="text"
                        value={settings.wardName}
                        onChange={(e) => handleSettingChange('wardName', e.target.value)}
                        className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="예: A병동"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        총 침대 수
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.bedCount}
                        onChange={(e) => handleSettingChange('bedCount', parseInt(e.target.value))}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">현재 사용 중: {wardStats.total}개</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        간호사실 전화번호
                      </label>
                      <input
                        type="tel"
                        value={settings.nurseStationPhone}
                        onChange={(e) => handleSettingChange('nurseStationPhone', e.target.value)}
                        className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="예: 02-123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        응급 연락처
                      </label>
                      <input
                        type="text"
                        value={settings.emergencyContact}
                        onChange={(e) => handleSettingChange('emergencyContact', e.target.value)}
                        className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="예: 응급실: 02-123-1119"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">{wardStats.total}</div>
                      <div className="text-sm text-gray-600">총 침대</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{wardStats.normal}</div>
                      <div className="text-sm text-gray-600">정상</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">{wardStats.warning}</div>
                      <div className="text-sm text-gray-600">주의</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">{wardStats.critical}</div>
                      <div className="text-sm text-gray-600">응급</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">설정 초기화</h3>
                <p className="text-sm text-gray-600">모든 설정을 기본값으로 되돌립니다.</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-6">
              현재 설정이 모두 삭제되고 기본값으로 초기화됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
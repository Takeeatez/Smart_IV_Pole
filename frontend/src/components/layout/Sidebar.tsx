import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, TrendingUp } from 'lucide-react';
import { useWardStore } from '../../stores/wardStore';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getActiveAlerts } = useWardStore();

  const activeAlerts = getActiveAlerts();

  const navigationItems = [
    {
      id: 'overview',
      path: '/',
      label: '병동 전체',
      icon: '📊'
    },
    {
      id: 'patients',
      path: '/patients',
      label: '환자 목록',
      icon: '📋'
    },
    {
      id: 'devices',
      path: '/devices',
      label: 'IV 폴대',
      icon: '🏥',
      disabled: true // 추후 구현 예정
    },
    {
      id: 'statistics',
      path: '/statistics',
      label: '통계/리포트',
      icon: '📈'
    },
    {
      id: 'alerts',
      path: '/alerts',
      label: '알림',
      icon: '🔔',
      badge: activeAlerts.length > 0 ? activeAlerts.length : undefined,
      disabled: true // 추후 구현 예정
    },
    {
      id: 'reports',
      path: '/reports',
      label: '보고서',
      icon: '📝',
      disabled: true // 추후 구현 예정
    }
  ];

  const isCurrentPage = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string, disabled?: boolean) => {
    if (disabled) return;
    navigate(path);
  };

  return (
    <div className="w-64 bg-slate-800 text-white flex flex-col">
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
      <nav className="mt-6 flex-1">
        <div className="px-4 space-y-2">
          {navigationItems.map((item) => {
            const isCurrent = isCurrentPage(item.path);
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path, isDisabled)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer text-left transition-colors ${
                  isCurrent
                    ? 'bg-slate-700'
                    : isDisabled
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'hover:bg-slate-700'
                }`}
              >
                <div className={`w-5 h-5 flex items-center justify-center ${
                  isCurrent ? 'bg-blue-400 rounded-sm' : ''
                }`}>
                  {item.id === 'statistics' && isCurrent ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <span className="text-xs">{item.icon}</span>
                  )}
                </div>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-700">
        {/* Settings */}
        <button
          onClick={() => handleNavigation('/settings')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer text-left transition-colors mb-4 ${
            isCurrentPage('/settings')
              ? 'bg-slate-700'
              : 'hover:bg-slate-700'
          }`}
        >
          <div className={`w-5 h-5 flex items-center justify-center ${
            isCurrentPage('/settings') ? 'bg-blue-400 rounded-sm' : ''
          }`}>
            {isCurrentPage('/settings') ? (
              <Settings className="w-3 h-3" />
            ) : (
              <span className="text-xs">⚙️</span>
            )}
          </div>
          <span>설정</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
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
  );
};

export default Sidebar;
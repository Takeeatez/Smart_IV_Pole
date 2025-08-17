import { 
  Home, 
  Activity, 
  Users, 
  Settings, 
  HelpCircle,
  ClipboardList,
  FileText,
  Shield,
  MessageCircle
} from 'lucide-react';

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (path: string) => void;
}

const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'My Profile', 
    icon: Home, 
    path: '/dashboard' 
  },
  { 
    id: 'monitoring', 
    label: 'Prescriptions', 
    icon: FileText, 
    path: '/monitoring' 
  },
  { 
    id: 'patients', 
    label: 'See My Doc', 
    icon: Users, 
    path: '/patients' 
  },
  { 
    id: 'records', 
    label: 'Health Record', 
    icon: ClipboardList, 
    path: '/records' 
  },
  { 
    id: 'reports', 
    label: 'Treatment Plan', 
    icon: Activity, 
    path: '/reports' 
  },
  { 
    id: 'alerts', 
    label: 'Insurance', 
    icon: Shield, 
    path: '/alerts'
  },
  { 
    id: 'support', 
    label: 'Support', 
    icon: HelpCircle, 
    path: '/support' 
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/settings' 
  },
];

export default function Sidebar({ activeItem = 'dashboard', onNavigate }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <h1 className="text-lg font-bold text-white">SMART IV</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate?.(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-cyan-500 ring-opacity-50">
            <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">이</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">이간호사</p>
            <p className="text-xs text-gray-400">smartiv@hospital.com</p>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
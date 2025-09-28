import React, { useState, useEffect } from 'react';
import {
  Activity,
  Battery,
  Wifi,
  WifiOff,
  Settings,
  Plus,
  Search,
  Filter,
  Power,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface PoleDevice {
  id: string;
  serialNumber: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  batteryLevel: number;
  location: {
    room: string;
    bedNumber?: string;
  };
  lastSeen: Date;
  firmwareVersion: string;
  isAssigned: boolean;
  currentPatient?: {
    id: string;
    name: string;
  };
  hardware: {
    model: string;
    year: number;
  };
  connectivity: {
    wifi: boolean;
    signalStrength: number; // 0-100
  };
  maintenance: {
    lastCheck: Date;
    nextCheck: Date;
  };
}

const DeviceManagement: React.FC = () => {
  const [poles, setPoles] = useState<PoleDevice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 예시 폴대 데이터
  useEffect(() => {
    const mockPoles: PoleDevice[] = [
      {
        id: 'pole-001',
        serialNumber: 'MP2024-001',
        name: 'MEDIPOLE Unit 001',
        status: 'online',
        batteryLevel: 85,
        location: {
          room: '301A',
          bedNumber: '1'
        },
        lastSeen: new Date(),
        firmwareVersion: '2.1.3',
        isAssigned: true,
        currentPatient: {
          id: 'patient-001',
          name: '김철수'
        },
        hardware: {
          model: 'MEDIPOLE-Pro',
          year: 2024
        },
        connectivity: {
          wifi: true,
          signalStrength: 92
        },
        maintenance: {
          lastCheck: new Date('2024-09-20'),
          nextCheck: new Date('2024-12-20')
        }
      },
      {
        id: 'pole-002',
        serialNumber: 'MP2024-002',
        name: 'MEDIPOLE Unit 002',
        status: 'offline',
        batteryLevel: 0,
        location: {
          room: '창고',
        },
        lastSeen: new Date('2024-09-25'),
        firmwareVersion: '2.1.2',
        isAssigned: false,
        hardware: {
          model: 'MEDIPOLE-Pro',
          year: 2024
        },
        connectivity: {
          wifi: false,
          signalStrength: 0
        },
        maintenance: {
          lastCheck: new Date('2024-09-15'),
          nextCheck: new Date('2024-12-15')
        }
      },
      {
        id: 'pole-003',
        serialNumber: 'MP2024-003',
        name: 'MEDIPOLE Unit 003',
        status: 'maintenance',
        batteryLevel: 45,
        location: {
          room: '정비실',
        },
        lastSeen: new Date('2024-09-26'),
        firmwareVersion: '2.1.3',
        isAssigned: false,
        hardware: {
          model: 'MEDIPOLE-Standard',
          year: 2023
        },
        connectivity: {
          wifi: true,
          signalStrength: 65
        },
        maintenance: {
          lastCheck: new Date(),
          nextCheck: new Date('2024-10-28')
        }
      }
    ];

    // 실제 환경에서는 API 호출
    setTimeout(() => {
      setPoles(mockPoles);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: PoleDevice['status']) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50';
      case 'offline': return 'text-gray-600 bg-gray-50';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: PoleDevice['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'offline': return <Power className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Power className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: PoleDevice['status']) => {
    switch (status) {
      case 'online': return '온라인';
      case 'offline': return '오프라인';
      case 'maintenance': return '정비중';
      case 'error': return '오류';
      default: return '알 수 없음';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPoles = poles.filter(pole => {
    const matchesSearch = pole.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pole.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pole.location.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || pole.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: poles.length,
    online: poles.filter(p => p.status === 'online').length,
    offline: poles.filter(p => p.status === 'offline').length,
    maintenance: poles.filter(p => p.status === 'maintenance').length,
    assigned: poles.filter(p => p.isAssigned).length
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">폴대 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IV 폴대 관리</h1>
              <p className="text-gray-600 mt-1">MEDIPOLE 장비 상태 및 관리</p>
            </div>
            <Button leftIcon={<Plus />}>
              새 폴대 등록
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">전체 폴대</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.online}</div>
                  <div className="text-sm text-gray-600">온라인</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.offline}</div>
                  <div className="text-sm text-gray-600">오프라인</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
                  <div className="text-sm text-gray-600">정비중</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
                  <div className="text-sm text-gray-600">사용중</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="폴대 이름, 시리얼 번호, 위치로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">모든 상태</option>
              <option value="online">온라인</option>
              <option value="offline">오프라인</option>
              <option value="maintenance">정비중</option>
              <option value="error">오류</option>
            </select>
          </div>
        </div>

        {/* Pole Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPoles.map((pole) => (
            <Card key={pole.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{pole.name}</CardTitle>
                    <p className="text-sm text-gray-600">{pole.serialNumber}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(pole.status)}`}>
                    {getStatusIcon(pole.status)}
                    {getStatusText(pole.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Pole Image Placeholder */}
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">MEDIPOLE 이미지</p>
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-3">
                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {pole.location.room}
                      {pole.location.bedNumber && ` - ${pole.location.bedNumber}번 침대`}
                    </span>
                  </div>

                  {/* Battery */}
                  <div className="flex items-center gap-2">
                    <Battery className={`w-4 h-4 ${getBatteryColor(pole.batteryLevel)}`} />
                    <span className="text-sm">
                      배터리: <span className={getBatteryColor(pole.batteryLevel)}>{pole.batteryLevel}%</span>
                    </span>
                  </div>

                  {/* Connectivity */}
                  <div className="flex items-center gap-2">
                    {pole.connectivity.wifi ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {pole.connectivity.wifi ? `WiFi: ${pole.connectivity.signalStrength}%` : 'WiFi 연결 안됨'}
                    </span>
                  </div>

                  {/* Patient Assignment */}
                  {pole.currentPatient && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">사용 중</p>
                      <p className="text-sm text-blue-700">환자: {pole.currentPatient.name}</p>
                    </div>
                  )}

                  {/* Last Seen */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">
                      마지막 접속: {pole.lastSeen.toLocaleString('ko-KR')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      상세보기
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPoles.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManagement;
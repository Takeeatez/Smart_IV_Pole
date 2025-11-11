import React, { useState, useEffect } from 'react';
import {
  Activity,
  Battery,
  Wifi,
  WifiOff,
  Settings,
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

  // 백엔드에서 실제 폴대 데이터 가져오기
  useEffect(() => {
    const fetchPoles = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8081/api/v1/poles');

        if (response.ok) {
          const backendPoles = await response.json();

          // 백엔드 데이터를 프론트엔드 형식으로 변환
          const convertedPoles: PoleDevice[] = backendPoles.map((pole: any) => ({
            id: pole.poleId,
            serialNumber: pole.poleId, // 시리얼 번호는 poleId 사용
            name: `폴대 ${pole.poleId}`,
            status: pole.isOnline ? 'online' : 'offline',
            batteryLevel: pole.batteryLevel || 0,
            location: {
              room: pole.patientId ? '병실' : '대기중',
              bedNumber: pole.patientId ? undefined : undefined
            },
            lastSeen: pole.lastPingAt ? new Date(pole.lastPingAt) : new Date(),
            firmwareVersion: '2.1.3', // 고정값 (추후 백엔드에서 제공)
            isAssigned: !!pole.patientId,
            currentPatient: pole.patientId ? {
              id: pole.patientId.toString(),
              name: '환자' // 실제로는 환자 정보 조인 필요
            } : undefined,
            hardware: {
              model: 'ESP8266',
              year: 2024
            },
            connectivity: {
              wifi: pole.isOnline,
              signalStrength: pole.isOnline ? 85 : 0 // 추후 실제 신호 세기 추가
            },
            maintenance: {
              lastCheck: new Date(),
              nextCheck: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90일 후
            }
          }));

          setPoles(convertedPoles);
          console.log('✅ 폴대 목록 로드 완료:', convertedPoles.length, '개');
        } else {
          console.error('❌ 폴대 목록 로드 실패:', response.statusText);
          setPoles([]);
        }
      } catch (error) {
        console.error('❌ 폴대 목록 로드 중 오류:', error);
        setPoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPoles();

    // 30초마다 자동 새로고침
    const interval = setInterval(fetchPoles, 30000);
    return () => clearInterval(interval);
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">IV 폴대 관리</h1>
            <p className="text-gray-600 mt-1">
              실시간 폴대 상태 모니터링 (ESP8266 자동 등록)
            </p>
            <p className="text-sm text-gray-500 mt-1">
              💡 폴대가 핑을 보내면 자동으로 등록됩니다
            </p>
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
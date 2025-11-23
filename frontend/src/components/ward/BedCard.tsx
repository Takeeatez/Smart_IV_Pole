import React from 'react';
import { BedInfo, StatusColor } from '../../types';
import { Battery, Droplet, Clock, AlertTriangle, Phone, Plus, User, Activity } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BedCardProps {
  bed: BedInfo;
  onClick: () => void;
}

const BedCard: React.FC<BedCardProps> = ({ bed, onClick }) => {
  const getStatusColor = (): StatusColor => {
    if (!bed.poleData || bed.poleData.status === 'offline') return 'offline';
    if (bed.poleData.status === 'error') return 'critical';
    if (bed.poleData.percentage < 10) return 'critical';
    if (bed.poleData.percentage <= 30) return 'warning';
    return 'normal';
  };

  const getStatusColorClass = (status: StatusColor) => {
    switch (status) {
      case 'normal':
        return 'border-green-200 bg-green-50 hover:shadow-lg';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 hover:shadow-lg';
      case 'critical':
        return 'border-red-200 bg-red-50 hover:shadow-lg animate-pulse';
      case 'offline':
        return 'border-gray-200 bg-gray-50 hover:shadow-md';
      default:
        return 'border-gray-200 bg-white hover:shadow-md';
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes <= 0) return '완료';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${Math.round(minutes)}분`;
  };

  const status = getStatusColor();
  const isOccupied = bed.status === 'occupied' && bed.patient;

  // 디버깅: 퍼센트 값 확인
  if (isOccupied && bed.poleData) {
    console.log(`🔍 [BedCard ${bed.bedNumber}] Percentage: ${bed.poleData.percentage}%, CurrentVolume: ${bed.poleData.currentVolume}mL, Capacity: ${bed.poleData.capacity}mL`);
  }

  if (!isOccupied) {
    return (
      <div
        onClick={onClick}
        className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer h-64 flex flex-col items-center justify-center group"
      >
        <div className="text-gray-600 text-lg font-medium mb-2">{bed.bedNumber}</div>
        <div className="text-gray-500 text-sm mb-4">비어있음</div>
        <div className="mt-2 w-14 h-14 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
          <Plus className="w-7 h-7 text-gray-600 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="mt-4 text-center">
          <div className="text-blue-600 text-sm font-medium group-hover:text-blue-700">환자 등록</div>
          <div className="text-gray-600 text-xs mt-1">클릭하여 새 환자 추가</div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 h-64 flex flex-col',
        getStatusColorClass(status),
        status === 'critical' && 'shadow-floating'
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-base font-bold text-gray-900">{bed.bedNumber}</div>
          <div className="text-sm font-medium text-gray-700">{bed.patient?.name}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Alert Indicators */}
          {bed.poleData?.isButtonPressed && (
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Phone className="w-3 h-3 text-white" />
            </div>
          )}
          {status === 'critical' && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          )}
          {bed.poleData?.status === 'offline' && (
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          )}
        </div>
      </div>

      {/* IV Status */}
      <div className="flex-1">
        {bed.poleData ? (
          <>
            {/* IV Fluid Level */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Droplet className={`w-4 h-4 ${
                    status === 'normal' ? 'text-green-600' :
                    status === 'warning' ? 'text-orange-600' :
                    status === 'critical' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">수액량</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {Math.round(bed.poleData.percentage)}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(bed.poleData.percentage, 2)}%`,
                    backgroundColor: status === 'normal' ? '#4CAF50' :
                                   status === 'warning' ? '#FFC107' :
                                   status === 'critical' ? '#F44336' :
                                   '#9CA3AF'
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{Math.round(bed.poleData.currentVolume)}ml</span>
                <span>{bed.poleData.capacity}ml</span>
              </div>
            </div>

            {/* Flow Rate - 투여 속도 (측정값 vs 처방값) */}
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">투여속도</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-gray-800">
                    {bed.poleData.flowRate ? bed.poleData.flowRate.toFixed(1) : '-'} mL/min
                  </span>
                  {bed.poleData.prescribedRate && (
                    <span className="text-xs text-gray-500">
                      / {bed.poleData.prescribedRate.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">예상시간</span>
                </div>
                <span className={`text-xs font-medium ${
                  bed.poleData.estimatedTime < 30 ? 'text-red-600' :
                  bed.poleData.estimatedTime < 60 ? 'text-orange-600' : 'text-gray-800'
                }`}>
                  {formatTime(bed.poleData.estimatedTime)}
                </span>
              </div>
            </div>

            {/* Battery */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Battery className={`w-3 h-3 ${
                  bed.poleData.battery > 30 ? 'text-green-500' :
                  bed.poleData.battery > 15 ? 'text-orange-500' : 'text-red-500'
                }`} />
                <span className="text-xs text-gray-600">배터리</span>
              </div>
              <span className="text-xs font-medium text-gray-800">
                {Math.round(bed.poleData.battery)}%
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <span className="text-sm">데이터 없음</span>
          </div>
        )}
      </div>

      {/* Bottom Status */}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600 truncate">담당: {bed.patient?.nurseName}</span>
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0
            ${status === 'normal' ? 'bg-green-100 text-green-700' :
              status === 'warning' ? 'bg-orange-100 text-orange-700' :
              status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
          `}>
            {status === 'normal' ? '정상' :
             status === 'warning' ? '주의' :
             status === 'critical' ? '응급' : '오프라인'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedCard;
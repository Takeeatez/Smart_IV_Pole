import React from 'react';
import { BedInfo, StatusColor } from '../../types';
import { Battery, Droplet, Clock, AlertTriangle, Phone } from 'lucide-react';

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
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'warning':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      case 'critical':
        return 'border-red-200 bg-red-50 hover:bg-red-100 animate-pulse';
      case 'offline':
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
      default:
        return 'border-gray-200 bg-white hover:bg-gray-50';
    }
  };

  const getGaugeColor = (status: StatusColor) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500';
      case 'warning':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
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

  const status = getStatusColor();
  const isOccupied = bed.status === 'occupied' && bed.patient;

  if (!isOccupied) {
    return (
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors cursor-pointer h-64 flex flex-col items-center justify-center">
        <div className="text-gray-400 text-lg font-medium mb-2">{bed.bedNumber}</div>
        <div className="text-gray-500 text-sm">비어있음</div>
        <div className="mt-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-400 text-2xl">🛏️</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 h-64 flex flex-col
        ${getStatusColorClass(status)}
        ${status === 'critical' ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-lg font-bold text-gray-900">{bed.bedNumber}</div>
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
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplet className={`w-4 h-4 ${
                    status === 'normal' ? 'text-green-600' :
                    status === 'warning' ? 'text-orange-600' :
                    status === 'critical' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">수액량</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {bed.poleData.percentage.toFixed(0)}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getGaugeColor(status)}`}
                  style={{ width: `${Math.max(bed.poleData.percentage, 2)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{bed.poleData.currentVolume.toFixed(0)}ml</span>
                <span>{bed.poleData.capacity}ml</span>
              </div>
            </div>

            {/* Flow Rate */}
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">유량</span>
                <span className="text-xs font-medium text-gray-800">
                  {bed.poleData.flowRate.toFixed(0)} mL/h
                </span>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="mb-3">
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
                {bed.poleData.battery}%
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
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">담당: {bed.patient?.nurseName}</span>
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
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
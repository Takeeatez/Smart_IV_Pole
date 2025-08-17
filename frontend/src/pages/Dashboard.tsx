import { Droplets, Activity, Thermometer, FileText, Download } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Top Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* IV Status */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-cyan-50 rounded-2xl mb-4">
            <Droplets className="h-8 w-8 text-cyan-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">IV 현황</h3>
          <p className="text-3xl font-bold text-gray-900 mb-3">12/8</p>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">정상 범위보다 높음</span>
          </div>
        </div>

        {/* Alert Status */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-cyan-50 rounded-2xl mb-4">
            <Activity className="h-8 w-8 text-cyan-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">유속 모니터링</h3>
          <p className="text-3xl font-bold text-gray-900 mb-3">78 mL/h</p>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">정상 범위보다 낮음</span>
          </div>
        </div>

        {/* Fluid Level */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-center w-16 h-16 bg-cyan-50 rounded-2xl mb-4">
            <Thermometer className="h-8 w-8 text-cyan-500" />
          </div>
          <h3 className="text-gray-600 text-sm font-medium mb-1">수액 잔량</h3>
          <p className="text-3xl font-bold text-gray-900 mb-3">78-92%</p>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">정상 범위보다 높음</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IV 모니터링 Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">IV 모니터링</h3>
            <span className="text-sm text-gray-500">마지막 업데이트 2024년 8월 17일</span>
          </div>
          
          {/* Chart Area with gradient */}
          <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 h-64 mb-6">
            {/* Chart line simulation */}
            <div className="absolute bottom-8 left-8 right-8">
              <svg viewBox="0 0 400 100" className="w-full h-20">
                <path 
                  d="M0,80 Q100,40 200,45 T400,30" 
                  stroke="#22d3ee" 
                  strokeWidth="3" 
                  fill="none"
                  className="drop-shadow-sm"
                />
                <circle cx="320" cy="35" r="4" fill="#22d3ee" className="drop-shadow-sm" />
              </svg>
            </div>
            
            {/* Chart content */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-lg font-semibold text-cyan-700">13% 평균 잔량</p>
              <p className="text-sm text-cyan-600">활성 IV 폴대에서</p>
            </div>
            
            {/* Y-axis labels */}
            <div className="absolute left-2 top-4 text-xs text-gray-400 space-y-6">
              <div>40%</div>
              <div>30%</div>
              <div>20%</div>
              <div>10%</div>
              <div>0</div>
            </div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-2 left-8 right-8 flex justify-between text-xs text-gray-400">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
            </div>
          </div>

          {/* Blood Pressure Section */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">유속 변화</h4>
            <div className="flex items-end space-x-2 mb-4">
              {[
                { height: 24, color: 'bg-cyan-400' },
                { height: 32, color: 'bg-cyan-400' },
                { height: 40, color: 'bg-cyan-400' },
                { height: 48, color: 'bg-cyan-400' },
                { height: 56, color: 'bg-cyan-400' },
                { height: 44, color: 'bg-red-400' },
                { height: 52, color: 'bg-red-400' },
                { height: 36, color: 'bg-red-400' }
              ].map((bar, index) => (
                <div 
                  key={index}
                  className={`w-6 rounded-t ${bar.color}`}
                  style={{ height: `${bar.height}px` }}
                />
              ))}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">100 mL/h</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">정상 범위보다 높음</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-cyan-100">
              <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">이</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">이간호사</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-4 h-4 text-cyan-500">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">병동</p>
                <p className="text-sm font-medium text-gray-900">3A 병동</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-4 h-4 text-cyan-500">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">근무시간</p>
                <p className="text-sm font-medium text-gray-900">주간</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-4 h-4 text-cyan-500">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A3,3 0 0,1 15,5V7A3,3 0 0,1 12,10A3,3 0 0,1 9,7V5A3,3 0 0,1 12,2Z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">키</p>
                <p className="text-sm font-medium text-gray-900">173 cm</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-4 h-4 text-cyan-500">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,3A4,4 0 0,1 16,7A4,4 0 0,1 12,11A4,4 0 0,1 8,7A4,4 0 0,1 12,3Z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">담당환자</p>
                <p className="text-sm font-medium text-gray-900">12명</p>
              </div>
            </div>
            
            <button className="w-full mt-6 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              모든 정보 보기
            </button>
          </div>

          {/* Appointment History */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">이벤트 히스토리</h3>
              <span className="text-sm text-cyan-500 font-medium">전체 보기 ›</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">수액 교체</p>
                    <p className="text-xs text-gray-500">8월 17일 - 9:30 am</p>
                  </div>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">유속 조정</p>
                    <p className="text-xs text-gray-500">8월 12일 - 03:00 pm</p>
                  </div>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">환자 상담</p>
                    <p className="text-xs text-gray-500">8월 10일 - 8:50 am</p>
                  </div>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">화상 상담</p>
                    <p className="text-xs text-gray-500">8월 08일 - 2:30 pm</p>
                  </div>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Diagnosis */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">환자 진단 정보</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 py-2 text-sm text-gray-500 border-b border-gray-100">
              <span>코드</span>
              <span>진단명</span>
              <span>진단일</span>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3 text-sm">
              <span className="font-medium text-gray-900">D40.8</span>
              <span className="text-gray-900">당뇨병</span>
              <span className="text-gray-600">04-10-2021</span>
            </div>
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              <span className="font-medium">치료:</span> 인슐린 펌프
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">문서</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">IV 상태 리포트.pdf</p>
                  <p className="text-xs text-gray-500">1 MB</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">유속 모니터링.pdf</p>
                  <p className="text-xs text-gray-500">1 MB</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
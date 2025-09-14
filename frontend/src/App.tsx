import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WardOverview from './components/ward/WardOverview'
import PatientDetail from './pages/PatientDetail'
import PatientList from './pages/PatientList'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import { useWardStore } from './stores/wardStore'
import { useMQTT } from './hooks/useMQTT'

function App() {
  const { checkConnection, loadStoredData, isServerConnected } = useWardStore()
  const [isInitialized, setIsInitialized] = useState(false)
  
  useMQTT() // Initialize MQTT connection (currently mock)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. 먼저 저장된 데이터가 있는지 확인하고 로드
        const hasStoredData = loadStoredData()
        
        // 2. 백엔드 서버 연결 확인 및 데이터 동기화
        await checkConnection()
        
        // 3. 초기화 완료
        setIsInitialized(true)
        
        console.log('App initialized:', { 
          hasStoredData, 
          isServerConnected: isServerConnected 
        })
      } catch (error) {
        console.error('App initialization failed:', error)
        // 에러가 발생해도 저장된 데이터나 목업 데이터로 앱 실행
        setIsInitialized(true)
      }
    }

    initializeApp()
  }, [checkConnection, loadStoredData, isServerConnected])

  // 초기화 중일 때는 로딩 화면 표시 (선택사항)
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">IV</span>
          </div>
          <div className="text-xl font-semibold text-gray-900 mb-2">Smart IV Pole</div>
          <div className="text-gray-600">데이터 로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WardOverview />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patient/:id" element={<PatientDetail />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
}

export default App

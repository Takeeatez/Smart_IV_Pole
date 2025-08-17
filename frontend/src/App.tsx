import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WardOverview from './components/ward/WardOverview'
import PatientDetail from './pages/PatientDetail'
import PatientList from './pages/PatientList'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WardOverview />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patient/:id" element={<PatientDetail />} />
      </Routes>
    </Router>
  )
}

export default App

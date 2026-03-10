import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import EmployeeEnterId from './pages/EmployeeEnterId'
import EmployeeDashboard from './pages/EmployeeDashboard'
import AgentEnterId from './pages/AgentEnterId'
import AgentDashboard from './pages/AgentDashboard'
import AdminPasscode from './pages/AdminPasscode'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/employee" element={<EmployeeEnterId />} />
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/agent" element={<AgentEnterId />} />
      <Route path="/agent/dashboard" element={<AgentDashboard />} />
      <Route path="/admin" element={<AdminPasscode />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

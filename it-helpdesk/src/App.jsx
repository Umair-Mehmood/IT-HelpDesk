import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import HowToUsePage from './pages/HowToUsePage'
import SheetNinjaPage from './pages/SheetNinjaPage'
import VibeCodePromptPage from './pages/VibeCodePromptPage'
import EmployeeEnterId from './pages/EmployeeEnterId'
import EmployeeDashboard from './pages/EmployeeDashboard'
import AgentEnterId from './pages/AgentEnterId'
import AgentDashboard from './pages/AgentDashboard'
import AdminPasscode from './pages/AdminPasscode'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-to-use" element={<HowToUsePage />} />
        <Route path="/workflow" element={<AboutPage />} />
        <Route path="/about" element={<Navigate to="/workflow" replace />} />
        <Route path="/sheet-ninja" element={<SheetNinjaPage />} />
        <Route path="/vibe-code-prompt" element={<VibeCodePromptPage />} />
        <Route path="/employee" element={<EmployeeEnterId />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/agent" element={<AgentEnterId />} />
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/admin" element={<AdminPasscode />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientProfile from './pages/PatientProfile'
import PublicQR from './pages/PublicQR'
import NewConsult from './pages/NewConsult'
import NewPatient from './pages/NewPatient'
import Reports from './pages/Reports'
import Records from './pages/Records'
import Schedule from './pages/Schedule'
import Consultas from './pages/Consultas'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Landing from './pages/Landing'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/public/:qrToken" element={<PublicQR />} />

      {/* Protected routes with layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<NewPatient />} />
          <Route path="/patients/:id" element={<PatientProfile />} />
          <Route path="/patients/:id/consult" element={<NewConsult />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/records" element={<Records />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

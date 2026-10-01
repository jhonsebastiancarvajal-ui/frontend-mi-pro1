import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardHoy } from './views/DashboardHoy'
import { DashboardAyer } from './views/DashboardAyer'
import { DashboardEvento } from './views/DashboardEvento'
import { CrearEventoView } from './views/CrearEventoView'
import { LoginView } from './views/auth/LoginView'
import { RegisterView } from './views/auth/RegisterView'

import { DashboardProximos } from './views/DashboardProximos'
import { DashboardCompletados } from './views/DashboardCompletados'

// Forzar actualización de Vite
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes (No Navbar) */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/registro" element={<RegisterView />} />

      {/* Main Layout Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        {/* Redirect root to /hoy */}
        <Route index element={<Navigate to="/hoy" replace />} />
        
        {/* Endpoints for different days */}
        <Route path="hoy" element={<DashboardHoy />} />
        <Route path="ayer" element={<DashboardAyer />} />
        <Route path="proximos" element={<DashboardProximos />} />
        <Route path="completados" element={<DashboardCompletados />} />
        <Route path="evento/:id" element={<DashboardEvento />} />
        <Route path="crear" element={<CrearEventoView />} />
      </Route>
    </Routes>
  )
}

export default App

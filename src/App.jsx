import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardHoy } from './views/DashboardHoy'
import { DashboardAyer } from './views/DashboardAyer'
import { DashboardEvento } from './views/DashboardEvento'
import { CrearEventoView } from './views/CrearEventoView'
import { LoginView } from './views/auth/LoginView'
import { RegisterView } from './views/auth/RegisterView'

// Placeholder for future component
function DashboardProximos() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-outfit text-white mb-2">Próximos Eventos</h2>
        <p className="text-slate-400">Esta sección estará disponible pronto.</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public Routes (No Navbar) */}
      <Route path="/login" element={<LoginView />} />
      <Route path="/registro" element={<RegisterView />} />

      {/* Main Layout Routes */}
      <Route path="/" element={<AppLayout />}>
        {/* Redirect root to /hoy */}
        <Route index element={<Navigate to="/hoy" replace />} />
        
        {/* Endpoints for different days */}
        <Route path="hoy" element={<DashboardHoy />} />
        <Route path="ayer" element={<DashboardAyer />} />
        <Route path="proximos" element={<DashboardProximos />} />
        <Route path="evento/:id" element={<DashboardEvento />} />
        <Route path="crear" element={<CrearEventoView />} />
      </Route>
    </Routes>
  )
}

export default App

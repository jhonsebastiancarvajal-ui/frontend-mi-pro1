import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, CalendarDays, Award, Settings, X, Save } from 'lucide-react';
import { clearApiCache, getCapacity, updateCapacity } from '../../services/api';

export function AppLayout() {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(6);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isSettingsOpen) {
      getCapacity().then(data => setDailyLimit(data.daily_limit_hours || 6)).catch(console.error);
    }
  }, [isSettingsOpen]);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await updateCapacity(dailyLimit);
      setIsSettingsOpen(false);
      alert(`¡Límite diario actualizado exitosamente a ${dailyLimit}h!`);
    } catch (e) {
      alert("Error al guardar límite diario");
    } finally {
      setIsSaving(false);
    }
  };
  const navItems = [
    { name: 'Vencidas', path: '/ayer', icon: History },
    { name: 'Hoy', path: '/hoy', icon: LayoutDashboard },
    { name: 'Próximos', path: '/proximos', icon: CalendarDays },
    { name: 'Completados', path: '/completados', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-white">
              Task<span className="text-primary">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {localStorage.getItem('token') ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/5 rounded-full py-1 pr-3 pl-1 border border-white/10">
                  {localStorage.getItem('user_picture') ? (
                    <img src={localStorage.getItem('user_picture')} alt="Profile" className="w-7 h-7 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30">
                      {localStorage.getItem('user_name') ? localStorage.getItem('user_name').charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-200 hidden sm:block">
                    {localStorage.getItem('user_name')}
                  </span>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors"
                  title="Configuración"
                >
                  <Settings className="w-4 h-4 text-slate-300" />
                </button>
                <button 
                  onClick={() => {
                    clearApiCache();
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_name');
                    localStorage.removeItem('user_picture');
                    navigate('/login');
                  }}
                  className="text-sm font-medium px-4 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-colors border border-red-500/30"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <>
                <NavLink 
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </NavLink>
                <NavLink 
                  to="/registro"
                  className="text-sm font-medium px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
                >
                  Registrarme
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Settings Modal (Sprint 3 - C2) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <button 
              onClick={() => setIsSettingsOpen(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-outfit font-bold text-white">Configuración</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">
                  Límite diario de gestión (horas)
                </label>
                <div className="flex items-center justify-between gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="16" 
                    step="0.5"
                    value={dailyLimit} 
                    onChange={e => setDailyLimit(parseFloat(e.target.value))} 
                    className="flex-1 accent-primary" 
                  />
                  <div className="w-16 bg-white/10 text-center py-1.5 rounded-lg text-white font-medium">
                    {dailyLimit}h
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Te avisaremos si planificas más de {dailyLimit} horas en un solo día. Rango permitido: 1-16h.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
              <button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl h-11 shadow-[0_0_20px_rgba(var(--primary),0.3)] font-medium transition-all"
              >
                {isSaving ? "Guardando..." : <><Save className="w-4 h-4" /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

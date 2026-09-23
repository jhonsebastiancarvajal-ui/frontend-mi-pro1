import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, History, CalendarDays } from 'lucide-react';

export function AppLayout() {
  const navItems = [
    { name: 'Ayer', path: '/ayer', icon: History },
    { name: 'Hoy', path: '/hoy', icon: LayoutDashboard },
    { name: 'Próximos', path: '/proximos', icon: CalendarDays },
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
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

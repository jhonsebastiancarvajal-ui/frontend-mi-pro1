import React from 'react';
import { PlusCircle, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { TaskItem } from '../components/dashboard/TaskItem';

// Mock data
const mockTasks = [
  {
    id: 1,
    title: 'Confirmar catering',
    description: 'Llamar a "Sabores del Mundo" para confirmar el menú vegetariano y las intolerancias.',
    event: 'Boda García-López',
    time: 'Hoy, 10:00 AM',
    status: 'vencida',
  },
  {
    id: 2,
    title: 'Enviar presupuesto a cliente',
    description: 'Revisar y enviar la cotización final para el congreso de tecnología.',
    event: 'Tech Summit 2024',
    time: 'Hoy, 14:00 PM',
    status: 'urgente',
  },
  {
    id: 3,
    title: 'Visita técnica de iluminación',
    description: 'Revisar las instalaciones del salón principal con el equipo de AV.',
    event: 'Gala Anual Corporativa',
    time: 'Hoy, 16:30 PM',
    status: 'urgente',
  },
  {
    id: 4,
    title: 'Revisión de lista de invitados',
    description: 'Actualizar las confirmaciones de asistencia recibidas durante la semana.',
    event: 'Lanzamiento Producto X',
    time: 'Mañana, 09:00 AM',
    status: 'proxima',
  },
  {
    id: 5,
    title: 'Pago a proveedores',
    description: 'Abonar el 50% restante al florista y alquiladora de muebles.',
    event: 'Boda García-López',
    time: 'Viernes, 12:00 PM',
    status: 'proxima',
  }
];

export function DashboardHoy() {
  const navigate = useNavigate();
  
  const overdueTasks = mockTasks.filter(t => t.status === 'vencida');
  const urgentTasks = mockTasks.filter(t => t.status === 'urgente');
  const upcomingTasks = mockTasks.filter(t => t.status === 'proxima');

  return (
    <div className="pb-12">
      {/* Premium Header */}
      <header className="pt-8 pb-4">
        <div className="max-w-5xl mx-auto px-6 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-2">
              Hoy
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/crear')}
            size="lg" 
            className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all hover:scale-105 border-0"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Crear evento
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-6 space-y-10">
        {/* Overdue Tasks (Vencidas) */}
        {overdueTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-outfit font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                Gestiones vencidas
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overdueTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}

        {/* Urgent Tasks (Urgentes) */}
        {urgentTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-outfit font-semibold text-slate-100 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                Urgente para hoy
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Tasks (Próximas) */}
        {upcomingTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-outfit font-semibold text-slate-300">
                Próximas gestiones
              </h2>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}
        
        {mockTasks.length === 0 && (
          <div className="text-center py-24 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-outfit font-semibold text-white">Todo al día</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto">
              No tienes gestiones pendientes para hoy. ¡Disfruta tu día!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

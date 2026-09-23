import React from 'react';
import { CalendarIcon, ArrowRight, History } from 'lucide-react';
import { Button } from '../components/ui/button';
import { TaskItem } from '../components/dashboard/TaskItem';

// Mock data for yesterday
const mockTasksAyer = [
  {
    id: 101,
    title: 'Reunión con cliente principal',
    description: 'Presentación final del diseño del escenario.',
    event: 'Conferencia Anual',
    time: 'Ayer, 09:00 AM',
    status: 'completada',
  },
  {
    id: 102,
    title: 'Firma de contrato de locación',
    description: 'Visita al hotel plaza para firmar el salón de convenciones.',
    event: 'Expo Emprendedores',
    time: 'Ayer, 11:30 AM',
    status: 'completada',
  },
  {
    id: 103,
    title: 'Llamada con equipo de seguridad',
    description: 'Coordinar los accesos VIP y estacionamiento.',
    event: 'Concierto de Verano',
    time: 'Ayer, 16:00 PM',
    status: 'vencida',
  }
];

export function DashboardAyer() {
  const completedTasks = mockTasksAyer.filter(t => t.status === 'completada');
  const missedTasks = mockTasksAyer.filter(t => t.status === 'vencida');

  // Calculate yesterday's date
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  return (
    <div className="pb-12">
      {/* Page Header */}
      <header className="pt-8 pb-4">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl font-outfit font-bold tracking-tight text-white mb-2">
            Ayer
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            {ayer.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-6 space-y-10">
        
        {/* Missed Tasks (Vencidas ayer y no completadas) */}
        {missedTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-outfit font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                Quedaron pendientes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-outfit font-semibold text-slate-300">
                Completadas
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 hover:opacity-100 transition-opacity">
              {completedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { History, AlertCircle, CalendarIcon, ChevronRight, Clock } from 'lucide-react';
import { fetchTareasHoy, actualizarEstadoSubtarea } from '../services/api';
import { TaskItem } from '../components/dashboard/TaskItem';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function DashboardAyer() {
  const [vencidas, setVencidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('tareas'); // 'tareas' | 'eventos'

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTareasHoy();
        // Solo tareas que pasaron la fecha y NO están completadas
        const pendientesVencidas = (data.vencidas || []).filter(t => t.status !== 'DONE').map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          event: task.activity_title,
          time: task.target_date,
          status: 'vencida',
          backendStatus: task.status,
          activity_id: task.activity_id
        }));
        setVencidas(pendientesVencidas);
      } catch (error) {
        console.error('Error cargando tareas vencidas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleTask = async (taskId) => {
    const currentTask = vencidas.find(t => t.id === taskId);
    if (!currentTask) return;

    // Solo podemos pasarlas a completado
    const newStatusBackend = currentTask.backendStatus === 'DONE' ? 'PENDING' : 'DONE';
    
    try {
      await actualizarEstadoSubtarea(taskId, newStatusBackend);
      
      // Si la completó, la removemos de la lista ya que solo debe mostrar pendientes
      if (newStatusBackend === 'DONE') {
        setVencidas(prev => prev.filter(t => t.id !== taskId));
      } else {
        setVencidas(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, backendStatus: newStatusBackend, status: 'vencida' }
            : t
        ));
      }
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  const eventosAgrupados = Object.values(vencidas.reduce((acc, task) => {
    if (!acc[task.activity_id]) {
      acc[task.activity_id] = {
        id: task.activity_id,
        title: task.event,
        tasks: []
      };
    }
    acc[task.activity_id].tasks.push(task);
    return acc;
  }, {}));



  return (
    <div className="pb-12">
      {/* Page Header */}
      <header className="pt-8 pb-4">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-3xl font-outfit font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            Vencidas
          </h1>
          <p className="text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-red-400" />
            Tareas que pasaron su fecha y nunca se hicieron
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-6 space-y-10">
        
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-outfit">Buscando tareas vencidas...</div>
        ) : vencidas.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
            <h3 className="text-xl font-outfit font-semibold text-white">¡Todo al día!</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto">
              No tienes ninguna tarea vencida ni pendiente del pasado. ¡Excelente trabajo!
            </p>
          </div>
        ) : (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-outfit font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                Tareas Vencidas (Pendientes)
              </h2>

              {/* View Toggle */}
              <div className="flex bg-white/5 p-1 rounded-full border border-white/5 max-w-fit">
                <button 
                  onClick={() => setViewMode('tareas')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", viewMode === 'tareas' ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-slate-400 hover:text-white")}
                >
                  Por Subtareas
                </button>
                <button 
                  onClick={() => setViewMode('eventos')}
                  className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", viewMode === 'eventos' ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-slate-400 hover:text-white")}
                >
                  Por Eventos
                </button>
              </div>
            </div>

            {viewMode === 'tareas' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vencidas.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={() => handleToggleTask(task.id)} 
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {eventosAgrupados.map(evento => (
                  <Card key={evento.id} className="overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="absolute left-0 top-0 h-full w-[4px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    <CardContent className="p-6 pl-8">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 font-medium px-2.5 py-0.5 rounded-full mb-2 flex items-center max-w-fit gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Evento Atrasado
                              </Badge>
                              <h2 className="text-2xl font-outfit font-bold text-white mb-2">
                                {evento.title}
                              </h2>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="text-red-400 font-medium">{evento.tasks.length} {evento.tasks.length === 1 ? 'subtarea pendiente' : 'subtareas pendientes'}</span>
                              </div>
                            </div>
                            <Link 
                              to={`/evento/${evento.id}`}
                              className="flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-full transition-colors flex-shrink-0 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            >
                              Ver Detalles <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>

                          <div className="mt-6 space-y-3 bg-black/20 p-5 rounded-2xl border border-white/5">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Subtareas Pendientes</h3>
                            {evento.tasks.map(task => (
                              <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                <div 
                                  onClick={() => handleToggleTask(task.id)}
                                  className="w-5 h-5 rounded-full border border-red-500/50 mt-0.5 cursor-pointer hover:bg-red-500/20 flex-shrink-0 transition-colors"
                                />
                                <div className="flex-1">
                                  <h4 className="text-white font-medium">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-red-400/80 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                                  <Clock className="w-3.5 h-3.5" />
                                  {task.time}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

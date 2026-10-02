import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar as CalendarIcon, ArrowRight, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { TaskItem } from '../components/dashboard/TaskItem';
import { EventItem } from '../components/dashboard/EventItem';
import { fetchTareasHoy, actualizarEstadoSubtarea, fetchAllEventos } from '../services/api';
import { cn } from '../lib/utils';

export function DashboardHoy() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ vencidas: [], para_hoy: [], proximas: [] });
  const [eventos, setEventos] = useState([]);
  const [rule, setRule] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isPopupRendered, setIsPopupRendered] = useState(false);
  const [showAllProximas, setShowAllProximas] = useState(false);
  const [showAllParaHoy, setShowAllParaHoy] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, eventosData] = await Promise.all([
        fetchTareasHoy(),
        fetchAllEventos()
      ]);
      
      const mapTask = (task, uiStatus) => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        event: task.activity_title,
        time: task.target_date,
        status: task.status === 'DONE' ? 'completada' : uiStatus,
        backendStatus: task.status,
        activity_id: task.activity_id
      });

      setTasks({
        vencidas: (data.vencidas || []).map(t => mapTask(t, 'vencida')),
        para_hoy: (data.para_hoy || []).map(t => mapTask(t, 'urgente')),
        proximas: (data.proximas || []).map(t => mapTask(t, 'proxima'))
      });
      setRule(data.rule || '');

      const evts = eventosData?.results || (Array.isArray(eventosData) ? eventosData : []);
      const todayDate = new Date();
      const todayStr = todayDate.getFullYear() + '-' + String(todayDate.getMonth() + 1).padStart(2, '0') + '-' + String(todayDate.getDate()).padStart(2, '0');
      
      const eventosHoy = evts.filter(e => e.due_date === todayStr);
      setEventos(eventosHoy);

    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar las tareas y eventos de hoy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Controlar la ventana emergente de vencidas
  useEffect(() => {
    if (tasks.vencidas.length === 0) {
      setIsPopupVisible(false);
      return;
    }

    let hideTimeout;
    let showInterval;

    const showAndScheduleHide = () => {
      setIsPopupRendered(true);
      // Pequeño delay para asegurar que el DOM se haya actualizado antes de animar
      setTimeout(() => setIsPopupVisible(true), 10);
      
      hideTimeout = setTimeout(() => {
        setIsPopupVisible(false);
      }, 6000);
    };

    // Mostrar inicialmente
    showAndScheduleHide();

    // Repetir cada 8 minutos (480000 ms)
    showInterval = setInterval(() => {
      showAndScheduleHide();
    }, 8 * 60 * 1000);

    return () => {
      clearTimeout(hideTimeout);
      clearInterval(showInterval);
    };
  }, [tasks.vencidas.length]);

  // Manejar el desmontaje del DOM después del fade out (500ms es la duración de la transición)
  useEffect(() => {
    if (!isPopupVisible) {
      const timeout = setTimeout(() => setIsPopupRendered(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isPopupVisible]);

  const handleToggleTask = async (taskId) => {
    let currentTask = null;
    let listName = '';
    for (const key of ['vencidas', 'para_hoy', 'proximas']) {
      const found = tasks[key].find(t => t.id === taskId);
      if (found) {
        currentTask = found;
        listName = key;
        break;
      }
    }
    
    if (!currentTask) return;

    const newStatusBackend = currentTask.backendStatus === 'DONE' ? 'PENDING' : 'DONE';
    const newUiStatus = newStatusBackend === 'DONE' ? 'completada' : 
                        listName === 'vencidas' ? 'vencida' : 
                        listName === 'para_hoy' ? 'urgente' : 'proxima';

    try {
      await actualizarEstadoSubtarea(taskId, newStatusBackend);
      
      setTasks(prev => ({
        ...prev,
        [listName]: prev[listName].map(t => 
          t.id === taskId 
            ? { ...t, backendStatus: newStatusBackend, status: newUiStatus }
            : t
        )
      }));
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  const hasAnyMainTask = tasks.para_hoy.length > 0 || tasks.proximas.length > 0 || eventos.length > 0;

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

      <main className="max-w-5xl mx-auto px-6 pt-2 space-y-8">
        
        {/* REGLA DE PRIORIDAD (C3) */}
        {rule && (
          <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-primary font-semibold text-sm">Prioridad Recomendada</h3>
              <p className="text-primary/80 text-sm mt-1">{rule}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4 opacity-80" />
            <p className="font-outfit animate-pulse">Cargando tus gestiones para hoy...</p>
          </div>
        ) : error ? (
          // ESTADO DE ERROR (C4)
          <div className="text-center py-24 rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-outfit font-semibold text-white mb-2">Ups, algo salió mal</h3>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button onClick={loadData} variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-full px-6">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        ) : hasAnyMainTask ? (
          <>

            {/* Urgent Tasks (Urgentes) */}
            {tasks.para_hoy.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-outfit font-semibold text-slate-100 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                    Urgente para hoy
                  </h2>
                  {tasks.para_hoy.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-white"
                      onClick={() => setShowAllParaHoy(!showAllParaHoy)}
                    >
                      {showAllParaHoy ? 'Ver menos' : 'Ver todas'} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(showAllParaHoy ? tasks.para_hoy : tasks.para_hoy.slice(0, 2)).map(task => (
                    <TaskItem key={task.id} task={task} onToggleComplete={handleToggleTask} />
                  ))}
                </div>
              </section>
            )}

            {/* Eventos para hoy */}
            {eventos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-outfit font-semibold text-slate-100 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                    Eventos de hoy
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventos.map(evento => (
                    <EventItem key={evento.id} evento={evento} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Tasks (Próximas) */}
            {tasks.proximas.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-outfit font-semibold text-slate-300">
                    Próximas gestiones
                  </h2>
                  {tasks.proximas.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-slate-400 hover:text-white"
                      onClick={() => setShowAllProximas(!showAllProximas)}
                    >
                      {showAllProximas ? 'Ver menos' : 'Ver todas'} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {(showAllProximas ? tasks.proximas : tasks.proximas.slice(0, 3)).map(task => (
                    <TaskItem key={task.id} task={task} onToggleComplete={handleToggleTask} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          // ESTADO VACÍO (C4)
          <div className="text-center py-24 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-outfit font-semibold text-white">Todo al día</h3>
            <p className="text-slate-400 mt-2 mb-6 max-w-sm mx-auto">
              No tienes gestiones pendientes para hoy. ¡Disfruta tu día o planifica algo nuevo!
            </p>
            <Button 
              onClick={() => navigate('/crear')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105 transition-all"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Crear evento
            </Button>
          </div>
        )}
      </main>

      {/* Mini Ventana Emergente para Tareas Vencidas */}
      {isPopupRendered && !loading && !error && (
        <div 
          className={cn(
            "fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out",
            isPopupVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          <div className="relative bg-[#1a1423]/95 border border-red-500/30 backdrop-blur-xl p-5 rounded-2xl shadow-[0_15px_40px_rgba(239,68,68,0.25)] flex items-start gap-4 max-w-sm">
            {/* Botón Cerrar */}
            <button 
              onClick={() => setIsPopupVisible(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-red-500/20 p-2.5 rounded-full mt-0.5">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="pr-4">
              <h4 className="text-white font-outfit font-bold text-base">
                Tienes {tasks.vencidas.length > 9 ? '+9' : tasks.vencidas.length} {tasks.vencidas.length === 1 ? 'tarea atrasada' : 'tareas atrasadas'}
              </h4>
              <p className="text-slate-400 text-sm mt-1 leading-snug">
                Algunas tareas pendientes ya pasaron su fecha. ¡Revisa qué faltó!
              </p>
              <Button 
                onClick={() => navigate('/ayer')}
                size="sm"
                className="mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs h-8 px-4 transition-colors font-medium"
              >
                Ver vencidas
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

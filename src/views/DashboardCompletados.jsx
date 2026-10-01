import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAllEventos } from '../services/api';
import { cn } from '../lib/utils';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function DashboardCompletados() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventos = async () => {
      try {
        const data = await fetchAllEventos();
        setEventos(data?.results || (Array.isArray(data) ? data : []));
      } catch (error) {
        console.error('Error cargando eventos completados:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEventos();
  }, []);

  // Filter events that have at least one completed task
  const eventosConCompletadas = eventos.filter(e => {
    const doneTasks = (e.subtasks || []).filter(st => st.status === 'DONE');
    return doneTasks.length > 0;
  });

  return (
    <div className="pb-12 relative min-h-screen">
      {/* Background elegant glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="pt-8 pb-4">
        <div className="max-w-5xl mx-auto px-6 flex items-end justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-2 flex items-center gap-3">
              <Award className="w-10 h-10 text-emerald-400" />
              Completados
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Historial de tus tareas y eventos superados
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-6 space-y-10 relative z-10">
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-outfit">Cargando completados...</div>
        ) : eventosConCompletadas.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Award className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-outfit font-semibold text-white">Aún no hay completados</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto">
              Las tareas que completes aparecerán aquí agrupadas por evento. ¡Ve y completa algunas!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {eventosConCompletadas.map(evento => {
              const doneTasks = (evento.subtasks || []).filter(st => st.status === 'DONE');
              const isEventFullyCompleted = evento.subtasks_total > 0 && evento.subtasks_done === evento.subtasks_total;
              
              return (
                <Card key={evento.id} className={cn(
                  "overflow-hidden transition-all duration-300",
                  "border border-white/10 backdrop-blur-md",
                  isEventFullyCompleted ? "bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30" : "bg-white/5 hover:bg-white/10 hover:border-white/20"
                )}>
                  {/* Accent Line */}
                  <div className={cn(
                    "absolute left-0 top-0 h-full w-[4px]",
                    isEventFullyCompleted ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]" : "bg-primary/50"
                  )} />
                  
                  <CardContent className="p-6 pl-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              {isEventFullyCompleted && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                  <Award className="w-3.5 h-3.5" />
                                  Evento Completado
                                </Badge>
                              )}
                              {!isEventFullyCompleted && (
                                <Badge className="bg-primary/20 text-primary border border-primary/30 font-medium px-2.5 py-0.5 rounded-full">
                                  Evento en progreso
                                </Badge>
                              )}
                            </div>
                            <h2 className="text-2xl font-outfit font-bold text-white mb-2">
                              {evento.title}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {evento.due_date}</span>
                              <span className="text-emerald-400 font-medium">{doneTasks.length} {doneTasks.length === 1 ? 'tarea completada' : 'tareas completadas'}</span>
                            </div>
                          </div>
                          <Link 
                            to={`/evento/${evento.id}`}
                            className={cn(
                              "flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-full transition-colors flex-shrink-0",
                              isEventFullyCompleted ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-primary/10 text-primary hover:bg-primary/20"
                            )}
                          >
                            Ver Detalles <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>

                        {/* List of completed tasks for this event */}
                        <div className="mt-6 space-y-3 bg-black/20 p-5 rounded-2xl border border-white/5">
                          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Tareas Realizadas</h3>
                          {doneTasks.map(task => (
                            <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-white font-medium line-through decoration-emerald-500/50 text-slate-300">{task.title}</h4>
                                {task.description && (
                                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                                <Clock className="w-3.5 h-3.5" />
                                {task.target_date}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

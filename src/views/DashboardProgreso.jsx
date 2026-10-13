import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  RefreshCw, 
  Search, 
  TrendingUp, 
  PlusCircle,
  FileCheck2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { fetchAllEventos } from '../services/api';
import { cn } from '../lib/utils';

export function DashboardProgreso() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('todos'); // 'todos' | 'en_curso' | 'completados'

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllEventos();
      const list = data?.results || (Array.isArray(data) ? data : []);
      setEventos(list);
    } catch (err) {
      console.error('Error cargando progreso de eventos:', err);
      setError('No se pudo cargar el progreso de los eventos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Métricas agregadas de todos los eventos
  const totalEventos = eventos.length;
  const totalGestiones = eventos.reduce((acc, e) => acc + (e.subtasks_total || 0), 0);
  const totalEjecutadas = eventos.reduce((acc, e) => acc + (e.subtasks_done || 0), 0);
  const totalPospuestas = eventos.reduce((acc, e) => acc + (e.subtasks_postponed || 0), 0);
  const totalPendientes = eventos.reduce((acc, e) => acc + (e.subtasks_pending || (e.subtasks_total || 0) - (e.subtasks_done || 0)), 0);
  const progresoGlobal = totalGestiones > 0 ? Math.round((totalEjecutadas / totalGestiones) * 100) : 0;

  // Filtrado de eventos
  const eventosFiltrados = eventos.filter(evento => {
    const matchesSearch = evento.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (evento.course && evento.course.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const percent = evento.progress_percent || 0;
    if (filterType === 'completados') {
      return matchesSearch && percent === 100 && (evento.subtasks_total || 0) > 0;
    }
    if (filterType === 'en_curso') {
      return matchesSearch && percent < 100;
    }
    return matchesSearch;
  });

  return (
    <div className="pb-16 min-h-screen">
      {/* Header */}
      <header className="pt-8 pb-6 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Panel de Avance Logístico
              </span>
            </div>
            <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-2">
              Progreso de Eventos
            </h1>
            <p className="text-slate-400 text-sm">
              Monitoreo y cálculo en tiempo real de gestiones ejecutadas por evento
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={loadData}
              disabled={loading}
              className="rounded-full border-white/10 text-slate-300 hover:text-white bg-white/5"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
              Actualizar
            </Button>
            <Button 
              onClick={() => navigate('/crear')}
              className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-8">
        
        {/* KPI Cards de Métricas Globales (C2) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Avance Global</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-outfit font-bold text-emerald-400">{progresoGlobal}%</span>
              <span className="text-xs text-slate-400">completado</span>
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mt-3">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${progresoGlobal}%` }} 
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Total Gestiones</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-outfit font-bold text-white">{totalGestiones}</span>
              <span className="text-xs text-slate-400">en {totalEventos} eventos</span>
            </div>
            <p className="text-xs text-primary/80 mt-3 flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5" /> Planificadas
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Ejecutadas (Hechas)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-outfit font-bold text-emerald-400">{totalEjecutadas}</span>
              <span className="text-xs text-slate-400">de {totalGestiones}</span>
            </div>
            <p className="text-xs text-emerald-400/80 mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Gestiones listas
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Pospuestas con Nota</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-outfit font-bold text-amber-400">{totalPospuestas}</span>
              <span className="text-xs text-slate-400">gestiones</span>
            </div>
            <p className="text-xs text-amber-400/80 mt-3 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> En espera o reagendadas
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por evento o curso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('todos')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filterType === 'todos' ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              )}
            >
              Todos ({eventos.length})
            </button>
            <button
              onClick={() => setFilterType('en_curso')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filterType === 'en_curso' ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              )}
            >
              En Curso
            </button>
            <button
              onClick={() => setFilterType('completados')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filterType === 'completados' ? "bg-primary text-white" : "text-slate-400 hover:text-white"
              )}
            >
              100% Completados
            </button>
          </div>
        </div>

        {/* Event List with Real-time Progress Bar */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4 opacity-80" />
            <p className="font-outfit animate-pulse">Calculando progreso de los eventos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 rounded-3xl border border-red-500/20 bg-red-500/5">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-white font-medium mb-4">{error}</p>
            <Button onClick={loadData} variant="outline" className="border-white/10 text-white">
              Reintentar
            </Button>
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
            <CheckCircle2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-outfit font-semibold text-white mb-1">No se encontraron eventos</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              {searchQuery ? "No hay eventos que coincidan con tu búsqueda." : "Aún no tienes eventos registrados en el sistema."}
            </p>
            <Button onClick={() => navigate('/crear')} className="bg-primary text-white rounded-full">
              Crear mi primer evento
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {eventosFiltrados.map((evento) => {
              const total = evento.subtasks_total || 0;
              const done = evento.subtasks_done || 0;
              const postponed = evento.subtasks_postponed || 0;
              const percent = total > 0 ? Math.round((done / total) * 100) : 0;
              const isFinished = percent === 100 && total > 0;

              return (
                <div 
                  key={evento.id}
                  className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-6 backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20 font-medium">
                          {evento.type || 'Evento'}
                        </span>
                        {evento.course && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                            {evento.course}
                          </span>
                        )}
                        {isFinished ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Listo para ejecución
                          </span>
                        ) : percent > 0 ? (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            En preparación
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-white/5">
                            Sin avance
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-outfit font-bold text-white group-hover:text-primary transition-colors">
                        {evento.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 self-start md:self-center">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Fecha: <strong>{evento.due_date}</strong></span>
                      </div>
                      {evento.location && (
                        <div className="flex items-center gap-1.5 hidden sm:flex">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{evento.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso interactiva (C2) */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 font-medium">
                          {done} de {total} gestiones ejecutadas
                        </span>
                        {postponed > 0 && (
                          <span className="text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Clock className="w-3 h-3" /> {postponed} pospuesta{postponed > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <span className={cn(
                        "font-outfit font-bold text-sm",
                        isFinished ? "text-emerald-400" : percent > 0 ? "text-primary" : "text-slate-400"
                      )}>
                        {percent}%
                      </span>
                    </div>

                    <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-700 ease-out",
                          isFinished 
                            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
                            : percent > 50 
                            ? "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.5)]"
                            : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer con Acceso al Evento */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs text-slate-500">
                      {total === 0 
                        ? "Agrega subtareas logísticas para calcular el avance" 
                        : isFinished 
                        ? "Todas las tareas logísticas han sido completadas" 
                        : `${total - done} gestiones pendientes`}
                    </span>

                    <Button 
                      size="sm"
                      onClick={() => navigate(`/evento/${evento.id}`)}
                      className="rounded-full bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs px-4"
                    >
                      Ver Gestiones del Evento
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

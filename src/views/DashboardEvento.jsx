import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { TaskItem } from '../components/dashboard/TaskItem';

export function DashboardEvento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isCompleted, setIsCompleted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showSubtaskToast, setShowSubtaskToast] = useState(false);

  const handleCompleteEvent = () => {
    setIsCompleted(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [tasks, setTasks] = useState([
    {
      id: 101,
      title: 'Confirmar catering',
      description: 'Llamar a "Sabores del Mundo" para confirmar el menú vegetariano y las intolerancias.',
      event: 'Evento Principal',
      time: 'Hoy, 10:00 AM',
      status: 'vencida',
    },
    {
      id: 102,
      title: 'Revisión de lista de invitados',
      description: 'Actualizar las confirmaciones de asistencia recibidas durante la semana.',
      event: 'Evento Principal',
      time: 'Mañana, 09:00 AM',
      status: 'proxima',
    },
    {
      id: 103,
      title: 'Pago a proveedores',
      description: 'Abonar el 50% restante al florista y alquiladora de muebles.',
      event: 'Evento Principal',
      time: 'Viernes, 12:00 PM',
      status: 'proxima',
    },
    {
      id: 104,
      title: 'Confirmar música',
      description: 'Asegurar que el DJ tiene la playlist correcta para la recepción.',
      event: 'Evento Principal',
      time: 'Viernes, 04:00 PM',
      status: 'proxima',
    }
  ]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completada').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    if (totalTasks > 0 && completedTasks === totalTasks && !isCompleted) {
      handleCompleteEvent();
    }
  }, [completedTasks, totalTasks, isCompleted]);

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === 'completada' ? 'proxima' : 'completada';
        if (newStatus === 'completada') {
          setShowSubtaskToast(true);
          setTimeout(() => setShowSubtaskToast(false), 3000);
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleViewMoreTask = (task) => {
    setSelectedTask(task);
  };

  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  const paginatedTasks = tasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

  const eventDetails = {
    id: id,
    title: 'Evento Principal (Simulado)',
    description: 'Esta es la información detallada del evento que seleccionaste. Aquí puedes ver todos los datos relacionados, gestionar el equipo y revisar el presupuesto.',
    date: '16 Septiembre 2026',
    time: '14:00 PM - 20:00 PM',
    location: 'Salón Principal, Hotel Plaza',
    attendees: '250 Invitados',
    status: 'En progreso',
    budget: '$15,000 USD'
  };

  return (
    <div className="pb-12">
      {/* Header */}
      <header className="pt-8 pb-6 border-b border-white/5 bg-background/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  isCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-primary/20 text-primary border-primary/20'
                }`}>
                  {isCompleted ? 'Completado' : eventDetails.status}
                </span>
                <span className="text-slate-500 text-sm">ID: #{eventDetails.id}</span>
              </div>
              <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-2">
                {eventDetails.title}
              </h1>
            </div>
            
            <Button 
              onClick={handleCompleteEvent}
              disabled={isCompleted}
              className={`rounded-full ${
                isCompleted 
                  ? 'bg-emerald-500 text-white opacity-80' 
                  : 'bg-white text-black hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isCompleted ? 'Completado' : 'Marcar Completado'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column (Info) */}
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-xl font-outfit font-semibold text-white mb-4">Detalles del Evento</h2>
              <p className="text-slate-400 leading-relaxed">
                {eventDetails.description}
              </p>
            </section>
            
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-outfit font-semibold text-white mb-1">Agenda y Tareas</h2>
                  <p className="text-sm text-slate-400">{completedTasks} de {totalTasks} completadas</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {paginatedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggleComplete={handleToggleTask}
                    onViewMore={handleViewMoreTask}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">
                    Mostrando {Math.min(paginatedTasks.length, totalTasks)} de {totalTasks} tareas
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="bg-black/20 border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-black/20 px-3"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="bg-black/20 border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-black/20 px-3"
                    >
                      Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>
          
          {/* Right Column (Sidebar) */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
              <h3 className="text-lg font-outfit font-semibold text-white">Resumen</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Fecha</p>
                    <p className="text-slate-400">{eventDetails.date}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Horario</p>
                    <p className="text-slate-400">{eventDetails.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Ubicación</p>
                    <p className="text-slate-400">{eventDetails.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-sm">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Asistencia</p>
                    <p className="text-slate-400">{eventDetails.attendees}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-medium text-primary mb-1">Presupuesto Asignado</h3>
              <p className="text-3xl font-outfit font-bold text-white">{eventDetails.budget}</p>
            </div>
            
            {/* Progress Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Progreso del Evento</h3>
              <div className="w-full">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">{completedTasks} de {totalTasks} tareas</span>
                  <span className="text-emerald-400 font-medium">{progressPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Mini Dashboard (Modal) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="absolute inset-0"
            onClick={() => setSelectedTask(null)}
          />
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`p-6 border-b border-white/5 ${
              selectedTask.status === 'vencida' ? 'bg-red-500/10' :
              selectedTask.status === 'completada' ? 'bg-emerald-500/10' :
              selectedTask.status === 'urgente' ? 'bg-amber-500/10' :
              'bg-primary/10'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  selectedTask.status === 'vencida' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                  selectedTask.status === 'completada' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                  selectedTask.status === 'urgente' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                  'bg-primary/20 text-primary border border-primary/20'
                }`}>
                  {selectedTask.status.charAt(0).toUpperCase() + selectedTask.status.slice(1)}
                </span>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-xl font-outfit font-semibold text-white pr-6">
                {selectedTask.title}
              </h3>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedTask.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Evento</span>
                  </div>
                  <p className="text-sm text-white font-medium">{selectedTask.event}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    {selectedTask.status === 'vencida' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <Clock className="w-4 h-4" />}
                    <span className="text-xs font-medium uppercase tracking-wider">Horario</span>
                  </div>
                  <p className={`text-sm font-medium ${selectedTask.status === 'vencida' ? 'text-red-400' : 'text-white'}`}>
                    {selectedTask.time}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end">
              <Button 
                onClick={() => {
                  handleToggleTask(selectedTask.id);
                  // Opcional: Cerrar modal si no queremos que se quede abierto al completar
                  // setSelectedTask(null); 
                  
                  // Actualizamos el selectedTask en el modal para que refleje el cambio instantáneamente
                  setSelectedTask(prev => ({ ...prev, status: prev.status === 'completada' ? 'proxima' : 'completada' }));
                }}
                className={`rounded-xl px-6 ${
                  selectedTask.status === 'completada'
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                }`}
              >
                {selectedTask.status === 'completada' ? 'Desmarcar' : 'Completar Tarea'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast (Event) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 border border-emerald-400/20">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="font-medium font-outfit">¡Evento marcado como completado!</span>
        </div>
      )}

      {/* Subtask Success Toast */}
      {showSubtaskToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">Subtarea completada</span>
        </div>
      )}
    </div>
  );
}

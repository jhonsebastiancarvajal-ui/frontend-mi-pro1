import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2, ChevronLeft, ChevronRight, X, AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { TaskItem } from '../components/dashboard/TaskItem';
import { 
  fetchEventoPorId, 
  eliminarEvento, 
  actualizarEvento, 
  actualizarDatosSubtarea, 
  actualizarEstadoSubtarea,
  eliminarSubtarea,
  crearNuevaSubtarea,
  checkOverload
} from '../services/api';

export function DashboardEvento() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventDetails, setEventDetails] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / Edit states
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [editEventData, setEditEventData] = useState({});
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({ title: '', priority: 'Media', estimated_hours: 1, description: '' });
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskData, setEditTaskData] = useState({});

  const [conflictData, setConflictData] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 3;

  const loadEvent = async () => {
    try {
      const data = await fetchEventoPorId(id);
      setEventDetails(data);
      const mappedTasks = (data.subtasks || []).map(st => {
        let stStatus = 'proxima';
        if (st.status === 'PENDING') stStatus = 'urgente';
        if (st.status === 'OVERDUE') stStatus = 'vencida';
        if (st.status === 'DONE') stStatus = 'completada';
        
        return {
          id: st.id,
          title: st.title,
          description: st.description || '',
          event: data.title,
          time: st.target_date,
          status: stStatus,
          estimated_hours: st.estimated_hours,
          course: st.course
        };
      });
      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error cargando el evento', error);
      navigate('/hoy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleDeleteEvent = async () => {
    try {
      await eliminarEvento(id);
      navigate('/hoy');
    } catch (error) {
      alert('Error al eliminar evento');
    }
  };

  const handleUpdateEvent = async () => {
    try {
      const fullDescription = `${editEventData.description}
${editEventData.budget ? `\nPresupuesto: $${editEventData.budget}` : ''}
${editEventData.attendees ? `\nInvitados: ${editEventData.attendees}` : ''}`.trim();

      const payload = { 
        title: editEventData.title,
        description: fullDescription,
        due_date: editEventData.due_date,
        location: editEventData.location,
        time: editEventData.time,
        status: editEventData.status 
      };

      if (payload.time && payload.time.length === 5) payload.time += ':00';
      if (!payload.time) payload.time = null;
      
      await actualizarEvento(id, payload);
      setIsEditingEvent(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      loadEvent();
    } catch (error) {
      alert('Error al actualizar evento');
    }
  };

  const handleAddTask = async () => {
    const finalTargetDate = eventDetails.due_date;
    if (!newTaskData.title || !newTaskData.estimated_hours) {
      alert("Por favor, llena todos los campos obligatorios (Título, Horas Estimadas).");
      return;
    }
    try {
      const overloadCheck = await checkOverload(finalTargetDate, newTaskData.estimated_hours);
      if (overloadCheck.conflict) {
        setConflictData(overloadCheck);
        setPendingAction({ type: 'ADD', data: { ...newTaskData, target_date: finalTargetDate } });
        return;
      }
      await executeAddTask({ ...newTaskData, target_date: finalTargetDate });
    } catch (error) {
      alert('Error al verificar tarea');
    }
  };

  const executeAddTask = async (dataToSave) => {
    try {
      const priorityTag = `[Prioridad ${dataToSave.priority}] `;
      const finalDescription = dataToSave.priority ? priorityTag + dataToSave.description : dataToSave.description;
      
      await crearNuevaSubtarea(id, {
        ...dataToSave,
        description: finalDescription,
        activity_id: id,
        course: "General",
      });
      setIsAddingTask(false);
      setNewTaskData({ title: '', priority: 'Media', estimated_hours: 1, description: '' });
      loadEvent();
    } catch (error) {
      alert('Error al crear tarea');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await eliminarSubtarea(selectedTask.id);
      setIsDeletingTask(false);
      setSelectedTask(null);
      setIsEditingTask(false);
      loadEvent();
    } catch (error) {
      alert('Error al eliminar tarea');
    }
  };

  const handleUpdateTask = async () => {
    if (!editTaskData.title || !editTaskData.time || !editTaskData.estimated_hours) {
      alert("Por favor, llena todos los campos obligatorios (Título, Fecha Objetivo, Horas Estimadas).");
      return;
    }
    try {
      const overloadCheck = await checkOverload(editTaskData.time, editTaskData.estimated_hours, selectedTask.id);
      if (overloadCheck.conflict) {
        setConflictData(overloadCheck);
        setPendingAction({ type: 'UPDATE', data: editTaskData, id: selectedTask.id });
        return;
      }
      await executeUpdateTask(editTaskData, selectedTask.id);
    } catch (error) {
      alert('Error al verificar tarea');
    }
  };

  const executeUpdateTask = async (dataToSave, taskId) => {
    try {
      await actualizarDatosSubtarea(taskId, {
        title: dataToSave.title,
        description: dataToSave.description,
        target_date: dataToSave.time || dataToSave.target_date,
        estimated_hours: dataToSave.estimated_hours
      });
      setIsEditingTask(false);
      setSelectedTask(null);
      loadEvent();
    } catch (error) {
      alert('Error al actualizar tarea');
    }
  };

  const handleToggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const newStatusBackend = task.status === 'completada' ? 'PENDING' : 'DONE';
    try {
      await actualizarEstadoSubtarea(taskId, newStatusBackend);
      loadEvent();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null); // Close modal
      }
    } catch (error) {
      alert('Error al actualizar estado');
    }
  };

  if (loading) return <div className="text-center p-12 text-white">Cargando...</div>;
  if (!eventDetails) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completada').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  const paginatedTasks = tasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

  return (
    <div className="pb-12 relative min-h-screen">
      {/* Background elegant glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="pt-8 pb-6 border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-[64px] z-40">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
          </Button>
          
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-primary/20 text-primary border-primary/20">
                  {eventDetails.status}
                </span>
              </div>
              <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-2">
                {eventDetails.title}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  let desc = eventDetails.description || '';
                  let budget = '';
                  let attendees = '';
                  
                  const invitadosMatch = desc.match(/\nInvitados:\s*(.*)/);
                  if (invitadosMatch) {
                    attendees = invitadosMatch[1].trim();
                    desc = desc.replace(invitadosMatch[0], '');
                  }
                  
                  const presupuestoMatch = desc.match(/\nPresupuesto:\s*\$?(.*)/);
                  if (presupuestoMatch) {
                    budget = presupuestoMatch[1].trim();
                    desc = desc.replace(presupuestoMatch[0], '');
                  }

                  const ubicacionMatch = desc.match(/(?:\r?\n)?Ubicación:\s*(.*)/);
                  if (ubicacionMatch) {
                    desc = desc.replace(ubicacionMatch[0], '');
                  }

                  const horaMatch = desc.match(/(?:\r?\n)?Hora:\s*(.*)/);
                  if (horaMatch) {
                    desc = desc.replace(horaMatch[0], '');
                  }

                  setEditEventData({ 
                    title: eventDetails.title, 
                    description: desc.trim(), 
                    due_date: eventDetails.due_date, 
                    time: eventDetails.time ? eventDetails.time.substring(0, 5) : '', 
                    location: eventDetails.location || '',
                    status: eventDetails.status,
                    budget,
                    attendees
                  });
                  setIsEditingEvent(true);
                }}
                className="rounded-full bg-slate-800 text-white hover:bg-slate-700 border border-white/10"
              >
                <Edit className="w-4 h-4 mr-2" /> Editar Evento
              </Button>
              <Button 
                onClick={() => setIsDeletingEvent(true)}
                className="rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h2 className="text-xl font-outfit font-semibold text-white mb-4">Detalles del Evento</h2>
              <p className="text-slate-400 leading-relaxed">
                {eventDetails.description || 'Sin descripción'}
              </p>
            </section>
            
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-outfit font-semibold text-white mb-1">Tareas</h2>
                  <p className="text-sm text-slate-400">{completedTasks} de {totalTasks} completadas</p>
                </div>
                <Button 
                  onClick={() => setIsAddingTask(true)}
                  size="sm"
                  className="bg-primary/20 text-primary hover:bg-primary/30 rounded-full"
                >
                  <Plus className="w-4 h-4 mr-1" /> Añadir Subtarea
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {paginatedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggleComplete={handleToggleTask}
                    onViewMore={(t) => {
                      setSelectedTask(t);
                      setEditTaskData(t);
                    }}
                  />
                ))}
                {tasks.length === 0 && <p className="text-slate-400 text-sm py-4">No hay tareas creadas.</p>}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">
                    Mostrando {Math.min(paginatedTasks.length, totalTasks)} de {totalTasks} tareas
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="bg-black/20 text-white px-3"
                    ><ChevronLeft className="w-4 h-4 mr-1" /> Anterior</Button>
                    <Button 
                      variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="bg-black/20 text-white px-3"
                    >Siguiente <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </div>
                </div>
              )}
            </section>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-5">
              <h3 className="text-lg font-outfit font-semibold text-white">Resumen</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Fecha Límite</p>
                    <p className="text-slate-400">{eventDetails.due_date}</p>
                  </div>
                </div>
                {eventDetails.time && (
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Hora</p>
                      <p className="text-slate-400">{eventDetails.time.substring(0, 5)}</p>
                    </div>
                  </div>
                )}
                {eventDetails.location && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Ubicación</p>
                      <p className="text-slate-400">{eventDetails.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Progreso</h3>
              <div className="w-full">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">{completedTasks} de {totalTasks} tareas</span>
                  <span className="text-emerald-400 font-medium">{progressPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Event Modal */}
      {isEditingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <button 
              onClick={() => setIsEditingEvent(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <Edit className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-2xl font-outfit font-bold text-white">Editar Evento</h3>
            </div>
            
            <div className="space-y-6">
              <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-xl font-outfit font-semibold text-white mb-6">Información General</h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Título del evento *</label>
                    <input 
                      value={editEventData.title} 
                      onChange={e => setEditEventData({...editEventData, title: e.target.value})} 
                      className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-white transition-all outline-none" 
                      placeholder="Ej. Boda García-López"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Descripción *</label>
                    <textarea 
                      value={editEventData.description} 
                      onChange={e => setEditEventData({...editEventData, description: e.target.value})} 
                      className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-white transition-all outline-none min-h-[100px] resize-none" 
                      placeholder="Detalles adicionales sobre el evento..."
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-xl font-outfit font-semibold text-white mb-6">Cuándo y Dónde</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Fecha Límite *</label>
                    <input 
                      type="date" 
                      value={editEventData.due_date} 
                      onChange={e => setEditEventData({...editEventData, due_date: e.target.value})} 
                      className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-white transition-all outline-none [color-scheme:dark]" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Hora *</label>
                    <input 
                      type="time" 
                      value={editEventData.time} 
                      onChange={e => setEditEventData({...editEventData, time: e.target.value})} 
                      className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-white transition-all outline-none [color-scheme:dark]" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Ubicación (Opcional)</label>
                    <input 
                      value={editEventData.location} 
                      onChange={e => setEditEventData({...editEventData, location: e.target.value})} 
                      className="w-full bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-3 text-white transition-all outline-none" 
                      placeholder="Ej. Salón Principal, Hotel Plaza"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-xl font-outfit font-semibold text-white mb-6">Detalles Adicionales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Presupuesto Estimado (Opcional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input 
                        type="number" 
                        value={editEventData.budget || ''} 
                        onChange={e => setEditEventData({...editEventData, budget: e.target.value})} 
                        className="w-full pl-8 pr-4 py-3 bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl text-white transition-all outline-none" 
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1.5 block">Invitados Estimados (Opcional)</label>
                    <input 
                      type="number" 
                      value={editEventData.attendees || ''} 
                      onChange={e => setEditEventData({...editEventData, attendees: e.target.value})} 
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl text-white transition-all outline-none" 
                      placeholder="Ej. 150"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-white/10">
              <Button onClick={() => setIsEditingEvent(false)} variant="ghost" className="text-slate-300 hover:text-white">
                Cancelar
              </Button>
              <Button onClick={handleUpdateEvent} className="px-8 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {isDeletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-red-500/20 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-outfit font-semibold text-white mb-2">¿Eliminar evento?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Esta acción eliminará permanentemente el evento <strong>{eventDetails.title}</strong> y todas sus tareas asociadas. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsDeletingEvent(false)} className="flex-1 text-slate-300 hover:text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button onClick={handleDeleteEvent} className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddingTask(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Plus className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-outfit font-bold text-white">Añadir Nueva Subtarea</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Título de la tarea</label>
                <input 
                  value={newTaskData.title} 
                  onChange={e => setNewTaskData({...newTaskData, title: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-white transition-all outline-none" 
                  placeholder="¿Qué necesitas hacer?"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-2 block">Descripción</label>
                <textarea 
                  value={newTaskData.description} 
                  onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} 
                  className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-white transition-all outline-none min-h-[100px] resize-none" 
                  placeholder="Detalles sobre cómo completar la tarea..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Nivel de Prioridad</label>
                  <div className="relative">
                    <select 
                      value={newTaskData.priority} 
                      onChange={e => setNewTaskData({...newTaskData, priority: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-white transition-all outline-none appearance-none"
                    >
                      <option value="Baja" className="bg-slate-900">Baja (🟢)</option>
                      <option value="Media" className="bg-slate-900">Media (🟡)</option>
                      <option value="Alta" className="bg-slate-900">Alta (🔴)</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      ▼
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Horas Estimadas</label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={newTaskData.estimated_hours} 
                    onChange={e => setNewTaskData({...newTaskData, estimated_hours: parseFloat(e.target.value) || 0.5})} 
                    className="w-full bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-white transition-all outline-none" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
              <Button onClick={() => setIsAddingTask(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-12">
                Cancelar
              </Button>
              <Button onClick={handleAddTask} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Crear Tarea
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Task Details / Edit Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center relative">
              <h3 className="text-xl font-outfit font-bold text-white pr-8 truncate">
                {isEditingTask ? 'Editar Subtarea' : selectedTask.title}
              </h3>
              <button 
                onClick={() => { setSelectedTask(null); setIsEditingTask(false); }} 
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="p-8">
              {isEditingTask ? (
                <div className="space-y-5">
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">Título</label>
                    <input 
                      value={editTaskData.title} 
                      onChange={e => setEditTaskData({...editTaskData, title: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-white transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">Descripción</label>
                    <textarea 
                      value={editTaskData.description} 
                      onChange={e => setEditTaskData({...editTaskData, description: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-white transition-all outline-none min-h-[100px] resize-none" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">Fecha Objetivo</label>
                      <input 
                        type="date" 
                        value={editTaskData.time} 
                        onChange={e => setEditTaskData({...editTaskData, time: e.target.value})} 
                        className="w-full bg-black/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-white transition-all outline-none [color-scheme:dark]" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">Horas Estimadas</label>
                      <input 
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={editTaskData.estimated_hours} 
                        onChange={e => setEditTaskData({...editTaskData, estimated_hours: parseFloat(e.target.value) || 0.5})} 
                        className="w-full bg-black/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-white transition-all outline-none" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
                    <Button onClick={() => setIsEditingTask(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-12">
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdateTask} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-12 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Descripción</p>
                    <p className="text-slate-200 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                      {selectedTask.description || <span className="italic text-slate-500">Sin descripción</span>}
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5 flex-1">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-slate-400 text-xs font-medium uppercase">Fecha Objetivo</p>
                        <p className="text-white font-medium">{selectedTask.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5 flex-1">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-slate-400 text-xs font-medium uppercase">Horas Estimadas</p>
                        <p className="text-white font-medium">{selectedTask.estimated_hours}h</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-6 border-t border-white/10">
                    <Button onClick={() => setIsEditingTask(true)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl h-11">
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </Button>
                    <Button 
                      onClick={() => handleToggleTask(selectedTask.id)} 
                      className={`flex-[1.5] text-white rounded-xl h-11 shadow-lg ${selectedTask.status === 'completada' ? 'bg-slate-600 hover:bg-slate-700' : 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
                    >
                      {selectedTask.status === 'completada' ? 'Marcar como Pendiente' : 'Completar Tarea'}
                    </Button>
                    <Button 
                      onClick={() => setIsDeletingTask(true)} 
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 rounded-xl h-11 transition-all hover:scale-105"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {isDeletingTask && selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-red-500/20 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-outfit font-semibold text-white mb-2">¿Eliminar tarea?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Estás a punto de eliminar la tarea <strong>{selectedTask.title}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsDeletingTask(false)} className="flex-1 text-slate-300 hover:text-white hover:bg-white/5">
                Cancelar
              </Button>
              <Button onClick={handleDeleteTask} className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-[70] border border-emerald-400/20">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="font-medium font-outfit">¡Se han guardado los cambios!</span>
        </div>
      )}

      {/* Conflict Modal (Sprint 3) */}
      {conflictData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-outfit font-bold text-white">Sobrecarga Detectada</h3>
            </div>
            
            <p className="text-slate-300 mb-6 leading-relaxed">
              Quedarías con <strong className="text-amber-400">{conflictData.planned_hours}h planificadas</strong>, pero tu límite es de <strong className="text-white">{conflictData.limit_hours}h</strong>. Tienes un exceso de <span className="text-red-400 font-medium">{conflictData.exceeds_by}h</span>.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-sm font-medium text-white mb-3">Opción 1: Reducir las horas de la tarea</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    step="0.5"
                    min="0.5"
                    max={pendingAction?.data?.estimated_hours - conflictData.exceeds_by > 0.5 ? pendingAction?.data?.estimated_hours - conflictData.exceeds_by : 0.5}
                    value={pendingAction?.data?.estimated_hours || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0.5;
                      setPendingAction(prev => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          estimated_hours: val
                        }
                      }));
                    }}
                    className="w-24 bg-black/40 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-white" 
                  />
                  <span className="text-sm text-slate-400">horas (Recomendado: {Math.max(0.5, pendingAction?.data?.estimated_hours - conflictData.exceeds_by)}h)</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-sm font-medium text-white mb-3">Opción 2: Mover TODO el evento a otra fecha</p>
                <input 
                  type="date"
                  value={pendingAction?.data?.target_date || eventDetails?.due_date || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPendingAction(prev => ({
                      ...prev,
                      data: {
                        ...prev.data,
                        target_date: val
                      }
                    }));
                  }}
                  className="w-full bg-black/40 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-white [color-scheme:dark]" 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-white/10">
              <Button 
                onClick={() => {
                  setConflictData(null);
                  setPendingAction(null);
                }} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  setConflictData(null);
                  
                  if (pendingAction.data.target_date && pendingAction.data.target_date !== eventDetails.due_date) {
                    try {
                      await actualizarEvento(id, {
                        ...eventDetails,
                        due_date: pendingAction.data.target_date
                      });
                      setEventDetails(prev => ({...prev, due_date: pendingAction.data.target_date}));
                    } catch (err) {
                      console.error(err);
                    }
                  }

                  if (pendingAction.type === 'ADD') {
                    executeAddTask(pendingAction.data);
                  } else {
                    executeUpdateTask(pendingAction.data, pendingAction.id);
                  }
                  setPendingAction(null);
                }} 
                className="flex-[1.5] bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] rounded-xl h-11"
              >
                Reintentar Guardado
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

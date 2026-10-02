import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { crearNuevoEvento, crearNuevaSubtarea, checkOverload } from '../services/api';

export function CrearEventoView() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    budget: '',
    attendees: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '', estimated_hours: '', status: 'PENDING' });
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [pendingSubtask, setPendingSubtask] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.date) newErrors.date = 'La fecha es obligatoria';
    if (!formData.time) newErrors.time = 'El horario es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Combinar solo campos que no existen en el backend (presupuesto, invitados)
        const fullDescription = `${formData.description}
${formData.budget ? `\nPresupuesto: $${formData.budget}` : ''}
${formData.attendees ? `\nInvitados: ${formData.attendees}` : ''}`;

        const eventData = {
          title: formData.title,
          due_date: formData.date,
          time: formData.time ? (formData.time.length === 5 ? formData.time + ':00' : formData.time) : null,
          location: formData.location,
          description: fullDescription.trim(),
          type: 'OTRO', // Por defecto para eventos
          course: ''
        };

        const eventoCreado = await crearNuevoEvento(eventData);
        
        // Crear las subtareas
        for (const task of subtasks) {
          const subtaskData = {
            title: task.title,
            target_date: formData.date, // Usamos la fecha del evento
            estimated_hours: parseFloat(task.estimated_hours),
            description: task.description,
            status: task.status
          };
          await crearNuevaSubtarea(eventoCreado.id, subtaskData);
        }

        setShowToast(true);
        setTimeout(() => {
          navigate('/hoy');
        }, 2000);
      } catch (error) {
        console.error("Error guardando el evento:", error);
        alert(`${error.message || "Hubo un error al guardar el evento."}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.title.trim() || !newSubtask.estimated_hours) {
      alert("Por favor, ingresa el título y las horas estimadas para poder añadir la tarea.");
      return;
    }
    if (parseFloat(newSubtask.estimated_hours) > 999.99) {
      alert("Las horas estimadas no pueden superar 999.99");
      return;
    }

    if (formData.date) {
      try {
        const totalPendingHours = subtasks.reduce((sum, t) => sum + parseFloat(t.estimated_hours), 0) + parseFloat(newSubtask.estimated_hours);
        const overloadCheck = await checkOverload(formData.date, totalPendingHours);
        if (overloadCheck.conflict) {
          setConflictData(overloadCheck);
          setPendingSubtask(newSubtask);
          return;
        }
      } catch (error) {
        console.error("Error validando sobrecarga:", error);
      }
    } else {
      alert("Aviso: Como no has seleccionado una fecha general arriba, no podemos validar aún si esta tarea excederá tu límite de horas.");
    }

    executeAddSubtask(newSubtask);
  };

  const executeAddSubtask = (taskToAdd) => {
    setSubtasks([...subtasks, { id: Date.now(), ...taskToAdd }]);
    setNewSubtask({ title: '', description: '', estimated_hours: '', status: 'PENDING' });
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(task => task.id !== id));
  };

  return (
    <div className="pb-12">
      {/* Header */}
      <header className="pt-8 pb-6 border-b border-white/5 bg-background/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-3xl mx-auto px-6">
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          
          <div>
            <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-2">
              Crear Nuevo Evento
            </h1>
            <p className="text-slate-400">
              Completa los detalles a continuación para registrar un nuevo evento en tu agenda.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content (Form) */}
      <main className="max-w-3xl mx-auto px-6 pt-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General Information Section */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <h2 className="text-xl font-outfit font-semibold text-white mb-6">Información General</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Título del Evento *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej. Boda García-López"
                  className={`w-full px-4 py-3 rounded-xl bg-black/20 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.title 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : isSubmitted && !errors.title && formData.title 
                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/50'
                        : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'
                  }`}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span>{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción *</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Detalles adicionales sobre el evento..."
                  className={`w-full px-4 py-3 rounded-xl bg-black/20 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all resize-none ${
                    errors.description 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : isSubmitted && !errors.description && formData.description 
                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/50'
                        : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'
                  }`}
                />
                {errors.description && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span>{errors.description}</p>}
              </div>
            </div>
          </section>

          {/* Date & Location Section */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <h2 className="text-xl font-outfit font-semibold text-white mb-6">Cuándo y Dónde</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Fecha *</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl bg-black/20 border text-white focus:outline-none focus:ring-1 transition-all ${
                    errors.date 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : isSubmitted && !errors.date && formData.date
                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/50'
                        : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'
                  }`}
                />
                {errors.date && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span>{errors.date}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Horario *</label>
                <input 
                  type="time" 
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl bg-black/20 border text-white focus:outline-none focus:ring-1 transition-all ${
                    errors.time 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                      : isSubmitted && !errors.time && formData.time
                        ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/50'
                        : 'border-white/10 focus:border-primary/50 focus:ring-primary/50'
                  }`}
                />
                {errors.time && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span>{errors.time}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Ubicación (Opcional)</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ej. Salón Principal, Hotel Plaza"
                  className={`w-full px-4 py-3 rounded-xl bg-black/20 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all border-white/10 focus:border-primary/50 focus:ring-primary/50`}
                />
              </div>
            </div>
          </section>

          {/* Additional Details */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <h2 className="text-xl font-outfit font-semibold text-white mb-6">Detalles Adicionales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Presupuesto Estimado (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input 
                    type="number" 
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl bg-black/20 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all border-white/10 focus:border-primary/50 focus:ring-primary/50`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Invitados Estimados (Opcional)</label>
                <input 
                  type="number" 
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleInputChange}
                  placeholder="Ej. 150"
                  className={`w-full px-4 py-3 rounded-xl bg-black/20 border text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all border-white/10 focus:border-primary/50 focus:ring-primary/50`}
                />
              </div>
            </div>
          </section>

          {/* Subtasks Section */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-outfit font-semibold text-white">Subtareas del Evento</h2>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/20">
                {subtasks.length} tareas
              </span>
            </div>
            
            <div className="space-y-6">
              <div className="bg-black/10 p-5 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-medium text-slate-300">Añadir Nueva Subtarea</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input 
                      type="text"
                      placeholder="Título de la tarea (Ej. Llamar al proveedor)"
                      value={newSubtask.title}
                      onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <input 
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="999.99"
                      placeholder="Horas est. (Ej. 1.5)"
                      value={newSubtask.estimated_hours}
                      onChange={(e) => setNewSubtask({ ...newSubtask, estimated_hours: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder-slate-500"
                    />
                  </div>
                  <div className="md:col-span-3 flex gap-3">
                    <input 
                      type="text"
                      placeholder="Descripción breve..."
                      value={newSubtask.description}
                      onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                      className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                    <Button 
                      type="button"
                      onClick={handleAddSubtask}
                      disabled={!newSubtask.title.trim() || !newSubtask.estimated_hours}
                      className="bg-primary hover:bg-primary/90 text-white px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Añadir
                    </Button>
                  </div>
                </div>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-3">
                  {subtasks.map((task) => (
                    <div key={task.id} className="flex items-start justify-between p-4 rounded-xl bg-black/20 border border-white/5 group hover:border-white/10 transition-all">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-slate-600 mt-0.5" />
                        <div>
                          <p className="text-slate-200 font-medium flex items-center gap-2">
                            {task.title} 
                            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{task.estimated_hours}h</span>
                          </p>
                          {task.description && <p className="text-sm text-slate-500 mt-1.5">{task.description}</p>}
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveSubtask(task.id)}
                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-slate-300 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-105 disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Guardando...' : 'Guardar Evento'}
            </Button>
          </div>
          
        </form>
      </main>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 border border-emerald-400/20">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="font-medium font-outfit">¡Evento guardado con éxito!</span>
        </div>
      )}
      {/* Conflict Modal */}
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
              Con esta nueva tarea sumarías <strong className="text-amber-400">{conflictData.planned_hours}h planificadas</strong> para el {formData.date}, pero tu límite es de <strong className="text-white">{conflictData.limit_hours}h</strong>. Tienes un exceso de <span className="text-red-400 font-medium">{conflictData.exceeds_by}h</span>.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-sm font-medium text-white mb-3">Opción 1: Reducir las horas de la tarea</p>
                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    step="0.5"
                    min="0.5"
                    max={pendingSubtask?.estimated_hours - conflictData.exceeds_by > 0.5 ? pendingSubtask?.estimated_hours - conflictData.exceeds_by : 0.5}
                    value={pendingSubtask?.estimated_hours || ''}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0.5;
                      setPendingSubtask(prev => ({ ...prev, estimated_hours: val }));
                    }}
                    className="w-24 bg-black/40 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-white" 
                  />
                  <span className="text-sm text-slate-400">horas (Recomendado: {Math.max(0.5, pendingSubtask?.estimated_hours - conflictData.exceeds_by)}h)</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-sm font-medium text-white mb-3">Opción 2: Mover TODO el evento a otra fecha</p>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, date: val }));
                  }}
                  className="w-full bg-black/40 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-white [color-scheme:dark]" 
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-white/10">
              <Button 
                type="button"
                onClick={() => {
                  setConflictData(null);
                  setPendingSubtask(null);
                }} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  setConflictData(null);
                  executeAddSubtask(pendingSubtask);
                  setPendingSubtask(null);
                }} 
                className="flex-[1.5] bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] rounded-xl h-11"
              >
                Añadir Tarea
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Clock, StickyNote, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

export function PostponeTaskModal({ isOpen, onClose, task, onConfirm }) {
  const [note, setNote] = useState(task?.postpone_note || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const suggestions = [
    'Esperando confirmación de salón',
    'Pendiente por cotización de catering',
    'Esperando respuesta de ponente',
    'Reagendado por ajuste presupuestal',
  ];

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(task.id, note.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-outfit font-bold text-white">Posponer Gestión</h3>
            <p className="text-xs text-slate-400">Actualiza el estado de la tarea logística</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-5">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Tarea a posponer</p>
          <p className="text-white font-medium text-sm">{task.title}</p>
          {task.event && (
            <p className="text-xs text-primary/80 mt-1">Evento: {task.event}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-200 text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <StickyNote className="w-4 h-4 text-amber-400" />
              Nota explicativa (opcional)
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Indica la razón por la que se posterga (quedará visible en el panel).
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="ej. esperando confirmación de salón..."
              className="w-full bg-black/40 border border-white/10 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
            />
          </div>

          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium">Sugerencias rápidas:</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNote(sug)}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/5 transition-all"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8 pt-5 border-t border-white/10">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="flex-1 text-slate-300 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-[0_0_20px_rgba(245,158,11,0.3)] rounded-xl"
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar Posposición'}
          </Button>
        </div>
      </div>
    </div>
  );
}

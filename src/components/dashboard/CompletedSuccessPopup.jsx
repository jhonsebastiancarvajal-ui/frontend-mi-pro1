import React, { useEffect } from 'react';
import { CheckCircle2, Award, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export function CompletedSuccessPopup({
  isOpen,
  onClose,
  title = '¡Tarea completada!',
  message = 'Has completado la gestión con éxito.',
  actionText = 'Ver progreso',
  onAction,
  isEventCompleted = false,
  autoCloseMs = 6000
}) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, autoCloseMs]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={cn(
        "relative bg-[#101c1c]/95 border backdrop-blur-xl p-5 rounded-2xl flex items-start gap-4 max-w-sm",
        isEventCompleted
          ? "border-emerald-500/50 shadow-[0_15px_40px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/30"
          : "border-emerald-500/30 shadow-[0_15px_40px_rgba(16,185,129,0.25)]"
      )}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1 transition-colors"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glowing Icon */}
        <div className={cn(
          "p-2.5 rounded-full mt-0.5 shrink-0 border",
          isEventCompleted 
            ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
            : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
        )}>
          {isEventCompleted ? (
            <Award className="w-6 h-6 text-emerald-400" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          )}
        </div>

        {/* Content */}
        <div className="pr-4 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-white font-outfit font-bold text-base">
              {title}
            </h4>
            {isEventCompleted && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                100%
              </span>
            )}
          </div>
          <p className="text-slate-300 text-sm mt-1 leading-snug">
            {message}
          </p>

          {onAction && actionText && (
            <Button 
              onClick={() => {
                onAction();
                onClose();
              }}
              size="sm"
              className="mt-4 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-full text-xs h-8 px-4 transition-all font-medium flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-105"
            >
              {actionText}
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

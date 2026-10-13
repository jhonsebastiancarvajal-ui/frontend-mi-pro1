import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight, StickyNote, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function TaskItem({ task, onToggleComplete, onPostpone, onViewMore }) {
  const isOverdue = task.status === 'vencida';
  const isUrgent = task.status === 'urgente';
  const isCompleted = task.status === 'completada' || task.backendStatus === 'DONE';
  const isPostponed = task.status === 'pospuesta' || task.backendStatus === 'POSTPONED';

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1",
      "border border-white/5 backdrop-blur-md",
      isOverdue ? "bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)]" : 
      isPostponed ? "bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]" :
      isUrgent ? "bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]" :
      isCompleted ? "bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30" :
      "bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]"
    )}>
      {/* Accent Line */}
      <div className={cn(
        "absolute left-0 top-0 h-full w-[3px] transition-all duration-300 group-hover:w-[4px]",
        isOverdue ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : 
        isPostponed ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" :
        isUrgent ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" : 
        isCompleted ? "bg-emerald-500" :
        "bg-primary/50"
      )} />
      
      <CardContent className="p-5 pl-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-start gap-3">
              {onToggleComplete && (
                <button 
                  onClick={() => onToggleComplete(task.id)}
                  title={isCompleted ? "Marcar como pendiente" : "Marcar como ejecutada"}
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 mt-0.5",
                    isCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-slate-500/50 text-transparent hover:border-primary/50"
                  )}
                >
                  <CheckCircle2 className="w-3 h-3" />
                </button>
              )}
              <div className="flex items-center flex-wrap gap-2">
                <h4 className={cn(
                  "font-outfit font-medium text-base transition-colors",
                  isOverdue ? "text-red-400 group-hover:text-red-300" : 
                  isPostponed ? "text-amber-300 group-hover:text-amber-200" :
                  isCompleted ? "text-emerald-400 line-through opacity-80" :
                  "text-slate-200 group-hover:text-white"
                )}>
                  {task.title}
                </h4>
                {isOverdue && (
                  <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
                    Vencida
                  </span>
                )}
                {isPostponed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
                    <Clock className="w-3 h-3" /> Pospuesta
                  </span>
                )}
                {isUrgent && !isPostponed && !isCompleted && (
                  <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                    Urgente
                  </span>
                )}
                {isCompleted && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    Ejecutada
                  </span>
                )}
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-slate-400 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* NOTA EXPLICATIVA PERSISTENTE (C1, C4) */}
            {task.postpone_note && (
              <div className="mt-2.5 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-amber-300/90 flex items-start gap-2">
                <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                <div className="flex-1">
                  <span className="font-semibold text-amber-400 block mb-0.5">Nota explicativa:</span>
                  <span className="italic">{task.postpone_note}</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-3 border-t border-white/5 mt-3">
              {task.event && (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{task.event}</span>
                </div>
              )}
              <div className={cn(
                "flex items-center gap-1.5 font-medium",
                isOverdue ? "text-red-400/80" : 
                isPostponed ? "text-amber-400/80" :
                isUrgent ? "text-blue-400/80" : 
                isCompleted ? "text-emerald-400/80" :
                "text-primary/80"
              )}>
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : 
                 isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                 <Clock className="w-3.5 h-3.5" />}
                <span>{task.time || task.target_date}</span>
                {task.estimated_hours && <span>• {task.estimated_hours}h</span>}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 justify-end">
              {onPostpone && !isCompleted && (
                <button
                  type="button"
                  onClick={() => onPostpone(task)}
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-all hover:scale-105"
                  title="Posponer gestión con nota explicativa"
                >
                  <Clock className="w-3 h-3" />
                  {isPostponed ? 'Editar nota' : 'Posponer'}
                </button>
              )}

              {onViewMore ? (
                <button 
                  onClick={() => onViewMore(task)}
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:scale-105",
                    isOverdue ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : 
                    isPostponed ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" :
                    isUrgent ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" : 
                    isCompleted ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" :
                    "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  Ver más
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <Link 
                  to={`/evento/${task.activity_id || task.id}`} 
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:scale-105",
                    isOverdue ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : 
                    isPostponed ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" :
                    isUrgent ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" : 
                    isCompleted ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" :
                    "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  Ver más
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}

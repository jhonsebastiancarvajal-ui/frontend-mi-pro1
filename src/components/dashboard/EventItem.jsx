import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight, MapPin, DollarSign, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function EventItem({ evento }) {
  const localDueDate = new Date(evento.due_date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isOverdue = localDueDate < today;
  const isToday = localDueDate.toDateString() === today.toDateString();
  const isCompleted = evento.status === 'COMPLETED' || (evento.subtasks_total > 0 && evento.subtasks_done === evento.subtasks_total);

  const displayStatus = isCompleted ? 'completado' : isOverdue ? 'vencido' : isToday ? 'hoy' : 'proximo';

  const parseDescription = (desc) => {
    if (!desc) return { mainText: "Sin descripción", details: {} };
    
    // Regular expressions to find the custom fields
    const ubicacionMatch = desc.match(/Ubicación:\s*(.*?)(?=\s+Hora:|\s+Presupuesto:|\s+Invitados:|$)/i);
    const horaMatch = desc.match(/Hora:\s*(.*?)(?=\s+Ubicación:|\s+Presupuesto:|\s+Invitados:|$)/i);
    const presupuestoMatch = desc.match(/Presupuesto:\s*(.*?)(?=\s+Ubicación:|\s+Hora:|\s+Invitados:|$)/i);
    const invitadosMatch = desc.match(/Invitados:\s*(.*?)(?=\s+Ubicación:|\s+Hora:|\s+Presupuesto:|$)/i);

    let mainText = desc;
    const details = {};

    if (ubicacionMatch) {
      details.ubicacion = ubicacionMatch[1].trim();
      mainText = mainText.replace(ubicacionMatch[0], '');
    }
    if (horaMatch) {
      details.hora = horaMatch[1].trim();
      mainText = mainText.replace(horaMatch[0], '');
    }
    if (presupuestoMatch) {
      details.presupuesto = presupuestoMatch[1].trim();
      mainText = mainText.replace(presupuestoMatch[0], '');
    }
    if (invitadosMatch) {
      details.invitados = invitadosMatch[1].trim();
      mainText = mainText.replace(invitadosMatch[0], '');
    }

    return { 
      mainText: mainText.trim(), 
      details 
    };
  };

  const { mainText, details } = parseDescription(evento.description);

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1",
      "border border-white/5 backdrop-blur-md cursor-pointer",
      displayStatus === 'vencido' ? "bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)]" : 
      displayStatus === 'hoy' ? "bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)]" :
      displayStatus === 'completado' ? "bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30" :
      "bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]"
    )}>
      {/* Accent Line */}
      <div className={cn(
        "absolute left-0 top-0 h-full w-[3px] transition-all duration-300 group-hover:w-[4px]",
        displayStatus === 'vencido' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : 
        displayStatus === 'hoy' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" : 
        displayStatus === 'completado' ? "bg-emerald-500" :
        "bg-primary/50"
      )} />
      
      <CardContent className="p-5 pl-6 block">
        <Link to={`/evento/${evento.id}`} className="block flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex items-center flex-wrap gap-2">
                  <h4 className={cn(
                    "font-outfit font-semibold text-lg transition-colors",
                    displayStatus === 'vencido' ? "text-red-400 group-hover:text-red-300" : 
                    displayStatus === 'completado' ? "text-emerald-400" :
                    "text-slate-200 group-hover:text-white"
                  )}>
                    {evento.title}
                  </h4>
                  {displayStatus === 'vencido' && (
                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                      Evento Vencido
                    </span>
                  )}
                  {displayStatus === 'hoy' && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                      Para Hoy
                    </span>
                  )}
                  {displayStatus === 'completado' && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                      Culminado
                    </span>
                  )}
                </div>
              </div>
              
              {/* Main Description */}
              {mainText && (
                <p className="text-sm text-slate-400/90 line-clamp-2 leading-relaxed">
                  {mainText}
                </p>
              )}

              {/* Parsed Details Grid */}
              {(details.ubicacion || details.hora || details.presupuesto || details.invitados) && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {details.hora && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/5 rounded-md px-2 py-1 border border-white/5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="font-medium">{details.hora}</span>
                    </div>
                  )}
                  {details.ubicacion && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/5 rounded-md px-2 py-1 border border-white/5 max-w-xs">
                      <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="font-medium truncate" title={details.ubicacion}>{details.ubicacion}</span>
                    </div>
                  )}
                  {details.presupuesto && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/5 rounded-md px-2 py-1 border border-white/5">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                      <span className="font-medium">{details.presupuesto}</span>
                    </div>
                  )}
                  {details.invitados && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/5 rounded-md px-2 py-1 border border-white/5">
                      <Users className="w-3 h-3 text-purple-400" />
                      <span className="font-medium">{details.invitados} inv.</span>
                    </div>
                  )}
                  {evento.subtasks && evento.subtasks.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-emerald-500/10 rounded-md px-2 py-1 border border-emerald-500/20">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span className="font-medium text-emerald-300">
                        Total a invertir: {evento.subtasks.reduce((acc, st) => acc + parseFloat(st.estimated_hours || 0), 0)}h
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-white/5">
            <div className={cn(
              "flex items-center gap-1.5 font-medium",
              displayStatus === 'vencido' ? "text-red-400/80" : 
              displayStatus === 'hoy' ? "text-amber-400/80" : 
              displayStatus === 'completado' ? "text-emerald-400/80" :
              "text-primary/80"
            )}>
              {displayStatus === 'vencido' ? <AlertCircle className="w-3.5 h-3.5" /> : 
               displayStatus === 'completado' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
               <Calendar className="w-3.5 h-3.5" />}
              <span>{evento.due_date}</span>
            </div>
            {evento.subtasks_total !== undefined && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>{evento.subtasks_done} / {evento.subtasks_total} tareas</span>
                {/* Visual Progress Bar Mini */}
                {evento.subtasks_total > 0 && (
                  <div className="w-16 h-1.5 bg-black/40 rounded-full ml-1 overflow-hidden border border-white/5">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        displayStatus === 'completado' ? "bg-emerald-500" : "bg-primary"
                      )} 
                      style={{ width: `${(evento.subtasks_done / evento.subtasks_total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* View More Button */}
          <div className="absolute bottom-4 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div 
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300",
                displayStatus === 'vencido' ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : 
                displayStatus === 'hoy' ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" : 
                displayStatus === 'completado' ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" :
                "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              Abrir Evento
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

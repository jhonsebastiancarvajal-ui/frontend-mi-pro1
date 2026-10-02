import React, { useState, useEffect } from 'react';
import { PlusCircle, Calendar as CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { fetchAllEventos } from '../services/api';
import { EventItem } from '../components/dashboard/EventItem';

export function DashboardProximos() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventos = async () => {
      try {
        const data = await fetchAllEventos();
        setEventos(data?.results || (Array.isArray(data) ? data : []));
      } catch (error) {
        console.error('Error cargando eventos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEventos();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const proximos = eventos.filter(e => {
    const dueDate = new Date(e.due_date + 'T00:00:00');
    return dueDate >= today;
  });

  return (
    <div className="pb-12">
      <header className="pt-8 pb-4">
        <div className="max-w-5xl mx-auto px-6 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-outfit font-bold tracking-tight text-white mb-2">
              Proyectos y Eventos
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Gestión de todas tus actividades
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

      <main className="max-w-5xl mx-auto px-6 pt-6 space-y-10">
        {loading ? (
          <div className="text-center py-12 text-slate-400 font-outfit">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-outfit font-semibold text-white">Sin Eventos</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto">
              Aún no tienes eventos registrados. ¡Crea uno nuevo!
            </p>
          </div>
        ) : (
          <>
            {proximos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-outfit font-semibold text-slate-100 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                    Próximos Eventos
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proximos.map(evento => (
                    <EventItem key={evento.id} evento={evento} />
                  ))}
                </div>
              </section>
            )}
            
            {proximos.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-outfit">No tienes eventos próximos pendientes.</div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

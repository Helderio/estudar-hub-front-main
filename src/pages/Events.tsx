import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '@/components/EventCard';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EVENT_TYPES } from '@/types';
import type { EventType, UniversityEvent } from '@/types';
import { Plus } from 'lucide-react';
import { eventService } from '@/services/eventService';
import type { PageResponse } from '@/services/apiResponse';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';

const typeKeys = Object.keys(EVENT_TYPES) as EventType[];

const Events = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'closed' | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [events, setEvents] = useState<UniversityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await eventService.getAll({ page: '0', size: '100' });
        const page = unwrapApiResponseOrRaw<PageResponse<UniversityEvent>>(res);
        if (!alive) return;
        setEvents(page?.content ?? []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? 'Falha ao carregar eventos.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const institutions = useMemo(() => [...new Set(events.map(e => e.institution).filter(Boolean))], [events]);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedType && e.type !== selectedType) return false;
      if (selectedStatus && e.status !== selectedStatus) return false;
      if (selectedInstitution && e.institution !== selectedInstitution) return false;
      return true;
    });
  }, [events, search, selectedType, selectedStatus, selectedInstitution]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Eventos</h1>
          <p className="text-sm text-muted-foreground">Descubra eventos académicos em Benguela.</p>
        </div>
        <Link to="/create-event" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus size={16} /> Criar Evento
        </Link>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar eventos..." />

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedType(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!selectedType ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Todos</button>
        {typeKeys.map(t => (
          <button key={t} onClick={() => setSelectedType(t === selectedType ? null : t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedType === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{EVENT_TYPES[t]}</button>
        ))}
        <div className="w-px bg-border mx-1" />
        <button onClick={() => setSelectedStatus(selectedStatus === 'open' ? null : 'open')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'open' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Abertos</button>
        <button onClick={() => setSelectedStatus(selectedStatus === 'closed' ? null : 'closed')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedStatus === 'closed' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Encerrados</button>
      </div>

      {/* Institution filter */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Instituição:</span>
        <button onClick={() => setSelectedInstitution(null)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!selectedInstitution ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Todas</button>
        {institutions.map(i => (
          <button key={i} onClick={() => setSelectedInstitution(i === selectedInstitution ? null : i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedInstitution === i ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{i}</button>
        ))}
      </div>

      {loading ? (
        <SkeletonLoader count={4} type="card" />
      ) : error ? (
        <EmptyState title="Não foi possível carregar" description={error} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      ) : (
        <EmptyState title="Nenhum evento encontrado" description="Tente ajustar os filtros." />
      )}
    </div>
  );
};

export default Events;

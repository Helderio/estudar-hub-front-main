import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, FilterChip, FilterRow } from '@/shared/ui';
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
        setError(e?.response?.data?.message ?? 'O servidor não respondeu.');
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

  const hasFilters = !!(search || selectedType || selectedStatus || selectedInstitution);
  const clearFilters = () => {
    setSearch('');
    setSelectedType(null);
    setSelectedStatus(null);
    setSelectedInstitution(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Eventos"
        description="Hackathons, conferências e concursos nas instituições de Benguela."
        actions={
          <Link to="/create-event" className="btn-primary">
            <Plus size={16} aria-hidden /> Novo evento
          </Link>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar eventos" />
          </div>
          {institutions.length > 0 && (
            <select
              value={selectedInstitution ?? ''}
              onChange={(e) => setSelectedInstitution(e.target.value || null)}
              aria-label="Filtrar por instituição"
              className="field h-11 sm:w-56"
            >
              <option value="">Todas as instituições</option>
              {institutions.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          )}
        </div>

        <FilterRow label="Filtrar por tipo e estado">
          <FilterChip active={!selectedType} onClick={() => setSelectedType(null)}>
            Todos os tipos
          </FilterChip>
          {typeKeys.map((t) => (
            <FilterChip key={t} active={selectedType === t} onClick={() => setSelectedType(t === selectedType ? null : t)}>
              {EVENT_TYPES[t]}
            </FilterChip>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />
          <FilterChip active={selectedStatus === 'open'} onClick={() => setSelectedStatus(selectedStatus === 'open' ? null : 'open')}>
            <span className="h-1.5 w-1.5 rounded-full bg-rank-e" aria-hidden /> Inscrições abertas
          </FilterChip>
          <FilterChip active={selectedStatus === 'closed'} onClick={() => setSelectedStatus(selectedStatus === 'closed' ? null : 'closed')}>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden /> Encerrados
          </FilterChip>
        </FilterRow>
      </div>

      {loading ? (
        <SkeletonLoader count={4} type="card" />
      ) : error ? (
        <EmptyState title="Não foi possível carregar os eventos" description={`${error} Verifique a ligação e recarregue a página.`} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasFilters ? 'Nenhum evento com estes critérios' : 'Ainda não há eventos'}
          description={hasFilters ? 'Limpe os filtros para ver todos os eventos.' : 'Organiza algo na sua instituição? Publique o primeiro evento.'}
          action={
            hasFilters ? (
              <button onClick={clearFilters} className="btn-secondary">
                Limpar filtros
              </button>
            ) : (
              <Link to="/create-event" className="btn-primary">
                Novo evento
              </Link>
            )
          }
        />
      )}
    </div>
  );
};

export default Events;

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, CalendarDays, CheckCircle2, MapPin, Share2, UserMinus, UserPlus } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { UserCard } from '@/components/UserCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { EVENT_TYPES } from '@/types';
import type { EventType, UniversityEvent } from '@/types';
import { eventService } from '@/services/eventService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';
import { SonaCover, BackLink } from '@/shared/ui';

const typeColors: Record<EventType, string> = {
  hackathon: 'text-rank-s',
  conference: 'text-primary',
  contest: 'text-rank-b',
  games: 'text-rank-e',
};

const formatDate = (value?: string) => {
  if (!value) return 'Data por confirmar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const EventDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [event, setEvent] = useState<UniversityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = async (eventId: string, alive?: () => boolean) => {
    const res = await eventService.getById(eventId);
    const data = unwrapApiResponseOrRaw<UniversityEvent>(res);
    if (!alive || alive()) setEvent(data ?? null);
  };

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await loadEvent(id, () => active);
      } catch (e: any) {
        if (!active) return;
        setError(e?.response?.data?.message ?? 'O servidor não respondeu.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const isParticipating = useMemo(() => {
    if (!event || !user) return false;
    return event.participants?.some((participant) => String(participant.id) === String(user.id)) ?? false;
  }, [event, user]);

  const handleParticipation = async () => {
    if (!event) return;
    try {
      setActionLoading(true);
      if (isParticipating) {
        await eventService.leave(String(event.id));
        toast({ title: 'Inscrição cancelada' });
      } else {
        await eventService.participate(String(event.id));
        toast({ title: 'Inscrição feita' });
      }
      await loadEvent(String(event.id));
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Não foi possível actualizar a inscrição. Tente novamente.', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && event) {
        await navigator.share({ title: event.title, text: event.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: 'Ligação copiada' });
    } catch {
      toast({ title: 'Não foi possível partilhar o evento.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <BackLink to="/events" label="Eventos" />
        <div className="aspect-[3/1] animate-pulse rounded-lg bg-secondary" />
        <SkeletonLoader count={5} type="line" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <BackLink to="/events" label="Eventos" />
        <EmptyState
          title={error ? 'Não foi possível abrir o evento' : 'Este evento não existe'}
          description={error ?? 'Pode ter sido removido ou ainda não estar publicado.'}
          action={<Link to="/events" className="btn-primary">Ver eventos</Link>}
        />
      </div>
    );
  }

  const type = event.type in EVENT_TYPES ? event.type : 'conference';
  const participants = event.participants ?? [];
  const open = event.status === 'open';
  const d = new Date(event.date);
  const validDate = !Number.isNaN(d.getTime());

  const actions = (
    <div className="panel space-y-4 p-4">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <span className={`h-2 w-2 rounded-full ${open ? 'bg-rank-e' : 'bg-muted-foreground'}`} aria-hidden />
        {open ? 'Inscrições abertas' : 'Inscrições encerradas'}
      </p>
      <button type="button" onClick={handleParticipation} disabled={actionLoading || !open} className={isParticipating ? 'btn-secondary w-full' : 'btn-primary w-full'}>
        {isParticipating ? <UserMinus size={16} aria-hidden /> : <UserPlus size={16} aria-hidden />}
        {isParticipating ? 'Cancelar inscrição' : 'Inscrever-me'}
      </button>
      {isParticipating && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 size={14} className="text-rank-e" aria-hidden /> Está inscrito neste evento.
        </p>
      )}
      <button type="button" onClick={handleShare} className="btn-secondary w-full">
        <Share2 size={16} aria-hidden /> Partilhar
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <BackLink to="/events" label="Eventos" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <div className="min-w-0 space-y-8">
          <header className="flex gap-5">
            {validDate && (
              <time dateTime={event.date} className="hidden w-20 shrink-0 flex-col items-center rounded-lg border border-border bg-card py-3 sm:flex">
                <span className="text-xs font-medium text-muted-foreground">{d.toLocaleDateString('pt-AO', { month: 'short' }).replace('.', '')}</span>
                <span className="font-display text-3xl font-medium leading-none text-foreground">{d.getDate()}</span>
                <span className="mt-1 font-mono text-[11px] text-muted-foreground">{d.getFullYear()}</span>
              </time>
            )}
            <div className="min-w-0 space-y-3">
              <p className={`text-sm font-medium ${typeColors[type]}`}>{EVENT_TYPES[type]}</p>
              <h1 className="detail-title">{event.title}</h1>
              <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{event.description}</p>
            </div>
          </header>

          <div className="lg:hidden">{actions}</div>

          <div className="aspect-[16/7] overflow-hidden rounded-lg border border-border">
            {event.banner ? <img src={event.banner} alt="" className="h-full w-full object-cover" /> : <SonaCover seed={event.title} className="h-full w-full" />}
          </div>

          <section aria-labelledby="inscritos">
            <h2 id="inscritos" className="section-title mb-3 flex items-center gap-2">
              Inscritos <span className="font-mono text-sm font-normal text-muted-foreground">{participants.length}</span>
            </h2>
            {participants.length > 0 ? (
              <div className="grid gap-x-6 gap-y-0.5 border-t border-border pt-3 sm:grid-cols-2">
                {participants.map((participant) => (
                  <UserCard key={participant.id} user={participant} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{open ? 'Ainda ninguém se inscreveu. Seja o primeiro.' : 'Este evento não teve inscrições.'}</p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block">{actions}</div>

          <dl className="panel divide-y divide-border text-sm">
            <div className="flex gap-3 p-4">
              <CalendarDays size={17} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Data</dt>
                <dd className="font-medium text-foreground">{formatDate(event.date)}</dd>
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <MapPin size={17} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Local</dt>
                <dd className="font-medium text-foreground">{event.location || 'Por confirmar'}</dd>
              </div>
            </div>
            <div className="flex gap-3 p-4">
              <Building2 size={17} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Organização</dt>
                <dd className="font-medium text-foreground">{event.organizer || event.institution || 'Por confirmar'}</dd>
                {event.institution && event.organizer && event.institution !== event.organizer && <dd className="text-xs text-muted-foreground">{event.institution}</dd>}
              </div>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
};

export default EventDetails;

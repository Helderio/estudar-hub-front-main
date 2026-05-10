import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Share2,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { UserCard } from '@/components/UserCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { EVENT_TYPES } from '@/types';
import type { EventType, UniversityEvent } from '@/types';
import { eventService } from '@/services/eventService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';

const typeColors: Record<EventType, string> = {
  hackathon: 'bg-rank-s/15 text-rank-s',
  conference: 'bg-primary/15 text-primary',
  contest: 'bg-rank-c/15 text-rank-c',
  games: 'bg-rank-e/15 text-rank-e',
};

const formatDate = (value?: string) => {
  if (!value) return 'Data por confirmar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', {
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
        setError(e?.response?.data?.message ?? 'Falha ao carregar o evento.');
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
        toast({ title: 'Participação removida.' });
      } else {
        await eventService.participate(String(event.id));
        toast({ title: 'Participação registrada!' });
      }
      await loadEvent(String(event.id));
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Não foi possível atualizar a participação.', variant: 'destructive' });
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
      toast({ title: 'Link copiado.' });
    } catch {
      toast({ title: 'Não foi possível partilhar o evento.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-5xl">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Voltar aos eventos
        </Link>
        <div className="aspect-[3/1] rounded-2xl bg-muted/40" />
        <SkeletonLoader count={5} type="line" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Não foi possível carregar"
        description={error}
        action={<Link to="/events" className="text-sm font-medium text-primary hover:underline">Voltar aos eventos</Link>}
      />
    );
  }

  if (!event) {
    return (
      <EmptyState
        title="Evento não encontrado"
        description="Este evento pode ter sido removido ou ainda não está disponível."
        action={<Link to="/events" className="text-sm font-medium text-primary hover:underline">Voltar aos eventos</Link>}
      />
    );
  }

  const type = event.type in EVENT_TYPES ? event.type : 'conference';
  const participants = event.participants ?? [];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Voltar aos eventos
      </Link>

      <div className="relative aspect-[3/1] min-h-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-accent/20 to-rank-e/10 border border-border">
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-7xl font-bold text-primary/20">{event.title.charAt(0)}</span>
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className={`rounded-lg px-3 py-1 text-xs font-medium ${typeColors[type]}`}>{EVENT_TYPES[type]}</span>
          <span className={`rounded-lg px-3 py-1 text-xs font-medium ${event.status === 'open' ? 'bg-rank-e/15 text-rank-e' : 'bg-destructive/15 text-destructive'}`}>
            {event.status === 'open' ? 'Aberto' : 'Encerrado'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="font-display text-3xl font-bold text-foreground">{event.title}</h1>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <CalendarDays size={18} className="mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="text-sm font-medium text-foreground">{formatDate(event.date)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <MapPin size={18} className="mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Local</p>
              <p className="text-sm font-medium text-foreground">{event.location || 'Local por confirmar'}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Users size={18} className="mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Participantes</p>
              <p className="text-sm font-medium text-foreground">{participants.length}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-display font-semibold text-foreground mb-3">Participantes</h2>
            {participants.length > 0 ? (
              <div className="grid gap-1 sm:grid-cols-2">
                {participants.map((participant) => <UserCard key={participant.id} user={participant} compact />)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda não há participantes inscritos.</p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Organização</p>
              <p className="text-sm font-medium text-foreground">{event.organizer || event.institution || 'Organização por confirmar'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Instituição</p>
              <p className="text-sm font-medium text-foreground">{event.institution || event.institutionObj?.nome || 'Instituição por confirmar'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado da inscrição</p>
              <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                {isParticipating ? <CheckCircle2 size={16} className="text-rank-e" /> : <Clock size={16} className="text-muted-foreground" />}
                {isParticipating ? 'Estás a participar' : 'Ainda não estás inscrito'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleParticipation}
              disabled={actionLoading || event.status === 'closed'}
              className="inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isParticipating ? <UserMinus size={16} /> : <UserPlus size={16} />}
              {isParticipating ? 'Sair do evento' : 'Participar no evento'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              <Share2 size={16} /> Partilhar
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EventDetails;

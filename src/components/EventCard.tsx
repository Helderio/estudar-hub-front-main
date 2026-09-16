import { MapPin, Users } from 'lucide-react';
import type { UniversityEvent } from '@/types';
import { EVENT_TYPES } from '@/types';
import { Link } from 'react-router-dom';
import { SonaCover } from '@/shared/ui/brand';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: UniversityEvent;
}

export const eventTypeTone: Record<string, string> = {
  hackathon: 'text-rank-s',
  conference: 'text-primary',
  contest: 'text-rank-b',
  games: 'text-rank-e',
};

export const EventCard = ({ event }: EventCardProps) => {
  const d = new Date(event.date);
  const valid = !Number.isNaN(d.getTime());
  const open = event.status === 'open';

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
      <div className="relative aspect-[2/1] border-b border-border">
        {event.banner ? <img src={event.banner} alt="" loading="lazy" className="h-full w-full object-cover" /> : <SonaCover seed={event.title} className="h-full w-full" />}
        <span
          className={cn(
            'absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium shadow-sm',
            open ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', open ? 'bg-rank-e' : 'bg-muted-foreground')} />
          {open ? 'Inscrições abertas' : 'Encerrado'}
        </span>
      </div>

      <div className="flex flex-1 gap-4 p-4">
        {valid && (
          <time dateTime={event.date} className="flex w-12 shrink-0 flex-col items-center rounded-md border border-border py-1.5 text-center">
            <span className="text-[11px] font-medium text-muted-foreground">{d.toLocaleDateString('pt-AO', { month: 'short' }).replace('.', '')}</span>
            <span className="font-display text-lg font-medium leading-none text-foreground">{d.getDate()}</span>
          </time>
        )}
        <div className="min-w-0 flex-1">
          <p className={cn('text-xs font-medium', eventTypeTone[event.type] ?? 'text-primary')}>{EVENT_TYPES[event.type]}</p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-card-foreground">
            <Link to={`/events/${event.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} aria-hidden />
                {event.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={13} aria-hidden />
              <span className="font-mono">{event.participants?.length ?? 0}</span> inscritos
            </span>
          </div>
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-primary group-has-[a:focus-visible]:ring-2" aria-hidden />
    </article>
  );
};

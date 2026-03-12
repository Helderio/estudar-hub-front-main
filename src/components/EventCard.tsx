import { MapPin, Calendar, Users } from 'lucide-react';
import type { UniversityEvent } from '@/types';
import { EVENT_TYPES } from '@/types';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: UniversityEvent;
}

const typeColors: Record<string, string> = {
  hackathon: 'bg-rank-s/15 text-rank-s',
  conference: 'bg-primary/15 text-primary',
  contest: 'bg-rank-c/15 text-rank-c',
  games: 'bg-rank-e/15 text-rank-e',
};

export const EventCard = ({ event }: EventCardProps) => {
  return (
    <Link to={`/events`} className="group block">
      <div className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
        <div className="aspect-[2/1] bg-gradient-to-br from-primary/10 to-accent/20 relative flex items-center justify-center">
          <span className="text-5xl font-display font-bold text-primary/20">{event.title.charAt(0)}</span>
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${typeColors[event.type]}`}>{EVENT_TYPES[event.type]}</span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${event.status === 'open' ? 'bg-rank-e/15 text-rank-e' : 'bg-destructive/15 text-destructive'}`}>
              {event.status === 'open' ? 'Aberto' : 'Encerrado'}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-display font-bold text-card-foreground group-hover:text-primary transition-colors">{event.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar size={12} />{new Date(event.date).toLocaleDateString('pt-BR')}</span>
            <span className="flex items-center gap-1"><MapPin size={12} />{event.location}</span>
            <span className="flex items-center gap-1"><Users size={12} />{event.participants.length}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

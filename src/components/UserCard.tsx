import type { User } from '@/types';
import { RankBadge } from './RankBadge';
import { Link } from 'react-router-dom';

interface UserCardProps {
  user: User;
  compact?: boolean;
}

export const UserCard = ({ user, compact = false }: UserCardProps) => {
  if (compact) {
    return (
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.institution}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/profile/${user.id}`} className="block">
      <div className="rounded-xl border border-border bg-card p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary mx-auto mb-3">
          {user.name.charAt(0)}
        </div>
        <h4 className="font-display font-semibold text-card-foreground">{user.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{user.institution}{user.course ? ` · ${user.course}` : ''}</p>
        <div className="mt-3">
          <RankBadge rank={user.rank} size="sm" />
        </div>
      </div>
    </Link>
  );
};

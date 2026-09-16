import type { User } from '@/types';
import { RankBadge } from './RankBadge';
import { Link } from 'react-router-dom';
import { Avatar } from '@/shared/ui';

interface UserCardProps {
  user: User;
  compact?: boolean;
  /** Texto curto à direita, ex.: "Autor". */
  note?: string;
}

export const UserCard = ({ user, compact = false, note }: UserCardProps) => {
  if (compact) {
    return (
      <Link to={`/profile/${user.id}`} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary">
        <Avatar name={user.name} src={user.avatar} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{user.name}</span>
          {user.institution && <span className="block truncate text-xs text-muted-foreground">{user.institution}</span>}
        </span>
        {note && <span className="shrink-0 text-xs text-muted-foreground">{note}</span>}
      </Link>
    );
  }

  return (
    <Link to={`/profile/${user.id}`} className="panel flex items-center gap-4 p-4 transition-colors hover:border-primary/50">
      <Avatar name={user.name} src={user.avatar} size="lg" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-card-foreground">{user.name}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {[user.institution, user.course].filter(Boolean).join(', ')}
        </span>
      </span>
      {user.rank && <RankBadge rank={user.rank} size="sm" showTooltip={false} />}
    </Link>
  );
};

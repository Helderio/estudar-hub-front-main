import { Link, useLocation } from 'react-router-dom';
import { FolderKanban, CalendarDays, MessageCircle, User, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const items = [
    { to: '/dashboard', match: ['/dashboard', '/projects', '/create-project'], icon: FolderKanban, label: 'Projectos' },
    { to: '/events', match: ['/events', '/create-event'], icon: CalendarDays, label: 'Eventos' },
    { to: '/people', match: ['/people'], icon: Users, label: 'Pessoas' },
    { to: '/chat', match: ['/chat'], icon: MessageCircle, label: 'Chat' },
    { to: user ? `/profile/${user.id}` : '/login', match: ['/profile', '/edit-profile'], icon: User, label: 'Perfil' },
  ];

  return (
    <nav aria-label="Principal" className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm lg:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5">
        {items.map((item) => {
          const active = item.match.some((m) => location.pathname.startsWith(m));
          return (
            <Link
              key={item.label}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn('relative flex flex-col items-center justify-center gap-1 transition-colors', active ? 'text-foreground' : 'text-muted-foreground')}
            >
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
              <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} className={cn(active && 'text-primary')} />
              <span className={cn('text-[11px]', active ? 'font-semibold' : 'font-medium')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

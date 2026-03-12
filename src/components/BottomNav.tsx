import { Link, useLocation } from 'react-router-dom';
import { Home, FolderKanban, CalendarDays, MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard', icon: FolderKanban, label: 'Projectos', match: '/dashboard' },
  { to: '/events', icon: CalendarDays, label: 'Eventos' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
];

export const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const allItems = [
    ...navItems,
    { to: `/profile/${user?.id || '1'}`, icon: User, label: 'Perfil', match: '/profile' },
  ];

  // Remove duplicate dashboard
  const items = allItems.filter((item, i) => i !== 1);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const matchPath = (item as any).match || item.to;
          const isActive = location.pathname === item.to || location.pathname.startsWith(matchPath);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

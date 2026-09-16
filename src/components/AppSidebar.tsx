import { Link, useLocation } from 'react-router-dom';
import { FolderKanban, FolderPlus, CalendarDays, CalendarPlus, User, PanelLeftClose, PanelLeftOpen, Mail, Building2, MessageCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { WASignature } from '@/shared/ui/brand';
import { cn } from '@/lib/utils';

type Item = { to: string; icon: typeof FolderKanban; label: string };

const groups: Array<{ label: string; items: Item[] }> = [
  {
    label: 'Explorar',
    items: [
      { to: '/dashboard', icon: FolderKanban, label: 'Projectos' },
      { to: '/events', icon: CalendarDays, label: 'Eventos' },
      { to: '/institutions', icon: Building2, label: 'Instituições' },
      { to: '/people', icon: Users, label: 'Pessoas' },
    ],
  },
  {
    label: 'Publicar',
    items: [
      { to: '/create-project', icon: FolderPlus, label: 'Novo projecto' },
      { to: '/create-event', icon: CalendarPlus, label: 'Novo evento' },
    ],
  },
  {
    label: 'Contactos',
    items: [
      { to: '/chat', icon: MessageCircle, label: 'Chat' },
      { to: '/invitations', icon: Mail, label: 'Convites' },
    ],
  },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (to: string) => {
    if (to === '/events') return location.pathname === '/events' || /^\/events\/[^/]+$/.test(location.pathname);
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const renderItem = (item: Item) => {
    const active = isActive(item.to);
    return (
      <Link
        key={item.to}
        to={item.to}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? item.label : undefined}
        className={cn(
          'relative flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
          active ? 'bg-secondary font-semibold text-foreground' : 'font-medium text-muted-foreground hover:bg-secondary/70 hover:text-foreground',
          collapsed && 'justify-center px-0',
        )}
      >
        {active && <span className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />}
        <item.icon size={17} className={cn('shrink-0', active && 'text-primary')} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <nav aria-label="Principal" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-1.5 px-3 text-xs font-medium text-muted-foreground/80">{group.label}</p>
            ) : (
              <div className="mx-auto mb-2 h-px w-6 bg-border" />
            )}
            <div className="space-y-0.5">{group.items.map(renderItem)}</div>
          </div>
        ))}
        {user && <div className="space-y-0.5 border-t border-border pt-4">{renderItem({ to: `/profile/${user.id}`, icon: User, label: 'O meu perfil' })}</div>}
      </nav>

      <div className={cn('flex items-center border-t border-border px-3 py-3', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && <WASignature className="pl-3 text-xs" />}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
    </aside>
  );
};

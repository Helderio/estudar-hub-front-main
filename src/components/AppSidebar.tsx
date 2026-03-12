import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderPlus, CalendarDays, User, ChevronLeft, ChevronRight, Mail, Building2, MessageCircle, CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/create-project', icon: FolderPlus, label: 'Criar Projecto' },
  { to: '/events', icon: CalendarDays, label: 'Eventos' },
  { to: '/create-event', icon: CalendarPlus, label: 'Criar Evento' },
  { to: '/institutions', icon: Building2, label: 'Instituições' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/invitations', icon: Mail, label: 'Convites' },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className={`hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-border bg-card transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex-1 py-4 space-y-1 px-2">
        {menuItems.map(item => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        {user && (
          <Link
            to={`/profile/${user.id}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname.startsWith('/profile') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <User size={18} className="shrink-0" />
            {!collapsed && <span>Meu Perfil</span>}
          </Link>
        )}
      </div>
      <button
        onClick={() => setCollapsed(c => !c)}
        className="p-3 border-t border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

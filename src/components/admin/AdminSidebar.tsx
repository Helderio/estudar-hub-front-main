import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FolderKanban,
  Building2,
  CalendarDays,
  Tag,
  Trophy,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/users', icon: Users, label: 'Usuários' },
  { to: '/admin/projects', icon: FolderKanban, label: 'Projetos' },
  { to: '/admin/institutions', icon: Building2, label: 'Instituições' },
  { to: '/admin/events', icon: CalendarDays, label: 'Eventos' },
  { to: '/admin/categories', icon: Tag, label: 'Categorias' },
  { to: '/admin/rankings', icon: Trophy, label: 'Rankings' },
  { to: '/admin/settings', icon: Settings, label: 'Configurações' },
];

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-card transition-all duration-300 z-30',
        collapsed ? 'w-[68px]' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <GraduationCap size={18} className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            EstudarHub
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="h-12 flex items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

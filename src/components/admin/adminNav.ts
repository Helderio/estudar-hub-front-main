import { LayoutDashboard, BarChart3, Users, FolderKanban, Building2, CalendarDays, Tag, Trophy, Settings, BookOpen } from 'lucide-react';

export const adminNavGroups = [
  {
    label: 'Visão geral',
    items: [
      { to: '/admin', icon: LayoutDashboard, label: 'Painel', end: true },
      { to: '/admin/analytics', icon: BarChart3, label: 'Estatísticas' },
    ],
  },
  {
    label: 'Conteúdo',
    items: [
      { to: '/admin/users', icon: Users, label: 'Utilizadores' },
      { to: '/admin/projects', icon: FolderKanban, label: 'Projectos' },
      { to: '/admin/events', icon: CalendarDays, label: 'Eventos' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { to: '/admin/institutions', icon: Building2, label: 'Instituições' },
      { to: '/admin/courses', icon: BookOpen, label: 'Cursos' },
      { to: '/admin/categories', icon: Tag, label: 'Categorias' },
      { to: '/admin/rankings', icon: Trophy, label: 'Ranks' },
    ],
  },
  {
    label: 'Sistema',
    items: [{ to: '/admin/settings', icon: Settings, label: 'Configurações' }],
  },
];

export const adminNavItems = adminNavGroups.flatMap((g) => g.items);

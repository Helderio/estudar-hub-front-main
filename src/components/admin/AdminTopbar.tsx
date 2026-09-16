import { ArrowUpRight, ChevronDown, LogOut, Moon, Sun, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar, Logo } from '@/shared/ui';
import { cn } from '@/lib/utils';
import { adminNavItems } from './adminNav';

const periods = [
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
  { label: 'Últimos 90 dias', value: '90d' },
  { label: 'Último ano', value: '1y' },
] as const;

interface AdminTopbarProps {
  period: string;
  onPeriodChange: (v: string) => void;
}

export const AdminTopbar = ({ period, onPeriodChange }: AdminTopbarProps) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const currentLabel = periods.find((p) => p.value === period)?.label ?? 'Últimos 30 dias';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <span className="lg:hidden">
            <Logo to="/admin" compact />
          </span>
          <p className="text-sm font-semibold text-foreground">Administração</p>
        </div>

        <div className="flex items-center gap-1.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <span className="hidden sm:inline">{currentLabel}</span>
                <span className="sm:hidden">{period}</span>
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Período dos gráficos</DropdownMenuLabel>
              {periods.map((p) => (
                <DropdownMenuItem key={p.value} onClick={() => onPeriodChange(p.value)} className={period === p.value ? 'font-semibold' : ''}>
                  {p.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-secondary" aria-label="Menu da conta">
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
                <span className="hidden max-w-32 truncate text-sm font-medium text-foreground sm:inline">{user?.name ?? 'Administrador'}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/dashboard">
                  <ArrowUpRight size={15} className="mr-2" /> Voltar à aplicação
                </Link>
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${user.id}`}>
                    <User size={15} className="mr-2" /> O meu perfil
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                <LogOut size={15} className="mr-2" /> Terminar sessão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Sem barra lateral abaixo de lg: navegação em linha */}
      <nav aria-label="Administração" className="flex gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:hidden">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium',
                isActive ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground',
              )
            }
          >
            <item.icon size={13} /> {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

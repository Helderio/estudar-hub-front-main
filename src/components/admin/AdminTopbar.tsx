import { Search, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const periods = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
  { label: '1 ano', value: '1y' },
] as const;

interface AdminTopbarProps {
  period: string;
  onPeriodChange: (v: string) => void;
}

export const AdminTopbar = ({ period, onPeriodChange }: AdminTopbarProps) => {
  const [search, setSearch] = useState('');
  const currentLabel = periods.find((p) => p.value === period)?.label ?? '30 dias';

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
        />
      </div>

      <div className="flex items-center gap-3 ml-4">
        {/* Period filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-sm font-medium">
              {currentLabel}
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {periods.map((p) => (
              <DropdownMenuItem
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={period === p.value ? 'bg-primary/10 text-primary' : ''}
              >
                {p.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </Button>

        {/* Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/60 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                A
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:inline">Admin</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

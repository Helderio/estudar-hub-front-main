import { Outlet } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Logo, Lusona, WASignature } from '@/shared/ui/brand';
import { RankDiamond } from '@/components/RankBadge';
import type { Rank } from '@/types';

const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

export const AuthLayout = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="grid min-h-screen bg-background transition-theme lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-4 md:px-10">
          <Logo />
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="flex flex-1 items-center justify-center px-5 py-10 md:px-10">
          <Outlet />
        </main>
        <footer className="px-5 py-5 md:px-10">
          <WASignature className="text-xs" />
        </footer>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-border bg-secondary lg:flex lg:flex-col lg:justify-between">
        <div className="sona-dots absolute inset-0 opacity-70" aria-hidden />
        <div className="relative px-12 pt-16">
          <Lusona cols={7} rows={4} className="w-full max-w-[520px]" strokeWidth={1.75} dotClassName="text-foreground/35" draw />
        </div>
        <div className="relative space-y-6 px-12 pb-14">
          <p className="font-display text-[26px] font-medium leading-snug text-foreground max-w-[18ch]">
            Do primeiro exercício à investigação científica.
          </p>
          <div className="flex items-center gap-3" aria-label="Níveis de rank, de E a S">
            {ranks.map((r) => (
              <RankDiamond key={r} rank={r} size="md" />
            ))}
          </div>
          <p className="max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
            Cada projecto publicado no EstudarHub recebe um rank de E a S, conforme a complexidade do trabalho.
          </p>
        </div>
      </aside>
    </div>
  );
};

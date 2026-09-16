import { cn } from '@/lib/utils';

interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

/** Botão de filtro alternável. */
export const FilterChip = ({ active, className, children, ...props }: FilterChipProps) => (
  <button
    type="button"
    aria-pressed={active}
    className={cn(
      'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors',
      active ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

/** Linha de filtros: desliza na horizontal no telemóvel, quebra linha a partir de sm. */
export const FilterRow = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div
    role="group"
    aria-label={label}
    className={cn('-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0', className)}
  >
    {children}
  </div>
);

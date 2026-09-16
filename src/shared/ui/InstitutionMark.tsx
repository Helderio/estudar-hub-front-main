import { cn } from '@/lib/utils';

/** Monograma da instituição (ou o logótipo, se existir). */
export const InstitutionMark = ({ sigla, logo, size = 'md', className }: { sigla?: string; logo?: string; size?: 'md' | 'lg'; className?: string }) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary font-display font-medium text-foreground',
      size === 'md' ? 'h-11 w-11' : 'h-16 w-16',
      size === 'md' ? ((sigla?.length ?? 0) > 4 ? 'text-[9px]' : 'text-[11px]') : (sigla?.length ?? 0) > 4 ? 'text-[11px]' : 'text-sm',
      className,
    )}
    aria-hidden
  >
    {logo ? <img src={logo} alt="" className="h-full w-full object-contain p-1.5" /> : (sigla ?? '?').slice(0, 5)}
  </span>
);

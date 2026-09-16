import type { Rank } from '@/types';
import { RANK_INFO } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const rankTone: Record<Rank, string> = {
  E: 'text-rank-e',
  D: 'text-rank-d',
  C: 'text-rank-c',
  B: 'text-rank-b',
  A: 'text-rank-a',
  S: 'text-rank-s',
};

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  /** Mostra o nome do nível ao lado do losango. */
  withLabel?: boolean;
  className?: string;
}

const dims = {
  sm: { box: 'h-7 w-7', letter: 'text-[11px]', label: 'text-xs' },
  md: { box: 'h-8 w-8', letter: 'text-xs', label: 'text-sm' },
  lg: { box: 'h-11 w-11', letter: 'text-base', label: 'text-sm' },
};

/** Losango sona com a letra do rank. A cor vem do nível. */
export const RankDiamond = ({ rank, size = 'md', className }: { rank: Rank; size?: RankBadgeProps['size']; className?: string }) => (
  <span className={cn('relative inline-grid place-items-center shrink-0', dims[size].box, rankTone[rank], className)}>
    <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" aria-hidden>
      <path d="M20 2.5 37.5 20 20 37.5 2.5 20Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
    <span className={cn('relative font-display font-semibold leading-none', dims[size].letter)}>{rank}</span>
  </span>
);

export const RankBadge = ({ rank, size = 'md', showTooltip = true, withLabel, className }: RankBadgeProps) => {
  const showLabel = withLabel ?? size !== 'sm';
  const info = RANK_INFO[rank];

  const badge = (
    <span
      className={cn('inline-flex items-center gap-2 align-middle', className)}
      aria-label={`Rank ${rank}: ${info.label}`}
      tabIndex={showTooltip ? 0 : undefined}
    >
      <RankDiamond rank={rank} size={size} />
      {showLabel &&
        (size === 'lg' ? (
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">Rank {rank}</span>
            <span className="text-xs text-muted-foreground">{info.label}</span>
          </span>
        ) : (
          <span className={cn('font-medium text-foreground', dims[size].label)}>Rank {rank}</span>
        ))}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="max-w-60">
        <p className="font-semibold">
          Rank {rank}: {info.label}
        </p>
        <p className="text-xs text-muted-foreground">{info.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

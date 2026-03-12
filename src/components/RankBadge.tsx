import type { Rank } from '@/types';
import { RANK_INFO } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const rankStyles: Record<Rank, string> = {
  E: 'bg-rank-e/15 text-rank-e border-rank-e/30',
  D: 'bg-rank-d/15 text-rank-d border-rank-d/30',
  C: 'bg-rank-c/15 text-rank-c border-rank-c/30',
  B: 'bg-rank-b/15 text-rank-b border-rank-b/30',
  A: 'bg-rank-a/15 text-rank-a border-rank-a/30',
  S: 'bg-rank-s/15 text-rank-s border-rank-s/30',
};

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const RankBadge = ({ rank, size = 'md', showTooltip = true }: RankBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5 font-bold',
  };

  const badge = (
    <span className={`inline-flex items-center gap-1 font-display font-bold border rounded-lg transition-theme ${rankStyles[rank]} ${sizeClasses[size]}`}>
      Rank {rank}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{RANK_INFO[rank].label}</p>
        <p className="text-xs text-muted-foreground">{RANK_INFO[rank].description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  description?: string;
}

export const StatCard = ({ title, value, change, icon: Icon, description }: StatCardProps) => {
  const safeChange = Number.isFinite(change) ? change : 0;
  const isPositive = safeChange >= 0;

  return (
    <div className="panel p-4 md:p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon size={15} aria-hidden /> {title}
      </p>
      <p className="mt-3 font-display text-[26px] font-medium leading-none md:text-[32px] text-foreground">{value}</p>
      <p className="mt-3 flex items-center gap-1.5 text-xs">
        <span className={cn('inline-flex items-center gap-0.5 font-mono font-medium', isPositive ? 'text-success' : 'text-destructive')}>
          {isPositive ? <TrendingUp size={13} aria-hidden /> : <TrendingDown size={13} aria-hidden />}
          {isPositive ? '+' : ''}
          {safeChange}%
        </span>
        <span className="hidden text-muted-foreground sm:inline">{description ?? 'face ao período anterior'}</span>
      </p>
    </div>
  );
};

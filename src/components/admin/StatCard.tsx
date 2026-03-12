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
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-sm">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 font-medium',
            isPositive ? 'text-success' : 'text-destructive'
          )}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {isPositive ? '+' : ''}
          {change}%
        </span>
        <span className="text-muted-foreground">{description ?? 'vs período anterior'}</span>
      </div>
    </div>
  );
};

import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { EstudarHubMark } from './EstudarHubMark';

interface LogoProps {
  to?: string;
  className?: string;
  compact?: boolean;
}

export const Logo = ({ to = '/', className, compact = false }: LogoProps) => (
  <Link to={to} className={cn('inline-flex items-center gap-2.5 rounded-md', className)} aria-label="EstudarHub, página inicial">
    <EstudarHubMark className="h-8 w-8" title="" />
    {!compact && (
      <span className="font-display text-[15px] font-medium tracking-tight text-foreground">
        Estudar<span className="text-primary">Hub</span>
      </span>
    )}
  </Link>
);

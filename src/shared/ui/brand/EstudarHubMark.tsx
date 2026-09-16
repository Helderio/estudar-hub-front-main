import { cn } from '@/lib/utils';

interface MarkProps {
  className?: string;
  title?: string;
}

/**
 * Símbolo do EstudarHub: o losango da família WA.S com quatro pontos sona
 * à volta de um centro — o "hub". O ponto central leva o latão da família.
 */
export const EstudarHubMark = ({ className, title = 'EstudarHub' }: MarkProps) => (
  <svg viewBox="0 0 32 32" className={cn('shrink-0', className)} role="img" aria-label={title}>
    <path
      d="M16 2.75 29.25 16 16 29.25 2.75 16Z"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="2.25"
      strokeLinejoin="round"
    />
    <path
      d="M16 9.5c3.6 0 6.5 2.9 6.5 6.5M16 22.5c-3.6 0-6.5-2.9-6.5-6.5"
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <g fill="hsl(var(--primary))">
      <circle cx="16" cy="9.5" r="1.55" />
      <circle cx="22.5" cy="16" r="1.55" />
      <circle cx="16" cy="22.5" r="1.55" />
      <circle cx="9.5" cy="16" r="1.55" />
    </g>
    <circle cx="16" cy="16" r="2.4" fill="hsl(var(--brass))" />
  </svg>
);

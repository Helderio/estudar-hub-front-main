import { cn } from '@/lib/utils';

/** Assinatura da família: indica que o produto é feito pela WA.S. */
export const WASignature = ({ className }: { className?: string }) => (
  <a
    href="https://helderiodev.vercel.app"
    target="_blank"
    rel="noopener noreferrer"
    className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors', className)}
  >
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
      <path d="M6 .75 11.25 6 6 11.25.75 6Z" fill="none" stroke="hsl(var(--brass))" strokeWidth="1.5" />
      <circle cx="6" cy="6" r="1.4" fill="hsl(var(--brass))" />
    </svg>
    <span>
      Um produto <span className="font-display text-[0.85em] font-medium tracking-wide text-brass">WA.S</span>
    </span>
  </a>
);

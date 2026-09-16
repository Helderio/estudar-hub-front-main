import { cn } from '@/lib/utils';
import { Lusona } from './Lusona';

interface SonaCoverProps {
  /** Texto usado para escolher a grelha de forma estável (ex.: título). */
  seed: string;
  className?: string;
  children?: React.ReactNode;
}

// Grelhas com mdc = 1 → uma só linha contínua.
const GRIDS: Array<[number, number]> = [
  [5, 3],
  [4, 3],
  [5, 2],
  [7, 3],
  [5, 4],
  [7, 4],
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/** Capa por omissão para projectos e eventos sem imagem. */
export const SonaCover = ({ seed, className, children }: SonaCoverProps) => {
  const [cols, rows] = GRIDS[hash(seed) % GRIDS.length];
  return (
    <div className={cn('relative overflow-hidden bg-secondary', className)}>
      <div className="sona-dots absolute inset-0 opacity-60" aria-hidden />
      {/* Absoluto para o desenho nunca influenciar a altura da capa */}
      <div className="absolute inset-x-[10%] inset-y-[20%] flex items-center justify-center">
        <Lusona
          cols={cols}
          rows={rows}
          className="h-full max-h-full w-auto max-w-full"
          lineClassName="text-primary/70"
          dotClassName="text-foreground/45"
          strokeWidth={1.75}
        />
      </div>
      {children}
    </div>
  );
};

import { useEffect, useMemo, useRef } from 'react';
import { lusona } from '@/shared/lib/sona';
import { cn } from '@/lib/utils';

interface LusonaProps {
  cols?: number;
  rows?: number;
  className?: string;
  /** Classe aplicada à linha contínua (cor via `text-*`). */
  lineClassName?: string;
  /** Classe aplicada aos pontos (cor via `text-*`). */
  dotClassName?: string;
  strokeWidth?: number;
  /** Desenha a linha uma vez, no carregamento. Respeita `prefers-reduced-motion`. */
  draw?: boolean;
  title?: string;
}

/**
 * Desenho sona: pontos numa grelha e uma única linha que os contorna.
 * É o elemento visual da família WA.S; no EstudarHub usa o azul do produto.
 */
export const Lusona = ({
  cols = 5,
  rows = 3,
  className,
  lineClassName = 'text-primary',
  dotClassName = 'text-foreground/70',
  strokeWidth = 2,
  draw = false,
  title,
}: LusonaProps) => {
  const g = useMemo(() => lusona(cols, rows), [cols, rows]);
  const pathRef = useRef<SVGPathElement>(null);

  // Desenho da linha: medido em unidades reais e limpo no fim, para não depender
  // de `pathLength` (que alguns navegadores escalam mal em capturas e no Safari).
  useEffect(() => {
    const el = pathRef.current;
    if (!draw || !el || typeof el.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len} ${len}`;
    const anim = el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], {
      duration: 2400,
      delay: 200,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      fill: 'backwards',
    });
    const clear = () => {
      el.style.strokeDasharray = '';
    };
    anim.onfinish = clear;
    return () => {
      anim.cancel();
      clear();
    };
  }, [draw, g.path]);

  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      className={cn('block', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        d={g.path}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        ref={pathRef}
        className={lineClassName}
      />
      <g className={dotClassName} fill="currentColor">
        {g.dots.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={strokeWidth * 1.15} />
        ))}
      </g>
    </svg>
  );
};

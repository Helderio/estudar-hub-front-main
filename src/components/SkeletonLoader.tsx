interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'line' | 'avatar';
}

export const SkeletonLoader = ({ count = 3, type = 'card' }: SkeletonLoaderProps) => {
  if (type === 'line') {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="A carregar">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-secondary" style={{ width: `${80 - i * 15}%` }} />
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className="flex gap-3" aria-busy="true" aria-label="A carregar">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="A carregar">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="sona-dots aspect-[16/9] animate-pulse border-b border-border bg-secondary" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-full animate-pulse rounded bg-secondary" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
};

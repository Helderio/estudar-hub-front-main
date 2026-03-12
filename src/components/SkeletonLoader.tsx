interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'line' | 'avatar';
}

export const SkeletonLoader = ({ count = 3, type = 'card' }: SkeletonLoaderProps) => {
  if (type === 'line') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded-lg animate-pulse" style={{ width: `${80 - i * 15}%` }} />
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className="flex gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-10 h-10 bg-muted rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
          <div className="aspect-video bg-muted" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-muted rounded w-1/4" />
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

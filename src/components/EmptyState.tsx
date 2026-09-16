import { Lusona } from '@/shared/ui/brand';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = ({ title = 'Nada por aqui', description = 'Ajuste os filtros para ver mais resultados.', icon, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <div className="mb-5 text-muted-foreground">{icon ?? <Lusona cols={3} rows={2} className="h-14 w-auto" strokeWidth={1.75} lineClassName="text-primary/60" dotClassName="text-foreground/40" />}</div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

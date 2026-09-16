import { cn } from '@/lib/utils';

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Rótulo + controlo + erro. Definido fora das páginas para o React não recriar o campo a cada tecla. */
export const Field = ({ id, label, error, hint, required, className, children }: FieldProps) => (
  <div className={className}>
    <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium text-foreground">
      <span>
        {label}
        {required && (
          <span className="text-muted-foreground" aria-hidden>
            {' '}
            *
          </span>
        )}
      </span>
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
    {children}
    {error && (
      <p id={`${id}-erro`} className="mt-1.5 text-xs text-destructive">
        {error}
      </p>
    )}
  </div>
);

/** Secção de formulário: descrição à esquerda, campos à direita (empilha no telemóvel). */
export const FormSection = ({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) => (
  <section className={cn('grid gap-5 border-t border-border py-8 first:border-t-0 first:pt-0 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10', className)}>
    <div>
      <h2 className="section-title">{title}</h2>
      {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

/** Barra de acções no fim de um formulário. */
export const FormActions = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:justify-end">{children}</div>
);

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { to: string; label: string };
}

/** Cabeçalho comum das páginas da aplicação. */
export const PageHeader = ({ title, description, actions, back }: PageHeaderProps) => (
  <header className="space-y-4">
    {back && <BackLink to={back.to} label={back.label} />}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-1.5 max-w-[60ch] text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  </header>
);

export const BackLink = ({ to, label }: { to: string; label: string }) => (
  <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
    <ArrowLeft size={15} aria-hidden /> {label}
  </Link>
);

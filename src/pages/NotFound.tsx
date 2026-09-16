import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Lusona, Logo } from '@/shared/ui/brand';
import { useAuth } from '@/context/AuthContext';

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.error('404: rota inexistente', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-5 py-4 md:px-10">
        <Logo />
      </header>
      <main className="flex flex-1 items-center px-5 md:px-10">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-2">
          <div>
            <p className="font-mono text-sm text-muted-foreground">Erro 404</p>
            <h1 className="mt-3 text-[34px] leading-tight text-foreground md:text-[44px]">Esta página não existe.</h1>
            <p className="mt-4 max-w-[44ch] text-muted-foreground">
              O endereço <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[13px] text-foreground">{location.pathname}</code> pode ter mudado ou o
              projecto foi removido.
            </p>
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-accent"
            >
              {isAuthenticated ? 'Voltar aos projectos' : 'Ir para a página inicial'}
            </Link>
          </div>
          <div className="sona-dots rounded-xl p-8">
            <Lusona cols={4} rows={3} className="w-full" strokeWidth={2} lineClassName="text-primary/50" dotClassName="text-foreground/50" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;

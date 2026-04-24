import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';

const TOKEN_STORAGE_KEY = 'token';

function parseFragment(hash: string): Record<string, string> {
  const h = (hash ?? '').trim().replace(/^#/, '');
  const out: Record<string, string> = {};
  if (!h) return out;
  for (const part of h.split('&')) {
    const [k, v] = part.split('=');
    if (!k) continue;
    out[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }
  return out;
}

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => parseFragment(window.location.hash), []);

  useEffect(() => {
    // Remove fragment from address bar ASAP.
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

    const run = async () => {
      const fragmentError = params.error;
      if (fragmentError) {
        setError(fragmentError);
        toast({ title: 'Falha no login', description: fragmentError, variant: 'destructive' });
        setTimeout(() => navigate('/login', { replace: true }), 1200);
        return;
      }

      const token = params.token;
      if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);

      try {
        const res = await authService.me();
        const profile = (res.data as any)?.data;
        if (!profile) throw new Error('Perfil vazio.');

        updateUser(profile);
        toast({ title: 'Login realizado com sucesso!' });

        const role = (profile as any)?.role as string | undefined;
        navigate(role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setError('Não foi possível concluir o login. Tente novamente.');
        setTimeout(() => navigate('/login', { replace: true }), 1200);
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 text-center">
        {!error ? (
          <>
            <Loader2 size={20} className="animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">A concluir o login…</p>
          </>
        ) : (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground">Você será redirecionado para o login.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuth2Callback;


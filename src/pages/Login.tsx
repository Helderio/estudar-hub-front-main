import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Indique o seu email.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Este email não parece válido.';
    if (!password) e.password = 'Indique a sua palavra-passe.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast({ title: 'Sessão iniciada' });
      navigate('/dashboard');
    } catch {
      toast({ title: 'Não foi possível entrar', description: 'O email ou a palavra-passe estão incorrectos.', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-[380px] animate-fade-in">
      <h1 className="font-display text-[28px] font-medium text-foreground">Entrar</h1>
      <p className="mt-2 text-sm text-muted-foreground">Continue onde ficou nos seus projectos.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            placeholder="nome@instituicao.ao"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-erro' : undefined}
          />
          {errors.email && (
            <p id="email-erro" className="mt-1.5 text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
            Palavra-passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field pr-11"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-erro' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
              className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p id="password-erro" className="mt-1.5 text-xs text-destructive">
              {errors.password}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {isLoading && <Loader2 size={17} className="animate-spin" />}
          Entrar
        </button>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
        Ainda não tem conta?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
};

export default Login;

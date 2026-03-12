import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Github, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { login, loginWithGoogle, loginWithGithub, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email inválido';
    if (!password) e.password = 'Senha é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(email, password);
      toast({ title: 'Bem-vindo de volta!' });
      navigate('/dashboard');
    } catch {
      toast({ title: 'Erro ao entrar', description: 'Verifique as suas credenciais.', variant: 'destructive' });
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') await loginWithGoogle();
      else await loginWithGithub();
      toast({ title: 'Login realizado com sucesso!' });
      navigate('/dashboard');
    } catch {
      toast({ title: 'Erro no login', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Entrar na sua conta</h1>
        <p className="text-sm text-muted-foreground mt-2">Acesse os seus projectos e continue a aprender.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleOAuth('google')} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google
          </button>
          <button onClick={() => handleOAuth('github')} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50">
            <Github size={16} /> GitHub
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs"><span className="px-2 bg-card text-muted-foreground">ou continue com email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" placeholder="seu@email.com" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta? <Link to="/register" className="text-primary font-medium hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

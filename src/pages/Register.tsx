import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Github, Loader2, ChevronRight, ChevronLeft, Check, Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { institutionService } from '@/services/institutionService';
import { courseService } from '@/services/courseService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';

type InstitutionOption = {
  id: string; // backend envia como string (normalmente numero em string)
  nome: string;
};

function getApiErrorMessage(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  if (!('response' in err)) return undefined;

  const response = (err as { response?: unknown }).response;
  if (!response || typeof response !== 'object') return undefined;
  if (!('data' in response)) return undefined;

  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return undefined;
  if (!('message' in data)) return undefined;

  const message = (data as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}

const steps = [
  { title: 'Dados Básicos', subtitle: 'Informações pessoais' },
  { title: 'Conta', subtitle: 'Credenciais de acesso' },
  { title: 'Dados Académicos', subtitle: 'Informação da instituição' },
  { title: 'Opcional', subtitle: 'Informações adicionais' },
];

const institutionFallback: InstitutionOption[] = [
  // Backend seeds at least `id=1` (V3__seed_default_institution.sql).
  { id: '1', nome: 'EstudarHub Default Institution' },
];

type CourseOption = { id: number; nome: string; area?: string };

const courseFallback: CourseOption[] = [
  { id: 1, nome: 'Engenharia Informatica', area: 'Engenharia' },
  { id: 2, nome: 'Direito', area: 'Ciencias Sociais' },
  { id: 3, nome: 'Medicina', area: 'Saude' },
];

const Register = () => {
  const { register, loginWithGoogle, loginWithGithub, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [institutionOptions, setInstitutionOptions] = useState<InstitutionOption[]>(institutionFallback);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>(courseFallback);
// Estado do form — adiciona username
const [form, setForm] = useState({
  username: '',
  name: '', email: '', phone: '', password: '', confirmPassword: '',
  institution: '', course: '', year: '',
  userType: 'student' as 'student' | 'professor',
  github: '', linkedin: '', portfolio: '', bio: '',
});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await institutionService.getAll({ size: 200 });
        const page = unwrapApiResponseOrRaw<PageResponse<InstitutionOption>>(res);
        const content = page?.content || [];
        if (!cancelled && content.length > 0) setInstitutionOptions(content);
      } catch {
        // Mantem fallback para UX, mas o backend precisa estar vivo para registrar.
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await courseService.getAll({ size: 200 });
        const page = unwrapApiResponseOrRaw<PageResponse<CourseOption>>(res);
        const content = page?.content || [];
        if (!cancelled && content.length > 0) setCourseOptions(content);
      } catch {
        // fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.username.trim()) e.username = 'Username é obrigatório';
      if (!form.name.trim()) e.name = 'Nome é obrigatório';
      if (!form.email) e.email = 'Email é obrigatório';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
      if (!form.phone) e.phone = 'Telefone é obrigatório';
    }
    if (step === 1) {
      if (!form.password) e.password = 'Senha é obrigatória';
      else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Senhas não coincidem';
    }
    if (step === 2) {
      if (!form.institution) e.institution = 'Instituição é obrigatória';
      if (!form.course) e.course = 'Curso é obrigatório';
      if (!form.year) e.year = 'Ano académico é obrigatório';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) setStep(s => s + 1);
    else handleSubmit();
  };

// handleSubmit — mapeia para o backend
	const handleSubmit = async () => {
	  try {
    const institutionId = Number(form.institution);
    if (!Number.isFinite(institutionId) || institutionId <= 0) {
      toast({ title: 'Selecione uma instituição válida.', variant: 'destructive' });
      return;
    }

    await register({
      username: form.username,
      nome: form.name,
      email: form.email,
      password: form.password,
      telefone: form.phone,
      bio: form.bio || undefined,
      github: form.github || undefined,
      linkedin: form.linkedin || undefined,
      portfolio: form.portfolio || undefined,
      curso: form.course,
      anoAcademico: form.year,
      role: form.userType === 'student' ? 'ESTUDANTE' : 'PROFESSOR',
      institutionId,
    });
	    toast({ title: 'Conta criada com sucesso!' });
	    navigate('/dashboard');
	  } catch (err: unknown) {
	    const msg = getApiErrorMessage(err) || 'Erro ao criar conta';
	    toast({ title: msg, variant: 'destructive' });
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 text-sm';
  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="w-full max-w-lg animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Criar sua conta</h1>
        <p className="text-sm text-muted-foreground mt-1">Junte-se à comunidade académica de Benguela.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i < step ? 'bg-primary text-primary-foreground' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 transition-colors ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5">
        <div className="text-center mb-2">
          <h2 className="font-semibold text-foreground">{steps[step].title}</h2>
          <p className="text-xs text-muted-foreground">{steps[step].subtitle}</p>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleOAuth('google')} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button onClick={() => handleOAuth('github')} disabled={isLoading} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50">
                <Github size={16} /> GitHub
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="px-2 bg-card text-muted-foreground">ou preencha o formulário</span></div>
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <Upload size={12} className="text-primary-foreground" />
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => update('username', e.target.value)}
                className={inputClass}
                placeholder="ex: joaosilva123"
              />
              {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome completo</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="Seu nome completo" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} placeholder="seu@email.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Telefone</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} placeholder="+244 9XX XXX XXX" />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} className={`${inputClass} pr-10`} placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirmar senha</label>
              <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className={inputClass} placeholder="Repita a senha" />
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Instituição</label>
              <select value={form.institution} onChange={e => update('institution', e.target.value)} className={selectClass}>
                <option value="">Selecione a instituição...</option>
                {institutionOptions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
              {errors.institution && <p className="text-xs text-destructive mt-1">{errors.institution}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Curso</label>
              <select value={form.course} onChange={e => update('course', e.target.value)} className={selectClass}>
                <option value="">Selecione o curso...</option>
                {courseOptions.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
              {errors.course && <p className="text-xs text-destructive mt-1">{errors.course}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ano académico</label>
              <select value={form.year} onChange={e => update('year', e.target.value)} className={selectClass}>
                <option value="">Selecione...</option>
                {['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.year && <p className="text-xs text-destructive mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de utilizador</label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'professor'] as const).map(type => (
                  <button key={type} type="button" onClick={() => update('userType', type)} className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${form.userType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
                    {type === 'student' ? '🎓 Estudante' : '👨‍🏫 Professor'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">GitHub (opcional)</label>
              <input type="url" value={form.github} onChange={e => update('github', e.target.value)} className={inputClass} placeholder="https://github.com/seu-usuario" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">LinkedIn (opcional)</label>
              <input type="url" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/seu-perfil" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Bio (opcional)</label>
              <textarea value={form.bio} onChange={e => update('bio', e.target.value)} className={`${inputClass} min-h-[80px] resize-y`} placeholder="Fale um pouco sobre si..." maxLength={200} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(s => s - 1)} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={16} /> Voltar
            </button>
          ) : <div />}
          <button type="button" onClick={handleNext} disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {step < steps.length - 1 ? (
              <>Próximo <ChevronRight size={16} /></>
            ) : (
              'Criar Conta'
            )}
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground pt-2">
          Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

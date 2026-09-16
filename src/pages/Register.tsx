import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2, ChevronRight, ChevronLeft, Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { institutionService } from '@/services/institutionService';
import { courseService } from '@/services/courseService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import { Field } from '@/shared/ui';

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
  { title: 'Sobre si', subtitle: 'Como os colegas o vão encontrar.' },
  { title: 'Acesso', subtitle: 'A palavra-passe para entrar na conta.' },
  { title: 'Formação', subtitle: 'Onde estuda ou ensina.' },
  { title: 'Perfil público', subtitle: 'Opcional. Pode preencher mais tarde.' },
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
  const { register, isLoading } = useAuth();
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
      if (!form.username.trim()) e.username = 'Escolha um nome de utilizador.';
      if (!form.name.trim()) e.name = 'Indique o seu nome.';
      if (!form.email) e.email = 'Indique o seu email.';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Este email não parece válido.';
      if (!form.phone) e.phone = 'Indique um número de telefone.';
    }
    if (step === 1) {
      if (!form.password) e.password = 'Crie uma palavra-passe.';
      else if (form.password.length < 6) e.password = 'Use pelo menos 6 caracteres.';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'As palavras-passe não coincidem.';
    }
    if (step === 2) {
      if (!form.institution) e.institution = 'Escolha a sua instituição.';
      if (!form.course) e.course = 'Escolha o seu curso.';
      if (!form.year) e.year = 'Escolha o ano que frequenta.';
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
      toast({ title: 'Escolha uma instituição da lista.', variant: 'destructive' });
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
	    toast({ title: 'Conta criada' });
	    navigate('/dashboard');
	  } catch (err: unknown) {
	    const msg = getApiErrorMessage(err) || 'Não foi possível criar a conta. Tente novamente.';
	    toast({ title: msg, variant: 'destructive' });
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

  const selectClass = 'field field-select';
  const isLast = step === steps.length - 1;

  return (
    <div className="w-full max-w-[440px] animate-fade-in">
      <h1 className="font-display text-[28px] font-medium text-foreground">Criar conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">Junte-se à comunidade académica de Benguela.</p>

      {/* Progresso: é mesmo uma sequência, por isso os passos são numerados */}
      <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Passos do registo">
        {steps.map((s, i) => (
          <li key={s.title} aria-current={i === step ? 'step' : undefined}>
            <div className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-border'}`} />
            <p className={`mt-2 hidden text-xs sm:block ${i === step ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              {i + 1}. {s.title}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <h2 className="font-sans text-base font-semibold tracking-normal text-foreground sm:sr-only">
          {step + 1}. {steps[step].title}
        </h2>
        <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
      </div>

      <div className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <div className="flex items-center gap-4">
              <label className="group relative cursor-pointer" aria-label="Escolher fotografia de perfil">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-dashed border-input bg-secondary transition-colors group-hover:border-primary">
                  {avatarPreview ? <img src={avatarPreview} alt="" className="h-full w-full object-cover" /> : <Camera size={20} className="text-muted-foreground" />}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary">
                  <Upload size={11} className="text-primary-foreground" />
                </span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              </label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Fotografia de perfil
                <br />
                Opcional, JPG ou PNG.
              </p>
            </div>

            <Field id="username" label="Nome de utilizador" error={errors.username}>
              <input id="username" type="text" autoComplete="username" value={form.username} onChange={(e) => update('username', e.target.value)} className="field" placeholder="joaosilva" />
            </Field>
            <Field id="name" label="Nome completo" error={errors.name}>
              <input id="name" type="text" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} className="field" />
            </Field>
            <Field id="email" label="Email" error={errors.email}>
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="field" placeholder="nome@instituicao.ao" />
            </Field>
            <Field id="phone" label="Telefone" error={errors.phone}>
              <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="field font-mono" placeholder="+244 9XX XXX XXX" />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field id="password" label="Palavra-passe" hint="Mínimo 6 caracteres" error={errors.password}>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => update('password', e.target.value)} className="field pr-11" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
                  className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
            <Field id="confirmPassword" label="Confirmar palavra-passe" error={errors.confirmPassword}>
              <input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className="field" />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-foreground">Sou</legend>
              <div className="grid grid-cols-2 gap-2">
                {(['student', 'professor'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={form.userType === type}
                    onClick={() => update('userType', type)}
                    className={`h-11 rounded-md border text-sm font-medium transition-colors ${
                      form.userType === type ? 'border-primary bg-primary/10 text-foreground' : 'border-input text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {type === 'student' ? 'Estudante' : 'Docente'}
                  </button>
                ))}
              </div>
            </fieldset>
            <Field id="institution" label="Instituição" error={errors.institution}>
              <select id="institution" value={form.institution} onChange={(e) => update('institution', e.target.value)} className={selectClass}>
                <option value="">Escolher instituição</option>
                {institutionOptions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="course" label="Curso" error={errors.course}>
              <select id="course" value={form.course} onChange={(e) => update('course', e.target.value)} className={selectClass}>
                <option value="">Escolher curso</option>
                {courseOptions.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="year" label="Ano académico" error={errors.year}>
              <select id="year" value={form.year} onChange={(e) => update('year', e.target.value)} className={selectClass}>
                <option value="">Escolher ano</option>
                {['1º Ano', '2º Ano', '3º Ano', '4º Ano', '5º Ano'].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field id="github" label="GitHub">
              <input id="github" type="url" value={form.github} onChange={(e) => update('github', e.target.value)} className="field" placeholder="https://github.com/utilizador" />
            </Field>
            <Field id="linkedin" label="LinkedIn">
              <input id="linkedin" type="url" value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} className="field" placeholder="https://linkedin.com/in/perfil" />
            </Field>
            <Field id="bio" label="Biografia" hint={`${form.bio.length}/200`}>
              <textarea id="bio" value={form.bio} onChange={(e) => update('bio', e.target.value)} className="field min-h-[96px] resize-y" placeholder="Em que áreas trabalha ou quer trabalhar?" maxLength={200} />
            </Field>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex h-11 items-center gap-1 rounded-md border border-input px-4 text-sm font-medium text-foreground hover:bg-secondary">
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={isLoading}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-60"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {isLast ? 'Criar conta' : 'Continuar'}
          {!isLast && <ChevronRight size={16} />}
        </button>
      </div>

      <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
};

export default Register;

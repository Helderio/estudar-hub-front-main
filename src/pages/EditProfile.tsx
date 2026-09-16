import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, Field, FormActions, FormSection, PageHeader } from '@/shared/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';
import { institutionService } from '@/services/institutionService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import type { User } from '@/types';
import { profileService } from '@/services/profileService';

type InstitutionOption = { id: string; nome: string };

const institutionFallback: InstitutionOption[] = [
  { id: '1', nome: 'EstudarHub Default Institution' },
];

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

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [institutionOptions, setInstitutionOptions] = useState<InstitutionOption[]>(institutionFallback);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institutionId: user?.institution_id || '',
    course: user?.course || '',
    year: user?.year || '',
    bio: user?.bio || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
  });

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await institutionService.getAll({ size: 200 });
        const page = unwrapApiResponseOrRaw<PageResponse<InstitutionOption>>(res);
        const content = page?.content || [];
        if (!cancelled && content.length > 0) setInstitutionOptions(content);
      } catch {
        // fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (!user?.id) {
      toast({ title: 'A sessão expirou. Entre novamente.', variant: 'destructive' });
      return;
    }

    try {
      setIsLoading(true);

      // 1) Atualiza os campos principais (inclui email) via /profile/me (JSON).
      const institutionIdNum = form.institutionId ? Number(form.institutionId) : undefined;
      const resProfile = await profileService.updateMe({
        nome: form.name,
        email: form.email,
        telefone: form.phone,
        bio: form.bio || undefined,
        github: form.github || undefined,
        linkedin: form.linkedin || undefined,
        curso: form.course || undefined,
        anoAcademico: form.year || undefined,
        institutionId: Number.isFinite(institutionIdNum as number) ? (institutionIdNum as number) : undefined,
      });
      const updatedProfile = unwrapApiResponseOrRaw<User>(resProfile);
      if (updatedProfile) updateUser(updatedProfile);

      // 2) Upload de avatar (multipart) via /users/{id}.
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const resAvatar = await userService.updateProfile(user.id, fd);
        const updatedAvatar = unwrapApiResponseOrRaw<User>(resAvatar);
        if (updatedAvatar) updateUser(updatedAvatar);
      }

      toast({ title: 'Perfil actualizado' });
      navigate(`/profile/${user.id}`);
    } catch (err: unknown) {
      toast({ title: getApiErrorMessage(err) ?? 'Não foi possível guardar. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <PageHeader
        title="Editar perfil"
        description="O que escrever aqui aparece no seu perfil público."
        back={user ? { to: `/profile/${user.id}`, label: 'O meu perfil' } : undefined}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <FormSection title="Fotografia" description="Quadrada, pelo menos 200 px. JPG ou PNG.">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} src={avatarPreview || user?.avatar} size="xl" />
            <label className="btn-secondary cursor-pointer">
              <Camera size={15} aria-hidden /> Escolher fotografia
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </label>
          </div>
        </FormSection>

        <FormSection title="Dados pessoais" description="O email e o telefone não são mostrados a outros utilizadores.">
          <Field id="name" label="Nome completo">
            <input id="name" type="text" autoComplete="name" value={form.name} onChange={(e) => update('name', e.target.value)} className="field" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="email" label="Email">
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="field" />
            </Field>
            <Field id="phone" label="Telefone">
              <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="field font-mono" placeholder="+244 9XX XXX XXX" />
            </Field>
          </div>
          <Field id="bio" label="Biografia" hint={`${form.bio.length}/200`}>
            <textarea id="bio" value={form.bio} maxLength={200} onChange={(e) => update('bio', e.target.value)} className="field min-h-[96px] resize-y" placeholder="Em que áreas trabalha ou quer trabalhar?" />
          </Field>
        </FormSection>

        <FormSection title="Formação" description="Ajuda colegas da mesma instituição a encontrá-lo.">
          <Field id="institution" label="Instituição">
            <select id="institution" value={form.institutionId} onChange={(e) => update('institutionId', e.target.value)} className="field field-select">
              <option value="">Escolher instituição</option>
              {institutionOptions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_160px]">
            <Field id="course" label="Curso">
              <input id="course" type="text" value={form.course} onChange={(e) => update('course', e.target.value)} className="field" />
            </Field>
            <Field id="year" label="Ano">
              <input id="year" type="text" value={form.year} onChange={(e) => update('year', e.target.value)} className="field" placeholder="3º Ano" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Ligações" description="Mostradas como botões no seu perfil.">
          <Field id="github" label="GitHub">
            <input id="github" type="url" value={form.github} onChange={(e) => update('github', e.target.value)} className="field" placeholder="https://github.com/utilizador" />
          </Field>
          <Field id="linkedin" label="LinkedIn">
            <input id="linkedin" type="url" value={form.linkedin} onChange={(e) => update('linkedin', e.target.value)} className="field" placeholder="https://linkedin.com/in/perfil" />
          </Field>
        </FormSection>

        <FormActions>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Guardar alterações
          </button>
        </FormActions>
      </form>
    </div>
  );
};

export default EditProfile;

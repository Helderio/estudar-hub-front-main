import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
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
  const inputClass = 'w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 text-sm';

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
      toast({ title: 'Sessão inválida. Faça login novamente.', variant: 'destructive' });
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

      toast({ title: 'Perfil actualizado com sucesso!' });
      navigate(`/profile/${user.id}`);
    } catch (err: unknown) {
      toast({ title: getApiErrorMessage(err) ?? 'Erro ao atualizar perfil.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-1">Editar Perfil</h1>
      <p className="text-sm text-muted-foreground mb-6">Actualize as suas informações pessoais.</p>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-colors">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">{user?.name.charAt(0)}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Camera size={14} className="text-primary-foreground" />
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Informações Pessoais</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome completo</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Telefone</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={e => update('bio', e.target.value)} className={`${inputClass} min-h-[80px] resize-y`} placeholder="Fale um pouco sobre si..." />
          </div>
        </div>

        {/* Academic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Informações Académicas</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Instituição</label>
              <select value={form.institutionId} onChange={e => update('institutionId', e.target.value)} className={inputClass}>
                <option value="">Selecione...</option>
                {institutionOptions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Curso</label>
              <input type="text" value={form.course} onChange={e => update('course', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ano académico</label>
              <input type="text" value={form.year} onChange={e => update('year', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Links</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">GitHub</label>
              <input type="url" value={form.github} onChange={e => update('github', e.target.value)} className={inputClass} placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">LinkedIn</label>
              <input type="url" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={isLoading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default EditProfile;

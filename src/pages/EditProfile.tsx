import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const institutions = [
  'Universidade Katyavala Bwila',
  'ISCED Benguela',
  'Universidade Mandume',
  'Instituto Superior Politécnico de Benguela',
  'Universidade Jean Piaget',
];

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institution: user?.institution || '',
    course: user?.course || '',
    bio: user?.bio || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
  });

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const inputClass = 'w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 text-sm';

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast({ title: 'Perfil actualizado com sucesso!' });
    setIsLoading(false);
    navigate(`/profile/${user?.id}`);
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
              <select value={form.institution} onChange={e => update('institution', e.target.value)} className={inputClass}>
                {institutions.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Curso</label>
              <input type="text" value={form.course} onChange={e => update('course', e.target.value)} className={inputClass} />
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

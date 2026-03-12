import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RankBadge } from '@/components/RankBadge';
import type { Rank } from '@/types';
import { PROJECT_CATEGORIES } from '@/types';

const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', rank: '' as Rank | '', description: '', repositoryUrl: '' });

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.rank || !form.description) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    toast({ title: 'Projeto publicado com sucesso!' });
    setIsLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Criar Projeto</h1>
      <p className="text-sm text-muted-foreground mb-6">Publique seu projeto acadêmico para a comunidade.</p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {/* Cover upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Imagem de capa</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Clique ou arraste uma imagem</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Título *</label>
          <input type="text" value={form.title} onChange={e => update('title', e.target.value)} className={inputClass} placeholder="Nome do projeto" maxLength={100} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Categoria *</label>
            <select value={form.category} onChange={e => update('category', e.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rank *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ranks.map(r => (
                <button key={r} type="button" onClick={() => update('rank', r)} className={`transition-all ${form.rank === r ? 'ring-2 ring-primary ring-offset-2 ring-offset-card rounded-lg' : ''}`}>
                  <RankBadge rank={r} size="sm" showTooltip />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Descrição *</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} className={`${inputClass} min-h-[120px] resize-y`} placeholder="Descreva seu projeto em detalhes..." maxLength={1000} />
        </div>

        {/* PDF upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">PDF (TCC/Artigo)</label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload size={20} className="mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Arraste o PDF aqui</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Link do repositório</label>
          <input type="url" value={form.repositoryUrl} onChange={e => update('repositoryUrl', e.target.value)} className={inputClass} placeholder="https://github.com/seu-repo" />
        </div>

        <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
          Publicar Projeto
        </button>
      </form>
    </div>
  );
};

export default CreateProject;

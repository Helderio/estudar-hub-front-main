import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Field, FileDrop, FormActions, FormSection, PageHeader } from '@/shared/ui';
import { useToast } from '@/hooks/use-toast';
import { RankDiamond } from '@/components/RankBadge';
import type { Project, Rank } from '@/types';
import { PROJECT_CATEGORIES, RANK_INFO } from '@/types';
import { projectService } from '@/services/projectService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';

const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

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

const CreateProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', rank: '' as Rank | '', description: '', repositoryUrl: '' });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const handleCoverChange = (file: File | undefined) => {
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePdfChange = (file: File | undefined) => {
    if (!file) return;
    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.rank || !form.description) {
      toast({ title: 'Faltam campos obrigatórios', description: 'Preencha o título, a categoria, a descrição e escolha um rank.', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);

      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category); // backend aceita por nome (fallback)
      fd.append('rank', form.rank);
      if (form.repositoryUrl) fd.append('repositoryUrl', form.repositoryUrl);
      if (coverFile) fd.append('coverImage', coverFile);
      if (pdfFile) fd.append('pdfUrl', pdfFile);

      const res = await projectService.create(fd);
      const created = unwrapApiResponseOrRaw<Project>(res);

      toast({ title: 'Projecto publicado' });
      if (created?.id != null) navigate(`/projects/${created.id}`);
      else navigate('/dashboard');
    } catch (err: unknown) {
      toast({ title: getApiErrorMessage(err) ?? 'Não foi possível publicar. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <PageHeader title="Novo projecto" description="Depois de publicado, qualquer pessoa da comunidade pode ver o projecto e pedir para participar." />

      <form onSubmit={handleSubmit} noValidate>
        <FormSection title="O projecto" description="Um título claro ajuda os colegas a encontrá-lo na pesquisa.">
          <Field id="title" label="Título" required hint={`${form.title.length}/100`}>
            <input id="title" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="field" maxLength={100} />
          </Field>
          <Field id="category" label="Categoria" required>
            <select id="category" value={form.category} onChange={(e) => update('category', e.target.value)} className="field field-select">
              <option value="">Escolher categoria</option>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field id="description" label="Descrição" required hint={`${form.description.length}/1000`}>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="field min-h-[140px] resize-y"
              placeholder="Que problema resolve, como foi feito e em que estado está."
              maxLength={1000}
            />
          </Field>
        </FormSection>

        <FormSection title="Rank" description="Escolha o nível que melhor descreve a complexidade do trabalho.">
          <fieldset>
            <legend className="sr-only">Rank do projecto</legend>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
              {ranks.map((r) => {
                const checked = form.rank === r;
                return (
                  <label
                    key={r}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      checked ? 'border-primary bg-primary/5' : 'border-input bg-card hover:border-primary/40'
                    }`}
                  >
                    <input type="radio" name="rank" value={r} checked={checked} onChange={() => update('rank', r)} className="sr-only" />
                    <RankDiamond rank={r} size="md" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {RANK_INFO[r].label} <span className="font-normal text-muted-foreground">(rank {r})</span>
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{RANK_INFO[r].description}.</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </FormSection>

        <FormSection title="Ficheiros e ligações" description="Opcional. Sem capa, o projecto usa um desenho sona.">
          <Field id="cover" label="Imagem de capa">
            <FileDrop
              id="cover"
              accept="image/*"
              file={coverFile}
              preview={coverPreview}
              onFile={handleCoverChange}
              onClear={() => {
                setCoverFile(null);
                setCoverPreview(null);
              }}
              hint="JPG ou PNG, na horizontal"
            />
          </Field>
          <Field id="pdf" label="Relatório ou artigo">
            <FileDrop id="pdf" accept="application/pdf" file={pdfFile} onFile={handlePdfChange} onClear={() => setPdfFile(null)} hint="PDF" />
          </Field>
          <Field id="repo" label="Repositório">
            <input id="repo" type="url" value={form.repositoryUrl} onChange={(e) => update('repositoryUrl', e.target.value)} className="field" placeholder="https://github.com/utilizador/projecto" />
          </Field>
        </FormSection>

        <FormActions>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Publicar projecto
          </button>
        </FormActions>
      </form>
    </div>
  );
};

export default CreateProject;

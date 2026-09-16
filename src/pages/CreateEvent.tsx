import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Field, FormActions, FormSection, PageHeader } from '@/shared/ui';
import { useToast } from '@/hooks/use-toast';
import { eventService } from '@/services/eventService';
import { institutionService } from '@/services/institutionService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';

const eventTypes = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'conference', label: 'Conferência' },
  { value: 'contest', label: 'Concurso' },
  { value: 'games', label: 'Jogos universitários' },
];

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

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [institutionOptions, setInstitutionOptions] = useState<InstitutionOption[]>(institutionFallback);
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', institutionId: '', type: '',
  });

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
        // fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location || !form.type) {
      toast({ title: 'Faltam campos obrigatórios', description: 'Indique o título, o tipo, a data e o município.', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      const institutionIdNum = form.institutionId ? Number(form.institutionId) : undefined;
      await eventService.create({
        title: form.title,
        description: form.description || undefined,
        date: form.date,
        location: form.location,
        institutionId: Number.isFinite(institutionIdNum as number) ? (institutionIdNum as number) : undefined,
        type: form.type,
      });
      toast({ title: 'Evento publicado' });
      navigate('/events');
    } catch (err: unknown) {
      toast({ title: getApiErrorMessage(err) ?? 'Não foi possível publicar. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <PageHeader title="Novo evento" description="Os estudantes vêem o evento na lista e podem inscrever-se enquanto as inscrições estiverem abertas." back={{ to: '/events', label: 'Eventos' }} />

      <form onSubmit={handleSubmit} noValidate>
        <FormSection title="O evento">
          <Field id="title" label="Título" required>
            <input id="title" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="field" placeholder="Hackathon ISPB 2026" />
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-foreground">
              Tipo <span className="text-muted-foreground" aria-hidden>*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {eventTypes.map((t) => {
                const checked = form.type === t.value;
                return (
                  <label
                    key={t.value}
                    className={`flex h-11 cursor-pointer items-center justify-center rounded-md border px-3 text-center text-sm font-medium transition-colors ${
                      checked ? 'border-primary bg-primary/10 text-foreground' : 'border-input bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    <input type="radio" name="type" value={t.value} checked={checked} onChange={() => update('type', t.value)} className="sr-only" />
                    {t.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <Field id="description" label="Descrição">
            <textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} className="field min-h-[110px] resize-y" placeholder="Programa, a quem se destina e o que levar." />
          </Field>
        </FormSection>

        <FormSection title="Quando e onde">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="date" label="Data" required>
              <input id="date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="field" />
            </Field>
            <Field id="location" label="Município" required>
              <select id="location" value={form.location} onChange={(e) => update('location', e.target.value)} className="field field-select">
                <option value="">Escolher município</option>
                <option value="Benguela">Benguela</option>
                <option value="Lobito">Lobito</option>
                <option value="Catumbela">Catumbela</option>
              </select>
            </Field>
          </div>
          <Field id="institution" label="Instituição organizadora">
            <select id="institution" value={form.institutionId} onChange={(e) => update('institutionId', e.target.value)} className="field field-select">
              <option value="">Nenhuma em particular</option>
              {institutionOptions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>

        <FormActions>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden />}
            Publicar evento
          </button>
        </FormActions>
      </form>
    </div>
  );
};

export default CreateEvent;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { eventService } from '@/services/eventService';
import { institutionService } from '@/services/institutionService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';

const eventTypes = [
  { value: 'hackathon', label: '💻 Hackathon' },
  { value: 'conference', label: '🎤 Conferência' },
  { value: 'contest', label: '🏆 Concurso' },
  { value: 'games', label: '⚽ Jogos Universitários' },
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
  const inputClass = 'w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 text-sm';

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
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
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
      toast({ title: 'Evento criado com sucesso!' });
      navigate('/events');
    } catch (err: unknown) {
      toast({ title: getApiErrorMessage(err) ?? 'Erro ao criar evento.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={16} /> Voltar
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-1">Criar Evento</h1>
      <p className="text-sm text-muted-foreground mb-6">Organize um novo evento académico.</p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Título *</label>
          <input type="text" value={form.title} onChange={e => update('title', e.target.value)} className={inputClass} placeholder="Nome do evento" />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Descrição</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} className={`${inputClass} min-h-[100px] resize-y`} placeholder="Descreva o evento..." />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Data *</label>
            <input type="date" value={form.date} onChange={e => update('date', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Local *</label>
            <select value={form.location} onChange={e => update('location', e.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              <option value="Benguela">Benguela</option>
              <option value="Lobito">Lobito</option>
              <option value="Catumbela">Catumbela</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Instituição</label>
            <select value={form.institutionId} onChange={e => update('institutionId', e.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              {institutionOptions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de evento *</label>
            <select value={form.type} onChange={e => update('type', e.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              {eventTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          Criar Evento
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;

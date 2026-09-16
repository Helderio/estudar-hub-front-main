import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Avatar, PageHeader } from '@/shared/ui';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { participationService } from '@/services/participationService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import type { Invitation } from '@/types';

const statusConfig = {
  pending: { label: 'Pendente', dot: 'bg-warning' },
  accepted: { label: 'Aceite', dot: 'bg-rank-e' },
  rejected: { label: 'Recusado', dot: 'bg-destructive' },
};

const Invitations = () => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await participationService.getMyInvitations();
      const data = unwrapApiResponseOrRaw<Invitation[]>(res);
      setInvitations(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'O servidor não respondeu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async (invitationId: string) => {
    try {
      const res = await participationService.acceptInvite(invitationId);
      toast({ title: res?.data?.message ?? 'Convite aceite' });
      await load();
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Não foi possível aceitar. Tente novamente.', variant: 'destructive' });
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      const res = await participationService.rejectInvite(invitationId);
      toast({ title: res?.data?.message ?? 'Convite recusado' });
      await load();
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Não foi possível recusar. Tente novamente.', variant: 'destructive' });
    }
  };

  const pending = invitations.filter((i) => i.status === 'pending');
  const answered = invitations.filter((i) => i.status !== 'pending');

  const renderRow = (inv: Invitation) => {
    const status = statusConfig[inv.status] ?? statusConfig.pending;
    const date = new Date(inv.createdAt);
    return (
      <li key={inv.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
        <Avatar name={inv.from?.name} src={inv.from?.avatar} size="md" className="hidden sm:inline-flex" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{inv.from?.name}</span> quer trabalhar consigo em
          </p>
          <Link to={`/projects/${inv.projectId}`} className="block truncate font-semibold text-foreground hover:text-primary">
            {inv.projectTitle}
          </Link>
          {!Number.isNaN(date.getTime()) && (
            <time dateTime={inv.createdAt} className="text-xs text-muted-foreground">
              {date.toLocaleDateString('pt-AO', { day: 'numeric', month: 'long' })}
            </time>
          )}
        </div>
        {inv.status === 'pending' ? (
          <div className="flex gap-2">
            <button onClick={() => handleReject(String(inv.id))} className="btn-secondary h-9">
              Recusar
            </button>
            <button onClick={() => handleAccept(String(inv.id))} className="btn-primary h-9">
              <Check size={15} aria-hidden /> Aceitar
            </button>
          </div>
        ) : (
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
            {status.label}
          </span>
        )}
      </li>
    );
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <PageHeader title="Convites" description="Convites para participar em projectos e pedidos de colegas para entrar nos seus." />

      {loading ? (
        <div className="panel p-4">
          <SkeletonLoader count={5} type="line" />
        </div>
      ) : error ? (
        <EmptyState title="Não foi possível carregar os convites" description={`${error} Verifique a ligação e recarregue a página.`} />
      ) : invitations.length === 0 ? (
        <EmptyState
          title="Sem convites por agora"
          description="Quando alguém o convidar para um projecto, ou pedir para entrar num dos seus, aparece aqui."
          action={
            <Link to="/dashboard" className="btn-secondary">
              Explorar projectos
            </Link>
          }
        />
      ) : (
        <>
          <section aria-labelledby="por-responder" className="space-y-3">
            <h2 id="por-responder" className="section-title flex items-center gap-2">
              Por responder <span className="font-mono text-sm font-normal text-muted-foreground">{pending.length}</span>
            </h2>
            {pending.length > 0 ? (
              <ul className="panel divide-y divide-border">{pending.map(renderRow)}</ul>
            ) : (
              <p className="text-sm text-muted-foreground">Respondeu a todos os convites.</p>
            )}
          </section>
          {answered.length > 0 && (
            <section aria-labelledby="respondidos" className="space-y-3">
              <h2 id="respondidos" className="section-title">Respondidos</h2>
              <ul className="panel divide-y divide-border">{answered.map(renderRow)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Invitations;

import { useCallback, useEffect, useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { participationService } from '@/services/participationService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import type { Invitation } from '@/types';

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, className: 'bg-warning/15 text-warning' },
  accepted: { label: 'Aceito', icon: Check, className: 'bg-rank-e/15 text-rank-e' },
  rejected: { label: 'Recusado', icon: X, className: 'bg-destructive/15 text-destructive' },
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
      setError(e?.response?.data?.message ?? 'Falha ao carregar convites.');
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
      toast({ title: res?.data?.message ?? 'Pedido aceite!' });
      await load();
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Falha ao aceitar pedido.', variant: 'destructive' });
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      const res = await participationService.rejectInvite(invitationId);
      toast({ title: res?.data?.message ?? 'Pedido recusado.' });
      await load();
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Falha ao recusar pedido.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Convites e pedidos</h1>
        <p className="text-sm text-muted-foreground">Gerencie convites recebidos e pedidos de participação nos teus projetos.</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-4">
            <SkeletonLoader count={6} type="line" />
          </div>
        ) : error ? (
          <EmptyState title="Não foi possível carregar" description={error} />
        ) : invitations.map(inv => {
          const status = statusConfig[inv.status];
          const StatusIcon = status.icon;
          return (
            <div key={inv.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link to={`/projects/${inv.projectId}`} className="font-medium text-foreground hover:text-primary transition-colors">{inv.projectTitle}</Link>
                <p className="text-xs text-muted-foreground mt-1">De: {inv.from.name} · {new Date(inv.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${status.className}`}>
                  <StatusIcon size={12} /> {status.label}
                </span>
                {inv.status === 'pending' && (
                  <div className="flex gap-1">
                    <button onClick={() => handleAccept(String(inv.id))} className="p-1.5 rounded-lg bg-rank-e/15 text-rank-e hover:bg-rank-e/25 transition-colors"><Check size={14} /></button>
                    <button onClick={() => handleReject(String(inv.id))} className="p-1.5 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors"><X size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Invitations;

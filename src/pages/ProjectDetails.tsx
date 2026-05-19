import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Download, ExternalLink, Mail, MessageSquare, Search, UserMinus, Users, UserPlus, Calendar } from 'lucide-react';
import { RankBadge } from '@/components/RankBadge';
import { UserCard } from '@/components/UserCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import type { Invitation, Project, User } from '@/types';
import { projectService } from '@/services/projectService';
import { participationService } from '@/services/participationService';
import { userService } from '@/services/userService';
import type { PageResponse } from '@/services/apiResponse';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';

const invitationStatus = {
  pending: { label: 'Pendente', className: 'bg-warning/15 text-warning' },
  accepted: { label: 'Aceito', className: 'bg-rank-e/15 text-rank-e' },
  rejected: { label: 'Recusado', className: 'bg-destructive/15 text-destructive' },
};

const ProjectDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [comment, setComment] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [inviteSearch, setInviteSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async (projectId: string) => {
    const res = await projectService.getById(projectId);
    return unwrapApiResponseOrRaw<Project>(res) ?? null;
  }, []);

  const loadSentInvitations = useCallback(async (projectId: string) => {
    const res = await participationService.getSentInvitations();
    const data = unwrapApiResponseOrRaw<Invitation[]>(res);
    return (Array.isArray(data) ? data : []).filter(inv => String(inv.projectId) === String(projectId));
  }, []);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [data, sent] = await Promise.all([
          loadProject(id),
          loadSentInvitations(id).catch(() => []),
        ]);
        if (!alive) return;
        setProject(data);
        setSentInvitations(sent);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? 'Falha ao carregar o projeto.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, loadProject, loadSentInvitations]);

  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(async () => {
      try {
        const res = await userService.list({ q: inviteSearch || undefined, page: 0, size: 10 });
        const page = unwrapApiResponseOrRaw<PageResponse<User>>(res);
        if (!alive) return;
        setUsers(page?.content ?? []);
      } catch {
        if (alive) setUsers([]);
      }
    }, 250);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [inviteSearch]);

  const participants = useMemo(() => {
    if (!project) return [];
    const byId = new Map<string, User>();
    if (project.author) byId.set(String(project.author.id), project.author);
    (project.participants ?? []).forEach(user => byId.set(String(user.id), user));
    return Array.from(byId.values());
  }, [project]);

  const participantIds = useMemo(() => new Set(participants.map(user => String(user.id))), [participants]);
  const pendingInviteUserIds = useMemo(
    () => new Set(sentInvitations.filter(inv => inv.status === 'pending').map(inv => String(inv.to.id))),
    [sentInvitations]
  );
  const isParticipating = !!currentUser && participantIds.has(String(currentUser.id));
  const isAuthor = !!currentUser && !!project?.author && String(project.author.id) === String(currentUser.id);
  const hasPendingParticipationRequest = !!currentUser && !!project && !isParticipating && sentInvitations.some(inv => {
    return inv.status === 'pending'
      && String(inv.projectId) === String(project.id)
      && String(inv.from.id) === String(currentUser.id)
      && String(inv.to.id) === String(project.author.id);
  });
  const canLeave = isParticipating && !isAuthor && participants.length > 1;
  const canInvite = isAuthor;

  const inviteCandidates = useMemo(() => {
    if (!currentUser || !canInvite) return [];
    return users.filter(user => {
      const userId = String(user.id);
      return userId !== String(currentUser.id) && !participantIds.has(userId) && !pendingInviteUserIds.has(userId);
    });
  }, [canInvite, currentUser, participantIds, pendingInviteUserIds, users]);

  const handleParticipate = async () => {
    if (!project) return;
    try {
      setActionLoading(true);
      const res = isParticipating
        ? await participationService.leaveProject(String(project.id))
        : await participationService.requestParticipation(String(project.id));
      toast({ title: res?.data?.message ?? (isParticipating ? 'Saíste do projeto.' : 'Pedido de participação enviado.') });
      setProject(unwrapApiResponseOrRaw<Project>(res) ?? await loadProject(String(project.id)));
      setSentInvitations(await loadSentInvitations(String(project.id)));
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Falha ao atualizar participação.', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!project || !selectedUserId) return;
    try {
      setInviteLoading(true);
      const res = await participationService.invite(String(project.id), selectedUserId);
      toast({ title: res?.data?.message ?? 'Convite enviado!' });
      setSelectedUserId('');
      setInviteSearch('');
      setSentInvitations(await loadSentInvitations(String(project.id)));
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Falha ao enviar convite.', variant: 'destructive' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!project || !comment.trim()) return;
    try {
      const res = await projectService.addComment(String(project.id), comment.trim());
      toast({ title: res?.data?.message ?? 'Comentário enviado!' });
      setComment('');
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Falha ao enviar comentário.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="aspect-[3/1] rounded-2xl bg-muted/40" />
        <SkeletonLoader count={4} type="line" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{error}</p>
        <Link to="/dashboard" className="text-primary hover:underline mt-2 inline-block">Voltar ao Dashboard</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Link to="/dashboard" className="text-primary hover:underline mt-2 inline-block">Voltar ao Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Voltar
      </Link>

      {/* Cover */}
      <div className="aspect-[3/1] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
        <span className="text-6xl font-display font-bold text-primary/20">{project.title.charAt(0)}</span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <RankBadge rank={project.rank} size="lg" />
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">{project.category}</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">{project.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{project.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar size={14} />{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
          <span className="flex items-center gap-1"><Users size={14} />{participants.length} participantes</span>
          {isParticipating && <span className="flex items-center gap-1 text-rank-e"><Check size={14} />Tu participas</span>}
          {hasPendingParticipationRequest && <span className="flex items-center gap-1 text-warning"><Mail size={14} />Pedido pendente</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleParticipate}
          disabled={actionLoading || isAuthor || hasPendingParticipationRequest || (isParticipating && !canLeave)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isAuthor ? <Check size={16} /> : isParticipating ? <UserMinus size={16} /> : hasPendingParticipationRequest ? <Check size={16} /> : <UserPlus size={16} />}
          {isAuthor ? 'Autor do projeto' : isParticipating ? 'Sair do Projeto' : hasPendingParticipationRequest ? 'Pedido enviado' : 'Pedir participação'}
        </button>
        {project.pdfUrl && (
          <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
            <Download size={16} /> Baixar PDF
          </a>
        )}
        {project.repositoryUrl && (
          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
            <ExternalLink size={16} /> Repositório
          </a>
        )}
      </div>

      {/* Author & Participants */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground mb-3">Autor</h3>
          <UserCard user={project.author} compact />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground mb-3">Participantes ({participants.length})</h3>
          {participants.length > 0 ? (
            <div className="space-y-1">
              {participants.map(u => <UserCard key={u.id} user={u} compact />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum participante ainda.</p>
          )}
        </div>
      </div>

      {/* Participation management */}
      <div className="grid md:grid-cols-[1fr_1fr] gap-6">
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><Mail size={18} /> Convidar participante</h3>
            <p className="text-xs text-muted-foreground mt-1">Procura um utilizador e envia um convite para colaborar neste projecto.</p>
          </div>
          {!canInvite ? (
            <p className="text-sm text-muted-foreground">Só o autor do projecto pode enviar convites.</p>
          ) : (
            <>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={inviteSearch}
                  onChange={e => setInviteSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                  placeholder="Pesquisar por nome, email ou username"
                />
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {inviteCandidates.length > 0 ? inviteCandidates.map(user => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => setSelectedUserId(String(user.id))}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl border p-2 text-left transition-colors ${selectedUserId === String(user.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground truncate">{user.name}</span>
                      <span className="block text-xs text-muted-foreground truncate">{user.email}</span>
                    </span>
                    {selectedUserId === String(user.id) && <Check size={16} className="text-primary shrink-0" />}
                  </button>
                )) : (
                  <p className="text-sm text-muted-foreground">Nenhum utilizador disponível para convite.</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleInvite}
                disabled={!selectedUserId || inviteLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                <Mail size={16} /> Enviar convite
              </button>
            </>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-foreground">{canInvite ? 'Convites enviados' : 'Pedidos enviados'}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {canInvite ? 'Acompanha o estado dos convites que enviaste para este projecto.' : 'Acompanha o estado dos teus pedidos para este projecto.'}
            </p>
          </div>
          {sentInvitations.length > 0 ? (
            <div className="space-y-2">
              {sentInvitations.map(inv => {
                const status = invitationStatus[inv.status] ?? invitationStatus.pending;
                return (
                  <div key={inv.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{canInvite ? inv.to.name : inv.projectTitle}</p>
                      <p className="text-xs text-muted-foreground truncate">{inv.to.email}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{canInvite ? 'Ainda não enviaste convites para este projecto.' : 'Ainda não enviaste pedidos para este projecto.'}</p>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><MessageSquare size={18} /> Comentários ({project.comments?.length ?? 0})</h3>
        
        <div className="flex gap-3">
          <input value={comment} onChange={e => setComment(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" placeholder="Escreva um comentário..." />
          <button onClick={handleSendComment} className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Enviar</button>
        </div>

        {(project.comments ?? []).map(c => (
          <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">{c.author.name.charAt(0)}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{c.author.name}</span>
                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;

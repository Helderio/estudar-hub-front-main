import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Download, ExternalLink, Mail, MessageSquare, Search, UserMinus, Users, UserPlus, Calendar } from 'lucide-react';
import { RankBadge } from '@/components/RankBadge';
import { UserCard } from '@/components/UserCard';
import { SonaCover, Avatar, BackLink } from '@/shared/ui';
import { EmptyState } from '@/components/EmptyState';
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
  pending: { label: 'Pendente', dot: 'bg-warning' },
  accepted: { label: 'Aceite', dot: 'bg-rank-e' },
  rejected: { label: 'Recusado', dot: 'bg-destructive' },
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
        setError(e?.response?.data?.message ?? 'O servidor não respondeu.');
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
      toast({ title: res?.data?.message ?? (isParticipating ? 'Saiu do projecto.' : 'Pedido enviado ao autor.') });
      setProject(unwrapApiResponseOrRaw<Project>(res) ?? await loadProject(String(project.id)));
      setSentInvitations(await loadSentInvitations(String(project.id)));
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Não foi possível actualizar a participação. Tente novamente.', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!project || !selectedUserId) return;
    try {
      setInviteLoading(true);
      const res = await participationService.invite(String(project.id), selectedUserId);
      toast({ title: res?.data?.message ?? 'Convite enviado' });
      setSelectedUserId('');
      setInviteSearch('');
      setSentInvitations(await loadSentInvitations(String(project.id)));
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'O convite não foi enviado. Tente novamente.', variant: 'destructive' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!project || !comment.trim()) return;
    try {
      const res = await projectService.addComment(String(project.id), comment.trim());
      toast({ title: res?.data?.message ?? 'Comentário publicado' });
      setComment('');
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'O comentário não foi publicado. Tente novamente.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <BackLink to="/dashboard" label="Projectos" />
        <div className="aspect-[3/1] animate-pulse rounded-lg bg-secondary" />
        <SkeletonLoader count={4} type="line" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <BackLink to="/dashboard" label="Projectos" />
        <EmptyState
          title={error ? 'Não foi possível abrir o projecto' : 'Este projecto não existe'}
          description={error ?? 'Pode ter sido removido pelo autor.'}
          action={<Link to="/dashboard" className="btn-primary">Ver todos os projectos</Link>}
        />
      </div>
    );
  }

  const created = new Date(project.createdAt);
  const comments = project.comments ?? [];
  const actionDisabled = actionLoading || isAuthor || hasPendingParticipationRequest || (isParticipating && !canLeave);
  const actionLabel = isAuthor
    ? 'É o autor deste projecto'
    : isParticipating
      ? 'Sair do projecto'
      : hasPendingParticipationRequest
        ? 'Pedido enviado'
        : 'Pedir para participar';
  const ActionIcon = isAuthor || hasPendingParticipationRequest ? Check : isParticipating ? UserMinus : UserPlus;

  // Mostrado ao lado no ecrã grande e logo a seguir ao cabeçalho no telemóvel
  const actions = (
    <div className="panel space-y-2 p-4">
      <button type="button" onClick={handleParticipate} disabled={actionDisabled} className={isParticipating && canLeave ? 'btn-secondary w-full' : 'btn-primary w-full'}>
        <ActionIcon size={16} aria-hidden />
        {actionLabel}
      </button>
      {project.pdfUrl && (
        <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
          <Download size={16} aria-hidden /> Descarregar PDF
        </a>
      )}
      {project.repositoryUrl && (
        <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
          <ExternalLink size={16} aria-hidden /> Abrir repositório
        </a>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <BackLink to="/dashboard" label="Projectos" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <div className="min-w-0 space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <RankBadge rank={project.rank} size="lg" />
              <span className="h-8 w-px bg-border" aria-hidden />
              <span className="text-sm font-medium text-primary">{project.category}</span>
            </div>
            <h1 className="detail-title max-w-[28ch]">{project.title}</h1>
            <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{project.description}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {!Number.isNaN(created.getTime()) && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} aria-hidden />
                  Publicado a <time dateTime={project.createdAt}>{created.toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                </span>
              )}
              {isParticipating && !isAuthor && (
                <span className="flex items-center gap-1.5 text-foreground">
                  <Check size={15} className="text-rank-e" aria-hidden /> Faz parte da equipa
                </span>
              )}
              {hasPendingParticipationRequest && (
                <span className="flex items-center gap-1.5 text-foreground">
                  <Mail size={15} className="text-warning" aria-hidden /> Pedido a aguardar resposta
                </span>
              )}
            </div>
          </header>

          <div className="lg:hidden">{actions}</div>

          <div className="aspect-[16/7] overflow-hidden rounded-lg border border-border">
            {project.coverImage ? <img src={project.coverImage} alt="" className="h-full w-full object-cover" /> : <SonaCover seed={project.title} className="h-full w-full" />}
          </div>

          <section aria-labelledby="comentarios" className="space-y-4">
            <h2 id="comentarios" className="section-title flex items-center gap-2">
              <MessageSquare size={17} aria-hidden /> Comentários
              <span className="font-mono text-sm font-normal text-muted-foreground">{comments.length}</span>
            </h2>

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendComment();
              }}
            >
              <Avatar name={currentUser?.name} src={currentUser?.avatar} size="md" className="hidden sm:inline-flex" />
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="field h-10 flex-1"
                placeholder="Escreva um comentário"
                aria-label="Comentário"
              />
              <button type="submit" disabled={!comment.trim()} className="btn-primary">
                Comentar
              </button>
            </form>

            {comments.length > 0 ? (
              <ul className="divide-y divide-border border-y border-border">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-3 py-4">
                    <Avatar name={c.author?.name} src={c.author?.avatar} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold text-foreground">{c.author?.name}</span>{' '}
                        <time className="text-xs text-muted-foreground" dateTime={c.createdAt}>
                          {new Date(c.createdAt).toLocaleDateString('pt-AO')}
                        </time>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/85">{c.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Ainda sem comentários. Deixe o primeiro.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden lg:block">{actions}</div>

          <section className="panel p-4" aria-labelledby="equipa">
            <h2 id="equipa" className="section-title mb-3 flex items-center justify-between">
              Equipa
              <span className="flex items-center gap-1 font-mono text-sm font-normal text-muted-foreground">
                <Users size={14} aria-hidden /> {participants.length}
              </span>
            </h2>
            <div className="space-y-0.5">
              {participants.map((u) => (
                <UserCard key={u.id} user={u} compact note={String(u.id) === String(project.author?.id) ? 'Autor' : undefined} />
              ))}
            </div>
          </section>

          {canInvite && (
            <section className="panel space-y-3 p-4" aria-labelledby="convidar">
              <div>
                <h2 id="convidar" className="section-title">Convidar colegas</h2>
                <p className="mt-1 text-xs text-muted-foreground">Quem aceitar passa a fazer parte da equipa.</p>
              </div>
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                  className="field h-10 pl-9"
                  placeholder="Nome, email ou utilizador"
                  aria-label="Pesquisar colegas para convidar"
                />
              </div>
              <div className="-mx-1 max-h-56 space-y-0.5 overflow-y-auto px-1" role="listbox" aria-label="Colegas disponíveis">
                {inviteCandidates.length > 0 ? (
                  inviteCandidates.map((u) => {
                    const selected = selectedUserId === String(u.id);
                    return (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        key={u.id}
                        onClick={() => setSelectedUserId(selected ? '' : String(u.id))}
                        className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors ${selected ? 'bg-primary/10' : 'hover:bg-secondary'}`}
                      >
                        <Avatar name={u.name} src={u.avatar} size="xs" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{u.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                        </span>
                        {selected && <Check size={15} className="shrink-0 text-primary" aria-hidden />}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-2 py-1 text-sm text-muted-foreground">{inviteSearch ? 'Ninguém encontrado com esse termo.' : 'Não há colegas disponíveis para convidar.'}</p>
                )}
              </div>
              <button type="button" onClick={handleInvite} disabled={!selectedUserId || inviteLoading} className="btn-secondary w-full">
                <Mail size={16} aria-hidden /> Enviar convite
              </button>
            </section>
          )}

          {(canInvite || sentInvitations.length > 0) && (
            <section className="panel p-4" aria-labelledby="enviados">
              <h2 id="enviados" className="section-title mb-3">
                {canInvite ? 'Convites enviados' : 'Os seus pedidos'}
              </h2>
              {sentInvitations.length > 0 ? (
                <ul className="space-y-2">
                  {sentInvitations.map((inv) => {
                    const status = invitationStatus[inv.status] ?? invitationStatus.pending;
                    return (
                      <li key={inv.id} className="flex items-center justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">{canInvite ? inv.to.name : inv.projectTitle}</span>
                          <span className="block truncate text-xs text-muted-foreground">{inv.to.email}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-foreground">
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
                          {status.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Ainda não enviou convites.</p>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetails;

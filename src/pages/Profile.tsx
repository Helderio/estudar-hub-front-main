import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RankDiamond } from '@/components/RankBadge';
import { EmptyState } from '@/components/EmptyState';
import { Avatar } from '@/shared/ui';
import { RANK_INFO } from '@/types';
import type { Rank } from '@/types';
import { ProjectCard } from '@/components/ProjectCard';
import { CalendarDays, Building2, GraduationCap, Edit, Github, Linkedin, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import type { Project, UniversityEvent, User } from '@/types';
import { userService } from '@/services/userService';
import { chatService } from '@/services/chatService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';
import { useToast } from '@/hooks/use-toast';
import type { Chat } from '@/types';

const RANK_ORDER: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userEvents, setUserEvents] = useState<UniversityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwnProfile = currentUser?.id === user?.id;

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [profileRes, projectsRes, eventsRes] = await Promise.all([
          userService.getProfile(id),
          userService.getProjects(id),
          userService.getEvents(id),
        ]);
        const profile = unwrapApiResponseOrRaw<User>(profileRes);
        const projects = unwrapApiResponseOrRaw<Project[]>(projectsRes);
        const events = unwrapApiResponseOrRaw<UniversityEvent[]>(eventsRes);
        if (!alive) return;
        setUser(profile ?? null);
        setUserProjects(Array.isArray(projects) ? projects : []);
        setUserEvents(Array.isArray(events) ? events : []);
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
  }, [id]);

  const handleStartChat = async () => {
    if (!user || isOwnProfile) return;

    try {
      setStartingChat(true);
      const res = await chatService.createChat(user.id);
      const chat = unwrapApiResponseOrRaw<Chat>(res);
      navigate(`/chat?chatId=${chat.id}`);
    } catch (e: any) {
      toast({
        title: e?.response?.data?.message ?? 'Não foi possível abrir a conversa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-5">
          <div className="h-24 w-24 animate-pulse rounded-full bg-secondary" />
          <div className="flex-1">
            <SkeletonLoader count={3} type="line" />
          </div>
        </div>
        <SkeletonLoader count={3} type="card" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <EmptyState
        title={error ? 'Não foi possível abrir o perfil' : 'Este perfil não existe'}
        description={error ?? 'A conta pode ter sido removida.'}
        action={<Link to="/people" className="btn-primary">Ver pessoas</Link>}
      />
    );
  }

  const rankIndex = user.rank ? RANK_ORDER.indexOf(user.rank) : -1;

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={user.name} src={user.avatar || user.foto} size="xl" />
          <div className="min-w-0">
            <h1 className="detail-title">{user.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {user.userType === 'professor' && <span className="font-medium text-foreground">Docente</span>}
              {user.institution && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={14} aria-hidden /> {user.institution}
                </span>
              )}
              {user.course && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap size={14} aria-hidden /> {[user.course, user.year].filter(Boolean).join(', ')}
                </span>
              )}
            </p>
            {user.bio && <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-foreground/85">{user.bio}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {isOwnProfile ? (
                <Link to="/edit-profile" className="btn-secondary h-9">
                  <Edit size={14} aria-hidden /> Editar perfil
                </Link>
              ) : (
                <button type="button" onClick={handleStartChat} disabled={startingChat} className="btn-primary h-9">
                  {startingChat ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <MessageCircle size={14} aria-hidden />}
                  Enviar mensagem
                </button>
              )}
              {user.github && (
                <a href={user.github} target="_blank" rel="noopener noreferrer" className="btn-secondary h-9 px-2.5" aria-label="GitHub">
                  <Github size={16} aria-hidden />
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="btn-secondary h-9 px-2.5" aria-label="LinkedIn">
                  <Linkedin size={16} aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Percurso de rank: o nível actual e os que faltam */}
        {rankIndex >= 0 && (
          <div className="panel p-4">
            <p className="text-xs text-muted-foreground">Rank actual</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              Rank {user.rank} <span className="font-normal text-muted-foreground">({RANK_INFO[user.rank].label})</span>
            </p>
            <ol className="mt-3 flex items-center gap-1.5" aria-label="Percurso de rank">
              {RANK_ORDER.map((r, i) => (
                <li key={r} className="flex items-center gap-1.5">
                  <RankDiamond rank={r} size="sm" className={i > rankIndex ? 'opacity-30 grayscale' : i < rankIndex ? 'opacity-60' : ''} />
                  {i < RANK_ORDER.length - 1 && <span className={`h-px w-2.5 ${i < rankIndex ? 'bg-foreground/40' : 'bg-border'}`} aria-hidden />}
                </li>
              ))}
            </ol>
          </div>
        )}
      </header>

      <dl className="grid grid-cols-2 divide-x divide-border border-y border-border sm:w-fit">
        {[
          { label: 'Projectos', value: user.projectCount ?? userProjects.length },
          { label: 'Eventos', value: user.eventCount ?? userEvents.length },
        ].map((stat) => (
          <div key={stat.label} className="px-6 py-3 first:pl-0">
            <dd className="font-display text-2xl font-medium text-foreground">{stat.value}</dd>
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <section aria-labelledby="perfil-projectos" className="space-y-4">
        <h2 id="perfil-projectos" className="section-title flex items-center gap-2">
          Projectos <span className="font-mono text-sm font-normal text-muted-foreground">{userProjects.length}</span>
        </h2>
        {userProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {userProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={isOwnProfile ? 'Ainda não publicou projectos' : 'Sem projectos publicados'}
            description={isOwnProfile ? 'Publique o primeiro para começar a construir o seu percurso.' : `${user.name.split(' ')[0]} ainda não publicou nenhum projecto.`}
            action={isOwnProfile ? <Link to="/create-project" className="btn-primary">Novo projecto</Link> : undefined}
          />
        )}
      </section>

      <section aria-labelledby="perfil-eventos" className="space-y-4">
        <h2 id="perfil-eventos" className="section-title flex items-center gap-2">
          Eventos <span className="font-mono text-sm font-normal text-muted-foreground">{userEvents.length}</span>
        </h2>
        {userEvents.length > 0 ? (
          <ul className="panel divide-y divide-border">
            {userEvents.map((e) => {
              const d = new Date(e.date);
              return (
                <li key={e.id}>
                  <Link to={`/events/${e.id}`} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary/60">
                    <CalendarDays size={17} className="shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">{e.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {!Number.isNaN(d.getTime()) && d.toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {e.location && `, ${e.location}`}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{isOwnProfile ? 'Ainda não se inscreveu em eventos.' : 'Sem eventos.'}</p>
        )}
      </section>
    </div>
  );
};

export default Profile;

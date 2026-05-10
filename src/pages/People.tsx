import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, Loader2, MessageCircle, Search, UserRound } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { RankBadge } from '@/components/RankBadge';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';
import type { Chat, User } from '@/types';

const People = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingChatUserId, setStartingChatUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userService.list({ q: search || undefined, page: 0, size: 40 });
        const page = unwrapApiResponseOrRaw<PageResponse<User>>(res);
        if (!alive) return;
        setUsers(page?.content ?? []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? 'Falha ao carregar pessoas.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }, 250);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [search]);

  const visibleUsers = useMemo(() => {
    return users.filter(user => String(user.id) !== String(currentUser?.id));
  }, [currentUser?.id, users]);

  const handleStartChat = async (userId: string) => {
    try {
      setStartingChatUserId(userId);
      const res = await chatService.createChat(userId);
      const chat = unwrapApiResponseOrRaw<Chat>(res);
      navigate(`/chat?chatId=${chat.id}`);
    } catch (e: any) {
      toast({
        title: e?.response?.data?.message ?? 'Não foi possível iniciar o chat.',
        variant: 'destructive',
      });
    } finally {
      setStartingChatUserId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Pessoas</h1>
        <p className="text-sm text-muted-foreground">Encontre colegas, professores e participantes da comunidade.</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar por nome, email ou username..." />

      {loading ? (
        <SkeletonLoader count={8} type="card" />
      ) : error ? (
        <EmptyState title="Não foi possível carregar" description={error} />
      ) : visibleUsers.length === 0 ? (
        <EmptyState
          title="Nenhuma pessoa encontrada"
          description="Tente pesquisar por outro nome, email ou username."
          icon={<Search className="text-muted-foreground" size={28} />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleUsers.map(user => (
            <div key={user.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Link
                  to={`/profile/${user.id}`}
                  className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-base font-bold text-primary shrink-0"
                >
                  {user.avatar || user.foto ? (
                    <img src={user.avatar || user.foto} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || <UserRound size={18} />
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/profile/${user.id}`} className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                    {user.name}
                  </Link>
                  <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
                    {user.institution && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <Building2 size={12} className="shrink-0" />
                        <span className="truncate">{user.institution}</span>
                      </span>
                    )}
                    {user.course && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <GraduationCap size={12} className="shrink-0" />
                        <span className="truncate">{user.course}</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <RankBadge rank={user.rank} size="sm" />
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  to={`/profile/${user.id}`}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  Perfil
                </Link>
                <button
                  type="button"
                  onClick={() => handleStartChat(user.id)}
                  disabled={startingChatUserId === user.id}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {startingChatUserId === user.id ? <Loader2 size={15} className="animate-spin" /> : <MessageCircle size={15} />}
                  Mensagem
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default People;

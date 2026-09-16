import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, Loader2, MessageCircle } from 'lucide-react';
import { Avatar, PageHeader } from '@/shared/ui';
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
        setError(e?.response?.data?.message ?? 'O servidor não respondeu.');
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
        title: e?.response?.data?.message ?? 'Não foi possível abrir a conversa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setStartingChatUserId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Pessoas" description="Estudantes e docentes da comunidade. Veja o que já publicaram ou comece uma conversa." />

      <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar por nome, email ou utilizador" />

      {loading ? (
        <SkeletonLoader count={6} type="line" />
      ) : error ? (
        <EmptyState title="Não foi possível carregar a lista" description={`${error} Verifique a ligação e recarregue a página.`} />
      ) : visibleUsers.length === 0 ? (
        <EmptyState
          title={search ? 'Ninguém encontrado' : 'Ainda não há outras pessoas'}
          description={search ? `Nenhum resultado para "${search}". Tente o nome ou o email completo.` : 'Quando colegas criarem conta, aparecem aqui.'}
        />
      ) : (
        <ul className="panel divide-y divide-border">
          {visibleUsers.map((user) => (
            <li key={user.id} className="flex items-center gap-4 px-4 py-3.5">
              <Avatar name={user.name} src={user.avatar || user.foto} size="md" />
              <div className="min-w-0 flex-1">
                <Link to={`/profile/${user.id}`} className="block truncate font-semibold text-foreground hover:text-primary">
                  {user.name}
                </Link>
                <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  {user.institution && (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <Building2 size={12} className="shrink-0" aria-hidden />
                      <span className="truncate">{user.institution}</span>
                    </span>
                  )}
                  {user.course && (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <GraduationCap size={12} className="shrink-0" aria-hidden />
                      <span className="truncate">{user.course}</span>
                    </span>
                  )}
                </p>
              </div>
              {user.rank && (
                <div className="hidden w-28 sm:block">
                  <RankBadge rank={user.rank} size="md" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleStartChat(user.id)}
                disabled={startingChatUserId === user.id}
                aria-label={`Enviar mensagem a ${user.name}`}
                className="btn-secondary h-9 px-3"
              >
                {startingChatUserId === user.id ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <MessageCircle size={15} aria-hidden />}
                <span className="hidden md:inline">Mensagem</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default People;

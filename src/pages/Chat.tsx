import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, ArrowLeft, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Avatar, Lusona } from '@/shared/ui';
import { cn } from '@/lib/utils';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { chatService } from '@/services/chatService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';
import type { Chat as ChatType, ChatMessage } from '@/types';

const Chat = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = user?.id || '1';
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeMessage = (raw: any): ChatMessage => ({
    id: String(raw?.id ?? ''),
    chat_id: String(raw?.chat_id ?? raw?.chatId ?? ''),
    sender_id: String(raw?.sender_id ?? raw?.senderId ?? ''),
    content: String(raw?.content ?? ''),
    created_at: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
  });

  const normalizeChat = (raw: any): ChatType => ({
    id: String(raw?.id ?? ''),
    participants: Array.isArray(raw?.participants) ? raw.participants : [],
    messages: Array.isArray(raw?.messages) ? raw.messages.map(normalizeMessage) : [],
    created_at: String(raw?.created_at ?? raw?.createdAt ?? new Date().toISOString()),
  });

  useEffect(() => {
    const requestedChatId = searchParams.get('chatId');
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await chatService.getChats();
        const data = unwrapApiResponseOrRaw<any[]>(res);
        if (!alive) return;
        const normalized = Array.isArray(data) ? data.map(normalizeChat) : [];
        setChats(normalized);
        if (requestedChatId && normalized.some(chat => chat.id === requestedChatId)) {
          setSelectedChatId(requestedChatId);
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? 'Não foi possível carregar as conversas.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchParams]);

  const selectChat = (chatId: string | null) => {
    setSelectedChatId(chatId);
    if (chatId) setSearchParams({ chatId });
    else setSearchParams({});
  };

  useEffect(() => {
    if (!selectedChatId) return;
    let alive = true;
    (async () => {
      try {
        const res = await chatService.getMessages(selectedChatId);
        const data = unwrapApiResponseOrRaw<any[]>(res);
        const normalized = Array.isArray(data) ? data.map(normalizeMessage) : [];
        if (!alive) return;
        setChats((prev) =>
          prev.map((c) => (c.id === selectedChatId ? { ...c, messages: normalized } : c))
        );
      } catch {
        // ignore - list will stay with whatever messages it has
      }
    })();
    return () => {
      alive = false;
    };
  }, [selectedChatId]);

  const selectedChat = useMemo(() => chats.find(c => c.id === selectedChatId) ?? null, [chats, selectedChatId]);

  const getOtherParticipant = (chat: ChatType) => {
    return chat.participants.find(p => p.id !== currentUserId) || chat.participants[0];
  };

  const getLastMessage = (chat: ChatType) => {
    return chat.messages?.[chat.messages.length - 1] ?? null;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredChats = useMemo(() => {
    return chats.filter(c => {
      if (!searchQuery) return true;
      const other = getOtherParticipant(c);
      return (other?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [chats, searchQuery]);

  const handleSendMessage = async () => {
    if (!selectedChatId || !message.trim()) return;
    const content = message.trim();
    setMessage('');
    try {
      const res = await chatService.sendMessage(selectedChatId, content);
      const created = unwrapApiResponseOrRaw<any>(res);
      const createdMsg = normalizeMessage(created);
      setChats((prev) =>
        prev.map((c) =>
          c.id === selectedChatId
            ? { ...c, messages: [...(c.messages ?? []), createdMsg] }
            : c
        )
      );
    } catch (e: any) {
      setMessage(content);
    }
  };

  // Funções de renderização (não componentes): assim os campos de texto não são recriados a cada tecla
  const renderChatList = () => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar conversas"
            aria-label="Pesquisar conversas"
            className="field h-9 pl-9"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4">
            <SkeletonLoader count={6} type="line" />
          </div>
        ) : error ? (
          <p className="p-4 text-sm text-muted-foreground">{error}</p>
        ) : filteredChats.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-semibold text-foreground">{searchQuery ? 'Nenhuma conversa encontrada' : 'Ainda sem conversas'}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {searchQuery ? 'Pesquise pelo nome da pessoa.' : 'Abra o perfil de um colega e escolha Enviar mensagem.'}
            </p>
            {!searchQuery && (
              <Link to="/people" className="btn-secondary mt-4 h-9">
                Ver pessoas
              </Link>
            )}
          </div>
        ) : (
          <ul>
            {filteredChats.map((chat) => {
              const other = getOtherParticipant(chat);
              const last = getLastMessage(chat);
              const active = chat.id === selectedChatId;
              return (
                <li key={chat.id}>
                  <button
                    onClick={() => selectChat(chat.id)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      active ? 'bg-secondary' : 'hover:bg-secondary/60',
                    )}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" aria-hidden />}
                    <Avatar name={other?.name} src={other?.avatar} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">{other?.name ?? 'Conversa'}</span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{last ? formatTime(last.created_at) : ''}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {last ? `${last.sender_id === currentUserId ? 'Eu: ' : ''}${last.content}` : 'Sem mensagens'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  const renderChatRoom = () => {
    if (!selectedChat) return null;
    const other = getOtherParticipant(selectedChat);
    if (!other) {
      return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Esta conversa não tem participantes.</div>;
    }
    const messages = selectedChat.messages ?? [];

    return (
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <button onClick={() => selectChat(null)} aria-label="Voltar às conversas" className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden">
            <ArrowLeft size={18} />
          </button>
          <Avatar name={other.name} src={other.avatar} size="md" />
          <div className="min-w-0">
            <Link to={`/profile/${other.id}`} className="block truncate text-sm font-semibold text-foreground hover:text-primary">
              {other.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{[other.institution, other.course].filter(Boolean).join(', ')}</p>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-5" aria-live="polite">
          {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Escreva a primeira mensagem a {other.name.split(' ')[0]}.</p>}
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[78%] rounded-lg px-3.5 py-2 text-sm leading-relaxed',
                    isMe ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm border border-border bg-background text-foreground',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={cn('mt-0.5 text-right font-mono text-[10px]', isMe ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{formatTime(msg.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="flex items-center gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) handleSendMessage();
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escrever mensagem"
            aria-label="Mensagem"
            className="field h-10 flex-1"
          />
          <button type="submit" disabled={!message.trim()} aria-label="Enviar" className="btn-primary h-10 w-10 px-0">
            <Send size={16} aria-hidden />
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="panel flex h-[calc(100dvh-12.5rem)] min-h-[420px] overflow-hidden lg:h-[calc(100dvh-9.5rem)]">
        <div className={cn('w-full shrink-0 border-r border-border lg:flex lg:w-80 lg:flex-col', selectedChatId ? 'hidden' : 'flex flex-col')}>
          <div className="border-b border-border px-4 py-3.5">
            <h1 className="font-display text-lg font-medium">Chat</h1>
          </div>
          {renderChatList()}
        </div>

        <div className={cn('min-w-0 flex-1', selectedChatId ? 'flex flex-col' : 'hidden lg:flex lg:items-center lg:justify-center')}>
          {selectedChatId ? (
            renderChatRoom()
          ) : (
            <div className="max-w-xs px-6 text-center">
              <Lusona cols={3} rows={2} className="mx-auto h-12 w-auto" strokeWidth={1.75} lineClassName="text-primary/60" dotClassName="text-foreground/40" />
              <p className="mt-4 text-sm font-semibold text-foreground">Escolha uma conversa</p>
              <p className="mt-1 text-sm text-muted-foreground">Ou abra o perfil de um colega para começar uma nova.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

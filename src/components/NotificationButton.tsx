import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Circle, ExternalLink, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationService } from '@/services/notificationService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationCount } from '@/types';

const emptyCount: NotificationCount = { unread: 0, total: 0 };

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const NotificationButton = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<NotificationCount>(emptyCount);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCount, setLoadingCount] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadLabel = useMemo(() => {
    if (count.unread > 99) return '99+';
    return String(count.unread);
  }, [count.unread]);

  const loadCount = useCallback(async () => {
    try {
      setLoadingCount(true);
      const res = await notificationService.getCount();
      const data = unwrapApiResponseOrRaw<NotificationCount>(res);
      setCount(data ?? emptyCount);
    } finally {
      setLoadingCount(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await notificationService.getNotifications(false);
      const data = unwrapApiResponseOrRaw<AppNotification[]>(res);
      setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadCount().catch(() => setCount(emptyCount));
  }, [loadCount, location.pathname]);

  useEffect(() => {
    if (!open) return;
    loadNotifications().catch(() => setNotifications([]));
  }, [open, loadNotifications]);

  const handleMarkAsRead = async (notification: AppNotification) => {
    if (notification.read) return;

    setNotifications(current =>
      current.map(item => (item.id === notification.id ? { ...item, read: true } : item)),
    );
    setCount(current => ({ ...current, unread: Math.max(current.unread - 1, 0) }));

    try {
      await notificationService.markAsRead(String(notification.id));
    } catch {
      await Promise.allSettled([loadNotifications(), loadCount()]);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (count.unread === 0) return;

    try {
      setMarkingAll(true);
      const res = await notificationService.markAllAsRead();
      const data = unwrapApiResponseOrRaw<NotificationCount>(res);
      setCount(data ?? emptyCount);
      setNotifications(current => current.map(item => ({ ...item, read: true })));
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Notificacoes"
        >
          <Bell size={18} />
          {count.unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadLabel}
            </span>
          )}
          {loadingCount && count.unread === 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,380px)] p-0 overflow-hidden rounded-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Notificacoes</h2>
            <p className="text-xs text-muted-foreground">{count.unread} por ler</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={count.unread === 0 || markingAll}
            className="h-8 px-2 text-xs"
          >
            {markingAll ? <Loader2 className="animate-spin" /> : <CheckCheck />}
            Marcar lidas
          </Button>
        </div>

        <ScrollArea className="max-h-[420px]">
          {loadingList ? (
            <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" />
              A carregar
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Sem notificacoes</p>
              <p className="mt-1 text-xs text-muted-foreground">Quando houver novidades, elas aparecem aqui.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(notification => {
                const content = (
                  <div
                    className={cn(
                      'flex gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                      !notification.read && 'bg-primary/5',
                    )}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    <Circle
                      size={9}
                      className={cn('mt-1.5 shrink-0', notification.read ? 'text-muted-foreground/30' : 'fill-primary text-primary')}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug text-foreground">{notification.title}</p>
                        {notification.actionUrl && <ExternalLink size={13} className="mt-0.5 shrink-0 text-muted-foreground" />}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
                      <p className="mt-2 text-[11px] text-muted-foreground">{formatNotificationDate(notification.createdAt)}</p>
                    </div>
                  </div>
                );

                if (notification.actionUrl) {
                  return (
                    <Link key={notification.id} to={notification.actionUrl} onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <button key={notification.id} type="button" className="w-full">
                    {content}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

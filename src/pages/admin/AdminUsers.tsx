import { useEffect, useMemo, useState } from 'react';
import { adminService } from '@/services/adminService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCcw, Search } from 'lucide-react';

type AdminUser = User & {
  role?: string;
  verified?: boolean;
};

const ROLE_OPTIONS = ['ALUNO', 'PROFESSOR', 'ADMIN'] as const;

type RoleOption = (typeof ROLE_OPTIONS)[number];

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

function isPageResponse<T>(value: unknown): value is PageResponse<T> {
  if (!value || typeof value !== 'object') return false;
  if (!('content' in value)) return false;
  const content = (value as { content?: unknown }).content;
  return Array.isArray(content);
}

const AdminUsers = () => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const [data, setData] = useState<PageResponse<AdminUser>>({
    content: [],
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const normalizedQ = useMemo(() => q.trim(), [q]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.listUsers({ q: normalizedQ || undefined, page, size });
      const raw = unwrapApiResponseOrRaw<PageResponse<AdminUser>>(res as any);
      setData(isPageResponse(raw) ? raw : { content: [], page, size, totalElements: 0, totalPages: 0, last: true });
    } catch (e: unknown) {
      setError(getApiErrorMessage(e) ?? 'Não foi possível carregar os utilizadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const updateUserInState = (updated: AdminUser) => {
    setData((prev) => ({
      ...prev,
      content: prev.content.map((u) => (u.id === updated.id ? ({ ...u, ...updated } as AdminUser) : u)),
    }));
  };

  const onChangeRole = async (user: AdminUser, role: RoleOption) => {
    try {
      setBusyUserId(user.id);
      const res = await adminService.setUserRole(user.id, role);
      const updated = unwrapApiResponseOrRaw<AdminUser>(res as any);
      if (updated && typeof updated === 'object') updateUserInState(updated);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e) ?? 'Não foi possível alterar o papel.');
    } finally {
      setBusyUserId(null);
    }
  };

  const onToggleVerified = async (user: AdminUser, verified: boolean) => {
    try {
      setBusyUserId(user.id);
      const res = await adminService.setUserVerified(user.id, verified);
      const updated = unwrapApiResponseOrRaw<AdminUser>(res as any);
      if (updated && typeof updated === 'object') updateUserInState(updated);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e) ?? 'Não foi possível alterar a verificação.');
    } finally {
      setBusyUserId(null);
    }
  };

  const onSubmitSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    await load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Utilizadores</h1>
          <p className="text-sm text-muted-foreground">Papéis e verificação das contas.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
          <RefreshCcw size={16} />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitSearch} className="flex flex-col sm:flex-row gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nome ou email..."
            />
            <Button type="submit" className="gap-2">
              <Search size={16} />
              Pesquisar
            </Button>
          </form>
          {loading && <p className="text-xs text-muted-foreground mt-3">A carregar...</p>}
          {error && <p className="text-xs text-destructive mt-3">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Verificado</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum utilizador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.content.map((u) => {
                    const role = (u as any).role as string | undefined;
                    const verified = Boolean((u as any).verified);
                    const isBusy = busyUserId === u.id;

                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
                            {role ?? 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={verified}
                              onCheckedChange={(val) => onToggleVerified(u, Boolean(val))}
                              disabled={isBusy}
                            />
                            <span className="text-xs text-muted-foreground">{verified ? 'Sim' : 'Não'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.rank}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <Select
                              value={(role as RoleOption) || undefined}
                              onValueChange={(v) => onChangeRole(u, v as RoleOption)}
                              disabled={isBusy}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Alterar role" />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLE_OPTIONS.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {r}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">
              Página {data.totalPages === 0 ? 0 : data.page + 1} de {data.totalPages}
              {' · '}Total {data.totalElements}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={loading || page <= 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || data.last || data.totalPages === 0}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;

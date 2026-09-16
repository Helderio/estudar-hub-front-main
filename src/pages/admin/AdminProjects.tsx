import { useEffect, useMemo, useState } from 'react';
import type { Project } from '@/types';
import { adminService } from '@/services/adminService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCcw, Search, Trash2 } from 'lucide-react';

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

const AdminProjects = () => {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [busyId, setBusyId] = useState<number | string | null>(null);

  const [data, setData] = useState<PageResponse<Project>>({
    content: [],
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const normalizedQ = useMemo(() => q.trim(), [q]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.listProjects({ q: normalizedQ || undefined, page, size, sort: 'createdAt,desc' });
      const raw = unwrapApiResponseOrRaw<PageResponse<Project>>(res as any);
      setData(isPageResponse(raw) ? raw : { content: [], page, size, totalElements: 0, totalPages: 0, last: true });
    } catch (e: unknown) {
      setError(getApiErrorMessage(e) ?? 'Falha ao carregar projetos.');
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

  const remove = async (p: Project) => {
    try {
      const id = (p as any).id as number | string;
      setBusyId(id);
      setError(null);
      await adminService.deleteProject(id);
      await load();
    } catch (e: unknown) {
      setError(getApiErrorMessage(e) ?? 'Falha ao remover.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Projectos</h1>
          <p className="text-muted-foreground mt-1">Gestão global de projetos (admin).</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por título..."
              className="pl-9 w-[260px]"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setPage(0);
              load();
            }}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCcw size={16} /> Actualizar
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum projecto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.content.map((p) => {
                    const id = (p as any).id as number | string;
                    const isBusy = busyId === id;
                    const title = (p as any).title ?? (p as any).titulo ?? '-';
                    const category = (p as any).category ?? '-';
                    const rank = (p as any).rank ?? '-';
                    const authorName = (p as any).author?.name ?? (p as any).authors?.[0]?.name ?? '-';

                    return (
                      <TableRow key={String(id)}>
                        <TableCell className="font-medium">{title}</TableCell>
                        <TableCell className="text-muted-foreground">{category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{rank}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{authorName}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={isBusy} className="gap-1">
                                <Trash2 size={14} /> Remover
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover projecto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => remove(p)}>Remover</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
            </p>
            <div className="flex items-center gap-2">
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
                disabled={loading || data.last}
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

export default AdminProjects;

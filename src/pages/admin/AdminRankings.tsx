import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { adminService } from '@/services/adminService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCcw } from 'lucide-react';

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

const AdminRankings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<User[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.listUsers({ page: 0, size: 100, sort: 'pontos,desc' });
      const raw = unwrapApiResponseOrRaw<PageResponse<User>>(res as any);
      const page = isPageResponse(raw) ? raw : null;
      setItems(page ? page.content : []);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e) ?? 'Falha ao carregar rankings.');
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
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Rankings</h1>
          <p className="text-muted-foreground mt-1">Top utilizadores por pontos (rank).</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
          <RefreshCcw size={16} /> Atualizar
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top 100</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Projetos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      Nenhum dado.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((u, idx) => (
                    <TableRow key={u.id}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.institution || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{u.rank}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.projectCount ?? 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRankings;

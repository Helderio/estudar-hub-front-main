import { useEffect, useMemo, useState } from 'react';
import type { Institution } from '@/types';
import { adminService, type UpsertInstitutionRequest } from '@/services/adminService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, RefreshCcw } from 'lucide-react';

type AdminInstitution = Institution & { tipo?: string; logo?: string; website?: string };

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

const emptyForm: UpsertInstitutionRequest = {
  nome: '',
  sigla: '',
  logo: '',
  website: '',
  tipo: 'Universidade',
};

const AdminInstitutions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminInstitution[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminInstitution | null>(null);
  const [form, setForm] = useState<UpsertInstitutionRequest>(emptyForm);

  const title = useMemo(() => (editing ? 'Editar Instituição' : 'Nova Instituição'), [editing]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.listInstitutions({ page: 0, size: 200 });
      const raw = unwrapApiResponseOrRaw<PageResponse<AdminInstitution>>(res as any);
      const page = isPageResponse(raw) ? raw : null;
      setItems(page ? page.content : []);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e) ?? 'Falha ao carregar instituições.');
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

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (inst: AdminInstitution) => {
    setEditing(inst);
    setForm({
      nome: inst.nome ?? '',
      sigla: inst.sigla ?? '',
      logo: inst.logo ?? '',
      website: inst.website ?? '',
      tipo: inst.tipo ?? 'Universidade',
    });
    setDialogOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (editing) {
        await adminService.updateInstitution(editing.id, form);
      } else {
        await adminService.createInstitution(form);
      }

      setDialogOpen(false);
      setEditing(null);
      setForm({ ...emptyForm });
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err) ?? 'Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (inst: AdminInstitution) => {
    try {
      setLoading(true);
      setError(null);
      await adminService.deleteInstitution(inst.id);
      await load();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err) ?? 'Falha ao remover.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Instituições</h1>
          <p className="text-sm text-muted-foreground">CRUD via API Admin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
            <RefreshCcw size={16} /> Actualizar
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus size={16} /> Nova
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
                <Input value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Sigla</label>
                <Input value={form.sigla ?? ''} onChange={(e) => setForm((p) => ({ ...p, sigla: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
                <Input value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Website</label>
                <Input value={form.website ?? ''} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Logo (URL)</label>
              <Input value={form.logo ?? ''} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  <TableHead>Sigla</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      Nenhuma instituição.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{inst.sigla}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{inst.tipo ?? 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{inst.website || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(inst)} className="gap-1">
                            <Pencil size={14} /> Editar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="gap-1">
                                <Trash2 size={14} /> Remover
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover instituição?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => remove(inst)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
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

export default AdminInstitutions;

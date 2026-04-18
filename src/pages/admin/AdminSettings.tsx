import { useEffect, useState } from 'react';
import { adminService, type AdminSettingsResponse } from '@/services/adminService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AdminSettingsResponse | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSettings();
      const raw = unwrapApiResponseOrRaw<AdminSettingsResponse>(res as any);
      setSettings(raw ?? null);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e) ?? 'Falha ao carregar settings.');
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">Info operacional (beta) do backend.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
          <RefreshCcw size={16} /> Atualizar
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Backend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">App</span>
            <span className="font-medium text-foreground">{settings?.appName ?? '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Auth mode</span>
            <span className="font-medium text-foreground">{settings?.authMode ?? '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Server time</span>
            <span className="font-medium text-foreground">{settings?.serverTime ?? '-'}</span>
          </div>
          <div className="pt-2">
            <p className="text-muted-foreground mb-2">CORS allowed origin patterns</p>
            <ul className="list-disc pl-6 space-y-1">
              {(settings?.corsAllowedOriginPatterns ?? []).map((o) => (
                <li key={o} className="text-foreground">{o}</li>
              ))}
              {(settings?.corsAllowedOriginPatterns ?? []).length === 0 && (
                <li className="text-muted-foreground">Nenhum.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;

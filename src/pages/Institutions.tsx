import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { institutionService } from '@/services/institutionService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import { Building2, Globe, ArrowRight } from 'lucide-react';
import type { Institution } from '@/types';

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

const Institutions = () => {
  const [search, setSearch] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await institutionService.getAll({ size: 200 });
        const data = unwrapApiResponseOrRaw<PageResponse<Institution>>(res);
        if (!alive) return;
        setInstitutions(isPageResponse(data) ? data.content : []);
      } catch (e: unknown) {
        if (!alive) return;
        setError(getApiErrorMessage(e) ?? 'Falha ao carregar instituições.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return institutions.filter((i) => {
      if (search && !i.nome.toLowerCase().includes(search.toLowerCase()) && !i.sigla.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [institutions, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Instituições</h1>
        <p className="text-sm text-muted-foreground">Universidades e institutos parceiros em Benguela.</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar instituições..." />

      {loading ? (
        <SkeletonLoader count={6} type="card" />
      ) : error ? (
        <EmptyState title="Não foi possível carregar" description={error} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inst) => (
            <Link
              key={inst.id}
              to={`/institutions/${inst.id}`}
              className="group rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 size={22} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {inst.sigla}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{inst.nome}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {inst.website && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe size={12} /> {inst.website.replace('https://', '')}
                  </span>
                )}
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhuma instituição encontrada" description="Tente ajustar a sua pesquisa." />
      )}
    </div>
  );
};

export default Institutions;

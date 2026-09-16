import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { institutionService } from '@/services/institutionService';
import { unwrapApiResponseOrRaw, type PageResponse } from '@/services/apiResponse';
import { Globe, ChevronRight } from 'lucide-react';
import { PageHeader, InstitutionMark } from '@/shared/ui';
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
        setError(getApiErrorMessage(e) ?? 'O servidor não respondeu.');
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
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Instituições" description="Universidades e institutos da província com estudantes no EstudarHub." />

      <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar por nome ou sigla" />

      {loading ? (
        <SkeletonLoader count={5} type="line" />
      ) : error ? (
        <EmptyState title="Não foi possível carregar as instituições" description={`${error} Verifique a ligação e recarregue a página.`} />
      ) : filtered.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {filtered.map((inst) => (
            <li key={inst.id}>
              <Link to={`/institutions/${inst.id}`} className="panel group flex h-full items-center gap-4 p-4 transition-colors hover:border-primary/50">
                <InstitutionMark sigla={inst.sigla} logo={inst.logo} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug text-foreground group-hover:text-primary">{inst.nome}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span>{inst.sigla}</span>
                    {inst.website && (
                      <span className="inline-flex items-center gap-1">
                        <Globe size={12} aria-hidden /> {inst.website.replace(/^https?:\/\//, '')}
                      </span>
                    )}
                  </span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Nenhuma instituição encontrada" description={`Nenhum resultado para "${search}". Tente a sigla, por exemplo ISPB.`} />
      )}
    </div>
  );
};

export default Institutions;

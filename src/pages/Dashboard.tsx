import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, SlidersHorizontal } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { FilterChip, FilterRow, PageHeader } from '@/shared/ui';
import { SearchBar } from '@/components/SearchBar';
import { RankDiamond } from '@/components/RankBadge';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { projectService } from '@/services/projectService';
import type { PageResponse } from '@/services/apiResponse';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';
import type { Rank } from '@/types';
import type { Project } from '@/types';
import { PROJECT_CATEGORIES, RANK_INFO } from '@/types';

const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

const Dashboard = () => {
  const [search, setSearch] = useState('');
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await projectService.getAll({ page: '0', size: '100' });
        const page = unwrapApiResponseOrRaw<PageResponse<Project>>(res);
        if (!alive) return;
        setProjects(page?.content ?? []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? 'O servidor não respondeu.');
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
    return projects.filter(p => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedRank && p.rank !== selectedRank) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      return true;
    });
  }, [projects, search, selectedRank, selectedCategory]);

  const activeFilters = (selectedRank ? 1 : 0) + (selectedCategory ? 1 : 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Projectos"
        description={
          loading ? (
            'A carregar projectos da comunidade.'
          ) : (
            <>
              <span className="font-mono text-foreground">{filtered.length}</span>
              {filtered.length === 1 ? ' projecto' : ' projectos'}
              {activeFilters > 0 || search ? ' com estes critérios' : ' publicados pela comunidade'}
            </>
          )
        }
        actions={
          <Link to="/create-project" className="btn-primary">
            <Plus size={16} aria-hidden /> Novo projecto
          </Link>
        }
      />

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar por título ou descrição" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            className="inline-flex h-11 items-center gap-2 rounded-md border border-input px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Categorias</span>
            {selectedCategory && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-label="filtro activo" />}
          </button>
        </div>

        {/* Ranks sempre à vista: é a forma mais rápida de filtrar */}
        <FilterRow label="Filtrar por rank">
          <FilterChip active={!selectedRank} onClick={() => setSelectedRank(null)}>
            Todos os ranks
          </FilterChip>
          {ranks.map((r) => (
            <FilterChip key={r} active={selectedRank === r} onClick={() => setSelectedRank(r === selectedRank ? null : r)} className="pl-0.5">
              <RankDiamond rank={r} size="sm" />
              {RANK_INFO[r].label}
            </FilterChip>
          ))}
        </FilterRow>

        {showFilters && (
          <FilterRow label="Filtrar por categoria" className="panel mx-0 animate-fade-in p-3 sm:mx-0">
            <FilterChip active={!selectedCategory} onClick={() => setSelectedCategory(null)}>
              Todas as categorias
            </FilterChip>
            {PROJECT_CATEGORIES.map((c) => (
              <FilterChip key={c} active={selectedCategory === c} onClick={() => setSelectedCategory(c === selectedCategory ? null : c)}>
                {c}
              </FilterChip>
            ))}
          </FilterRow>
        )}
      </div>

      {loading ? (
        <SkeletonLoader count={6} type="card" />
      ) : error ? (
        <EmptyState title="Não foi possível carregar os projectos" description={`${error} Verifique a ligação e recarregue a página.`} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum projecto com estes critérios"
          description="Limpe os filtros ou publique o primeiro projecto desta categoria."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {(activeFilters > 0 || search) && (
                <button
                  onClick={() => {
                    setSelectedRank(null);
                    setSelectedCategory(null);
                    setSearch('');
                  }}
                  className="btn-secondary"
                >
                  Limpar filtros
                </button>
              )}
              <Link to="/create-project" className="btn-primary">
                Novo projecto
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
};

export default Dashboard;

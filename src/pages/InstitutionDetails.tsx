import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, ExternalLink } from 'lucide-react';
import { BackLink, InstitutionMark } from '@/shared/ui';
import { EmptyState } from '@/components/EmptyState';
import { ProjectCard } from '@/components/ProjectCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import type { Institution, Project } from '@/types';
import { institutionService } from '@/services/institutionService';
import { projectService } from '@/services/projectService';
import type { PageResponse } from '@/services/apiResponse';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';

const InstitutionDetails = () => {
  const { id } = useParams();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [instRes, projectsRes] = await Promise.all([
          institutionService.getById(id),
          projectService.getAll({ page: '0', size: '100' }),
        ]);

        const inst = unwrapApiResponseOrRaw<Institution>(instRes);
        const page = unwrapApiResponseOrRaw<PageResponse<Project>>(projectsRes);
        const content = page?.content ?? [];

        if (!alive) return;
        setInstitution(inst ?? null);
        setProjects(Array.isArray(content) ? content : []);
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
  }, [id]);

  const institutionProjects = useMemo(() => {
    if (!institution) return [];
    return projects.filter((p) => {
      const authorInstitutionId = p.author?.institution_id;
      const authorInstitution = p.author?.institution;
      return authorInstitutionId === institution.id || authorInstitution === institution.sigla;
    });
  }, [institution, projects]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <BackLink to="/institutions" label="Instituições" />
        <SkeletonLoader count={3} type="line" />
        <SkeletonLoader count={3} type="card" />
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="space-y-6">
        <BackLink to="/institutions" label="Instituições" />
        <EmptyState
          title={error ? 'Não foi possível abrir a instituição' : 'Esta instituição não existe'}
          description={error ?? 'Pode ter sido removida da plataforma.'}
          action={<Link to="/institutions" className="btn-primary">Ver instituições</Link>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="space-y-6">
        <BackLink to="/institutions" label="Instituições" />
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <InstitutionMark sigla={institution.sigla} logo={institution.logo} size="lg" />
          <div className="min-w-0">
            <h1 className="detail-title">{institution.nome}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{institution.sigla}</span>
              {institution.website && (
                <a href={institution.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <Globe size={14} aria-hidden /> {institution.website.replace(/^https?:\/\//, '')} <ExternalLink size={12} aria-hidden />
                </a>
              )}
            </p>
          </div>
        </header>
      </div>

      <section aria-labelledby="projectos-inst" className="space-y-4">
        <h2 id="projectos-inst" className="section-title flex items-center gap-2">
          Projectos <span className="font-mono text-sm font-normal text-muted-foreground">{institutionProjects.length}</span>
        </h2>
        {institutionProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {institutionProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="Ainda sem projectos" description={`Nenhum estudante da ${institution.sigla} publicou um projecto até agora.`} />
        )}
      </section>
    </div>
  );
};

export default InstitutionDetails;

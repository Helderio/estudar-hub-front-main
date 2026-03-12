import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Globe, ExternalLink } from 'lucide-react';
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
        setError(e?.response?.data?.message ?? 'Falha ao carregar instituição.');
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
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <Link to="/institutions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <SkeletonLoader count={1} type="card" />
        <SkeletonLoader count={2} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{error}</p>
        <Link to="/institutions" className="text-primary hover:underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Instituição não encontrada.</p>
        <Link to="/institutions" className="text-primary hover:underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <Link to="/institutions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 size={28} className="text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{institution.sigla}</h1>
            <p className="text-muted-foreground">{institution.nome}</p>
            {institution.website && (
              <a href={institution.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
                <Globe size={14} /> {institution.website.replace('https://', '')} <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">
          Projectos ({institutionProjects.length})
        </h2>
        {institutionProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {institutionProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum projecto desta instituição ainda.</p>
        )}
      </div>
    </div>
  );
};

export default InstitutionDetails;

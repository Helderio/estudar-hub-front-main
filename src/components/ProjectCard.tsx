import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import type { Project } from '@/types';
import { RankBadge } from './RankBadge';
import { Avatar, SonaCover } from '@/shared/ui';

interface ProjectCardProps {
  project: Project;
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-AO', { month: 'short', year: 'numeric' });
};

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const authorName = project.author?.name ?? 'Autor desconhecido';
  const participants = project.participants?.length ?? 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50">
      <div className="relative aspect-[16/9] border-b border-border">
        {project.coverImage ? (
          <img src={project.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <SonaCover seed={project.title} className="h-full w-full" />
        )}
        <div className="absolute left-3 top-3 rounded-full bg-card/95 p-0.5 shadow-sm">
          <RankBadge rank={project.rank} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-primary">{project.category}</p>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-card-foreground">
          <Link to={`/projects/${project.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{project.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-2">
            <Avatar name={authorName} src={project.author?.avatar} size="xs" />
            <span className="truncate">{authorName}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="flex items-center gap-1" title={`${participants} participantes`}>
              <Users size={13} aria-hidden />
              <span className="font-mono">{participants}</span>
            </span>
            <time dateTime={project.createdAt}>{fmtDate(project.createdAt)}</time>
          </span>
        </div>
      </div>
      {/* Anel de foco para toda a cartão quando a ligação tem foco */}
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-primary group-has-[a:focus-visible]:ring-2" aria-hidden />
    </article>
  );
};

import { Link } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import type { Project } from '@/types';
import { RankBadge } from './RankBadge';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link to={`/projects/${project.id}`} className="group block">
      <div className="rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
          {project.coverImage ? (
            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-display font-bold text-primary/30">{project.title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <RankBadge rank={project.rank} size="sm" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <span className="text-xs font-medium text-primary">{project.category}</span>
            <h3 className="font-display font-bold text-card-foreground mt-1 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {project.author.name.charAt(0)}
              </div>
              <span className="text-xs text-muted-foreground">{project.author.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users size={12} />{project.participants.length}</span>
              <span className="flex items-center gap-1"><Calendar size={12} />{new Date(project.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

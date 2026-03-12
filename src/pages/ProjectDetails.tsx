import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, Users, UserPlus, MessageSquare, Calendar } from 'lucide-react';
import { RankBadge } from '@/components/RankBadge';
import { UserCard } from '@/components/UserCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types';
import { projectService } from '@/services/projectService';
import { participationService } from '@/services/participationService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';

const ProjectDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await projectService.getById(id);
        const data = unwrapApiResponseOrRaw<Project>(res);
        if (!alive) return;
        setProject(data ?? null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message ?? 'Falha ao carregar o projeto.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleParticipate = async () => {
    if (!project) return;
    try {
      const res = await participationService.requestParticipation(String(project.id));
      toast({ title: res?.data?.message ?? 'Solicitação enviada!' });
      const refreshed = await projectService.getById(String(project.id));
      setProject(unwrapApiResponseOrRaw<Project>(refreshed) ?? project);
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Falha ao solicitar participação.' });
    }
  };

  const handleSendComment = async () => {
    if (!project || !comment.trim()) return;
    try {
      const res = await projectService.addComment(String(project.id), comment.trim());
      toast({ title: res?.data?.message ?? 'Comentário enviado!' });
      setComment('');
    } catch (e: any) {
      toast({ title: e?.response?.data?.message ?? 'Falha ao enviar comentário.' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="aspect-[3/1] rounded-2xl bg-muted/40" />
        <SkeletonLoader count={4} type="line" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{error}</p>
        <Link to="/dashboard" className="text-primary hover:underline mt-2 inline-block">Voltar ao Dashboard</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Link to="/dashboard" className="text-primary hover:underline mt-2 inline-block">Voltar ao Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Voltar
      </Link>

      {/* Cover */}
      <div className="aspect-[3/1] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
        <span className="text-6xl font-display font-bold text-primary/20">{project.title.charAt(0)}</span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <RankBadge rank={project.rank} size="lg" />
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">{project.category}</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">{project.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{project.description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar size={14} />{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
          <span className="flex items-center gap-1"><Users size={14} />{project.participants.length + 1} participantes</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleParticipate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <UserPlus size={16} /> Participar do Projeto
        </button>
        <button onClick={() => toast({ title: 'Convite: implemente a escolha do usuário.' })} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
          <Users size={16} /> Convidar Usuário
        </button>
        {project.pdfUrl && (
          <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
            <Download size={16} /> Baixar PDF
          </a>
        )}
        {project.repositoryUrl && (
          <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
            <ExternalLink size={16} /> Repositório
          </a>
        )}
      </div>

      {/* Author & Participants */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground mb-3">Autor</h3>
          <UserCard user={project.author} compact />
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground mb-3">Participantes ({project.participants.length})</h3>
          {project.participants.length > 0 ? (
            <div className="space-y-1">
              {project.participants.map(u => <UserCard key={u.id} user={u} compact />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum participante ainda.</p>
          )}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <h3 className="font-display font-semibold text-foreground flex items-center gap-2"><MessageSquare size={18} /> Comentários ({project.comments?.length ?? 0})</h3>
        
        <div className="flex gap-3">
          <input value={comment} onChange={e => setComment(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" placeholder="Escreva um comentário..." />
          <button onClick={handleSendComment} className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Enviar</button>
        </div>

        {(project.comments ?? []).map(c => (
          <div key={c.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">{c.author.name.charAt(0)}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{c.author.name}</span>
                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;

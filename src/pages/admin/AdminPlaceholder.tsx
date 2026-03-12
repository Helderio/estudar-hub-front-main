import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const titles: Record<string, string> = {
  '/admin/analytics': 'Analytics',
  '/admin/users': 'Usuários',
  '/admin/projects': 'Projetos',
  '/admin/institutions': 'Instituições',
  '/admin/events': 'Eventos',
  '/admin/categories': 'Categorias',
  '/admin/rankings': 'Rankings',
  '/admin/settings': 'Configurações',
};

const AdminPlaceholder = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? 'Página';

  return (
    <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Construction size={28} className="text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-2 text-center max-w-md">
        Esta seção será implementada em breve. Os dados serão carregados diretamente da API.
      </p>
    </div>
  );
};

export default AdminPlaceholder;

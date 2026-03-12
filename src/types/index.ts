export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export const RANK_INFO: Record<Rank, { label: string; description: string }> = {
  E: { label: 'Muito Simples', description: 'Projectos introdutórios e exercícios básicos' },
  D: { label: 'Simples', description: 'Projectos com escopo pequeno e baixa complexidade' },
  C: { label: 'Médio', description: 'Projectos com complexidade moderada e múltiplas funcionalidades' },
  B: { label: 'Avançado', description: 'Projectos robustos com arquitectura complexa' },
  A: { label: 'TCC', description: 'Trabalhos de conclusão de curso com fundamentação teórica' },
  S: { label: 'Pesquisa Científica', description: 'Pesquisa académica com contribuição original ao conhecimento' },
};

export interface Institution {
  id: string;
  nome: string;
  sigla: string;
  logo?: string;
  website?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution: string;
  course?: string;
  avatar?: string;
  foto?: string;
  role_id?: string;
  institution_id?: string;
  institutionObj?: Institution;
  rank: Rank;
  projectCount: number;
  eventCount: number;
  bio?: string;
  github?: string;
  linkedin?: string;
  year?: string;
  userType?: 'student' | 'professor';
  interestArea?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  nome: string;
}

export interface ProjectRank {
  id: string;
  nome: Rank;
  descricao: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  rank: Rank;
  coverImage: string;
  pdfUrl?: string;
  repositoryUrl?: string;
  author: User;
  participants: User[];
  createdAt: string;
  comments: Comment[];
  titulo?: string;
  descricao?: string;
  capa?: string;
  link_repo?: string;
  pdf?: string;
  categoria_id?: string;
  rank_id?: string;
  categoryObj?: Category;
  projectRank?: ProjectRank;
  created_at?: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}

export type EventType = 'hackathon' | 'conference' | 'contest' | 'games';

export interface UniversityEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  banner: string;
  date: string;
  location: string;
  organizer: string;
  institution: string;
  participants: User[];
  status: 'open' | 'closed';
  titulo?: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  local?: string;
  institution_id?: string;
  institutionObj?: Institution;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Chat {
  id: string;
  participants: User[];
  messages: ChatMessage[];
  created_at: string;
}

export type ParticipationStatus = 'pending' | 'accepted' | 'rejected';

export interface Invitation {
  id: string;
  projectId: string;
  projectTitle: string;
  from: User;
  to: User;
  status: ParticipationStatus;
  createdAt: string;
}

export const PROJECT_CATEGORIES = [
  'Desenvolvimento Web',
  'Mobile',
  'IA & Machine Learning',
  'Ciência de Dados',
  'IoT',
  'Segurança',
  'DevOps',
  'Banco de Dados',
  'Jogos',
  'Outro',
] as const;

export const EVENT_TYPES: Record<EventType, string> = {
  hackathon: 'Hackathon',
  conference: 'Conferência',
  contest: 'Concurso',
  games: 'Jogos Universitários',
};

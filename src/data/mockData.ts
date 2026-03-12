import type { User, Project, UniversityEvent, Invitation, Chat, ChatMessage } from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: 'Manuel Domingos', email: 'manuel@ukb.ao', phone: '+244 923 456 789', institution: 'UKB', course: 'Engenharia Informática', rank: 'A', projectCount: 8, eventCount: 5, avatar: '', bio: 'Desenvolvedor full-stack apaixonado por tecnologia e inovação em Angola.', github: 'https://github.com/manueldomingos', linkedin: 'https://linkedin.com/in/manueldomingos', year: '4º Ano', userType: 'student' },
  { id: '2', name: 'Teresa Joaquim', email: 'teresa@isced-bg.ao', phone: '+244 912 345 678', institution: 'ISCED-BG', course: 'Direito', rank: 'B', projectCount: 5, eventCount: 3, avatar: '', year: '3º Ano', userType: 'student' },
  { id: '3', name: 'António Figueiredo', email: 'antonio@umandume.ao', phone: '+244 945 678 901', institution: 'UMA', course: 'Medicina', rank: 'S', projectCount: 12, eventCount: 7, avatar: '', bio: 'Pesquisador em saúde pública com foco em doenças tropicais.', year: '5º Ano', userType: 'student' },
  { id: '4', name: 'Luísa Tavares', email: 'luisa@ispb.ao', phone: '+244 934 567 890', institution: 'ISPB', course: 'Economia', rank: 'C', projectCount: 3, eventCount: 2, avatar: '', year: '2º Ano', userType: 'student' },
  { id: '5', name: 'Prof. Carlos Mendes', email: 'carlos@ukb.ao', phone: '+244 956 789 012', institution: 'UKB', course: 'Engenharia Informática', rank: 'S', projectCount: 15, eventCount: 10, avatar: '', bio: 'Professor catedrático e orientador de projectos de investigação.', userType: 'professor' },
  { id: '6', name: 'Beatriz Sousa', email: 'beatriz@isced-bg.ao', phone: '+244 967 890 123', institution: 'ISCED-BG', course: 'Educação', rank: 'D', projectCount: 2, eventCount: 1, avatar: '', year: '1º Ano', userType: 'student' },
];

export const mockProjects: Project[] = [
  {
    id: '1', title: 'Sistema de Gestão Académica - UKB', description: 'Plataforma completa para gestão de notas, frequência e histórico académico da Universidade Katyavala Bwila. Desenvolvido com Spring Boot e React, inclui portal do aluno e dashboard administrativo.', category: 'Desenvolvimento Web', rank: 'A', coverImage: '', pdfUrl: '#', repositoryUrl: 'https://github.com', author: mockUsers[0], participants: [mockUsers[1], mockUsers[3]], createdAt: '2026-01-15', comments: [
      { id: 'c1', author: mockUsers[1], content: 'Projecto muito bem estruturado! A arquitectura está excelente.', createdAt: '2026-01-20' },
      { id: 'c2', author: mockUsers[2], content: 'Gostaria de contribuir na parte de relatórios estatísticos.', createdAt: '2026-01-22' },
    ],
  },
  {
    id: '2', title: 'App de Transporte Benguela-Lobito', description: 'Aplicativo mobile para conectar passageiros e motoristas na rota Benguela-Lobito-Catumbela. Inclui sistema de avaliação e rotas otimizadas.', category: 'Mobile', rank: 'C', coverImage: '', author: mockUsers[1], participants: [mockUsers[5]], createdAt: '2026-02-01', comments: [],
  },
  {
    id: '3', title: 'IA para Diagnóstico de Malária', description: 'Sistema avançado de detecção de malária utilizando visão computacional e deep learning. Analisa imagens de microscopia para identificação rápida do parasita.', category: 'IA & Machine Learning', rank: 'S', coverImage: '', repositoryUrl: 'https://github.com', author: mockUsers[2], participants: [mockUsers[0], mockUsers[4]], createdAt: '2025-11-10', comments: [],
  },
  {
    id: '4', title: 'Plataforma de Monitoria Online', description: 'Sistema para agendar e realizar monitorias online entre alunos e professores com videoconferência integrada, ideal para apoio académico à distância.', category: 'Desenvolvimento Web', rank: 'B', coverImage: '', pdfUrl: '#', author: mockUsers[3], participants: [mockUsers[0]], createdAt: '2026-01-28', comments: [],
  },
  {
    id: '5', title: 'Bot de Atendimento ao Aluno - ISCED', description: 'Chatbot inteligente para tirar dúvidas frequentes de alunos sobre matrícula, notas e calendário académico do ISCED Benguela.', category: 'IA & Machine Learning', rank: 'D', coverImage: '', author: mockUsers[5], participants: [], createdAt: '2026-02-05', comments: [],
  },
  {
    id: '6', title: 'Dashboard de Análise Económica', description: 'Painel de visualização de dados económicos da província de Benguela com gráficos interactivos e indicadores de desenvolvimento.', category: 'Ciência de Dados', rank: 'E', coverImage: '', author: mockUsers[3], participants: [mockUsers[5]], createdAt: '2026-02-08', comments: [],
  },
  {
    id: '7', title: 'Biblioteca Digital Universitária', description: 'Sistema de catalogação e acesso digital a obras académicas, teses e dissertações das universidades de Benguela.', category: 'Desenvolvimento Web', rank: 'B', coverImage: '', pdfUrl: '#', repositoryUrl: 'https://github.com', author: mockUsers[4], participants: [mockUsers[0], mockUsers[1]], createdAt: '2026-01-05', comments: [],
  },
  {
    id: '8', title: 'App de Segurança no Campus', description: 'Aplicação mobile para reportar ocorrências e emergências nos campi universitários de Benguela com geolocalização em tempo real.', category: 'Mobile', rank: 'C', coverImage: '', author: mockUsers[0], participants: [mockUsers[3]], createdAt: '2026-02-12', comments: [],
  },
];

export const mockEvents: UniversityEvent[] = [
  { id: '1', title: 'HackBenguela 2026', description: 'O maior hackathon universitário de Benguela. 48 horas de inovação, mentorias e networking com líderes da indústria tech angolana.', type: 'hackathon', banner: '', date: '2026-03-15', location: 'Benguela', organizer: 'Departamento de Informática', institution: 'UKB', participants: [mockUsers[0], mockUsers[1], mockUsers[2]], status: 'open' },
  { id: '2', title: 'Conferência de Tecnologia e Inovação', description: 'Conferência com palestras sobre avanços tecnológicos e suas aplicações no contexto angolano. Participação de especialistas nacionais e internacionais.', type: 'conference', banner: '', date: '2026-04-20', location: 'Lobito', organizer: 'Direcção Científica', institution: 'ISCED-BG', participants: [mockUsers[2], mockUsers[3]], status: 'open' },
  { id: '3', title: 'Jogos Universitários de Benguela', description: 'Competição desportiva inter-universitária com diversas modalidades. Represente a sua universidade!', type: 'games', banner: '', date: '2026-05-10', location: 'Benguela', organizer: 'Associação de Estudantes', institution: 'UKB', participants: [mockUsers[3], mockUsers[5]], status: 'open' },
  { id: '4', title: 'Workshop de Defesa de TCC', description: 'Workshop preparatório para apresentação e defesa de trabalhos de conclusão de curso. Dicas de estrutura, apresentação e arguição.', type: 'conference', banner: '', date: '2026-02-28', location: 'Catumbela', organizer: 'Coordenação de Cursos', institution: 'ISPB', participants: [mockUsers[0], mockUsers[4]], status: 'open' },
  { id: '5', title: 'Concurso de Inovação Tecnológica', description: 'Apresente a sua solução inovadora para problemas reais de Angola e concorra a prémios e incubação do seu projecto.', type: 'contest', banner: '', date: '2026-02-01', location: 'Benguela', organizer: 'Incubadora UKB', institution: 'UKB', participants: mockUsers, status: 'closed' },
  { id: '6', title: 'Seminário de Saúde Pública', description: 'Seminário sobre desafios de saúde pública em Benguela com apresentação de pesquisas e projectos da área médica.', type: 'conference', banner: '', date: '2026-06-05', location: 'Lobito', organizer: 'Faculdade de Medicina', institution: 'UMA', participants: [mockUsers[2]], status: 'open' },
];

export const mockInvitations: Invitation[] = [
  { id: '1', projectId: '1', projectTitle: 'Sistema de Gestão Académica - UKB', from: mockUsers[0], to: mockUsers[2], status: 'pending', createdAt: '2026-02-10' },
  { id: '2', projectId: '3', projectTitle: 'IA para Diagnóstico de Malária', from: mockUsers[2], to: mockUsers[5], status: 'accepted', createdAt: '2026-01-15' },
  { id: '3', projectId: '4', projectTitle: 'Plataforma de Monitoria Online', from: mockUsers[3], to: mockUsers[1], status: 'rejected', createdAt: '2026-01-30' },
  { id: '4', projectId: '7', projectTitle: 'Biblioteca Digital Universitária', from: mockUsers[4], to: mockUsers[0], status: 'pending', createdAt: '2026-02-13' },
];

export const mockChats: Chat[] = [
  {
    id: '1',
    participants: [mockUsers[0], mockUsers[1]],
    messages: [
      { id: 'm1', chat_id: '1', sender_id: '2', content: 'Olá Manuel! Vi o teu projecto de gestão académica, está muito bom!', created_at: '2026-02-14T10:30:00' },
      { id: 'm2', chat_id: '1', sender_id: '1', content: 'Obrigado Teresa! Estamos a trabalhar na parte de relatórios agora.', created_at: '2026-02-14T10:32:00' },
      { id: 'm3', chat_id: '1', sender_id: '2', content: 'Posso ajudar nessa parte? Tenho experiência com geração de PDFs.', created_at: '2026-02-14T10:35:00' },
      { id: 'm4', chat_id: '1', sender_id: '1', content: 'Seria óptimo! Vou te adicionar como participante.', created_at: '2026-02-14T10:36:00' },
    ],
    created_at: '2026-02-14T10:30:00',
  },
  {
    id: '2',
    participants: [mockUsers[0], mockUsers[2]],
    messages: [
      { id: 'm5', chat_id: '2', sender_id: '3', content: 'Manuel, precisamos discutir a integração da IA no projecto de diagnóstico.', created_at: '2026-02-13T14:00:00' },
      { id: 'm6', chat_id: '2', sender_id: '1', content: 'Claro! Podemos usar TensorFlow para o modelo. O que achas?', created_at: '2026-02-13T14:05:00' },
      { id: 'm7', chat_id: '2', sender_id: '3', content: 'Boa ideia. Vou preparar o dataset de imagens de microscopia.', created_at: '2026-02-13T14:10:00' },
    ],
    created_at: '2026-02-13T14:00:00',
  },
  {
    id: '3',
    participants: [mockUsers[0], mockUsers[4]],
    messages: [
      { id: 'm8', chat_id: '3', sender_id: '5', content: 'Manuel, a tua proposta de TCC está aprovada. Parabéns!', created_at: '2026-02-12T09:00:00' },
      { id: 'm9', chat_id: '3', sender_id: '1', content: 'Muito obrigado Professor! Vou iniciar a implementação esta semana.', created_at: '2026-02-12T09:15:00' },
    ],
    created_at: '2026-02-12T09:00:00',
  },
];

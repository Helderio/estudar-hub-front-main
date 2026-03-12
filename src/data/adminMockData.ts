export const overviewStats = {
  totalUsers: 4_230,
  totalProjects: 1_128,
  totalEvents: 86,
  totalInstitutions: 12,
  userGrowth: 18.7,
  projectGrowth: 14.2,
  eventGrowth: 31.5,
  institutionGrowth: 8.3,
};

export const userGrowthData = [
  { month: 'Jan', users: 1200, projects: 280 },
  { month: 'Fev', users: 1500, projects: 340 },
  { month: 'Mar', users: 1850, projects: 420 },
  { month: 'Abr', users: 2100, projects: 510 },
  { month: 'Mai', users: 2450, projects: 600 },
  { month: 'Jun', users: 2800, projects: 690 },
  { month: 'Jul', users: 3100, projects: 780 },
  { month: 'Ago', users: 3400, projects: 860 },
  { month: 'Set', users: 3650, projects: 930 },
  { month: 'Out', users: 3850, projects: 1000 },
  { month: 'Nov', users: 4050, projects: 1070 },
  { month: 'Dez', users: 4230, projects: 1128 },
];

export const rankDistribution = [
  { rank: 'E', count: 380, fill: 'hsl(142, 71%, 45%)' },
  { rank: 'D', count: 290, fill: 'hsl(173, 80%, 40%)' },
  { rank: 'C', count: 210, fill: 'hsl(45, 93%, 47%)' },
  { rank: 'B', count: 145, fill: 'hsl(25, 95%, 53%)' },
  { rank: 'A', count: 78, fill: 'hsl(0, 84%, 60%)' },
  { rank: 'S', count: 25, fill: 'hsl(270, 76%, 55%)' },
];

export const categoryDistribution = [
  { name: 'Desenvolvimento Web', value: 320 },
  { name: 'Mobile', value: 210 },
  { name: 'IA & ML', value: 175 },
  { name: 'Ciência de Dados', value: 140 },
  { name: 'IoT', value: 95 },
  { name: 'Segurança', value: 72 },
  { name: 'DevOps', value: 58 },
  { name: 'Jogos', value: 38 },
  { name: 'Outros', value: 20 },
];

export const recentUsers = [
  { id: '1', name: 'Manuel Domingos', email: 'manuel@ukb.ao', institution: 'UKB', course: 'Engenharia Informática', rank: 'A' as const, projects: 8, joinedAt: '2026-02-12' },
  { id: '2', name: 'Teresa Joaquim', email: 'teresa@isced-bg.ao', institution: 'ISCED-BG', course: 'Direito', rank: 'B' as const, projects: 5, joinedAt: '2026-02-11' },
  { id: '3', name: 'António Figueiredo', email: 'antonio@umandume.ao', institution: 'UMA', course: 'Medicina', rank: 'S' as const, projects: 12, joinedAt: '2026-02-10' },
  { id: '4', name: 'Luísa Tavares', email: 'luisa@ispb.ao', institution: 'ISPB', course: 'Economia', rank: 'C' as const, projects: 3, joinedAt: '2026-02-09' },
  { id: '5', name: 'Beatriz Sousa', email: 'beatriz@isced-bg.ao', institution: 'ISCED-BG', course: 'Educação', rank: 'D' as const, projects: 2, joinedAt: '2026-02-08' },
];

export const topInstitutions = [
  { name: 'Universidade Katyavala Bwila', sigla: 'UKB', users: 1540, projects: 420 },
  { name: 'ISCED Benguela', sigla: 'ISCED-BG', users: 980, projects: 280 },
  { name: 'Universidade Mandume', sigla: 'UMA', users: 720, projects: 195 },
  { name: 'Instituto Sup. Politécnico de Benguela', sigla: 'ISPB', users: 560, projects: 140 },
  { name: 'Universidade Jean Piaget', sigla: 'UJP', users: 430, projects: 93 },
];

export const eventsPerMonth = [
  { month: 'Jan', events: 4 },
  { month: 'Fev', events: 6 },
  { month: 'Mar', events: 8 },
  { month: 'Abr', events: 5 },
  { month: 'Mai', events: 10 },
  { month: 'Jun', events: 7 },
  { month: 'Jul', events: 3 },
  { month: 'Ago', events: 9 },
  { month: 'Set', events: 11 },
  { month: 'Out', events: 8 },
  { month: 'Nov', events: 9 },
  { month: 'Dez', events: 6 },
];

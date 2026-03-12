import { Users, FolderKanban, CalendarDays, Building2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { StatCard } from '@/components/admin/StatCard';
import {
  overviewStats, userGrowthData, rankDistribution, categoryDistribution,
  recentUsers, topInstitutions, eventsPerMonth,
} from '@/data/adminMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RANK_COLORS: Record<string, string> = {
  E: 'hsl(142,71%,45%)', D: 'hsl(173,80%,40%)', C: 'hsl(45,93%,47%)',
  B: 'hsl(25,95%,53%)', A: 'hsl(0,84%,60%)', S: 'hsl(270,76%,55%)',
};

const BLUE = 'hsl(217,91%,60%)';
const BLUE_LIGHT = 'hsl(217,91%,73%)';

const AdminDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da plataforma EstudarHub · Benguela</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total de Utilizadores" value={overviewStats.totalUsers.toLocaleString('pt-BR')} change={overviewStats.userGrowth} icon={Users} />
        <StatCard title="Projectos" value={overviewStats.totalProjects.toLocaleString('pt-BR')} change={overviewStats.projectGrowth} icon={FolderKanban} />
        <StatCard title="Eventos" value={overviewStats.totalEvents.toLocaleString('pt-BR')} change={overviewStats.eventGrowth} icon={CalendarDays} />
        <StatCard title="Instituições" value={overviewStats.totalInstitutions.toLocaleString('pt-BR')} change={overviewStats.institutionGrowth} icon={Building2} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Crescimento da Plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BLUE_LIGHT} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={BLUE_LIGHT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(0,0%,100%)', border: '1px solid hsl(214,32%,91%)', borderRadius: '8px', fontSize: '13px' }} />
                  <Area type="monotone" dataKey="users" name="Utilizadores" stroke={BLUE} fill="url(#colorUsers)" strokeWidth={2} />
                  <Area type="monotone" dataKey="projects" name="Projectos" stroke={BLUE_LIGHT} fill="url(#colorProjects)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Distribuição por Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rankDistribution} dataKey="count" nameKey="rank" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                    {rankDistribution.map((entry) => <Cell key={entry.rank} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(0,0%,100%)', border: '1px solid hsl(214,32%,91%)', borderRadius: '8px', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {rankDistribution.map((r) => (
                <div key={r.rank} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: r.fill }} />
                  <span className="text-muted-foreground">Rank {r.rank}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Eventos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,16%,47%)" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(0,0%,100%)', border: '1px solid hsl(214,32%,91%)', borderRadius: '8px', fontSize: '13px' }} />
                  <Bar dataKey="events" name="Eventos" fill={BLUE} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Instituições</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topInstitutions.map((inst, i) => (
              <div key={inst.sigla} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inst.sigla}</p>
                  <p className="text-xs text-muted-foreground">{inst.users.toLocaleString('pt-BR')} utilizadores</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{inst.projects}</span>
                <span className="text-xs text-muted-foreground">proj.</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Utilizadores Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Instituição</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Curso</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Rank</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Proj.</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{u.institution}</td>
                    <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{u.course}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant="outline" className="text-xs font-bold border-0" style={{ backgroundColor: `${RANK_COLORS[u.rank]}20`, color: RANK_COLORS[u.rank] }}>
                        {u.rank}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-foreground">{u.projects}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground hidden lg:table-cell">{new Date(u.joinedAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useMemo, useState } from 'react';
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
import { RankDiamond } from '@/components/RankBadge';
import type { Rank } from '@/types';
import { adminService, type AdminDashboardResponse } from '@/services/adminService';
import { unwrapApiResponseOrRaw } from '@/services/apiResponse';

const RANK_COLORS: Record<string, string> = {
  E: 'hsl(142,71%,45%)', D: 'hsl(173,80%,40%)', C: 'hsl(45,93%,47%)',
  B: 'hsl(25,95%,53%)', A: 'hsl(0,84%,60%)', S: 'hsl(270,76%,55%)',
};

const BLUE = 'hsl(217,91%,60%)';
const BLUE_LIGHT = 'hsl(217,91%,73%)';

// Estilos com variáveis CSS para funcionarem no tema escuro
const TOOLTIP_STYLE = {
  backgroundColor: 'hsl(var(--popover))',
  color: 'hsl(var(--popover-foreground))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  fontSize: '13px',
};
const TICK = { fontSize: 12, style: { fill: 'hsl(var(--muted-foreground))' } };

function getApiErrorMessage(err: unknown): string | undefined {
  if (!err || typeof err !== 'object') return undefined;
  if (!('response' in err)) return undefined;

  const response = (err as { response?: unknown }).response;
  if (!response || typeof response !== 'object') return undefined;
  if (!('data' in response)) return undefined;

  const data = (response as { data?: unknown }).data;
  if (!data || typeof data !== 'object') return undefined;
  if (!('message' in data)) return undefined;

  const message = (data as { message?: unknown }).message;
  return typeof message === 'string' ? message : undefined;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardResponse>({
    overviewStats,
    userGrowthData,
    // backend nao devolve `fill`; geramos localmente.
    rankDistribution: rankDistribution.map((r) => ({ rank: r.rank, count: r.count })),
    categoryDistribution,
    recentUsers,
    topInstitutions,
    eventsPerMonth,
  });

  const growthChartData =
    dashboard.userGrowthData && dashboard.userGrowthData.length > 0
      ? dashboard.userGrowthData
      : userGrowthData;

  const eventsChartData =
    dashboard.eventsPerMonth && dashboard.eventsPerMonth.length > 0
      ? dashboard.eventsPerMonth
      : eventsPerMonth;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminService.getDashboard();
        const data = unwrapApiResponseOrRaw<AdminDashboardResponse>(res);
        if (!alive) return;
        // Junta à estrutura existente: uma resposta parcial não deve deitar a página abaixo
        if (data && typeof data === 'object' && 'overviewStats' in data) {
          setDashboard((prev) => ({ ...prev, ...data, overviewStats: { ...prev.overviewStats, ...(data.overviewStats ?? {}) } }));
        }
      } catch (e: unknown) {
        if (!alive) return;
        // Mantem fallback (mock) para não quebrar o dashboard se a API estiver fora.
        setError(getApiErrorMessage(e) ?? null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rankDistributionWithFill = useMemo(() => {
    return (dashboard.rankDistribution || []).map((r) => ({
      ...r,
      fill: RANK_COLORS[r.rank] || 'hsl(215,16%,47%)',
    }));
  }, [dashboard.rankDistribution]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Painel</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Utilizadores, projectos e eventos da plataforma.</p>
        {loading && <p className="mt-2 text-xs text-muted-foreground">A carregar dados.</p>}
        {error && <p className="mt-2 text-xs text-destructive">A API respondeu com erro: {error}. Os valores abaixo podem ser de exemplo.</p>}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard title="Utilizadores" value={dashboard.overviewStats.totalUsers.toLocaleString('pt-AO')} change={dashboard.overviewStats.userGrowth} icon={Users} />
        <StatCard title="Projectos" value={dashboard.overviewStats.totalProjects.toLocaleString('pt-AO')} change={dashboard.overviewStats.projectGrowth} icon={FolderKanban} />
        <StatCard title="Eventos" value={dashboard.overviewStats.totalEvents.toLocaleString('pt-AO')} change={dashboard.overviewStats.eventGrowth} icon={CalendarDays} />
        <StatCard title="Instituições" value={dashboard.overviewStats.totalInstitutions.toLocaleString('pt-AO')} change={dashboard.overviewStats.institutionGrowth} icon={Building2} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Crescimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 text-border">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthChartData}>
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
                  <CartesianGrid vertical={false} stroke="currentColor" />
                  <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="users" name="Utilizadores" stroke={BLUE} fill="url(#colorUsers)" strokeWidth={2} />
                  <Area type="monotone" dataKey="projects" name="Projectos" stroke={BLUE_LIGHT} fill="url(#colorProjects)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Projectos por rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rankDistributionWithFill} dataKey="count" nameKey="rank" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                    {rankDistributionWithFill.map((entry) => <Cell key={entry.rank} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {rankDistributionWithFill.map((r) => (
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
            <CardTitle className="text-base font-semibold">Eventos por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 text-border">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsChartData}>
                  <CartesianGrid vertical={false} stroke="currentColor" />
                  <XAxis dataKey="month" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="events" name="Eventos" fill={BLUE} radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Instituições mais activas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.topInstitutions.map((inst, i) => (
              <div key={inst.sigla} className="flex items-center gap-3">
                <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{inst.sigla}</p>
                  <p className="text-xs text-muted-foreground">{inst.users.toLocaleString('pt-AO')} utilizadores</p>
                </div>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-sm font-medium text-foreground">{inst.projects}</span>
                  <span className="block text-[11px] text-muted-foreground">projectos</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Registos recentes</CardTitle>
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
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Projectos</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Registo</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/60 transition-colors">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{u.institution}</td>
                    <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{u.course}</td>
                    <td className="py-3 px-2 text-center">
                      {u.rank in RANK_COLORS ? <RankDiamond rank={u.rank as Rank} size="sm" /> : u.rank}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-foreground">{u.projects}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground hidden lg:table-cell">{new Date(u.joinedAt).toLocaleDateString('pt-AO')}</td>
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

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getEmployerReport } from '../../api/reports.api';
import { Panel } from '../../components/common/Panel';
import { Spinner } from '../../components/common/Spinner';
import { StatCard } from '../../components/common/StatCard';
import { AppShell } from '../../components/layout/AppShell';
import { useAuth } from '../../hooks/useAuth';

// Gradient palette for bars
const BAR_COLORS = [
  '#0f7d82', '#1a9fa6', '#34c4cc', '#5cd6dd',
  '#8be4e8', '#b3eeef', '#d4f5f6', '#e8fbfb',
];

// Custom tooltip
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { title: string; applications: number } }> }) {
  if (!active || !payload?.length) return null;
  const { title, applications } = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold text-ink/50 mb-0.5 max-w-[200px] truncate">{title}</p>
      <p className="text-xl font-bold text-lagoon">{applications}</p>
      <p className="text-xs text-ink/40">candidature{applications > 1 ? 's' : ''}</p>
    </div>
  );
}

// Custom X-axis tick (abbreviated title)
function CustomXAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const label = payload?.value ?? '';
  const abbreviated = label.length > 14 ? label.slice(0, 12) + '…' : label;
  return (
    <text x={x} y={y! + 12} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={500}>
      {abbreviated}
    </text>
  );
}

export function EmployerDashboard() {
  const { user } = useAuth();
  const reportQuery = useQuery({
    queryKey: ['reports', 'employer', user?.id],
    queryFn: () => getEmployerReport(user!.id),
    enabled: Boolean(user?.id),
  });

  const report = reportQuery.data;

  return (
    <AppShell eyebrow="Centre de commande employeur" title="Gardez le cap sur vos recrutements">
      {reportQuery.isLoading ? (
        <Spinner />
      ) : reportQuery.isError ? (
        <Panel>Impossible de charger le tableau de bord employeur pour le moment.</Panel>
      ) : report ? (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Offres actives" value={report.openJobs} />
            <StatCard label="Candidatures reçues" value={report.totalApplicationsReceived} />
            <StatCard label="Taux d'acceptation" value={`${Math.round(report.acceptanceRate * 100)}%`} />
            <StatCard label="Moy. cand. / offre" value={report.averageApplicationsPerJob.toFixed(2)} />
          </div>

          {/* Bar Chart */}
          <Panel className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Candidatures par offre</h3>
                <p className="text-sm text-ink/45 mt-0.5">Comparaison du volume de candidatures reçues par poste</p>
              </div>
              {report.jobPerformance.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-lagoon/10 px-3 py-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-lagoon" />
                  <span className="text-xs font-semibold text-lagoon">Candidatures</span>
                </div>
              )}
            </div>

            {report.jobPerformance.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-ink/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                <p className="text-sm font-medium text-ink/40">Aucune donnée de performance disponible</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={report.jobPerformance}
                    margin={{ top: 24, right: 16, left: 0, bottom: 24 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="title"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      tick={CustomXAxisTick as any}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                      width={28}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(15, 125, 130, 0.06)', radius: 8 }} />
                    <Bar dataKey="applications" radius={[10, 10, 0, 0]} maxBarSize={64} isAnimationActive>
                      <LabelList
                        dataKey="applications"
                        position="top"
                        style={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                      />
                      {report.jobPerformance.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </>
      ) : (
        <Panel>Aucune donnée employeur disponible.</Panel>
      )}
    </AppShell>
  );
}

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Users, UserPlus, Coffee, AlertCircle,
  DollarSign, Heart, Zap
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { employees, departments } from '../data/employees';
import { candidates, openPositions } from '../data/candidates';
import { requests } from '../data/content';
import { cn } from '../lib/utils';
import { useDesignMode } from '../hooks/useDesignMode';
import { useLanguage } from '../hooks/useLanguage';
import { AdminDashboardEditorial } from './AdminDashboardEditorial';
import { AdminDashboardBrutalist } from './AdminDashboardBrutalist';

type Period = 'week' | 'month' | 'quarter';

const CHART_DATA = {
  week: {
    headcount: [
      { month: 'Po', count: 14 }, { month: 'Ut', count: 14 }, { month: 'St', count: 15 },
      { month: 'St', count: 15 }, { month: 'Pi', count: 15 },
    ],
    enps: [
      { month: 'Po', score: 56 }, { month: 'Ut', score: 57 }, { month: 'St', score: 58 },
      { month: 'St', score: 58 }, { month: 'Pi', score: 60 },
    ],
    funnel: [
      { stage: 'Applied', count: 12 },
      { stage: 'Screened', count: 5 },
      { stage: 'Interviewed', count: 2 },
      { stage: 'Offered', count: 1 },
      { stage: 'Hired', count: 0 },
    ],
    label: 'Tento týždeň',
    growthLabel: '+0 týždenne',
    growthValue: 0,
  },
  month: {
    headcount: [
      { month: 'Jan', count: 11 }, { month: 'Feb', count: 12 }, { month: 'Mar', count: 13 },
      { month: 'Apr', count: 14 }, { month: 'May', count: 15 }, { month: 'Jun', count: 15 },
    ],
    enps: [
      { month: 'Jan', score: 32 }, { month: 'Feb', score: 38 }, { month: 'Mar', score: 41 },
      { month: 'Apr', score: 45 }, { month: 'May', score: 52 }, { month: 'Jun', score: 58 },
    ],
    funnel: [
      { stage: 'Applied', count: 87 },
      { stage: 'Screened', count: 34 },
      { stage: 'Interviewed', count: 12 },
      { stage: 'Offered', count: 5 },
      { stage: 'Hired', count: 3 },
    ],
    label: 'Posledných 6 mesiacov',
    growthLabel: '+4 novenástupy',
    growthValue: 4,
  },
  quarter: {
    headcount: [
      { month: 'Q1 25', count: 8 }, { month: 'Q2 25', count: 10 }, { month: 'Q3 25', count: 11 },
      { month: 'Q4 25', count: 13 }, { month: 'Q1 26', count: 14 }, { month: 'Q2 26', count: 15 },
    ],
    enps: [
      { month: 'Q1 25', score: 22 }, { month: 'Q2 25', score: 28 }, { month: 'Q3 25', score: 35 },
      { month: 'Q4 25', score: 41 }, { month: 'Q1 26', score: 48 }, { month: 'Q2 26', score: 58 },
    ],
    funnel: [
      { stage: 'Applied', count: 287 },
      { stage: 'Screened', count: 112 },
      { stage: 'Interviewed', count: 41 },
      { stage: 'Offered', count: 14 },
      { stage: 'Hired', count: 9 },
    ],
    label: 'Posledných 6 kvartálov',
    growthLabel: '+7 kvartálne',
    growthValue: 7,
  },
};

const turnoverByDept = [
  { dept: 'IT', voluntary: 0, involuntary: 0 },
  { dept: 'Sales', voluntary: 1, involuntary: 0 },
  { dept: 'Marketing', voluntary: 0, involuntary: 1 },
  { dept: 'HR', voluntary: 0, involuntary: 0 },
];

/**
 * Top-level dispatcher: renders Editorial, Brutalist or Classic dashboard based on global design mode.
 */
export function AdminDashboard() {
  const { mode } = useDesignMode();
  if (mode === 'editorial') return <AdminDashboardEditorial />;
  if (mode === 'brutalist') return <AdminDashboardBrutalist />;
  return <AdminDashboardClassic />;
}

function AdminDashboardClassic() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [period, setPeriod] = useState<Period>('month');
  const data = CHART_DATA[period];
  const copy = {
    title: isEn ? 'HR Dashboard' : 'HR Dashboard',
    hello: isEn ? 'Good day, Janka 👋' : 'Dobrý deň, Janka 👋',
    overview: isEn ? 'Here is your company overview' : 'Tu je tvoj prehľad firmy',
    week: isEn ? 'Week' : 'Týždeň',
    month: isEn ? 'Month' : 'Mesiac',
    quarter: isEn ? 'Quarter' : 'Kvartál',
    employees: isEn ? 'Employees' : 'Zamestnanci',
    activeCandidates: isEn ? 'Active candidates' : 'Aktívni kandidáti',
    pendingRequests: isEn ? 'Pending requests' : 'Žiadanky',
    waitingApproval: isEn ? 'Awaiting approval' : 'Čakajú na schválenie',
    conversion: isEn ? 'conversion' : 'konverzia',
    headcountGrowth: isEn ? 'Headcount Growth' : 'Rast počtu ľudí',
    growth: isEn ? 'growth' : 'rast',
    enpsScore: isEn ? 'eNPS Score' : 'eNPS skóre',
    workerSatisfaction: isEn ? 'Employee satisfaction' : 'Spokojnosť zamestnancov',
    recruitingFunnel: isEn ? 'Recruiting Funnel' : 'Náborový funnel',
    turnoverByDept: isEn ? 'Turnover by Department' : 'Fluktuácia podľa oddelenia',
    last12Months: isEn ? 'Last 12 months' : 'Posledných 12 mesiacov',
    voluntary: isEn ? 'Voluntary' : 'Dobrovoľný',
    involuntary: isEn ? 'Involuntary' : 'Nedobrovoľný',
    aiInsightTitle: isEn ? '⚠️ AI Insight: vacation cluster in July' : '⚠️ AI Insight: vacation cluster v júli',
    aiInsightBody: isEn
      ? 'Filip and Tomáš requested vacation for July 14-25. Together with Adam\'s approved leave, the IT team drops to 3 people for 2 weeks. Consider discussing with Peter (Head of Engineering).'
      : 'Filip a Tomáš požiadali o dovolenku 14.-25. júla. Spolu s Adamovou už schválenou dovolenkou klesne IT tím na 3 ľudí počas 2 týždňov. Zvážte vyriešiť s Petrom (Head of Engineering).',
    openTimeOff: isEn ? '📅 Open Time-off' : '📅 Otvoriť Time-off',
    skip: isEn ? 'Skip' : 'Preskočiť',
  };
  const funnelLabels: Record<string, string> = {
    Applied: isEn ? 'Applied' : 'Aplikoval/a',
    Screened: isEn ? 'Screening' : 'Po screeningu',
    Interviewed: isEn ? 'Interviewed' : 'Po pohovore',
    Offered: isEn ? 'Offered' : 'S ponukou',
    Hired: isEn ? 'Hired' : 'Prijatý/á',
  };
  const growthLabel = period === 'week'
    ? (isEn ? '+0 weekly' : '+0 týždenne')
    : period === 'month'
      ? (isEn ? '+4 new hires' : '+4 novenástupy')
      : (isEn ? '+7 quarterly' : '+7 kvartálne');
  const periodLabel = period === 'week'
    ? (isEn ? 'This week' : 'Tento týždeň')
    : period === 'month'
      ? (isEn ? 'Last 6 months' : 'Posledných 6 mesiacov')
      : (isEn ? 'Last 6 quarters' : 'Posledných 6 kvartálov');
  const funnelData = data.funnel.map((item) => ({ ...item, stageLabel: funnelLabels[item.stage] || item.stage }));

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const activeRecruits = candidates.filter((c) => !['hired', 'rejected'].includes(c.stage)).length;

  const enpsCurrent = data.enps[data.enps.length - 1].score;
  const enpsPrev = data.enps[data.enps.length - 2]?.score || enpsCurrent;
  const enpsDelta = enpsCurrent - enpsPrev;

  const conversion = data.funnel[0].count > 0
    ? Math.round((data.funnel[data.funnel.length - 1].count / data.funnel[0].count) * 100 * 10) / 10
    : 0;

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">{copy.title}</p>
          <h1 className="font-display text-3xl">{copy.hello}</h1>
          <p className="text-secondary text-sm mt-1">
            {copy.overview} · {new Date().toLocaleDateString(isEn ? 'en-US' : 'sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-tertiary rounded-lg">
          {([
            { id: 'week' as const, label: copy.week },
            { id: 'month' as const, label: copy.month },
            { id: 'quarter' as const, label: copy.quarter },
          ]).map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                period === p.id
                  ? 'accent-bg text-white shadow-sm-themed'
                  : 'text-secondary hover:text-primary'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label={copy.employees}
          value={employees.length}
          change={isEn ? '+1 this month' : '+1 tento mesiac'}
          trend="up"
          color="#3b82f6"
        />
        <KpiCard
          icon={Heart}
          label="eNPS"
          value={`+${enpsCurrent}`}
          change={enpsDelta >= 0 ? `+${enpsDelta} vs predchádzajúce obdobie` : `${enpsDelta} vs predchádzajúce obdobie`}
          trend={enpsDelta >= 0 ? 'up' : 'down'}
          color="#ec4899"
        />
        <KpiCard
          icon={UserPlus}
          label={copy.activeCandidates}
          value={activeRecruits}
          change={`${conversion}% ${copy.conversion}`}
          trend="up"
          color="#10b981"
        />
        <KpiCard
          icon={AlertCircle}
          label={copy.pendingRequests}
          value={pendingRequests}
          change={copy.waitingApproval}
          trend="neutral"
          color="#f59e0b"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Headcount trend */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-medium">{copy.headcountGrowth}</h2>
              <p className="text-xs text-tertiary mt-0.5">{periodLabel} · +36% {copy.growth}</p>
            </div>
            <span className="badge badge-success">
              <TrendingUp size={12} />
              {growthLabel}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.headcount}>
              <defs>
                <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" style={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-tertiary)" style={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="var(--accent-primary)" strokeWidth={2} fill="url(#hcGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* eNPS */}
        <div className="card">
          <div className="mb-4">
            <h2 className="font-medium">{copy.enpsScore}</h2>
            <p className="text-xs text-tertiary mt-0.5">{copy.workerSatisfaction}</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.enps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" style={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-tertiary)" style={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={2.5} dot={{ fill: '#ec4899', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recruiting Funnel */}
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-medium">{copy.recruitingFunnel}</h2>
              <p className="text-xs text-tertiary mt-0.5">{periodLabel} · {conversion}% {copy.conversion}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" stroke="var(--text-tertiary)" style={{ fontSize: 10 }} />
              <YAxis dataKey="stageLabel" type="category" stroke="var(--text-tertiary)" style={{ fontSize: 10 }} width={90} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Turnover by department */}
        <div className="card lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-medium">{copy.turnoverByDept}</h2>
            <p className="text-xs text-tertiary mt-0.5">{copy.last12Months}</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={turnoverByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="dept" stroke="var(--text-tertiary)" style={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-tertiary)" style={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
              <Bar dataKey="voluntary" fill="#10b981" name={copy.voluntary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="involuntary" fill="#ef4444" name={copy.involuntary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI insights */}
      <div className="card border-l-4" style={{ borderLeftColor: 'var(--accent-primary)' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="accent-text" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm mb-2">{copy.aiInsightTitle}</p>
            <p className="text-sm text-secondary leading-relaxed">
              {copy.aiInsightBody}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button className="badge badge-accent hover:opacity-80">{copy.openTimeOff}</button>
              <button className="badge hover:opacity-80">{copy.skip}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, change, trend, color }: any) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card">
      <div className="flex items-center justify-between mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: color + '20', color }}
        >
          <Icon size={16} />
        </div>
        {trend === 'up' && <TrendingUp size={14} style={{ color: 'var(--success)' }} />}
        {trend === 'down' && <TrendingDown size={14} style={{ color: 'var(--danger)' }} />}
      </div>
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs text-tertiary">{label}</p>
      <p className="text-[10px] text-tertiary mt-1">{change}</p>
    </motion.div>
  );
}

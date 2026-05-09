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
import { useLanguage } from '../hooks/useLanguage';

type Period = 'week' | 'month' | 'quarter';

// Period-specific data
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

export function AdminDashboard() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [period, setPeriod] = useState<Period>('month');
  const data = CHART_DATA[period];

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const activeRecruits = candidates.filter((c) => !['hired', 'rejected'].includes(c.stage)).length;

  // Period-specific KPI values
  const enpsCurrent = data.enps[data.enps.length - 1].score;
  const enpsPrev = data.enps[data.enps.length - 2]?.score || enpsCurrent;
  const enpsDelta = enpsCurrent - enpsPrev;

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">HR Dashboard</p>
          <h1 className="font-display text-3xl">{isEn ? 'Good day, Janka 👋' : 'Dobrý deň, Janka 👋'}</h1>
          <p className="text-secondary text-sm mt-1">
            {isEn ? 'Here is your company overview' : 'Tu je tvoj prehľad firmy'} · {new Date().toLocaleDateString(isEn ? 'en-US' : 'sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Period switcher */}
        <div className="flex items-center gap-1 p-1 bg-tertiary rounded-lg">
          {([
            { id: 'week' as const, label: isEn ? 'Week' : 'Týždeň' },
            { id: 'month' as const, label: isEn ? 'Month' : 'Mesiac' },
            { id: 'quarter' as const, label: isEn ? 'Quarter' : 'Kvartál' },
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

      {/* AI Alert banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border-l-4 flex items-start gap-3"
        style={{
          borderLeftColor: 'var(--warning)',
          background: 'color-mix(in srgb, var(--warning) 8%, var(--bg-secondary))'
        }}
      >
        <Zap size={18} style={{ color: 'var(--warning)' }} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-sm mb-1">{isEn ? 'AI detected an anomaly in Sales team' : 'AI detekoval anomáliu v Sales tíme'}</p>
          <p className="text-sm text-secondary">
            {isEn
              ? 'Pulse score in Sales dropped from 4.6 to 3.8 in the last 3 weeks. Recommended: a 1:1 with Jakub (Sales Manager) this week.'
              : 'Pulse score v Sales klesol z 4.6 na 3.8 za posledné 3 týždne. Odporúčam 1:1 s Jakubom (Sales Manager) tento týždeň.'}
          </p>
        </div>
        <button className="btn-ghost text-xs">{isEn ? 'View details →' : 'Zobraziť detail →'}</button>
      </motion.div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Headcount"
          value={employees.length.toString()}
          change={isEn ? '+1 this month' : '+1 tento mesiac'}
          trend="up"
          color="#3b82f6"
        />
        <KpiCard
          icon={UserPlus}
          label={isEn ? 'Open positions' : 'Otvorené pozície'}
          value={openPositions.length.toString()}
          change={isEn ? `${activeRecruits} active candidates` : `${activeRecruits} aktívnych kandidátov`}
          trend="neutral"
          color="#10b981"
        />
        <KpiCard
          icon={Heart}
          label="eNPS"
          value={`+${enpsCurrent}`}
          change={enpsDelta >= 0
            ? (isEn ? `+${enpsDelta} vs previous period` : `+${enpsDelta} vs predchadzajuce obdobie`)
            : (isEn ? `${enpsDelta} vs previous period` : `${enpsDelta} vs predchadzajuce obdobie`)}
          trend={enpsDelta >= 0 ? 'up' : 'down'}
          color="#ec4899"
        />
        <KpiCard
          icon={AlertCircle}
          label={isEn ? 'Pending requests' : 'Pending žiadanky'}
          value={pendingRequests.toString()}
          change={isEn ? 'Require action' : 'Vyžadujú akciu'}
          trend="down"
          color="#f59e0b"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Headcount trend */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-medium">Headcount Growth</h2>
              <p className="text-xs text-tertiary mt-0.5">
                {(isEn
                  ? (period === 'week' ? 'This week' : period === 'month' ? 'Last 6 months' : 'Last 6 quarters')
                  : data.label)} · {isEn ? '+36% growth' : '+36% rast'}
              </p>
            </div>
            <span className="badge badge-success">
              <TrendingUp size={12} />
              {data.growthLabel}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.headcount}>
              <defs>
                <linearGradient id="headGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--accent-primary)"
                strokeWidth={2}
                fill="url(#headGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department breakdown */}
        <div className="card">
          <h2 className="font-medium mb-4">{isEn ? 'Departments' : 'Oddelenia'}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={departments}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {departments.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {departments.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span>{d.name}</span>
                </div>
                <span className="text-tertiary">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* eNPS trend */}
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-medium">eNPS Trend</h2>
              <p className="text-xs text-tertiary mt-0.5">Employee Net Promoter Score</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.enps}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis stroke="var(--text-tertiary)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--accent-primary)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--accent-primary)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recruiting Funnel */}
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-medium">Recruiting Funnel</h2>
              <p className="text-xs text-tertiary mt-0.5">{data.label} · {data.funnel[0].count > 0 ? Math.round((data.funnel[data.funnel.length - 1].count / data.funnel[0].count) * 100 * 10) / 10 : 0}% conversion</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.funnel} layout="vertical">
              <XAxis type="number" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis type="category" dataKey="stage" stroke="var(--text-tertiary)" fontSize={11} width={70} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Turnover */}
        <div className="card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-medium">Turnover by Dept</h2>
              <p className="text-xs text-tertiary mt-0.5">{isEn ? 'This year · 13% YTD' : 'Tento rok · 13% YTD'}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={turnoverByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="dept" stroke="var(--text-tertiary)" fontSize={11} />
              <YAxis stroke="var(--text-tertiary)" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="voluntary" fill="var(--info)" name="Voluntary" radius={[4, 4, 0, 0]} />
              <Bar dataKey="involuntary" fill="var(--danger)" name="Involuntary" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom widgets */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity feed */}
        <div className="card">
          <h2 className="font-medium mb-4">{isEn ? 'Recent activity' : 'Posledná aktivita'}</h2>
          <div className="space-y-3">
            {[
              { who: 'Peter Novák', what: 'požiadal o dovolenku 15.-22.7.', when: 'pred 2h', emoji: '🏖️' },
              { who: 'Roman Bednár', what: 'sa prihlásil na pozíciu Senior React', when: 'pred 4h', emoji: '🎯' },
              { who: 'Lucia Štefánková', what: 'odpovedala na Pulse Survey (4.5/5)', when: 'pred 6h', emoji: '😊' },
              { who: 'Michal Krajčí', what: 'dostal schválené AWS školenie', when: 'včera', emoji: '🎓' },
              { who: 'Marek Sokol', what: 'oficiálne potvrdil nástup 1.6.', when: 'včera', emoji: '🎉' },
            ].map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="text-xl">{act.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{act.who}</span>
                    <span className="text-secondary"> {act.what}</span>
                  </p>
                  <p className="text-xs text-tertiary">{act.when}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cost insights */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-tertiary" />
            <h2 className="font-medium">Cost insights</h2>
          </div>
          <div className="space-y-4">
            <CostRow label={isEn ? 'Monthly payroll (gross)' : 'Mesačné mzdy (gross)'} value="78 450 €" trend="+5.2% vs Q1" />
            <CostRow label="Recruiting cost / hire" value="2 100 €" trend="-15% vs benchmark" positive />
            <CostRow label="Wellness benefits" value="3 200 €" trend="Multisport + BetterHelp" />
            <CostRow label="Training spend YTD" value="14 500 €" trend={isEn ? '58% utilization' : '58% utilizácie'} />
            <CostRow label={isEn ? 'Office (per FTE/month)' : 'Office (per FTE/mesiac)'} value="290 €" trend={isEn ? 'Stable' : 'Stabilne'} />
          </div>

          <div className="mt-4 pt-4 border-t border-subtle">
            <p className="text-xs text-tertiary">
              {isEn
                ? '💡 AI insight: Recruiting cost is 15% below market - your referral program works. Consider increasing bonus from €500 to €750 for A-grade roles.'
                : '💡 AI insight: Recruiting cost je o 15% nižšie ako trh — váš referral program funguje. Zvýšte bonus z 500€ na 750€ pre A-grade pozície.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, change, trend, color }: any) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="card"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: color + '20', color }}
        >
          <Icon size={18} />
        </div>
        {TrendIcon && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: trend === 'up' ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--danger) 15%, transparent)',
              color: trend === 'up' ? 'var(--success)' : 'var(--danger)',
            }}
          >
            <TrendIcon size={12} />
          </div>
        )}
      </div>
      <p className="font-display text-3xl mb-0.5">{value}</p>
      <p className="text-xs text-tertiary mb-1">{label}</p>
      <p className="text-xs text-secondary">{change}</p>
    </motion.div>
  );
}

function CostRow({ label, value, trend, positive }: any) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-secondary">{label}</p>
        <p className="text-xs text-tertiary mt-0.5">{trend}</p>
      </div>
      <p className={`font-display text-lg ${positive ? 'text-green-600' : ''}`}>{value}</p>
    </div>
  );
}

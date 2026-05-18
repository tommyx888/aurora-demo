import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { candidates } from '../data/candidates';
import { requests } from '../data/content';

type Period = 'week' | 'month' | 'quarter';

const CHART_DATA = {
  week: {
    headcount: [
      { month: 'PO', count: 14 }, { month: 'UT', count: 14 }, { month: 'ST', count: 15 },
      { month: 'ŠT', count: 15 }, { month: 'PI', count: 15 },
    ],
    enps: [
      { month: 'PO', score: 56 }, { month: 'UT', score: 57 }, { month: 'ST', score: 58 },
      { month: 'ŠT', score: 58 }, { month: 'PI', score: 60 },
    ],
    funnel: [
      { stage: 'Applied', count: 12 },
      { stage: 'Screened', count: 5 },
      { stage: 'Interviewed', count: 2 },
      { stage: 'Offered', count: 1 },
      { stage: 'Hired', count: 0 },
    ],
    label: '7 DAYS',
    growthValue: 0,
  },
  month: {
    headcount: [
      { month: 'JAN', count: 11 }, { month: 'FEB', count: 12 }, { month: 'MAR', count: 13 },
      { month: 'APR', count: 14 }, { month: 'MAY', count: 15 }, { month: 'JUN', count: 15 },
    ],
    enps: [
      { month: 'JAN', score: 32 }, { month: 'FEB', score: 38 }, { month: 'MAR', score: 41 },
      { month: 'APR', score: 45 }, { month: 'MAY', score: 52 }, { month: 'JUN', score: 58 },
    ],
    funnel: [
      { stage: 'Applied', count: 87 },
      { stage: 'Screened', count: 34 },
      { stage: 'Interviewed', count: 12 },
      { stage: 'Offered', count: 5 },
      { stage: 'Hired', count: 3 },
    ],
    label: '6 MONTHS',
    growthValue: 4,
  },
  quarter: {
    headcount: [
      { month: 'Q1·25', count: 8 }, { month: 'Q2·25', count: 10 }, { month: 'Q3·25', count: 11 },
      { month: 'Q4·25', count: 13 }, { month: 'Q1·26', count: 14 }, { month: 'Q2·26', count: 15 },
    ],
    enps: [
      { month: 'Q1·25', score: 22 }, { month: 'Q2·25', score: 28 }, { month: 'Q3·25', score: 35 },
      { month: 'Q4·25', score: 41 }, { month: 'Q1·26', score: 48 }, { month: 'Q2·26', score: 58 },
    ],
    funnel: [
      { stage: 'Applied', count: 287 },
      { stage: 'Screened', count: 112 },
      { stage: 'Interviewed', count: 41 },
      { stage: 'Offered', count: 14 },
      { stage: 'Hired', count: 9 },
    ],
    label: '6 QUARTERS',
    growthValue: 7,
  },
};

export function AdminDashboardBrutalist() {
  const [period, setPeriod] = useState<Period>('month');
  const data = CHART_DATA[period];

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const activeRecruits = candidates.filter((c) => !['hired', 'rejected'].includes(c.stage)).length;

  const enpsCurrent = data.enps[data.enps.length - 1].score;
  const enpsPrev = data.enps[data.enps.length - 2]?.score || enpsCurrent;
  const enpsDelta = enpsCurrent - enpsPrev;

  const conversion = data.funnel[0].count > 0
    ? Math.round((data.funnel[data.funnel.length - 1].count / data.funnel[0].count) * 100 * 10) / 10
    : 0;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="br-root min-h-full -m-6 sm:-m-8 p-6 sm:p-10">
      {/* ============================================
          BRUTALIST HEADER — Massive poster
          ============================================ */}
      <header className="br-fade-in mb-12" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="br-tag" data-tone="accent">● LIVE</span>
            <span className="br-eyebrow">TALENT REPORT</span>
          </div>
          <span className="br-mono" style={{ color: 'var(--br-text-secondary)' }}>
            {dateStr} · Q2·26
          </span>
        </div>

        <h1 className="br-poster text-6xl md:text-8xl mb-6 max-w-5xl">
          Good morning,<br />
          <em className="br-italic">Janka.</em>
        </h1>

        <p
          className="text-base md:text-lg leading-relaxed max-w-2xl mb-2"
          style={{ color: 'var(--br-text-secondary)', letterSpacing: '-0.005em' }}
        >
          <span style={{ color: 'var(--br-text)', fontWeight: 600 }}>Three metrics moved this {period}.</span>{' '}
          One needs your attention. Recruiting funnel improved.
        </p>

        <hr className="br-divider mt-8" />
      </header>

      {/* ============================================
          PERIOD SWITCHER — Asymmetric inline
          ============================================ */}
      <section className="br-fade-in mb-12" style={{ animationDelay: '40ms' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <span className="br-index-large">/ 01</span>
            <span className="br-eyebrow">PERIOD</span>
            <div className="flex">
              {(['week', 'month', 'quarter'] as const).map((p, i) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="br-btn"
                  style={{
                    background: period === p ? 'var(--br-text)' : 'var(--br-surface)',
                    color: period === p ? 'var(--br-bg)' : 'var(--br-text)',
                    borderLeft: i === 0 ? '1px solid var(--br-border)' : 'none',
                  }}
                >
                  {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Quarter'}
                </button>
              ))}
            </div>
          </div>

          <button className="br-btn">
            Export <ArrowUpRight size={13} strokeWidth={2} />
          </button>
        </div>
      </section>

      {/* ============================================
          KPI ROW — Asymmetric, hard borders
          ============================================ */}
      <section className="br-fade-in mb-12" style={{ animationDelay: '80ms' }}>
        <div className="flex items-baseline justify-between mb-8">
          <div className="flex items-baseline gap-6">
            <span className="br-index-large">/ 02</span>
            <span className="br-eyebrow">KEY METRICS</span>
          </div>
          <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>
            — {data.label}
          </span>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ background: 'var(--br-border)', border: '1px solid var(--br-border)' }}
        >
          <BrKpi index="01" num={15} label="Headcount" delta={`+${data.growthValue}`} deltaTone="positive" />
          <BrKpi index="02" num={`+${enpsCurrent}`} label="Employee NPS" delta={`${enpsDelta >= 0 ? '+' : ''}${enpsDelta}`} deltaTone={enpsDelta >= 0 ? 'positive' : 'negative'} />
          <BrKpi index="03" num={activeRecruits} label="Active pipeline" delta={`${conversion}% conv.`} deltaTone="neutral" />
          <BrKpi index="04" num={pendingRequests} label="Pending requests" delta="Awaiting" deltaTone="warning" />
        </div>
      </section>

      {/* ============================================
          HEADCOUNT CHART — Asymmetric 1/3 + 2/3
          ============================================ */}
      <section className="br-fade-in mb-12" style={{ animationDelay: '120ms' }}>
        <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-baseline gap-6">
            <span className="br-index-large">/ 03</span>
            <span className="br-eyebrow">HEADCOUNT</span>
          </div>
          <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>— {data.label}</span>
        </div>

        <div className="grid md:grid-cols-5 gap-0">
          {/* Story side (2 columns) */}
          <div
            className="md:col-span-2 br-block flex flex-col justify-between"
            style={{ minHeight: 280 }}
          >
            <div>
              <p className="br-eyebrow mb-4" style={{ color: 'rgba(244, 241, 236, 0.6)' }}>
                01 / Growth
              </p>
              <h3 className="br-headline text-3xl md:text-4xl mb-4">
                Steady. <em className="br-italic" style={{ color: '#ff6347' }}>Healthy.</em>
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(244, 241, 236, 0.85)' }}>
                Team grew from 11 to 15. No churn surprises.
                No over-hiring. Within plan.
              </p>
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid rgba(244, 241, 236, 0.2)' }}>
              <div className="flex items-baseline justify-between">
                <span className="br-mono" style={{ color: 'rgba(244, 241, 236, 0.6)' }}>OVER {period.toUpperCase()}</span>
                <span className="br-number text-3xl" style={{ color: '#ff6347' }}>
                  +{Math.round((data.headcount[data.headcount.length - 1].count / data.headcount[0].count - 1) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Chart side (3 columns) */}
          <div
            className="md:col-span-3 br-chart bg-white"
            style={{
              border: '1px solid var(--br-border)',
              borderLeft: 'none',
              padding: '1.5rem',
            }}
          >
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.headcount} margin={{ top: 8, right: 4, bottom: 4, left: -20 }}>
                <defs>
                  <linearGradient id="brHcFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--br-accent)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--br-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--br-text-muted)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--br-text)',
                    color: 'var(--br-bg)',
                    border: 'none',
                    borderRadius: 0,
                    fontSize: 11,
                    fontFamily: 'var(--font-editorial-mono)',
                    textTransform: 'uppercase',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--br-text)"
                  strokeWidth={2}
                  fill="url(#brHcFill)"
                  dot={{ fill: 'var(--br-text)', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--br-accent)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ============================================
          eNPS + FUNNEL — Two columns
          ============================================ */}
      <section className="br-fade-in mb-12" style={{ animationDelay: '160ms' }}>
        <div className="grid md:grid-cols-2 gap-0" style={{ border: '1px solid var(--br-border)' }}>
          {/* eNPS */}
          <div
            className="p-8"
            style={{ borderRight: '1px solid var(--br-border)', background: 'var(--br-surface)' }}
          >
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
              <div className="flex items-baseline gap-3">
                <span className="br-index-large">/ 04</span>
                <span className="br-eyebrow">EMPLOYEE NPS</span>
              </div>
              <span
                className="br-mono flex items-center gap-1"
                style={{ color: enpsDelta >= 0 ? 'var(--br-positive)' : 'var(--br-negative)' }}
              >
                {enpsDelta >= 0 ? <TrendingUp size={12} strokeWidth={2} /> : <TrendingDown size={12} strokeWidth={2} />}
                {enpsDelta >= 0 ? '+' : ''}{enpsDelta}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="br-number text-7xl md:text-8xl">+{enpsCurrent}</span>
              <span className="br-eyebrow">SCORE</span>
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--br-text-secondary)' }}>
              Trending up since Q1. Tatra Bank deal energized the team.{' '}
              <em className="br-italic">Watch engineering</em> mid-summer.
            </p>

            <div className="br-chart">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data.enps} margin={{ top: 4, right: 4, bottom: 4, left: -28 }}>
                  <CartesianGrid vertical={false} stroke="var(--br-text-muted)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--br-text)',
                      color: 'var(--br-bg)',
                      border: 'none',
                      borderRadius: 0,
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--br-text)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--br-text)', r: 3, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel */}
          <div className="p-8" style={{ background: 'var(--br-surface)' }}>
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
              <div className="flex items-baseline gap-3">
                <span className="br-index-large">/ 05</span>
                <span className="br-eyebrow">RECRUITING FUNNEL</span>
              </div>
              <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>
                {conversion}% CONV.
              </span>
            </div>

            <div className="space-y-4">
              {data.funnel.map((s, i) => {
                const max = data.funnel[0].count;
                const pct = max > 0 ? (s.count / max) * 100 : 0;
                return (
                  <div key={s.stage}>
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="flex items-baseline gap-3">
                        <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--br-text)' }}>{s.stage}</span>
                      </div>
                      <span className="br-mono">{s.count}</span>
                    </div>
                    <div
                      style={{
                        height: 3,
                        background: 'var(--br-text-muted)',
                        position: 'relative',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, delay: 0.15 + i * 0.06, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: i === data.funnel.length - 1 ? 'var(--br-accent)' : 'var(--br-text)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          ATTENTION — Big bold callout
          ============================================ */}
      <section className="br-fade-in mb-12" style={{ animationDelay: '200ms' }}>
        <div className="flex items-baseline justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-baseline gap-6">
            <span className="br-index-large">/ 06</span>
            <span className="br-eyebrow">NEEDS YOUR ATTENTION</span>
          </div>
          <span className="br-tag" data-tone="outline">03 ITEMS</span>
        </div>

        <div className="space-y-0" style={{ border: '1px solid var(--br-border)' }}>
          <BrInsight
            num="01"
            severity="warn"
            headline="Engineering vacation cluster"
            italic="mid-July"
            body="Filip and Tomáš both submitted vacation for July 14–25. Combined with Adam's prior leave, the eng team drops to 3 people for two weeks."
            action="Open Time-off"
          />
          <BrInsight
            num="02"
            severity="info"
            headline="Vue.js coverage is"
            italic="one deep"
            body="Only Martin holds Vue.js (level 2). If Martin leaves, you have zero coverage. Consider sending Filip or Adam to a Vue intensive."
            action="Schedule training"
          />
          <BrInsight
            num="03"
            severity="positive"
            headline="Two strong AI-sourced candidates"
            italic="in pipeline"
            body="Patrik Sůra (92% match, Senior React) and Tomáš Fischer (89%, DevOps). Both likely getting offers from competitors. Move fast."
            action="View candidates"
            isLast
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="br-fade-in pt-8 pb-4" style={{ animationDelay: '240ms' }}>
        <hr className="br-divider mb-4" />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="br-eyebrow">DIGITAL EVOLUTION · HR PLATFORM</span>
          <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>
            UPDATED {today.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// KPI — Brutalist poster number
// ============================================
function BrKpi({
  index,
  num,
  label,
  delta,
  deltaTone,
}: {
  index: string;
  num: number | string;
  label: string;
  delta: string;
  deltaTone: 'positive' | 'negative' | 'neutral' | 'warning';
}) {
  const deltaColor = {
    positive: 'var(--br-positive)',
    negative: 'var(--br-negative)',
    warning: 'var(--br-warning)',
    neutral: 'var(--br-text-tertiary)',
  }[deltaTone];

  return (
    <div className="p-6" style={{ background: 'var(--br-surface)' }}>
      <div className="flex items-start justify-between mb-6">
        <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>
          {index}
        </span>
        <span className="br-mono" style={{ color: deltaColor, fontWeight: 700 }}>
          {delta}
        </span>
      </div>
      <p className="br-number text-5xl md:text-6xl mb-3">{num}</p>
      <p className="br-eyebrow">{label}</p>
    </div>
  );
}

// ============================================
// INSIGHT — Editorial brutalist row
// ============================================
function BrInsight({
  num,
  severity,
  headline,
  italic,
  body,
  action,
  isLast = false,
}: {
  num: string;
  severity: 'warn' | 'info' | 'positive' | 'danger';
  headline: string;
  italic: string;
  body: string;
  action: string;
  isLast?: boolean;
}) {
  const accentColor = {
    warn: 'var(--br-warning)',
    info: 'var(--br-info)',
    positive: 'var(--br-positive)',
    danger: 'var(--br-negative)',
  }[severity];

  return (
    <article
      className="grid md:grid-cols-[auto_1fr_auto] gap-x-6 gap-y-3 items-baseline p-6 group transition-colors"
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--br-border)',
        background: 'var(--br-surface)',
      }}
    >
      <div className="flex items-baseline gap-3">
        <span className="br-index-large" style={{ color: accentColor }}>{num}</span>
      </div>

      <div>
        <h3 className="br-headline text-xl md:text-2xl mb-2">
          {headline} <em className="br-italic">{italic}</em>.
        </h3>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--br-text-secondary)' }}>
          {body}
        </p>
      </div>

      <button className="br-btn">
        {action}
        <ArrowUpRight size={12} strokeWidth={2} />
      </button>
    </article>
  );
}

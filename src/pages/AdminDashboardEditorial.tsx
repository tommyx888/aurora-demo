import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  TrendingUp, TrendingDown, ArrowUpRight, Activity,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { candidates } from '../data/candidates';
import { requests } from '../data/content';
import { useLanguage } from '../hooks/useLanguage';

type Period = 'week' | 'month' | 'quarter';

const CHART_DATA = {
  week: {
    headcount: [
      { month: 'Mon', count: 14 }, { month: 'Tue', count: 14 }, { month: 'Wed', count: 15 },
      { month: 'Thu', count: 15 }, { month: 'Fri', count: 15 },
    ],
    enps: [
      { month: 'Mon', score: 56 }, { month: 'Tue', score: 57 }, { month: 'Wed', score: 58 },
      { month: 'Thu', score: 58 }, { month: 'Fri', score: 60 },
    ],
    funnel: [
      { stage: 'Applied', count: 12 },
      { stage: 'Screened', count: 5 },
      { stage: 'Interviewed', count: 2 },
      { stage: 'Offered', count: 1 },
      { stage: 'Hired', count: 0 },
    ],
    label: 'This week',
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
    label: 'Last 6 months',
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
    label: 'Last 6 quarters',
    growthValue: 7,
  },
};

export function AdminDashboardEditorial() {
  const { t, lang } = useLanguage();
  const isEn = lang === 'en';
  const [period, setPeriod] = useState<Period>('month');
  const data = CHART_DATA[period];

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const activeRecruits = candidates.filter((c) => !['hired', 'rejected'].includes(c.stage)).length;

  const enpsCurrent = data.enps[data.enps.length - 1].score;
  const enpsPrev = data.enps[data.enps.length - 2]?.score || enpsCurrent;
  const enpsDelta = enpsCurrent - enpsPrev;

  // Conversion rate
  const conversion = data.funnel[0].count > 0
    ? Math.round((data.funnel[data.funnel.length - 1].count / data.funnel[0].count) * 100 * 10) / 10
    : 0;

  // Today's date in editorial format
  const today = new Date();
  const dateStr = today.toLocaleDateString(isEn ? 'en-GB' : 'sk-SK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Localized period label + story
  const periodLabel = period === 'week' ? t('adminEditorial.labelWeek')
    : period === 'month' ? t('adminEditorial.labelMonth')
    : t('adminEditorial.labelQuarter');
  const subtitleText = period === 'week' ? t('adminEditorial.subtitleWeek')
    : period === 'month' ? t('adminEditorial.subtitleMonth')
    : t('adminEditorial.subtitleQuarter');
  const headcountStory = period === 'week' ? t('adminEditorial.headcountStoryWeek')
    : period === 'month' ? t('adminEditorial.headcountStoryMonth')
    : t('adminEditorial.headcountStoryQuarter');
  const overLabel = period === 'week' ? t('adminEditorial.overWeek')
    : period === 'month' ? t('adminEditorial.overMonth')
    : t('adminEditorial.overQuarter');
  const funnelLabel: Record<string, string> = {
    Applied: t('adminEditorial.funnelApplied'),
    Screened: t('adminEditorial.funnelScreened'),
    Interviewed: t('adminEditorial.funnelInterviewed'),
    Offered: t('adminEditorial.funnelOffered'),
    Hired: t('adminEditorial.funnelHired'),
  };

  return (
    <div className="ed-root min-h-full -m-6 sm:-m-8 p-6 sm:p-10">
      {/* ============================================
          EDITORIAL HEADER
          ============================================ */}
      <header className="ed-fade-in" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="ed-eyebrow">{t('adminEditorial.eyebrow')}</span>
            <span className="ed-tag" data-status="live">
              <span className="ed-pulse-dot"></span>
              {t('adminEditorial.live')}
            </span>
          </div>
          <span className="ed-mono" style={{ color: 'var(--ed-text-tertiary)' }}>{dateStr}</span>
        </div>

        <h1 className="ed-display text-5xl md:text-6xl mb-2">
          {t('adminEditorial.helloMorning')} <em className="ed-italic-flourish">{t('adminEditorial.helloName')}</em>.
        </h1>
        <p className="text-base mb-6" style={{ color: 'var(--ed-text-secondary)', maxWidth: '38rem' }}>
          {subtitleText}
        </p>

        <hr className="ed-divider-bold mt-4" />

        {/* Period switcher row */}
        <div className="flex items-center justify-between gap-4 py-4 flex-wrap">
          <nav className="flex items-center gap-1" aria-label="Period">
            <span className="ed-section-num mr-4">{t('adminEditorial.secPeriod')}</span>
            <div className="ed-segment">
              {(['week', 'month', 'quarter'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="ed-segment-item"
                  data-active={period === p}
                >
                  {p === 'week' ? t('adminEditorial.periodWeek')
                    : p === 'month' ? t('adminEditorial.periodMonth')
                    : t('adminEditorial.periodQuarter')}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button className="ed-btn">
              <Activity size={13} strokeWidth={1.5} />
              {t('adminEditorial.export')}
            </button>
          </div>
        </div>

        <hr className="ed-divider" />
      </header>

      {/* ============================================
          KPI ROW — Editorial poster numbers
          ============================================ */}
      <section className="ed-fade-in py-10" style={{ animationDelay: '60ms' }}>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="ed-eyebrow">{t('adminEditorial.secMetrics')}</h2>
          <span className="ed-mono" style={{ color: 'var(--ed-text-tertiary)' }}>{periodLabel}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
          <Kpi
            num={15}
            label={t('adminEditorial.kpiHeadcount')}
            delta={`+${data.growthValue} ${t('adminEditorial.kpiHeadcountDelta')}`}
            deltaSign="positive"
          />
          <Kpi
            num={`+${enpsCurrent}`}
            label={t('adminEditorial.kpiEnps')}
            delta={`${enpsDelta >= 0 ? '+' : ''}${enpsDelta} ${t('adminEditorial.kpiEnpsDelta')}`}
            deltaSign={enpsDelta >= 0 ? 'positive' : 'negative'}
          />
          <Kpi
            num={activeRecruits}
            label={t('adminEditorial.kpiPipeline')}
            delta={`${conversion}% ${t('adminEditorial.kpiPipelineDelta')}`}
            deltaSign="neutral"
          />
          <Kpi
            num={pendingRequests}
            label={t('adminEditorial.kpiPending')}
            delta={t('adminEditorial.kpiPendingDelta')}
            deltaSign="warning"
          />
        </div>

        <hr className="ed-divider mt-10" />
      </section>

      {/* ============================================
          HEADCOUNT — Editorial chart with sidebar story
          ============================================ */}
      <section className="ed-fade-in py-10" style={{ animationDelay: '120ms' }}>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="ed-eyebrow">{t('adminEditorial.secHeadcount')}</h2>
          <span className="ed-mono" style={{ color: 'var(--ed-text-tertiary)' }}>{periodLabel}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <h3 className="ed-headline text-3xl mb-3">
              {t('adminEditorial.headcountTitle')} <em className="ed-italic-flourish">{t('adminEditorial.headcountTitleEm')}</em>
            </h3>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--ed-text-secondary)' }}>
              {headcountStory}
            </p>
            <div className="flex items-center gap-2 ed-mono">
              <TrendingUp size={13} strokeWidth={1.5} style={{ color: 'var(--ed-positive)' }} />
              <span style={{ color: 'var(--ed-positive)' }}>+{Math.round((data.headcount[data.headcount.length - 1].count / data.headcount[0].count - 1) * 100)}%</span>
              <span style={{ color: 'var(--ed-text-tertiary)' }}>{overLabel}</span>
            </div>
          </div>

          <div className="md:col-span-2 ed-chart">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.headcount} margin={{ top: 8, right: 4, bottom: 4, left: -20 }}>
                <defs>
                  <linearGradient id="hcFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--ed-text)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="var(--ed-text)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--ed-border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--ed-surface)',
                    border: '1px solid var(--ed-border-bold)',
                    borderRadius: 4,
                    fontSize: 12,
                    fontFamily: 'var(--font-editorial-mono)',
                  }}
                  labelStyle={{ color: 'var(--ed-text-tertiary)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--ed-text)"
                  strokeWidth={1.5}
                  fill="url(#hcFill)"
                  dot={{ fill: 'var(--ed-text)', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--ed-text)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <hr className="ed-divider mt-10" />
      </section>

      {/* ============================================
          eNPS + RECRUITING FUNNEL — Two-column layout
          ============================================ */}
      <section className="ed-fade-in py-10" style={{ animationDelay: '180ms' }}>
        <div className="grid md:grid-cols-2 gap-12">
          {/* eNPS */}
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="ed-eyebrow">{t('adminEditorial.secEnps')}</h2>
              <span className={`ed-mono flex items-center gap-1`} style={{ color: enpsDelta >= 0 ? 'var(--ed-positive)' : 'var(--ed-negative)' }}>
                {enpsDelta >= 0 ? <TrendingUp size={11} strokeWidth={1.5} /> : <TrendingDown size={11} strokeWidth={1.5} />}
                {enpsDelta >= 0 ? '+' : ''}{enpsDelta}
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-4">
              <span className="ed-number text-7xl">+{enpsCurrent}</span>
              <span className="ed-eyebrow">{t('adminEditorial.enpsScore')}</span>
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--ed-text-secondary)' }}>
              {t('adminEditorial.enpsStory')}
            </p>

            <div className="ed-chart">
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={data.enps} margin={{ top: 4, right: 4, bottom: 4, left: -28 }}>
                  <CartesianGrid vertical={false} stroke="var(--ed-border)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} hide />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--ed-surface)',
                      border: '1px solid var(--ed-border-bold)',
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: 'var(--font-editorial-mono)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--ed-text)"
                    strokeWidth={1.5}
                    dot={{ fill: 'var(--ed-text)', r: 3, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recruiting Funnel */}
          <div>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="ed-eyebrow">{t('adminEditorial.secFunnel')}</h2>
              <span className="ed-mono" style={{ color: 'var(--ed-text-tertiary)' }}>
                {conversion}% {t('adminEditorial.funnelConversion')}
              </span>
            </div>

            <div className="space-y-3">
              {data.funnel.map((s, i) => {
                const max = data.funnel[0].count;
                const pct = max > 0 ? (s.count / max) * 100 : 0;
                return (
                  <div key={s.stage} className="flex items-center gap-4">
                    <span className="ed-section-num w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm flex-1" style={{ color: 'var(--ed-text-secondary)' }}>{funnelLabel[s.stage] || s.stage}</span>
                    <div className="relative flex-1 max-w-xs">
                      <div className="h-px" style={{ background: 'var(--ed-border)' }} />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease: 'easeOut' }}
                        className="absolute top-0 left-0 h-px"
                        style={{ background: 'var(--ed-text)' }}
                      />
                    </div>
                    <span className="ed-mono w-10 text-right">{s.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <hr className="ed-divider mt-10" />
      </section>

      {/* ============================================
          AI INSIGHTS — Editorial blockquote style
          ============================================ */}
      <section className="ed-fade-in py-10" style={{ animationDelay: '240ms' }}>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="ed-eyebrow">{t('adminEditorial.secAttention')}</h2>
          <span className="ed-tag">3 {t('adminEditorial.attentionItems')}</span>
        </div>

        <div className="space-y-8">
          <Insight
            num="01"
            severity="warn"
            headline={<>{t('adminEditorial.insight1Headline')} <em className="ed-italic-flourish">{t('adminEditorial.insight1HeadlineEm')}</em></>}
            body={t('adminEditorial.insight1Body')}
            action={t('adminEditorial.insight1Action')}
          />
          <Insight
            num="02"
            severity="info"
            headline={<>{t('adminEditorial.insight2Headline')} <em className="ed-italic-flourish">{t('adminEditorial.insight2HeadlineEm')}</em></>}
            body={t('adminEditorial.insight2Body')}
            action={t('adminEditorial.insight2Action')}
          />
          <Insight
            num="03"
            severity="positive"
            headline={<>{t('adminEditorial.insight3Headline')} <em className="ed-italic-flourish">{t('adminEditorial.insight3HeadlineEm')}</em></>}
            body={t('adminEditorial.insight3Body')}
            action={t('adminEditorial.insight3Action')}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="ed-fade-in pt-12 pb-4" style={{ animationDelay: '300ms' }}>
        <hr className="ed-divider mb-4" />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="ed-eyebrow">{t('adminEditorial.footerLabel')}</span>
          <span className="ed-mono" style={{ color: 'var(--ed-text-tertiary)' }}>
            {t('adminEditorial.footerUpdated')} {today.toLocaleTimeString(isEn ? 'en-GB' : 'sk-SK', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// KPI — Big poster number with eyebrow + delta
// ============================================
function Kpi({
  num,
  label,
  delta,
  deltaSign,
}: {
  num: number | string;
  label: string;
  delta: string;
  deltaSign: 'positive' | 'negative' | 'neutral' | 'warning';
}) {
  const deltaColor = {
    positive: 'var(--ed-positive)',
    negative: 'var(--ed-negative)',
    warning: '#854d0e',
    neutral: 'var(--ed-text-tertiary)',
  }[deltaSign];

  return (
    <div>
      <p className="ed-eyebrow mb-3">{label}</p>
      <p className="ed-number text-6xl md:text-7xl mb-3">{num}</p>
      <div className="flex items-center gap-1 ed-mono" style={{ color: deltaColor }}>
        {deltaSign === 'positive' && <TrendingUp size={11} strokeWidth={1.5} />}
        {deltaSign === 'negative' && <TrendingDown size={11} strokeWidth={1.5} />}
        <span>{delta}</span>
      </div>
    </div>
  );
}

// ============================================
// INSIGHT — Editorial blockquote-style insight
// ============================================
function Insight({
  num,
  severity,
  headline,
  body,
  action,
}: {
  num: string;
  severity: 'warn' | 'info' | 'positive' | 'danger';
  headline: React.ReactNode;
  body: string;
  action: string;
}) {
  const accentColor = {
    warn: 'var(--ed-warning)',
    info: 'var(--ed-info)',
    positive: 'var(--ed-positive)',
    danger: 'var(--ed-negative)',
  }[severity];

  return (
    <article className="grid md:grid-cols-[auto_1fr_auto] gap-x-6 gap-y-3 items-baseline">
      <div className="flex items-baseline gap-3">
        <span className="ed-section-num">{num}</span>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: accentColor, transform: 'translateY(-2px)' }}
          aria-hidden
        />
      </div>

      <div>
        <h3 className="ed-headline text-2xl md:text-3xl mb-2">{headline}</h3>
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--ed-text-secondary)' }}>
          {body}
        </p>
      </div>

      <button className="ed-btn-ghost ed-btn">
        {action}
        <ArrowUpRight size={13} strokeWidth={1.5} />
      </button>
    </article>
  );
}

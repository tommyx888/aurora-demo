import { motion } from 'framer-motion';
import { useState } from 'react';
import { MessageSquare, TrendingUp, Sparkles, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { surveys } from '../data/content';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';
import { LeadCTA } from './Requests';
import { formatDate } from '../lib/utils';

interface SurveysProps {
  onLeadCapture: (module: string) => void;
}

const pulseTrend = [
  { week: '1', score: 4.0 }, { week: '2', score: 4.1 }, { week: '3', score: 3.9 },
  { week: '4', score: 4.2 }, { week: '5', score: 4.3 }, { week: '6', score: 4.5 },
  { week: '7', score: 4.4 }, { week: '8', score: 4.2 },
];

export function Surveys({ onLeadCapture }: SurveysProps) {
  const { lang, t } = useLanguage();
  const { mode } = useDesignMode();
  const isEn = lang === 'en';
  const isEditorial = mode === 'editorial';
  const isBrutalist = mode === 'brutalist';
  const emojiOptions = [
    { emoji: '😞', label: isEn ? 'Very bad' : 'Veľmi zle', value: 1 },
    { emoji: '😕', label: isEn ? 'Bad' : 'Zle', value: 2 },
    { emoji: '😐', label: isEn ? 'Neutral' : 'Stredne', value: 3 },
    { emoji: '😊', label: isEn ? 'Good' : 'Dobre', value: 4 },
    { emoji: '🤩', label: isEn ? 'Great' : 'Super', value: 5 },
  ];
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="page-enter space-y-6">
      {isBrutalist ? (
        <div className="br-fade-in">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="br-tag" data-tone="accent">● PULSE</span>
            <span className="br-eyebrow">{t('surveys.eyebrowBrutalist').toUpperCase()}</span>
          </div>
          <h1 className="br-poster text-5xl md:text-7xl mb-4" style={{ lineHeight: 0.9 }}>
            {t('surveys.headlineBrutalist')} <em className="br-italic">{t('surveys.headlineEmBrutalist')}</em>
          </h1>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--br-text-secondary)', letterSpacing: '-0.005em' }}>
            {t('surveys.bodyBrutalist')}{' '}
            <span style={{ color: 'var(--br-accent)', fontWeight: 600 }}>{t('surveys.bodyBrutalistAccent')}</span>
          </p>
          <hr className="br-divider mt-6" />
        </div>
      ) : isEditorial ? (
        <div className="ed-fade-in">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="ed-eyebrow">{t('surveys.eyebrowEditorial')}</span>
            <span className="ed-tag" data-status="live">
              <span className="ed-pulse-dot"></span>
              {t('surveys.aiTrendDetection')}
            </span>
          </div>
          <h1 className="ed-display text-5xl md:text-6xl mb-3" style={{ lineHeight: 0.95 }}>
            {t('surveys.headlineEditorial')} <em className="ed-italic-flourish">{t('surveys.headlineEmEditorial')}</em>.
          </h1>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--ed-text-secondary)' }}>
            {t('surveys.bodyEditorial')}
          </p>
          <hr className="ed-divider mt-6" />
        </div>
      ) : (
      <div>
        <p className="text-sm text-tertiary uppercase tracking-wider mb-1">{t('surveys.eyebrowEditorial')}</p>
          <h1 className="font-display text-3xl">{t('surveys.headlineClassic')}</h1>
        <p className="text-secondary text-sm mt-1">
            {t('surveys.bodyClassic')}
        </p>
      </div>
      )}

      {/* Active pulse */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card mesh-bg"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="badge badge-accent">📊 LIVE</span>
          <p className="text-sm text-tertiary">{isEn ? 'Weekly Pulse · 3 days left' : 'Týždenný Pulse · zostáva 3 dni'}</p>
        </div>

        <h2 className="font-display text-2xl mb-6 text-center">
          {isEn ? 'How do you feel this week?' : 'Ako sa cítiš tento týždeň?'}
        </h2>

        {!submitted ? (
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {emojiOptions.map((opt) => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedScore(opt.value);
                  setTimeout(() => setSubmitted(true), 800);
                }}
                className={`relative ${selectedScore === opt.value ? 'scale-110' : ''}`}
              >
                <div className="text-5xl mb-1">{opt.emoji}</div>
                <p className="text-xs text-secondary">{opt.label}</p>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6"
          >
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-medium">{isEn ? 'Thank you!' : 'Ďakujeme!'}</p>
            <p className="text-sm text-tertiary">{isEn ? 'Your response is anonymous' : 'Tvoja odpoveď je anonymná'}</p>
          </motion.div>
        )}

        <div className="text-center text-xs text-tertiary">
          {isEn ? '13 of 15 responded · Anonymous · 30 seconds' : '13 z 15 už odpovedalo · Anonymné · 30 sekúnd'}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {surveys.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-tertiary" />
              <span className="text-xs uppercase tracking-wider text-tertiary">{s.type}</span>
            </div>
            <p className="font-medium text-sm mb-1">{s.title}</p>
            <p className="text-xs text-tertiary mb-3">{s.question}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-3xl accent-text">{s.averageScore}</p>
                <p className="text-xs text-tertiary">{isEn ? 'average' : 'priemer'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{s.responses}/{s.total}</p>
                <p className="text-xs text-tertiary">{isEn ? 'responses' : 'odpovedí'}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium">{isEn ? 'Pulse Trend (8 weeks)' : 'Pulse Trend (8 týždňov)'}</h2>
            <p className="text-xs text-tertiary mt-0.5">{isEn ? 'Weekly average score · stable growth' : 'Týždenné priemerné skóre · stabilný rast'}</p>
          </div>
          <span className="badge badge-success">
            <TrendingUp size={12} />
            +12.5%
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={pulseTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis dataKey="week" stroke="var(--text-tertiary)" fontSize={11} />
            <YAxis domain={[0, 5]} stroke="var(--text-tertiary)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="score" stroke="var(--accent-primary)" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI insights */}
      <div className="card border-l-4" style={{ borderLeftColor: 'var(--accent-primary)' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="accent-text" />
          </div>
          <div>
            <p className="font-medium text-sm mb-1">AI Trend Analysis</p>
            <p className="text-sm text-secondary leading-relaxed">
              {isEn
                ? 'Pulse in Sales dropped by 17% in the last 3 weeks. Key comment themes:'
                : 'Pulse v Sales tíme klesol o 17% za posledné 3 týždne. Identifikované témy v komentároch:'}
              <strong> "deadline pressure" (8x), "tooling issues" (5x), "compensation" (3x)</strong>.
              {isEn ? ' Recommended: 1:1 with Jakub (Sales Manager).' : ' Odporúčam 1:1 s Jakubom (Sales Manager).'}
            </p>
          </div>
        </div>
      </div>

      <LeadCTA module="Pulse Surveys" onLeadCapture={onLeadCapture} />
    </div>
  );
}

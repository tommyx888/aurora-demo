import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, CheckCircle2, Users, Brain, BarChart3,
  BriefcaseBusiness, FileText, GitBranch, MessageSquare, Newspaper,
  Calendar, Bot, Zap
} from 'lucide-react';
import type { Page } from '../types';
import { DemoDisclaimerBanner } from '../components/DemoDisclaimer';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';

interface LandingPageProps {
  onStart: (page: Page) => void;
  onOpenBranding: () => void;
  onOpenDemoInfo: () => void;
}

const features = [
  { icon: Sparkles, label: 'AI Onboarding', color: '#8b5cf6' },
  { icon: Brain, label: 'Skill Heatmap', color: '#ec4899' },
  { icon: BarChart3, label: 'Live Dashboard', color: '#3b82f6' },
  { icon: BriefcaseBusiness, label: 'Recruiting', color: '#10b981' },
  { icon: FileText, label: 'Requests', color: '#f59e0b' },
  { icon: GitBranch, label: 'Org Chart', color: '#06b6d4' },
  { icon: MessageSquare, label: 'Pulse Surveys', color: '#f97316' },
  { icon: Newspaper, label: 'Newsletter', color: '#8b5cf6' },
  { icon: Calendar, label: 'Events', color: '#ef4444' },
  { icon: Bot, label: 'AI Chatbot', color: '#10b981' },
];

export function LandingPage(props: LandingPageProps) {
  const { mode } = useDesignMode();
  if (mode === 'editorial') return <LandingPageEditorial {...props} />;
  if (mode === 'brutalist') return <LandingPageBrutalist {...props} />;
  return <LandingPageClassic {...props} />;
}

// ============================================
// CLASSIC LANDING — original look
// ============================================
function LandingPageClassic({ onStart, onOpenBranding, onOpenDemoInfo }: LandingPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      <div className="relative z-20">
        <DemoDisclaimerBanner onLearnMore={onOpenDemoInfo} />
      </div>

      <div className="absolute inset-0 mesh-bg opacity-60 pointer-events-none" />

      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, var(--border-subtle) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-20"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg accent-bg flex items-center justify-center text-white font-bold">
              DE
            </div>
            <div>
              <p className="font-display text-lg leading-none">Digital Evolution</p>
              <p className="text-[11px] text-tertiary uppercase tracking-wider mt-0.5">demo platform</p>
            </div>
          </div>

          <a
            href="https://www.digitalevolution.sk"
            target="_blank"
            rel="noopener"
            className="text-sm text-secondary hover:text-primary"
          >
            www.digitalevolution.sk →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-medium bg-secondary text-xs font-medium text-secondary mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 accent-bg"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 accent-bg"></span>
            </span>
            {t('landing.badge')}
          </motion.div>

          <h1 className="font-display text-6xl md:text-7xl leading-[1.05] mb-6">
            {t('landing.title1')}<br />
            {t('landing.title2')} <em className="gradient-text">{t('landing.titleEm')}</em>.
          </h1>

          <p className="text-lg text-secondary leading-relaxed max-w-2xl mx-auto mb-10">
            {t('landing.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStart('role-picker')}
              className="btn-primary text-base px-8 py-4"
            >
              <Sparkles size={18} />
              {t('landing.ctaPrimary')}
              <ArrowRight size={18} />
            </motion.button>
            <button
              onClick={onOpenBranding}
              className="btn-secondary text-base px-8 py-4"
            >
              {t('landing.ctaSecondary')}
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-tertiary">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="accent-text" />
              {t('landing.feature1')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="accent-text" />
              {t('landing.feature2')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="accent-text" />
              {t('landing.feature3')}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="accent-text" />
              {t('landing.feature4')}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-20"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ y: -4 }}
                className="card card-hover text-center p-4"
              >
                <div
                  className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ background: f.color + '15', color: f.color }}
                >
                  <Icon size={18} />
                </div>
                <p className="text-xs font-medium text-secondary">{f.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <Zap size={18} className="accent-text" />
            </div>
            <h3 className="font-medium text-base mb-2">{t('landing.why1Title')}</h3>
            <p className="text-sm text-secondary leading-relaxed">
              {t('landing.why1Body')}
            </p>
          </div>
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <Brain size={18} className="accent-text" />
            </div>
            <h3 className="font-medium text-base mb-2">{t('landing.why2Title')}</h3>
            <p className="text-sm text-secondary leading-relaxed">
              {t('landing.why2Body')}
            </p>
          </div>
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <Users size={18} className="accent-text" />
            </div>
            <h3 className="font-medium text-base mb-2">{t('landing.why3Title')}</h3>
            <p className="text-sm text-secondary leading-relaxed">
              {t('landing.why3Body')}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-tertiary"
        >
          {t('landing.footer')}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// EDITORIAL LANDING — Mix A+B aesthetic
// ============================================
function LandingPageEditorial({ onStart, onOpenBranding, onOpenDemoInfo }: LandingPageProps) {
  const { t } = useLanguage();

  return (
    <div className="ed-root min-h-screen" style={{ background: 'var(--ed-bg)' }}>
      <div className="relative z-20">
        <DemoDisclaimerBanner onLearnMore={onOpenDemoInfo} />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-24"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center text-sm"
              style={{
                background: 'var(--ed-text)',
                color: 'var(--ed-bg)',
                borderRadius: 3,
                fontFamily: 'var(--font-editorial-mono)',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              DE
            </div>
            <div>
              <p className="ed-headline text-lg leading-none" style={{ fontWeight: 500 }}>Digital Evolution</p>
              <p className="ed-eyebrow mt-1" style={{ fontSize: '0.5625rem' }}>HR Platform · Demo</p>
            </div>
          </div>

          <a
            href="https://www.digitalevolution.sk"
            target="_blank"
            rel="noopener"
            className="ed-mono text-xs transition-colors hover:underline"
            style={{ color: 'var(--ed-text-secondary)' }}
          >
            www.digitalevolution.sk →
          </a>
        </motion.header>

        {/* Hero */}
        <section className="mb-24 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="ed-section-num">00 — Intro</span>
              <span className="ed-tag" data-status="live">
                <span className="ed-pulse-dot"></span>
                {t('landing.badge')}
              </span>
            </div>

            <h1 className="ed-display text-6xl md:text-8xl mb-8" style={{ lineHeight: 0.92 }}>
              {t('landing.title1')}<br />
              {t('landing.title2')}{' '}
              <em className="ed-italic-flourish">{t('landing.titleEm')}</em>.
            </h1>

            <p
              className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl"
              style={{ color: 'var(--ed-text-secondary)', letterSpacing: '-0.01em' }}
            >
              {t('landing.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={() => onStart('role-picker')}
                className="ed-btn ed-btn-primary"
                style={{ padding: '0.875rem 1.5rem', fontSize: '0.9375rem' }}
              >
                {t('landing.ctaPrimary')}
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>
              <button
                onClick={onOpenBranding}
                className="ed-btn"
                style={{ padding: '0.875rem 1.5rem', fontSize: '0.9375rem' }}
              >
                {t('landing.ctaSecondary')}
              </button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[t('landing.feature1'), t('landing.feature2'), t('landing.feature3'), t('landing.feature4')].map((f) => (
                <span key={f} className="ed-mono flex items-center gap-1.5" style={{ color: 'var(--ed-text-tertiary)' }}>
                  <span style={{ color: 'var(--ed-text)' }}>—</span>
                  {f}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        <hr className="ed-divider mb-12" />

        {/* Feature inventory */}
        <section className="mb-24">
          <div className="flex items-baseline justify-between mb-8 flex-wrap gap-2">
            <h2 className="ed-eyebrow">01 — Modules</h2>
            <span className="ed-mono" style={{ color: 'var(--ed-text-tertiary)' }}>
              {features.length} included
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-px" style={{ background: 'var(--ed-border)' }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 + i * 0.03 }}
                  className="flex flex-col items-start gap-2 p-5 transition-colors"
                  style={{ background: 'var(--ed-surface)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--ed-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--ed-surface)';
                  }}
                >
                  <span className="ed-section-num">{String(i + 1).padStart(2, '0')}</span>
                  <Icon size={18} strokeWidth={1.5} style={{ color: 'var(--ed-text)' }} />
                  <p
                    className="text-xs font-medium"
                    style={{ color: 'var(--ed-text)', letterSpacing: '-0.01em' }}
                  >
                    {f.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <hr className="ed-divider mb-12" />

        {/* Why it's different */}
        <section className="mb-24">
          <h2 className="ed-eyebrow mb-10">02 — Why it works</h2>

          <div className="grid md:grid-cols-3 gap-x-10 gap-y-12">
            <article>
              <span className="ed-section-num mb-4 block">01</span>
              <h3 className="ed-headline text-2xl mb-3">
                {t('landing.why1Title')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ed-text-secondary)' }}>
                {t('landing.why1Body')}
              </p>
            </article>
            <article>
              <span className="ed-section-num mb-4 block">02</span>
              <h3 className="ed-headline text-2xl mb-3">
                <em className="ed-italic-flourish">AI</em> from day one
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ed-text-secondary)' }}>
                {t('landing.why2Body')}
              </p>
            </article>
            <article>
              <span className="ed-section-num mb-4 block">03</span>
              <h3 className="ed-headline text-2xl mb-3">
                {t('landing.why3Title')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ed-text-secondary)' }}>
                {t('landing.why3Body')}
              </p>
            </article>
          </div>
        </section>

        <hr className="ed-divider mb-6" />

        {/* Footer */}
        <footer className="flex items-center justify-between flex-wrap gap-2">
          <span className="ed-eyebrow">{t('landing.footer')}</span>
          <span className="ed-mono" style={{ color: 'var(--ed-text-tertiary)' }}>
            2026 — v1.0
          </span>
        </footer>
      </div>
    </div>
  );
}

// ============================================
// BRUTALIST LANDING — magazine bold
// ============================================
function LandingPageBrutalist({ onStart, onOpenBranding, onOpenDemoInfo }: LandingPageProps) {
  const { t } = useLanguage();

  return (
    <div className="br-root min-h-screen" style={{ background: 'var(--br-bg)' }}>
      <div className="relative z-20">
        <DemoDisclaimerBanner onLearnMore={onOpenDemoInfo} />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 relative" style={{ zIndex: 2 }}>
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-20 flex-wrap gap-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{
                background: 'var(--br-text)',
                color: 'var(--br-bg)',
                fontFamily: 'var(--font-editorial-mono)',
                fontWeight: 700,
                fontSize: '0.875rem',
                letterSpacing: '0.05em',
              }}
            >
              DE
            </div>
            <div>
              <p className="br-headline text-lg leading-none" style={{ fontWeight: 500 }}>Digital Evolution</p>
              <p className="br-eyebrow mt-1" style={{ fontSize: '0.5625rem' }}>HR PLATFORM · DEMO</p>
            </div>
          </div>

          <a
            href="https://www.digitalevolution.sk"
            target="_blank"
            rel="noopener"
            className="br-mono transition-colors hover:underline"
            style={{ color: 'var(--br-text)' }}
          >
            WWW.DIGITALEVOLUTION.SK →
          </a>
        </motion.header>

        {/* Hero — massive */}
        <section className="mb-24 max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <span className="br-tag" data-tone="accent">● LIVE</span>
              <span className="br-eyebrow">{t('landing.badge')}</span>
            </div>

            <h1 className="br-poster text-7xl md:text-9xl mb-8" style={{ lineHeight: 0.85 }}>
              {t('landing.title1')}<br />
              {t('landing.title2')}<br />
              <em className="br-italic">{t('landing.titleEm')}.</em>
            </h1>

            <p
              className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl"
              style={{ color: 'var(--br-text-secondary)', letterSpacing: '-0.005em' }}
            >
              {t('landing.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={() => onStart('role-picker')}
                className="br-btn br-btn-primary"
                style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem' }}
              >
                {t('landing.ctaPrimary')}
                <ArrowRight size={14} strokeWidth={2} />
              </button>
              <button
                onClick={onOpenBranding}
                className="br-btn"
                style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem' }}
              >
                {t('landing.ctaSecondary')}
              </button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[t('landing.feature1'), t('landing.feature2'), t('landing.feature3'), t('landing.feature4')].map((f) => (
                <span key={f} className="br-mono flex items-center gap-1.5" style={{ color: 'var(--br-text-secondary)' }}>
                  <span style={{ color: 'var(--br-accent)', fontWeight: 700 }}>×</span>
                  {f.toUpperCase()}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        <hr className="br-divider mb-12" />

        {/* Feature inventory — hard grid */}
        <section className="mb-24">
          <div className="flex items-baseline justify-between mb-8 flex-wrap gap-2">
            <div className="flex items-baseline gap-6">
              <span className="br-index-large">/ 01</span>
              <span className="br-eyebrow">MODULES</span>
            </div>
            <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>
              {String(features.length).padStart(2, '0')} INCLUDED
            </span>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-5 gap-px"
            style={{ background: 'var(--br-border)', border: '1px solid var(--br-border)' }}
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 + i * 0.03 }}
                  className="flex flex-col items-start gap-3 p-5 transition-colors"
                  style={{ background: 'var(--br-surface)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--br-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--br-surface)';
                  }}
                >
                  <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Icon size={20} strokeWidth={2} style={{ color: 'var(--br-text)' }} />
                  <p
                    className="text-sm"
                    style={{ color: 'var(--br-text)', fontWeight: 600, letterSpacing: '-0.01em' }}
                  >
                    {f.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <hr className="br-divider mb-12" />

        {/* Why it works — editorial articles with red accents */}
        <section className="mb-24">
          <div className="flex items-baseline gap-6 mb-12">
            <span className="br-index-large">/ 02</span>
            <span className="br-eyebrow">WHY IT WORKS</span>
          </div>

          <div className="grid md:grid-cols-3 gap-0" style={{ border: '1px solid var(--br-border)' }}>
            <article
              className="p-8"
              style={{ borderRight: '1px solid var(--br-border)', background: 'var(--br-surface)' }}
            >
              <span className="br-index-large mb-6 block">01</span>
              <h3 className="br-headline text-3xl mb-4">
                {t('landing.why1Title')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--br-text-secondary)' }}>
                {t('landing.why1Body')}
              </p>
            </article>
            <article
              className="p-8"
              style={{ borderRight: '1px solid var(--br-border)', background: 'var(--br-surface)' }}
            >
              <span className="br-index-large mb-6 block">02</span>
              <h3 className="br-headline text-3xl mb-4">
                <em className="br-italic">AI</em> from day one
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--br-text-secondary)' }}>
                {t('landing.why2Body')}
              </p>
            </article>
            <article
              className="p-8"
              style={{ background: 'var(--br-text)', color: 'var(--br-bg)' }}
            >
              <span className="br-index-large mb-6 block" style={{ color: 'var(--br-accent)' }}>03</span>
              <h3 className="br-headline text-3xl mb-4">
                {t('landing.why3Title')}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(244, 241, 236, 0.8)' }}>
                {t('landing.why3Body')}
              </p>
            </article>
          </div>
        </section>

        <hr className="br-divider mb-6" />

        {/* Footer */}
        <footer className="flex items-center justify-between flex-wrap gap-2 pb-6">
          <span className="br-eyebrow">{t('landing.footer').toUpperCase()}</span>
          <span className="br-mono" style={{ color: 'var(--br-text-tertiary)' }}>
            2026 — V1.0
          </span>
        </footer>
      </div>
    </div>
  );
}

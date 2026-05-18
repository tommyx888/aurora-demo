import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Sparkles, Wrench, Users, MessageCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';

interface DemoDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContact?: () => void;
}

export function DemoDisclaimerModal(props: DemoDisclaimerModalProps) {
  const { mode } = useDesignMode();
  if (mode === 'editorial') return <DemoDisclaimerModalEditorial {...props} />;
  if (mode === 'brutalist') return <DemoDisclaimerModalBrutalist {...props} />;
  return <DemoDisclaimerModalClassic {...props} />;
}

// ============================================
// CLASSIC MODAL — original look
// ============================================
function DemoDisclaimerModalClassic({ isOpen, onClose, onContact }: DemoDisclaimerModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-2xl w-full p-0 overflow-hidden"
          >
            <div className="p-6 border-b border-subtle mesh-bg flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl accent-bg flex items-center justify-center text-white flex-shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h2 className="font-display text-2xl mb-1">{t('demoModal.title')}</h2>
                  <p className="text-sm text-secondary">
                    {t('demoModal.subtitle')}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="btn-ghost flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm leading-relaxed">
                {t('demoModal.body')}
              </p>

              <div className="grid sm:grid-cols-3 gap-3">
                <FeatureBox
                  icon={Wrench}
                  title={t('demoModal.feat1Title')}
                  body={t('demoModal.feat1Body')}
                />
                <FeatureBox
                  icon={Users}
                  title={t('demoModal.feat2Title')}
                  body={t('demoModal.feat2Body')}
                />
                <FeatureBox
                  icon={Sparkles}
                  title={t('demoModal.feat3Title')}
                  body={t('demoModal.feat3Body')}
                />
              </div>

              <div className="card bg-tertiary p-4 border-l-4 accent-border">
                <p className="text-sm leading-relaxed">
                  💬 {t('demoModal.highlight')}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-tertiary mb-2">{t('demoModal.nextStepsTitle')}</p>
                <div className="space-y-2 text-sm">
                  <Step n="1" text={t('demoModal.step1')} />
                  <Step n="2" text={t('demoModal.step2')} />
                  <Step n="3" text={t('demoModal.step3')} />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-subtle flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-tertiary">
                <a
                  href="https://www.digitalevolution.sk"
                  target="_blank"
                  rel="noopener"
                  className="hover:accent-text transition-colors"
                >
                  Digital Evolution s.r.o. · www.digitalevolution.sk →
                </a>
              </p>
              <div className="flex gap-2">
                <button onClick={onClose} className="btn-secondary text-sm">
                  {t('demoModal.continueDemo')}
                </button>
                {onContact && (
                  <button onClick={onContact} className="btn-primary text-sm">
                    <MessageCircle size={14} />
                    {t('common.contactUs')}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// EDITORIAL MODAL — Mix A+B aesthetic
// ============================================
function DemoDisclaimerModalEditorial({ isOpen, onClose, onContact }: DemoDisclaimerModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(24, 24, 27, 0.4)', backdropFilter: 'blur(2px)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="ed-root max-w-2xl w-full overflow-hidden"
            style={{
              background: 'var(--ed-surface)',
              border: '1px solid var(--ed-border)',
              borderRadius: 6,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div className="p-8" style={{ borderBottom: '1px solid var(--ed-border)' }}>
              <div className="flex items-start justify-between mb-6">
                <span className="ed-section-num">00 — About this demo</span>
                <button
                  onClick={onClose}
                  className="ed-btn ed-btn-ghost"
                  style={{ padding: '0.25rem' }}
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              </div>

              <h2 className="ed-display text-3xl md:text-4xl mb-3" style={{ lineHeight: 1 }}>
                {t('demoModal.title')}
              </h2>
              <p className="text-sm" style={{ color: 'var(--ed-text-secondary)' }}>
                {t('demoModal.subtitle')}
              </p>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8 overflow-y-auto">
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--ed-text-secondary)' }}
              >
                {t('demoModal.body')}
              </p>

              {/* Features grid */}
              <div className="grid sm:grid-cols-3 gap-px" style={{ background: 'var(--ed-border)' }}>
                <EditorialFeatureBox
                  num="01"
                  title={t('demoModal.feat1Title')}
                  body={t('demoModal.feat1Body')}
                />
                <EditorialFeatureBox
                  num="02"
                  title={t('demoModal.feat2Title')}
                  body={t('demoModal.feat2Body')}
                />
                <EditorialFeatureBox
                  num="03"
                  title={t('demoModal.feat3Title')}
                  body={t('demoModal.feat3Body')}
                />
              </div>

              {/* Highlight blockquote */}
              <div
                style={{
                  borderLeft: '2px solid var(--ed-text)',
                  paddingLeft: '1rem',
                }}
              >
                <p className="ed-headline text-lg leading-relaxed" style={{ fontWeight: 400, lineHeight: 1.4 }}>
                  <em className="ed-italic-flourish">"</em>
                  {t('demoModal.highlight')}
                  <em className="ed-italic-flourish">"</em>
                </p>
              </div>

              {/* Next steps */}
              <div>
                <p className="ed-eyebrow mb-4">{t('demoModal.nextStepsTitle')}</p>
                <div className="space-y-3">
                  <EditorialStep n="01" text={t('demoModal.step1')} />
                  <EditorialStep n="02" text={t('demoModal.step2')} />
                  <EditorialStep n="03" text={t('demoModal.step3')} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-5 flex items-center justify-between gap-3 flex-wrap"
              style={{ borderTop: '1px solid var(--ed-border)' }}
            >
              <a
                href="https://www.digitalevolution.sk"
                target="_blank"
                rel="noopener"
                className="ed-mono hover:underline"
                style={{ color: 'var(--ed-text-tertiary)' }}
              >
                Digital Evolution s.r.o. · www.digitalevolution.sk →
              </a>
              <div className="flex gap-2">
                <button onClick={onClose} className="ed-btn">
                  {t('demoModal.continueDemo')}
                </button>
                {onContact && (
                  <button onClick={onContact} className="ed-btn ed-btn-primary">
                    {t('common.contactUs')}
                    <ArrowRight size={13} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// BRUTALIST MODAL — magazine bold
// ============================================
function DemoDisclaimerModalBrutalist({ isOpen, onClose, onContact }: DemoDisclaimerModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(10, 10, 9, 0.55)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="br-root max-w-2xl w-full overflow-hidden"
            style={{
              background: 'var(--br-surface)',
              border: '1px solid var(--br-border)',
              boxShadow: '8px 8px 0 var(--br-border)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div className="p-8" style={{ borderBottom: '1px solid var(--br-border)' }}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="br-index-large">/ 00</span>
                  <span className="br-eyebrow">ABOUT THIS DEMO</span>
                </div>
                <button
                  onClick={onClose}
                  className="br-btn"
                  style={{ padding: '0.25rem', border: 'none', background: 'transparent' }}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              <h2 className="br-poster text-4xl md:text-5xl mb-3" style={{ lineHeight: 0.9 }}>
                {t('demoModal.title')}
              </h2>
              <p className="text-sm" style={{ color: 'var(--br-text-secondary)' }}>
                {t('demoModal.subtitle')}
              </p>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8 overflow-y-auto">
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--br-text-secondary)' }}
              >
                {t('demoModal.body')}
              </p>

              {/* Features grid — hard borders */}
              <div
                className="grid sm:grid-cols-3 gap-0"
                style={{ border: '1px solid var(--br-border)' }}
              >
                <BrutalistFeatureBox
                  num="01"
                  title={t('demoModal.feat1Title')}
                  body={t('demoModal.feat1Body')}
                  borderRight
                />
                <BrutalistFeatureBox
                  num="02"
                  title={t('demoModal.feat2Title')}
                  body={t('demoModal.feat2Body')}
                  borderRight
                />
                <BrutalistFeatureBox
                  num="03"
                  title={t('demoModal.feat3Title')}
                  body={t('demoModal.feat3Body')}
                />
              </div>

              {/* Highlight — red left border, surface-2 bg */}
              <div
                style={{
                  borderLeft: '3px solid var(--br-accent)',
                  background: 'var(--br-surface-2)',
                  padding: '1rem 1.25rem',
                }}
              >
                <p className="br-eyebrow mb-2" style={{ fontSize: '0.5625rem', color: 'var(--br-accent)' }}>
                  KEY POINT
                </p>
                <p className="text-base leading-relaxed" style={{ color: 'var(--br-text)' }}>
                  {t('demoModal.highlight')}
                </p>
              </div>

              {/* Next steps */}
              <div>
                <p className="br-eyebrow mb-4">{t('demoModal.nextStepsTitle').toUpperCase()}</p>
                <div className="space-y-3">
                  <BrutalistStep n="01" text={t('demoModal.step1')} />
                  <BrutalistStep n="02" text={t('demoModal.step2')} />
                  <BrutalistStep n="03" text={t('demoModal.step3')} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-8 py-5 flex items-center justify-between gap-3 flex-wrap"
              style={{ borderTop: '1px solid var(--br-border)' }}
            >
              <a
                href="https://www.digitalevolution.sk"
                target="_blank"
                rel="noopener"
                className="br-mono hover:underline"
                style={{ color: 'var(--br-text-tertiary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                DIGITAL EVOLUTION s.r.o. · WWW.DIGITALEVOLUTION.SK →
              </a>
              <div className="flex gap-2">
                <button onClick={onClose} className="br-btn">
                  {t('demoModal.continueDemo')}
                </button>
                {onContact && (
                  <button onClick={onContact} className="br-btn br-btn-accent">
                    {t('common.contactUs')}
                    <ArrowRight size={13} strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BrutalistFeatureBox({ num, title, body, borderRight }: { num: string; title: string; body: string; borderRight?: boolean }) {
  return (
    <div
      className="p-5"
      style={{
        background: 'var(--br-surface)',
        borderRight: borderRight ? '1px solid var(--br-border)' : 'none',
      }}
    >
      <span className="br-index-large mb-3 block">{num}</span>
      <p
        className="text-sm mb-2"
        style={{ color: 'var(--br-text)', fontWeight: 700, letterSpacing: '-0.01em' }}
      >
        {title}
      </p>
      <p
        className="text-xs leading-relaxed"
        style={{ color: 'var(--br-text-secondary)' }}
      >
        {body}
      </p>
    </div>
  );
}

function BrutalistStep({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="br-mono flex-shrink-0"
        style={{
          background: 'var(--br-text)',
          color: 'var(--br-bg)',
          padding: '2px 6px',
          fontWeight: 700,
          fontSize: '0.6875rem',
          letterSpacing: '0.05em',
        }}
      >
        {n}
      </span>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--br-text-secondary)' }}
      >
        {text}
      </p>
    </div>
  );
}

function FeatureBox({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="card p-3">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mb-2">
        <Icon size={14} className="accent-text" />
      </div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-tertiary leading-snug">{body}</p>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 h-5 rounded-full accent-bg text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <p className="text-secondary leading-relaxed">{text}</p>
    </div>
  );
}

function EditorialFeatureBox({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="p-5" style={{ background: 'var(--ed-surface)' }}>
      <span className="ed-section-num mb-3 block">{num}</span>
      <p
        className="text-sm font-medium mb-2"
        style={{ color: 'var(--ed-text)', letterSpacing: '-0.01em' }}
      >
        {title}
      </p>
      <p
        className="text-xs leading-relaxed"
        style={{ color: 'var(--ed-text-secondary)' }}
      >
        {body}
      </p>
    </div>
  );
}

function EditorialStep({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="ed-section-num" style={{ paddingTop: '2px' }}>{n}</span>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--ed-text-secondary)' }}
      >
        {text}
      </p>
    </div>
  );
}

// ============================================
// LANDING BANNER (top of landing page)
// ============================================
export function DemoDisclaimerBanner({ onLearnMore }: { onLearnMore: () => void }) {
  const { t } = useLanguage();
  const { mode } = useDesignMode();
  const isEditorial = mode === 'editorial';
  const isBrutalist = mode === 'brutalist';

  if (isBrutalist) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="br-root w-full"
        style={{
          background: 'var(--br-text)',
          color: 'var(--br-bg)',
          borderBottom: '1px solid var(--br-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs">
            <span
              className="inline-block w-2 h-2"
              style={{ background: 'var(--br-accent)' }}
            />
            <span className="br-mono" style={{ color: 'var(--br-bg)', letterSpacing: '0.05em' }}>
              <strong style={{ color: 'var(--br-accent)' }}>{t('landing.disclaimer1').toUpperCase()}</strong>
              {' · '}
              {t('landing.disclaimer2').toUpperCase()}{' '}
              <strong>{t('landing.disclaimerEm').toUpperCase()}</strong>{t('landing.disclaimer3').toUpperCase()}
            </span>
          </div>
          <button
            onClick={onLearnMore}
            className="br-mono hover:underline whitespace-nowrap flex items-center gap-1"
            style={{ color: 'var(--br-accent)', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {t('common.learnMore')}
            <ArrowRight size={11} strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    );
  }

  if (isEditorial) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="ed-root w-full"
        style={{
          background: 'var(--ed-surface-2)',
          borderBottom: '1px solid var(--ed-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 text-xs">
            <span className="ed-pulse-dot" />
            <span className="ed-mono" style={{ color: 'var(--ed-text-secondary)' }}>
              <strong style={{ color: 'var(--ed-text)' }}>{t('landing.disclaimer1').toUpperCase()}</strong>
              {' · '}
              {t('landing.disclaimer2')}{' '}
              <strong style={{ color: 'var(--ed-text)' }}>{t('landing.disclaimerEm')}</strong>{t('landing.disclaimer3')}
            </span>
          </div>
          <button
            onClick={onLearnMore}
            className="ed-mono hover:underline whitespace-nowrap flex items-center gap-1"
            style={{ color: 'var(--ed-text)', fontSize: '0.6875rem' }}
          >
            {t('common.learnMore')}
            <ArrowRight size={11} strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full border-b border-subtle"
      style={{ background: 'color-mix(in srgb, var(--accent-primary) 8%, var(--bg-primary))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-base">✨</span>
          <span className="text-secondary">
            <strong className="text-primary">{t('landing.disclaimer1')}</strong> · {t('landing.disclaimer2')}{' '}
            <strong>{t('landing.disclaimerEm')}</strong> {t('landing.disclaimer3')}
          </span>
        </div>
        <button
          onClick={onLearnMore}
          className="text-xs font-medium accent-text hover:underline whitespace-nowrap flex items-center gap-1"
        >
          {t('common.learnMore')}
          <ArrowRight size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// SIDEBAR BADGE (under logo)
// ============================================
export function DemoDisclaimerBadge({ onClick }: { onClick: () => void }) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 mt-1 rounded-lg hover:bg-tertiary transition-colors group"
      title={t('nav.switchView')}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)' }}
        >
          <Info size={11} className="accent-text" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-tertiary leading-none">{t('sidebar.demoLabel')}</p>
          <p className="text-[10px] text-secondary leading-tight mt-0.5">
            {t('sidebar.demoTagline')}
          </p>
        </div>
      </div>
    </button>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles, X, ArrowRight, ArrowLeft, Wand2, Bot } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';

interface TourStep {
  title: string;
  body: string;
  emoji: string;
  tip?: string;
}

const STEPS_SK: TourStep[] = [
  {
    title: 'Vitaj v demo!',
    emoji: '👋',
    body: 'Ukazem ti za 30 sekund najsilnejsie funkcie tohto HR systemu. Ak nechces tour, klikni X v rohu — vsetko si mozes preskumat sam/sama.',
    tip: 'Demo ma pred-vyplnene data z firmy "Aurora" (15 zamestnancov). Vsetko je interaktivne.',
  },
  {
    title: '4 Hero moduly',
    emoji: '🔥',
    body: 'Vlavo v sidebare najdes nasich 4 hlavnych modulov: Onboarding s AI buddy, Skill Heatmap, Admin Dashboard a Recruiting kanban. Su plne funkcne.',
    tip: 'AI sucasti maju badge "AI" — toto su feature ktore robia rozdiel oproti BambooHR.',
  },
  {
    title: 'Branding Studio',
    emoji: '🪄',
    body: 'Vpravo dole klikni na palette ikonu → "Nahrat tvoje logo". AI extrahuje farby z tvojho loga a celé demo sa prepne do tvojho brand-u za 1 sekundu.',
    tip: 'Vyskusaj to so skutocnym logom svojej firmy. Predaj wow moment.',
  },
  {
    title: 'AI Chatbot Eva',
    emoji: '🤖',
    body: 'Vpravo hore (v Employee Dashboarde) klikni na bota. Eva odpoveda na otazky o firme — benefity, kolegovia, eventy. Bez API key bezi v fake mode, s API key naživo.',
    tip: 'Pridaj VITE_ANTHROPIC_API_KEY do .env.local pre Live mode.',
  },
  {
    title: 'Switching pohladu',
    emoji: '🔄',
    body: 'V sidebare hore prepnes Employee ⇄ Admin pohlad. Niektore funkcie su pre HR (Skill Matrix, Recruiting), ine pre zamestnanca (Pulse, Onboarding).',
    tip: 'Pri pitch-i klientovi: "Toto vidi tvoj manazer, toto tvoj zamestnanec".',
  },
  {
    title: '3 Themes',
    emoji: '🎨',
    body: 'Klient si moze vybrat z 3 vizualnych styluv: Modern Mint (Linear/Vercel), Playful Coral (Notion), Corporate Navy (BambooHR). Plus tvoj custom branding.',
    tip: 'Theme switcher je vpravo dole — palette ikona.',
  },
  {
    title: 'Hotovo!',
    emoji: '🚀',
    body: 'Si pripraveny. Klik kdekolvek pre exploration. Konami code (↑↑↓↓←→←→BA) ti hodi konfety. 🎉',
    tip: 'Dolu mas tip lištu, hore search bar, vsetko sa da kliknut.',
  },
];
const STEPS_EN: TourStep[] = [
  { title: 'Welcome to the demo!', emoji: '👋', body: 'I will show you the strongest features of this HR system in 30 seconds. If you do not want the tour, click X.', tip: 'Demo contains pre-filled data from "Aurora" (15 employees). Everything is interactive.' },
  { title: '4 Hero modules', emoji: '🔥', body: 'In the left sidebar you can find our 4 key modules: AI onboarding, Skill Heatmap, Admin Dashboard, and Recruiting kanban.', tip: 'Features with "AI" badge are your differentiation points.' },
  { title: 'Branding Studio', emoji: '🪄', body: 'Bottom-right palette icon → upload your logo. AI extracts colors and switches the whole demo to your brand in 1 second.', tip: 'Try this with a real customer logo for instant wow effect.' },
  { title: 'AI Chatbot Eva', emoji: '🤖', body: 'Open the bot and ask about benefits, colleagues, or events. Without API key it runs in demo mode, with API key in live mode.', tip: 'Add VITE_ANTHROPIC_API_KEY to .env.local for live mode.' },
  { title: 'View switching', emoji: '🔄', body: 'Switch between Employee and Admin views in sidebar. Some features are HR-only, others are employee-focused.', tip: 'Great for sales demos: show manager vs employee perspective.' },
  { title: '3 Themes', emoji: '🎨', body: 'Choose one of 3 visual themes or use custom branding.', tip: 'Theme switcher is bottom-right palette icon.' },
  { title: 'Done!', emoji: '🚀', body: 'You are ready. Explore freely and click around.', tip: 'Konami code (↑↑↓↓←→←→BA) triggers confetti. 🎉' },
];

const TOUR_KEY = 'de-demo-tour-completed';

interface OnboardingTourProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function OnboardingTour({ forceShow = false, onClose }: OnboardingTourProps) {
  const { lang } = useLanguage();
  const { mode } = useDesignMode();
  const isEn = lang === 'en';
  const isEditorial = mode === 'editorial';
  const isBrutalist = mode === 'brutalist';
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const steps = isEn ? STEPS_EN : STEPS_SK;

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      setStep(0);
      return;
    }
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      // Show after small delay so app loads first
      const t = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [forceShow]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TOUR_KEY, 'true');
    onClose?.();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  // Brutalist variant
  if (isBrutalist) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: 'rgba(10, 10, 9, 0.55)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="br-root max-w-md w-full relative"
              style={{
                background: 'var(--br-surface)',
                border: '1px solid var(--br-border)',
                boxShadow: '8px 8px 0 var(--br-border)',
              }}
            >
              {/* Progress bar — red signal */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'var(--br-text-muted)',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ height: '100%', background: 'var(--br-accent)' }}
                />
              </div>

              <button
                onClick={handleClose}
                className="absolute top-4 right-4 br-btn"
                style={{ padding: '0.25rem', zIndex: 10, border: 'none', background: 'transparent' }}
                title={isEn ? 'Skip tour' : 'Preskocit tour'}
              >
                <X size={14} strokeWidth={2} />
              </button>

              <div className="p-8 pt-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-baseline justify-between mb-6">
                      <span className="br-index-large">
                        / {String(step + 1).padStart(2, '0')} — {String(steps.length).padStart(2, '0')}
                      </span>
                      <span className="br-eyebrow" style={{ fontSize: '0.5625rem' }}>
                        {isEn ? 'WELCOME' : 'VITAJ'}
                      </span>
                    </div>

                    <h2 className="br-poster text-4xl md:text-5xl mb-4" style={{ lineHeight: 0.95 }}>
                      {current.title}
                    </h2>

                    <p
                      className="text-sm leading-relaxed mb-5"
                      style={{ color: 'var(--br-text-secondary)' }}
                    >
                      {current.body}
                    </p>

                    {current.tip && (
                      <div
                        style={{
                          borderLeft: '3px solid var(--br-accent)',
                          paddingLeft: '0.875rem',
                          marginTop: '1rem',
                          background: 'var(--br-surface-2)',
                          padding: '0.75rem 0.875rem',
                        }}
                      >
                        <p
                          className="br-eyebrow mb-1"
                          style={{ fontSize: '0.5625rem', color: 'var(--br-accent)' }}
                        >
                          {isEn ? 'NOTE' : 'TIP'}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: 'var(--br-text)' }}
                        >
                          {current.tip}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <hr className="br-divider my-6" />

                {/* Step dots — brutalist squares with red accent on active */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className="transition-all"
                      style={{
                        width: i === step ? 24 : 6,
                        height: 6,
                        background: i === step ? 'var(--br-accent)' : 'var(--br-text-muted)',
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={step === 0}
                    className="br-btn"
                    style={{ opacity: step === 0 ? 0.3 : 1, padding: '0.5rem 0.875rem' }}
                  >
                    <ArrowLeft size={13} strokeWidth={2} />
                    {isEn ? 'BACK' : 'SPAT'}
                  </button>

                  <button
                    onClick={handleClose}
                    className="br-mono"
                    style={{ fontSize: '0.6875rem', color: 'var(--br-text-tertiary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    {isEn ? 'SKIP' : 'PRESKOCIT'}
                  </button>

                  <button onClick={handleNext} className="br-btn br-btn-accent" style={{ padding: '0.5rem 0.875rem' }}>
                    {step === steps.length - 1 ? (isEn ? 'GOT IT' : 'OK') : (isEn ? 'NEXT' : 'DALEJ')}
                    <ArrowRight size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Editorial variant
  if (isEditorial) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: 'rgba(24, 24, 27, 0.5)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="ed-root max-w-md w-full overflow-hidden relative"
              style={{
                background: 'var(--ed-surface)',
                border: '1px solid var(--ed-border)',
                borderRadius: 6,
              }}
            >
              {/* Progress line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'var(--ed-border)',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ height: '100%', background: 'var(--ed-text)' }}
                />
              </div>

              <button
                onClick={handleClose}
                className="absolute top-4 right-4 ed-btn ed-btn-ghost"
                style={{ padding: '0.25rem', zIndex: 10 }}
                title={isEn ? 'Skip tour' : 'Preskocit tour'}
              >
                <X size={14} strokeWidth={1.5} />
              </button>

              <div className="p-8 pt-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-baseline justify-between mb-6">
                      <span className="ed-section-num">
                        {String(step + 1).padStart(2, '0')} — {isEn ? 'of' : 'z'} {String(steps.length).padStart(2, '0')}
                      </span>
                      <span className="ed-eyebrow" style={{ fontSize: '0.5625rem' }}>
                        {isEn ? 'Welcome' : 'Vitaj'}
                      </span>
                    </div>

                    <h2 className="ed-display text-4xl mb-4" style={{ lineHeight: 1 }}>
                      {current.title}
                    </h2>

                    <p
                      className="text-sm leading-relaxed mb-5"
                      style={{ color: 'var(--ed-text-secondary)' }}
                    >
                      {current.body}
                    </p>

                    {current.tip && (
                      <div
                        style={{
                          borderLeft: '2px solid var(--ed-text)',
                          paddingLeft: '0.875rem',
                          marginTop: '1rem',
                        }}
                      >
                        <p
                          className="ed-eyebrow mb-1"
                          style={{ fontSize: '0.5625rem' }}
                        >
                          {isEn ? 'Note' : 'Tip'}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: 'var(--ed-text-secondary)' }}
                        >
                          {current.tip}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <hr className="ed-divider my-6" />

                {/* Step dots — editorial style: small squares */}
                <div className="flex items-center justify-center gap-1 mb-6">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className="transition-all"
                      style={{
                        width: i === step ? 18 : 4,
                        height: 4,
                        background: i === step ? 'var(--ed-text)' : 'var(--ed-border-strong)',
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={step === 0}
                    className="ed-btn ed-btn-ghost"
                    style={{ opacity: step === 0 ? 0.3 : 1 }}
                  >
                    <ArrowLeft size={13} strokeWidth={1.5} />
                    {isEn ? 'Back' : 'Spat'}
                  </button>

                  <button onClick={handleClose} className="ed-mono" style={{ fontSize: '0.6875rem', color: 'var(--ed-text-tertiary)' }}>
                    {isEn ? 'Skip' : 'Preskocit'}
                  </button>

                  <button onClick={handleNext} className="ed-btn ed-btn-primary">
                    {step === steps.length - 1 ? (isEn ? 'Got it' : 'Pochopene') : (isEn ? 'Next' : 'Dalej')}
                    <ArrowRight size={13} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Classic variant
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="card max-w-md w-full p-0 overflow-hidden relative"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary">
              <motion.div
                className="h-full accent-bg"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-tertiary hover:bg-medium flex items-center justify-center transition-colors z-10"
              title={isEn ? 'Skip tour' : 'Preskocit tour'}
            >
              <X size={14} />
            </button>

            <div className="p-8 pt-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Emoji */}
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-6xl mb-4 text-center"
                  >
                    {current.emoji}
                  </motion.div>

                  <p className="text-[11px] uppercase tracking-wider text-tertiary text-center mb-2">
                    {isEn ? 'Step' : 'Krok'} {step + 1} {isEn ? 'of' : 'z'} {steps.length}
                  </p>

                  <h2 className="font-display text-3xl text-center mb-4">{current.title}</h2>

                  <p className="text-sm text-secondary leading-relaxed text-center mb-4">
                    {current.body}
                  </p>

                  {current.tip && (
                    <div className="card bg-tertiary p-3">
                      <div className="flex items-start gap-2">
                        <Sparkles size={14} className="accent-text mt-0.5 flex-shrink-0" />
                        <p className="text-xs leading-relaxed">
                          <strong className="text-primary">{isEn ? 'Tip:' : 'Tip:'}</strong>{' '}
                          <span className="text-secondary">{current.tip}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Step dots */}
              <div className="flex items-center justify-center gap-1 my-6">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`transition-all rounded-full ${
                      i === step ? 'w-6 h-1.5 accent-bg' : 'w-1.5 h-1.5 bg-tertiary'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrev}
                  disabled={step === 0}
                  className="btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={14} />
                  {isEn ? 'Back' : 'Spat'}
                </button>

                <button onClick={handleClose} className="btn-ghost text-xs text-tertiary">
                  {isEn ? 'Skip' : 'Preskocit'}
                </button>

                <button onClick={handleNext} className="btn-primary text-sm">
                  {step === steps.length - 1 ? (
                    <>
                      {isEn ? 'Got it' : 'Pochopene'}
                      <Sparkles size={14} />
                    </>
                  ) : (
                    <>
                      {isEn ? 'Next' : 'Dalej'}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Helper to manually trigger the tour (e.g. from a help button) */
export function useTour() {
  const [forceShow, setForceShow] = useState(false);
  return {
    showTour: () => setForceShow(true),
    hideTour: () => setForceShow(false),
    forceShow,
  };
}

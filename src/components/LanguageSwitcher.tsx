import { motion } from 'framer-motion';
import { useLanguage, type Language } from '../hooks/useLanguage';

const LANGUAGES: { code: Language; label: string; flag: string; native: string }[] = [
  { code: 'sk', label: 'language.sk', flag: '🇸🇰', native: 'SK' },
  { code: 'en', label: 'language.en', flag: '🇬🇧', native: 'EN' },
];

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className="fixed top-16 md:top-4 right-3 md:right-4 z-50"
      title={t('language.switcherTitle')}
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="card shadow-md-themed flex items-center gap-0.5 p-1 rounded-full relative"
        role="radiogroup"
        aria-label={t('language.label')}
      >
        {LANGUAGES.map((l) => {
          const isActive = l.code === lang;
          return (
            <button
              key={l.code}
              role="radio"
              aria-checked={isActive}
              aria-label={t(l.label)}
              onClick={() => setLang(l.code)}
              className={`relative z-10 flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-tertiary hover:text-primary'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="lang-switcher-pill"
                  className="absolute inset-0 accent-bg rounded-full -z-10 shadow-md-themed"
                  transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }}
                />
              )}
              <span
                className={`text-base leading-none transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'scale-95 opacity-70'
                }`}
                aria-hidden="true"
              >
                {l.flag}
              </span>
              <span className="text-[11px] md:text-xs font-semibold font-mono tracking-wider">
                {l.native}
              </span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}

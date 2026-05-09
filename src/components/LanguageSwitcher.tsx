import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useLanguage, type Language } from '../hooks/useLanguage';
import { Globe, Check } from 'lucide-react';

const LANGUAGES: { code: Language; label: string; flag: string; native: string }[] = [
  { code: 'sk', label: 'language.sk', flag: '🇸🇰', native: 'SK' },
  { code: 'en', label: 'language.en', flag: '🇬🇧', native: 'EN' },
];

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [isOpen]);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className="fixed top-16 md:top-4 right-3 md:right-4 z-50">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
        className="card shadow-md-themed flex items-center gap-2 px-2.5 md:px-3 py-2 hover:accent-border transition-colors"
        title={t('language.switcherTitle')}
      >
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="text-xs font-medium font-mono">{current.native}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 card shadow-xl-themed p-1.5 min-w-[160px] md:min-w-[180px]"
          >
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <Globe size={12} className="text-tertiary" />
              <p className="text-[10px] uppercase tracking-wider text-tertiary font-medium">{t('language.label')}</p>
            </div>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors text-sm ${
                  l.code === lang ? 'bg-accent' : 'hover:bg-tertiary'
                }`}
              >
                <span className="text-lg leading-none">{l.flag}</span>
                <span className="flex-1 font-medium">{t(l.label)}</span>
                {l.code === lang && <Check size={14} className="accent-text" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

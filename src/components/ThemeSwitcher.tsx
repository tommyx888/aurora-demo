import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Wand2, Sparkles, Layout, Feather, Type } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useBranding } from '../hooks/useBranding';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';
import type { Theme } from '../types';

const themes: { id: Theme; name: string; emoji: string; description: string; color: string }[] = [
  { id: 'mint', name: 'Modern Mint', emoji: '🌿', description: 'theme.modernMintDesc', color: '#10b981' },
  { id: 'coral', name: 'Playful Coral', emoji: '🌅', description: 'theme.playfulCoralDesc', color: '#f97316' },
  { id: 'navy', name: 'Corporate Navy', emoji: '💼', description: 'theme.corporateNavyDesc', color: '#2563eb' },
];

interface ThemeSwitcherProps {
  onOpenBranding: () => void;
}

export function ThemeSwitcher({ onOpenBranding }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const { branding } = useBranding();
  const { t } = useLanguage();
  const { mode, setMode } = useDesignMode();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 md:bottom-16 right-0 card shadow-xl-themed w-[min(20rem,calc(100vw-1.5rem))] md:w-80 p-2"
          >
            {/* Design mode toggle — Classic vs Editorial vs Brutalist */}
            <div className="px-3 py-2 mb-1">
              <p className="text-xs uppercase tracking-wider text-tertiary font-medium">{t('theme.designMode')}</p>
            </div>
            <div className="grid grid-cols-3 gap-1 px-2 mb-2">
              <button
                onClick={() => setMode('classic')}
                className={
                  'flex flex-col items-center gap-1 p-2 rounded-md transition-all border ' +
                  (mode === 'classic'
                    ? 'accent-border bg-accent'
                    : 'border-subtle hover:bg-tertiary')
                }
              >
                <Layout size={14} className={mode === 'classic' ? 'accent-text' : 'text-tertiary'} />
                <span className="text-xs font-medium">{t('theme.modeClassic')}</span>
                <span className="text-[9px] text-tertiary text-center leading-tight">{t('theme.modeClassicDesc')}</span>
              </button>
              <button
                onClick={() => setMode('editorial')}
                className={
                  'flex flex-col items-center gap-1 p-2 rounded-md transition-all border ' +
                  (mode === 'editorial'
                    ? 'accent-border bg-accent'
                    : 'border-subtle hover:bg-tertiary')
                }
              >
                <Feather size={14} className={mode === 'editorial' ? 'accent-text' : 'text-tertiary'} />
                <span className="text-xs font-medium">{t('theme.modeEditorial')}</span>
                <span className="text-[9px] text-tertiary text-center leading-tight">{t('theme.modeEditorialDesc')}</span>
              </button>
              <button
                onClick={() => setMode('brutalist')}
                className={
                  'flex flex-col items-center gap-1 p-2 rounded-md transition-all border ' +
                  (mode === 'brutalist'
                    ? 'accent-border bg-accent'
                    : 'border-subtle hover:bg-tertiary')
                }
              >
                <Type size={14} className={mode === 'brutalist' ? 'accent-text' : 'text-tertiary'} />
                <span className="text-xs font-medium">{t('theme.modeBrutalist')}</span>
                <span className="text-[9px] text-tertiary text-center leading-tight">{t('theme.modeBrutalistDesc')}</span>
              </button>
            </div>
            <div className="border-t border-subtle my-2" />

            <div className="px-3 py-2 mb-1">
              <p className="text-xs uppercase tracking-wider text-tertiary font-medium">{t('theme.visualStyle')}</p>
            </div>

            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => {
                  setTheme(themeOption.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-tertiary transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-lg"
                  style={{ background: themeOption.color + '20', color: themeOption.color }}
                >
                  {themeOption.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-primary">{themeOption.name}</p>
                  <p className="text-xs text-tertiary truncate">{t(themeOption.description)}</p>
                </div>
                {theme === themeOption.id && (
                  <Check size={16} className="accent-text" />
                )}
              </button>
            ))}

            {/* Custom branding option */}
            {branding.isActive && (
              <button
                onClick={() => {
                  setTheme('custom');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-tertiary transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center bg-white border border-medium"
                  style={{ background: branding.primary + '20' }}
                >
                  {branding.logoDataUrl ? (
                    <img src={branding.logoDataUrl} alt="" className="w-6 h-6 object-contain" />
                  ) : (
                    <Sparkles size={14} style={{ color: branding.primary }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-primary truncate">{branding.companyName}</p>
                  <p className="text-xs text-tertiary truncate">{t('theme.customBranding')}</p>
                </div>
                {theme === 'custom' && (
                  <Check size={16} className="accent-text" />
                )}
              </button>
            )}

            <div className="mt-1 pt-1 border-t border-subtle">
              <button
                onClick={() => {
                  onOpenBranding();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-md accent-bg flex items-center justify-center text-white">
                  <Wand2 size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm accent-text">
                    {branding.isActive ? t('theme.editBranding') : t('theme.uploadLogo')}
                  </p>
                  <p className="text-xs text-tertiary">
                    {branding.isActive ? t('theme.resetOrChange') : t('theme.autoPalette')}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wider badge badge-accent">NEW</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full accent-bg shadow-xl-themed flex items-center justify-center text-white relative"
        title={t('theme.changeTheme')}
      >
        <Palette size={20} />
        {branding.isActive && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 flex items-center justify-center" style={{ borderColor: branding.primary }}>
            <Sparkles size={8} style={{ color: branding.primary }} />
          </span>
        )}
      </motion.button>
    </div>
  );
}

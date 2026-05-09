import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Wand2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useBranding } from '../hooks/useBranding';
import type { Theme } from '../types';

const themes: { id: Theme; name: string; emoji: string; description: string; color: string }[] = [
  { id: 'mint', name: 'Modern Mint', emoji: '🌿', description: 'Linear / Vercel štýl', color: '#10b981' },
  { id: 'coral', name: 'Playful Coral', emoji: '🌅', description: 'Notion / Slack štýl', color: '#f97316' },
  { id: 'navy', name: 'Corporate Navy', emoji: '💼', description: 'BambooHR / Workday štýl', color: '#2563eb' },
];

interface ThemeSwitcherProps {
  onOpenBranding: () => void;
}

export function ThemeSwitcher({ onOpenBranding }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const { branding } = useBranding();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 card shadow-xl-themed w-80 p-2"
          >
            <div className="px-3 py-2 mb-1">
              <p className="text-xs uppercase tracking-wider text-tertiary font-medium">Vizuálny štýl</p>
            </div>

            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-tertiary transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-lg"
                  style={{ background: t.color + '20', color: t.color }}
                >
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-primary">{t.name}</p>
                  <p className="text-xs text-tertiary truncate">{t.description}</p>
                </div>
                {theme === t.id && (
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
                  <p className="text-xs text-tertiary truncate">Tvoj custom branding</p>
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
                    {branding.isActive ? 'Upraviť branding' : 'Nahrať tvoje logo'}
                  </p>
                  <p className="text-xs text-tertiary">
                    {branding.isActive ? 'Reset alebo zmeniť' : 'Auto-paleta z loga'}
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
        className="w-14 h-14 rounded-full accent-bg shadow-xl-themed flex items-center justify-center text-white relative"
        title="Zmeniť tému"
      >
        <Palette size={22} />
        {branding.isActive && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 flex items-center justify-center" style={{ borderColor: branding.primary }}>
            <Sparkles size={8} style={{ color: branding.primary }} />
          </span>
        )}
      </motion.button>
    </div>
  );
}

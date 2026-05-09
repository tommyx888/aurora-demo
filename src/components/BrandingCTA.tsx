import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useBranding } from '../hooks/useBranding';
import { useLanguage } from '../hooks/useLanguage';

interface BrandingCTAProps {
  onLeadCapture: () => void;
}

const DISMISS_KEY = 'de-demo-branding-cta-dismissed';

/**
 * Soft floating banner that appears bottom-center after user uploads a logo.
 * Auto-shows 3s after branding activation. Can be dismissed.
 */
export function BrandingCTA({ onLeadCapture }: BrandingCTAProps) {
  const { branding } = useBranding();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  });

  useEffect(() => {
    if (!branding.isActive || dismissed) {
      setIsVisible(false);
      return;
    }
    // Delay appearance for "wow" effect after branding applied
    const t = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(t);
  }, [branding.isActive, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && branding.isActive && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-1.5rem)] md:w-[calc(100%-3rem)]"
        >
          <div className="card shadow-xl-themed flex flex-wrap md:flex-nowrap items-center gap-3 p-3 pr-2 mesh-bg">
            <div className="w-9 h-9 rounded-lg accent-bg flex items-center justify-center text-white flex-shrink-0">
              <Heart size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">
                {t('brandingCta.title')}
              </p>
              <p className="text-xs text-tertiary mt-0.5">
                {t('brandingCta.subtitle')}
              </p>
            </div>
            <button
              onClick={onLeadCapture}
              className="btn-primary text-xs whitespace-nowrap w-full md:w-auto order-3 md:order-none"
            >
              {t('brandingCta.cta')}
            </button>
            <button
              onClick={handleDismiss}
              className="btn-ghost p-1.5"
              title={t('brandingCta.close')}
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { applyPalette, generatePalette } from '../lib/colorExtract';
import type { BrandingState } from '../types';

const STORAGE_KEY = 'de-demo-branding';

const DEFAULT_BRANDING: BrandingState = {
  isActive: false,
  companyName: 'Aurora',
  logoDataUrl: null,
  primary: '#10b981',
  secondary: '#059669',
  rawColors: [],
};

export function useBranding() {
  const [branding, setBranding] = useState<BrandingState>(() => {
    if (typeof window === 'undefined') return DEFAULT_BRANDING;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // MIGRATION: Auto-rename old "Acme" companyName to "Aurora"
        if (parsed.companyName && /acme/i.test(parsed.companyName)) {
          parsed.companyName = 'Aurora';
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        return { ...DEFAULT_BRANDING, ...parsed };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_BRANDING;
  });

  // Apply palette on mount if active
  useEffect(() => {
    if (branding.isActive && branding.rawColors.length > 0) {
      const palette = generatePalette(branding.rawColors);
      applyPalette(palette);
    }
  }, []);

  // Re-apply palette when design mode changes (so Editorial/Brutalist style overrides re-inject)
  useEffect(() => {
    if (!branding.isActive || branding.rawColors.length === 0) return;

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-design-mode') {
          const palette = generatePalette(branding.rawColors);
          applyPalette(palette);
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-design-mode'] });
    return () => observer.disconnect();
  }, [branding.isActive, branding.rawColors]);

  const updateBranding = (updates: Partial<BrandingState>) => {
    setBranding((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const reset = () => {
    setBranding(DEFAULT_BRANDING);
    localStorage.removeItem(STORAGE_KEY);
    // Remove custom theme styles
    const styleEl = document.getElementById('custom-theme-style');
    if (styleEl) styleEl.remove();
  };

  return { branding, updateBranding, reset };
}

import { useEffect, useState } from 'react';
import type { Theme } from '../types';

const STORAGE_KEY = 'de-demo-theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'mint';
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved || 'mint';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    const order: Theme[] = ['mint', 'coral', 'navy'];
    const currentIdx = order.indexOf(theme);
    setTheme(order[(currentIdx + 1) % order.length]);
  };

  return { theme, setTheme, cycleTheme };
}

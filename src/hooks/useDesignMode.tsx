import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type DesignMode = 'classic' | 'editorial' | 'brutalist';

const STORAGE_KEY = 'de-demo-design-mode';

interface DesignModeContextValue {
  mode: DesignMode;
  setMode: (mode: DesignMode) => void;
  toggleMode: () => void;
}

const DesignModeContext = createContext<DesignModeContextValue | null>(null);

function isValidMode(value: string | null): value is DesignMode {
  return value === 'classic' || value === 'editorial' || value === 'brutalist';
}

export function DesignModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DesignMode>(() => {
    if (typeof window === 'undefined') return 'classic';
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValidMode(saved)) return saved;
    return 'classic';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    // Apply as data attribute on <html> for global CSS hooks
    document.documentElement.setAttribute('data-design-mode', mode);
  }, [mode]);

  const setMode = (next: DesignMode) => setModeState(next);
  // Cycle: classic → editorial → brutalist → classic
  const toggleMode = () =>
    setModeState((m) => (m === 'classic' ? 'editorial' : m === 'editorial' ? 'brutalist' : 'classic'));

  return (
    <DesignModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </DesignModeContext.Provider>
  );
}

export function useDesignMode(): DesignModeContextValue {
  const ctx = useContext(DesignModeContext);
  if (!ctx) {
    // Fallback when used outside provider — default classic
    return {
      mode: 'classic',
      setMode: () => {},
      toggleMode: () => {},
    };
  }
  return ctx;
}

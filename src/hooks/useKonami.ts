import { useEffect } from 'react';

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export function useKonami(callback: () => void) {
  useEffect(() => {
    let buffer: string[] = [];

    const handler = (e: KeyboardEvent) => {
      buffer.push(e.key);
      if (buffer.length > KONAMI.length) buffer.shift();

      if (buffer.length === KONAMI.length && buffer.every((k, i) => k.toLowerCase() === KONAMI[i].toLowerCase())) {
        callback();
        buffer = [];
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [callback]);
}

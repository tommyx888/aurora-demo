/**
 * Color extraction from images
 * Uses k-means-like clustering + frequency counting
 * No external dependencies — pure browser canvas API
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ExtractedPalette {
  primary: string;       // Most vibrant dominant color
  secondary: string;     // Second-most vibrant
  tertiary: string;      // Light variant of primary
  bgPrimary: string;     // Light cream/white tint
  bgSecondary: string;   // Pure white
  bgTertiary: string;    // Subtle tint of primary
  bgAccent: string;      // Stronger tint of primary
  textPrimary: string;   // Near-black
  textSecondary: string; // Mid-gray
  textTertiary: string;  // Light gray
  textOnAccent: string;  // Dark variant of primary (for text on light bg-accent)
  borderSubtle: string;
  borderMedium: string;
  rawColors: string[];   // The raw extracted colors (for UI display)
}

// ============================================
// COLOR CONVERSIONS
// ============================================

export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rN: h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6; break;
      case gN: h = ((bN - rN) / d + 2) / 6; break;
      case bN: h = ((rN - gN) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hN = h / 360;
  const sN = s / 100;
  const lN = l / 100;

  if (sN === 0) {
    const v = lN * 255;
    return { r: v, g: v, b: v };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
  const p = 2 * lN - q;

  return {
    r: hue2rgb(p, q, hN + 1 / 3) * 255,
    g: hue2rgb(p, q, hN) * 255,
    b: hue2rgb(p, q, hN - 1 / 3) * 255,
  };
}

/** Adjust color lightness while keeping hue+saturation */
export function adjustLightness(hex: string, newLightness: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ ...hsl, l: newLightness }));
}

/** Adjust color saturation */
export function adjustSaturation(hex: string, newSaturation: number): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb({ ...hsl, s: newSaturation }));
}

/** Mix two colors */
export function mixColors(hexA: string, hexB: string, ratio: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r * (1 - ratio) + b.r * ratio,
    g: a.g * (1 - ratio) + b.g * ratio,
    b: a.b * (1 - ratio) + b.b * ratio,
  });
}

// ============================================
// COLOR EXTRACTION (k-means-like)
// ============================================

/** Extract dominant colors from an image */
export async function extractColors(file: File, maxColors = 6): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const colors = analyzeImage(img, maxColors);
          resolve(colors);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function analyzeImage(img: HTMLImageElement, maxColors: number): string[] {
  // Downsample for performance (max 200x200)
  const targetSize = 200;
  const scale = Math.min(targetSize / img.width, targetSize / img.height, 1);
  const w = Math.floor(img.width * scale);
  const h = Math.floor(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context failed');

  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  // Count quantized colors (reduce 24-bit to ~12-bit by bucketing)
  const buckets = new Map<string, { color: RGB; count: number }>();
  const BUCKET_SIZE = 16; // 256/16 = 16 levels per channel = 4096 buckets

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Skip transparent
    if (a < 200) continue;

    // Skip near-white (likely background)
    if (r > 240 && g > 240 && b > 240) continue;

    // Skip pure black (often anti-aliasing or text)
    if (r < 15 && g < 15 && b < 15) continue;

    // Bucket
    const br = Math.floor(r / BUCKET_SIZE) * BUCKET_SIZE;
    const bg = Math.floor(g / BUCKET_SIZE) * BUCKET_SIZE;
    const bb = Math.floor(b / BUCKET_SIZE) * BUCKET_SIZE;
    const key = `${br},${bg},${bb}`;

    const existing = buckets.get(key);
    if (existing) {
      existing.count++;
      // Running average for more accurate color
      existing.color.r = (existing.color.r * (existing.count - 1) + r) / existing.count;
      existing.color.g = (existing.color.g * (existing.count - 1) + g) / existing.count;
      existing.color.b = (existing.color.b * (existing.count - 1) + b) / existing.count;
    } else {
      buckets.set(key, { color: { r, g, b }, count: 1 });
    }
  }

  // Sort by count, then merge similar colors
  const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
  const merged: { color: RGB; count: number; hsl: HSL }[] = [];

  for (const item of sorted) {
    const hsl = rgbToHsl(item.color);
    // Skip too-gray colors (low saturation AND not extreme lightness)
    if (hsl.s < 8 && hsl.l > 15 && hsl.l < 90) continue;

    // Check if similar to already-merged color
    const similar = merged.find((m) => colorDistance(item.color, m.color) < 30);
    if (similar) {
      similar.count += item.count;
    } else {
      merged.push({ ...item, hsl });
      if (merged.length >= maxColors * 2) break;
    }
  }

  // Sort by "vibrancy score" — combine count and saturation
  merged.sort((a, b) => {
    const scoreA = a.count * (1 + a.hsl.s / 50);
    const scoreB = b.count * (1 + b.hsl.s / 50);
    return scoreB - scoreA;
  });

  return merged.slice(0, maxColors).map((m) => rgbToHex(m.color));
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    (a.r - b.r) ** 2 +
    (a.g - b.g) ** 2 +
    (a.b - b.b) ** 2
  );
}

// ============================================
// PALETTE GENERATION
// ============================================

/** Generate full palette from extracted colors */
export function generatePalette(rawColors: string[]): ExtractedPalette {
  if (rawColors.length === 0) {
    // Fallback: gray theme
    rawColors = ['#3b82f6', '#8b5cf6', '#10b981'];
  }

  // Pick most vibrant for primary
  const sorted = [...rawColors].sort((a, b) => {
    const sA = rgbToHsl(hexToRgb(a)).s;
    const sB = rgbToHsl(hexToRgb(b)).s;
    return sB - sA;
  });

  let primary = sorted[0];
  let secondary = sorted[1] || adjustLightness(primary, 40);

  // Make sure primary has good contrast (not too light, not too dark)
  const primaryHsl = rgbToHsl(hexToRgb(primary));
  if (primaryHsl.l > 75) primary = adjustLightness(primary, 50);
  if (primaryHsl.l < 25) primary = adjustLightness(primary, 40);

  // If secondary is too similar to primary, generate a complement
  if (colorDistance(hexToRgb(primary), hexToRgb(secondary)) < 50) {
    const newHsl = { ...primaryHsl, h: (primaryHsl.h + 30) % 360, l: 55 };
    secondary = rgbToHex(hslToRgb(newHsl));
  }

  const tertiary = adjustLightness(primary, 65);

  return {
    primary,
    secondary,
    tertiary,
    bgPrimary: mixColors('#ffffff', primary, 0.02),
    bgSecondary: '#ffffff',
    bgTertiary: mixColors('#f5f5f5', primary, 0.05),
    bgAccent: mixColors('#ffffff', primary, 0.12),
    textPrimary: '#0a0a0a',
    textSecondary: '#525252',
    textTertiary: '#a3a3a3',
    textOnAccent: adjustLightness(primary, 25),
    borderSubtle: mixColors('#e5e5e5', primary, 0.05),
    borderMedium: mixColors('#d4d4d4', primary, 0.1),
    rawColors,
  };
}

/** Apply palette to CSS variables (data-theme='custom') */
export function applyPalette(palette: ExtractedPalette) {
  const root = document.documentElement;

  // Create or update <style> tag for custom theme
  let styleEl = document.getElementById('custom-theme-style') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-theme-style';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    [data-theme='custom'] {
      --bg-primary: ${palette.bgPrimary};
      --bg-secondary: ${palette.bgSecondary};
      --bg-tertiary: ${palette.bgTertiary};
      --bg-accent: ${palette.bgAccent};

      --text-primary: ${palette.textPrimary};
      --text-secondary: ${palette.textSecondary};
      --text-tertiary: ${palette.textTertiary};
      --text-on-accent: ${palette.textOnAccent};

      --accent-primary: ${palette.primary};
      --accent-secondary: ${palette.secondary};
      --accent-tertiary: ${palette.tertiary};

      --border-subtle: ${palette.borderSubtle};
      --border-medium: ${palette.borderMedium};
      --border-strong: ${palette.textPrimary};
    }
  `;

  root.setAttribute('data-theme', 'custom');
}

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import {
  Sparkles, Upload, X, RotateCcw, Check, Loader2, Image as ImageIcon,
  Palette, Wand2
} from 'lucide-react';
import { extractColors, generatePalette, applyPalette } from '../lib/colorExtract';
import { useBranding } from '../hooks/useBranding';
import { useTheme } from '../hooks/useTheme';
import type { Theme } from '../types';

interface BrandingStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BrandingStudio({ isOpen, onClose }: BrandingStudioProps) {
  const { branding, updateBranding, reset } = useBranding();
  const { setTheme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>(branding.isActive ? 'preview' : 'upload');
  const [companyNameInput, setCompanyNameInput] = useState(branding.companyName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Prosím nahraj obrázok (PNG, JPG, SVG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Súbor je príliš veľký (max 5 MB)');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Read as data URL for display
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Read failed'));
        reader.readAsDataURL(file);
      });

      // Small delay for "wow" effect
      await new Promise((res) => setTimeout(res, 800));

      // Extract colors
      const colors = await extractColors(file, 6);

      if (colors.length === 0) {
        throw new Error('Nepodarilo sa extrahovať farby z loga. Skús iný obrázok.');
      }

      // Generate palette + apply
      const palette = generatePalette(colors);
      applyPalette(palette);
      setTheme('custom' as Theme);

      updateBranding({
        isActive: true,
        logoDataUrl: dataUrl,
        rawColors: colors,
        primary: palette.primary,
        secondary: palette.secondary,
        companyName: companyNameInput || branding.companyName,
      });

      setStep('preview');
    } catch (err: any) {
      setError(err?.message || 'Niečo sa pokazilo. Skús znova.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyNameInput]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleReset = () => {
    reset();
    setTheme('mint');
    setStep('upload');
    setCompanyNameInput('Aurora');
  };

  const handleNameSave = () => {
    updateBranding({ companyName: companyNameInput });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-2xl w-full p-0 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 mesh-bg border-b border-subtle">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg accent-bg flex items-center justify-center text-white">
                    <Wand2 size={18} />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl">Branding Studio</h2>
                    <p className="text-sm text-tertiary">
                      Nahraj svoje logo a uvidíš demo v <em>tvojich</em> farbách
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="btn-ghost">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Upload area or Preview */}
              {step === 'upload' ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={companyNameInput}
                    onChange={(e) => setCompanyNameInput(e.target.value)}
                    placeholder="Názov tvojej firmy (napr. Tatra Banka)"
                    className="input-field text-sm"
                  />

                  <motion.label
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={`block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                      dragActive ? 'accent-border bg-accent' : 'border-medium hover:border-strong'
                    }`}
                    whileHover={{ scale: 1.01 }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />

                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin accent-text" />
                        <div>
                          <p className="font-medium text-sm">Analyzujem tvoje logo...</p>
                          <p className="text-xs text-tertiary mt-1">Extrahujem dominantné farby</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-tertiary flex items-center justify-center">
                          <Upload size={24} className="accent-text" />
                        </div>
                        <div>
                          <p className="font-medium">Drag & drop logo sem</p>
                          <p className="text-xs text-tertiary mt-1">
                            alebo <span className="accent-text">klikni a vyber súbor</span>
                          </p>
                          <p className="text-[10px] text-tertiary mt-3">
                            PNG, JPG, SVG, WEBP · max 5 MB
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.label>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-red-50 text-sm"
                      style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)' }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* How it works */}
                  <div className="card bg-tertiary text-xs text-secondary leading-relaxed">
                    <p className="font-medium mb-1.5 flex items-center gap-1.5 text-primary">
                      <Sparkles size={12} className="accent-text" />
                      Ako to funguje
                    </p>
                    <ol className="space-y-1 list-decimal list-inside text-tertiary">
                      <li>Nahraj logo svojej firmy</li>
                      <li>AI extrahuje 5 dominantných farieb</li>
                      <li>Generuje paletu (primárna, sekundárna, akcenty)</li>
                      <li>Aplikuje na celé demo za 1 sekundu</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Logo preview */}
                  <div className="flex items-center gap-4">
                    {branding.logoDataUrl && (
                      <div className="w-20 h-20 rounded-xl bg-white border border-medium flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={branding.logoDataUrl}
                          alt="Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={companyNameInput}
                        onChange={(e) => setCompanyNameInput(e.target.value)}
                        onBlur={handleNameSave}
                        className="input-field font-display text-xl py-2"
                      />
                      <p className="text-xs text-tertiary mt-1.5 flex items-center gap-1">
                        <Check size={11} className="accent-text" />
                        Demo prepnuté na tvoj branding
                      </p>
                    </div>
                  </div>

                  {/* Extracted palette */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-tertiary mb-2">
                      Extrahovaná paleta
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {branding.rawColors.map((color, i) => (
                        <motion.div
                          key={color + i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="aspect-square rounded-lg border border-medium relative group cursor-pointer"
                          style={{ background: color }}
                          title={color}
                        >
                          <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-white">
                              {color}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Active swatches */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-tertiary mb-2">
                      Aplikované farby
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <SwatchCard label="Primárna" color={branding.primary} />
                      <SwatchCard label="Sekundárna" color={branding.secondary} />
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="card bg-tertiary p-3">
                    <p className="text-xs uppercase tracking-wider text-tertiary mb-2">Náhľad</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button className="btn-primary text-xs">Primary tlačidlo</button>
                      <button className="btn-secondary text-xs">Secondary</button>
                      <span className="badge badge-accent">Tvoj badge</span>
                      <span className="text-xs accent-text font-medium">Akcent text →</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleReset}
                      className="btn-secondary text-sm flex-1"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>
                    <button
                      onClick={() => setStep('upload')}
                      className="btn-secondary text-sm flex-1"
                    >
                      <ImageIcon size={14} />
                      Iné logo
                    </button>
                    <button
                      onClick={onClose}
                      className="btn-primary text-sm flex-1"
                    >
                      <Check size={14} />
                      Hotovo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SwatchCard({ label, color }: { label: string; color: string }) {
  return (
    <div className="card p-3 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg border border-medium flex-shrink-0"
        style={{ background: color }}
      />
      <div className="min-w-0">
        <p className="text-xs text-tertiary">{label}</p>
        <p className="text-sm font-mono">{color}</p>
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import {
  FileSearch, Upload, X, Sparkles, Loader2, CheckCircle2,
  AlertCircle, FileText, Star, TrendingUp, Briefcase,
  Award, AlertTriangle, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { analyzeCv, isAILive } from '../lib/aiHelpers';
import { sampleCVs } from '../data/hrData';
import { LeadCTA } from './Requests';
import { cn } from '../lib/utils';
import type { CVAnalysis } from '../types';

interface CVScreenerProps {
  onLeadCapture: (module: string) => void;
}

const positions = [
  'Senior React Developer',
  'DevOps Engineer',
  'UX Designer',
  'Account Manager',
  'Marketing Specialist',
  'Junior Developer',
  'Product Manager',
];

const recommendationConfig = {
  'strong-fit': { label: 'Silny match', color: '#10b981', icon: ThumbsUp, emoji: '🔥' },
  'good-fit': { label: 'Dobry match', color: '#3b82f6', icon: ThumbsUp, emoji: '👍' },
  'maybe': { label: 'Mozno', color: '#f59e0b', icon: AlertCircle, emoji: '🤔' },
  'not-fit': { label: 'Nevhodny', color: '#ef4444', icon: ThumbsDown, emoji: '👎' },
};

export function CVScreener({ onLeadCapture }: CVScreenerProps) {
  const [position, setPosition] = useState(positions[0]);
  const [cvText, setCvText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async (textOverride?: string) => {
    const text = textOverride ?? cvText;
    if (!text.trim()) {
      setError('Vloz CV alebo pretiahni subor');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await analyzeCv(text, position);
      setAnalysis(result);
    } catch (e: any) {
      setError(e?.message || 'Nieco sa pokazilo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    if (file.type !== 'text/plain' && !file.name.match(/\.(txt|md)$/i)) {
      setError('Pre demo podporujeme TXT subory. V plnej verzii bude PDF/DOCX parsing.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Subor je prilis velky (max 1 MB)');
      return;
    }
    const text = await file.text();
    setCvText(text);
    handleAnalyze(text);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  const loadSample = (idx: number) => {
    const sample = sampleCVs[idx];
    setCvText(sample.cv);
    setPosition(sample.expectedAnalysis.position);
    setTimeout(() => handleAnalyze(sample.cv), 100);
  };

  const reset = () => {
    setCvText('');
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="page-enter space-y-6">
      <div>
        <p className="text-sm text-tertiary uppercase tracking-wider mb-1">AI Recruiter</p>
        <h1 className="font-display text-3xl">CV Screener</h1>
        <p className="text-secondary text-sm mt-1">
          Pretiahni CV (alebo skopiruj text), AI ho analyzuje za sekundu · {isAILive ? 'Live AI mode 🔥' : 'Demo mode'}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: Input */}
        <div className="space-y-4">
          {/* Position selector */}
          <div className="card">
            <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
              Pozicia, na ktoru hodnotis
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="input-field text-sm"
            >
              {positions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <motion.label
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            className={cn(
              'block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
              dragActive ? 'accent-border bg-accent' : 'border-medium hover:border-strong'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-tertiary flex items-center justify-center">
                <Upload size={20} className="accent-text" />
              </div>
              <p className="font-medium text-sm">Pretiahni CV sem</p>
              <p className="text-xs text-tertiary">
                alebo <span className="accent-text">klikni a vyber subor</span>
              </p>
              <p className="text-[10px] text-tertiary">TXT subory · max 1 MB</p>
            </div>
          </motion.label>

          {/* Or paste text */}
          <div className="card">
            <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
              ...alebo prilep text CV
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Skopiruj sem text z CV..."
              className="input-field text-sm resize-none font-mono"
              rows={8}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleAnalyze()}
                disabled={isAnalyzing || !cvText.trim()}
                className="btn-primary flex-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Analyzujem...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Analyzovat AI
                  </>
                )}
              </button>
              {cvText && (
                <button onClick={reset} className="btn-secondary text-sm">
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Sample CVs */}
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-tertiary mb-2">
              Alebo skus s ukazkovymi CV
            </p>
            <div className="space-y-1.5">
              {sampleCVs.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => loadSample(i)}
                  disabled={isAnalyzing}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-tertiary transition-colors text-xs disabled:opacity-50 flex items-center gap-2"
                >
                  <FileText size={12} className="text-tertiary flex-shrink-0" />
                  <span className="truncate">{sample.name}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card flex items-start gap-2 p-3"
              style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Analysis */}
        <div className="space-y-4">
          {!analysis && !isAnalyzing && (
            <div className="card text-center py-12">
              <FileSearch size={40} className="mx-auto text-tertiary mb-3 opacity-30" />
              <p className="text-sm text-tertiary">
                Vyber CV a klikni "Analyzovat AI" pre vysledky
              </p>
            </div>
          )}

          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card text-center py-12"
            >
              <Loader2 size={40} className="mx-auto accent-text animate-spin mb-3" />
              <p className="font-medium text-sm">AI analyzuje CV...</p>
              <p className="text-xs text-tertiary mt-1">Extrahuje skills, pocita match score, hladaje red flags</p>
            </motion.div>
          )}

          <AnimatePresence>
            {analysis && (
              <motion.div
                key={analysis.candidateName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Hero score */}
                <div
                  className="card relative overflow-hidden text-white"
                  style={{ background: `linear-gradient(135deg, ${recommendationConfig[analysis.recommendation].color}, ${recommendationConfig[analysis.recommendation].color}dd)` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-80">AI Match Score</p>
                      <p className="font-display text-5xl">{analysis.matchScore}<span className="text-2xl opacity-80">%</span></p>
                    </div>
                    <div className="text-5xl">{recommendationConfig[analysis.recommendation].emoji}</div>
                  </div>
                  <p className="font-medium">{analysis.candidateName}</p>
                  <p className="text-sm opacity-90">{analysis.position} · {analysis.yearsExperience} {analysis.yearsExperience === 1 ? 'rok' : 'rokov'} skusenosti</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/20 text-xs font-medium">
                    {recommendationConfig[analysis.recommendation].label}
                  </div>
                </div>

                {/* Summary */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="accent-text" />
                    <p className="text-xs uppercase tracking-wider text-tertiary">AI Hodnotenie</p>
                  </div>
                  <p className="text-sm leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Score breakdown */}
                <div className="card">
                  <p className="text-xs uppercase tracking-wider text-tertiary mb-3">Skore podla kategorii</p>
                  <div className="space-y-2">
                    <ScoreBar label="Skill match" value={analysis.skillMatch} icon={Briefcase} />
                    <ScoreBar label="Skusenosti" value={analysis.experienceMatch} icon={TrendingUp} />
                    <ScoreBar label="Culture fit" value={analysis.cultureMatch} icon={Star} />
                  </div>
                </div>

                {/* Highlights */}
                {analysis.highlights.length > 0 && (
                  <div className="card border-l-4" style={{ borderLeftColor: 'var(--success)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={14} style={{ color: 'var(--success)' }} />
                      <p className="text-xs uppercase tracking-wider text-tertiary">Silne stranky</p>
                    </div>
                    <ul className="space-y-1.5">
                      {analysis.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 size={12} style={{ color: 'var(--success)' }} className="mt-1 flex-shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Red flags */}
                {analysis.redFlags.length > 0 && (
                  <div className="card border-l-4" style={{ borderLeftColor: 'var(--danger)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                      <p className="text-xs uppercase tracking-wider text-tertiary">Red flags</p>
                    </div>
                    <ul className="space-y-1.5">
                      {analysis.redFlags.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <AlertCircle size={12} style={{ color: 'var(--danger)' }} className="mt-1 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills */}
                <div className="card">
                  <p className="text-xs uppercase tracking-wider text-tertiary mb-2">
                    Extrahovane skills ({analysis.extractedSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.extractedSkills.map((s) => (
                      <span key={s} className="badge badge-accent">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="btn-primary text-sm flex-1">
                    Pridat do recruiting pipeline →
                  </button>
                  <button className="btn-secondary text-sm">
                    Email kandidatovi
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <LeadCTA module="AI CV Screener" onLeadCapture={onLeadCapture} />
    </div>
  );
}

function ScoreBar({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  const color = value >= 80 ? 'var(--success)' : value >= 60 ? 'var(--info)' : value >= 40 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs flex items-center gap-1.5">
          <Icon size={11} className="text-tertiary" />
          {label}
        </span>
        <span className="text-xs font-mono font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-tertiary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

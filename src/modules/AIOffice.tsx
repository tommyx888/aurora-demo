import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  FileText, Sparkles, Loader2, Copy, Download, RotateCcw, Check
} from 'lucide-react';
import { generateDoc, isAILive } from '../lib/aiHelpers';
import { useLanguage } from '../hooks/useLanguage';
import { LeadCTA } from './Requests';
import { cn } from '../lib/utils';
import type { AIDocTemplate } from '../types';

interface AIOfficeProps {
  onLeadCapture: (module: string) => void;
}

interface TemplateConfig {
  id: AIDocTemplate;
  name: string;
  description: string;
  emoji: string;
  color: string;
  fields: { key: string; label: string; placeholder?: string; type?: 'text' | 'textarea'; default?: string }[];
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'employment-contract',
    name: 'Pracovna zmluva',
    description: 'Standardna PZ podla Zakonnika prace',
    emoji: '📜',
    color: '#3b82f6',
    fields: [
      { key: 'name', label: 'Meno zamestnanca', placeholder: 'Tomas Novak' },
      { key: 'position', label: 'Pozicia', default: 'Software Engineer' },
      { key: 'startDate', label: 'Datum nastupu', default: '1.6.2026' },
      { key: 'salary', label: 'Hrubá mzda', default: '2 500 EUR' },
      { key: 'duration', label: 'Doba trvania', default: 'na dobu neurcita' },
    ],
  },
  {
    id: 'job-posting',
    name: 'Pracovny inzerat',
    description: 'Inzerat pripraveny pre Profesia, LinkedIn',
    emoji: '📢',
    color: '#10b981',
    fields: [
      { key: 'position', label: 'Pozicia', default: 'Senior React Developer' },
      { key: 'location', label: 'Lokalita', default: 'Bratislava / Remote' },
      { key: 'salary', label: 'Plat', default: '3000 - 4500 EUR' },
      { key: 'requirements', label: 'Pozadovane skills', type: 'textarea', placeholder: '5+ rokov React, TypeScript...' },
      { key: 'responsibilities', label: 'Zodpovednosti', type: 'textarea', placeholder: 'Stavat moderne web apps...' },
    ],
  },
  {
    id: 'exit-interview',
    name: 'Exit Interview otázky',
    description: 'Strukturovany rozhovor pri odchode zamestnanca',
    emoji: '🚪',
    color: '#f59e0b',
    fields: [
      { key: 'name', label: 'Meno zamestnanca' },
      { key: 'position', label: 'Pozicia' },
      { key: 'date', label: 'Datum rozhovoru', default: new Date().toLocaleDateString('sk-SK') },
      { key: 'interviewer', label: 'Vedie rozhovor', default: 'HR Manager' },
    ],
  },
  {
    id: 'review-draft',
    name: 'Performance Review draft',
    description: 'Draft 1:1 hodnotenia',
    emoji: '🎯',
    color: '#8b5cf6',
    fields: [
      { key: 'name', label: 'Meno zamestnanca' },
      { key: 'position', label: 'Pozicia' },
      { key: 'manager', label: 'Manazer' },
      { key: 'quarter', label: 'Kvartal', default: '2' },
      { key: 'year', label: 'Rok', default: '2026' },
      { key: 'score', label: 'Celkove skore (1-5)', default: '4.5' },
    ],
  },
  {
    id: 'offer-letter',
    name: 'Ponukovy list',
    description: 'Oficialna ponuka prace',
    emoji: '✉️',
    color: '#ec4899',
    fields: [
      { key: 'candidateName', label: 'Meno kandidata' },
      { key: 'position', label: 'Pozicia' },
      { key: 'startDate', label: 'Datum nastupu' },
      { key: 'salary', label: 'Hruba mzda' },
      { key: 'manager', label: 'Manazer' },
      { key: 'expiryDate', label: 'Platnost ponuky do' },
    ],
  },
  {
    id: 'warning-letter',
    name: 'Upozornenie',
    description: 'Formalne upozornenie na nedostatky',
    emoji: '⚠️',
    color: '#ef4444',
    fields: [
      { key: 'name', label: 'Meno zamestnanca' },
      { key: 'position', label: 'Pozicia' },
      { key: 'issues', label: 'Konkretne nedostatky', type: 'textarea', placeholder: '1. ...\n2. ...' },
      { key: 'expectations', label: 'Ocakavane zlepsenie', type: 'textarea' },
      { key: 'manager', label: 'Manazer' },
      { key: 'reviewDate', label: 'Datum prehodnotenia' },
    ],
  },
];

export function AIOffice({ onLeadCapture }: AIOfficeProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(TEMPLATES[0]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectTemplate = (t: TemplateConfig) => {
    setSelectedTemplate(t);
    const defaults: Record<string, string> = {};
    t.fields.forEach((f) => {
      if (f.default) defaults[f.key] = f.default;
    });
    setVariables(defaults);
    setGenerated(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerated(null);
    try {
      const result = await generateDoc({
        template: selectedTemplate.id,
        variables,
      });
      setGenerated(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-enter space-y-6">
      <div>
        <p className="text-sm text-tertiary uppercase tracking-wider mb-1">AI Office</p>
        <h1 className="font-display text-3xl">{isEn ? 'AI Document Generator' : 'AI Generator dokumentov'}</h1>
        <p className="text-secondary text-sm mt-1">
          {isEn ? 'Contracts, job ads, exit interviews and more' : 'Zmluvy, inzeraty, exit interviews a viac'} · {isAILive ? 'Live AI mode 🔥' : 'Demo mode'}
        </p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TEMPLATES.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ y: -2 }}
            onClick={() => selectTemplate(t)}
            className={cn(
              'card text-left p-3 transition-all',
              selectedTemplate.id === t.id && 'ring-2 ring-offset-2'
            )}
            style={selectedTemplate.id === t.id ? { borderColor: t.color, boxShadow: `0 0 0 2px ${t.color}` } as any : {}}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-2"
              style={{ background: t.color + '20', color: t.color }}
            >
              {t.emoji}
            </div>
            <p className="font-medium text-xs leading-tight">{t.name}</p>
            <p className="text-[10px] text-tertiary mt-1 line-clamp-2">{t.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: selectedTemplate.color + '20', color: selectedTemplate.color }}
            >
              {selectedTemplate.emoji}
            </div>
            <div>
              <p className="font-medium text-sm">{selectedTemplate.name}</p>
              <p className="text-xs text-tertiary">{selectedTemplate.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedTemplate.fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs uppercase tracking-wider text-tertiary block mb-1">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={variables[field.key] || ''}
                    onChange={(e) => setVariables({ ...variables, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input-field text-sm resize-none"
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    value={variables[field.key] || ''}
                    onChange={(e) => setVariables({ ...variables, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input-field text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary flex-1 text-sm disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {isEn ? 'Generating...' : 'Generujem...'}
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  {isEn ? 'Generate with AI' : 'Generovat AI'}
                </>
              )}
            </button>
            {generated && (
              <button onClick={() => setGenerated(null)} className="btn-secondary text-sm">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="card flex flex-col" style={{ minHeight: 500 }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-tertiary">{isEn ? 'Output' : 'Vystup'}</p>
            {generated && (
              <div className="flex gap-1">
                <button
                  onClick={handleCopy}
                  className="btn-ghost text-xs"
                  title={isEn ? 'Copy' : 'Kopirovat'}
                >
                  {copied ? (
                    <>
                      <Check size={12} style={{ color: 'var(--success)' }} />
                      {isEn ? 'Copied' : 'Skopirovane'}
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      {isEn ? 'Copy' : 'Kopirovat'}
                    </>
                  )}
                </button>
                <button onClick={handleDownload} className="btn-ghost text-xs">
                  <Download size={12} />
                  {isEn ? 'Download' : 'Stiahnut'}
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!generated && !isGenerating && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <FileText size={40} className="text-tertiary opacity-30 mb-3" />
                <p className="text-sm text-tertiary">{isEn ? 'Fill fields and click "Generate with AI"' : 'Vyplň údaje a klikni "Generovat AI"'}</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <Loader2 size={40} className="accent-text animate-spin mb-3" />
                <p className="font-medium text-sm">{isEn ? 'AI is writing your document...' : 'AI pise dokument...'}</p>
                <p className="text-xs text-tertiary mt-1">{isEn ? 'Using localized formatting and legal style' : 'Pouziva slovenske formaty a legislativu'}</p>
              </motion.div>
            )}

            {generated && !isGenerating && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-auto"
              >
                <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-primary p-3 bg-tertiary rounded-lg">
                  {generated}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <LeadCTA module={isEn ? 'AI Office Generator' : 'AI Office Generator'} onLeadCapture={onLeadCapture} />
    </div>
  );
}

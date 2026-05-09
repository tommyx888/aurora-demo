import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, CheckCircle2, Users, Brain, BarChart3,
  BriefcaseBusiness, FileText, GitBranch, MessageSquare, Newspaper,
  Calendar, Bot, Zap
} from 'lucide-react';
import type { Page } from '../types';
import { DemoDisclaimerBanner } from '../components/DemoDisclaimer';

interface LandingPageProps {
  onStart: (page: Page) => void;
  onOpenBranding: () => void;
  onOpenDemoInfo: () => void;
}

const features = [
  { icon: Sparkles, label: 'AI Onboarding', color: '#8b5cf6' },
  { icon: Brain, label: 'Skill Heatmap', color: '#ec4899' },
  { icon: BarChart3, label: 'Live Dashboard', color: '#3b82f6' },
  { icon: BriefcaseBusiness, label: 'Recruiting', color: '#10b981' },
  { icon: FileText, label: 'Žiadanky', color: '#f59e0b' },
  { icon: GitBranch, label: 'Org Chart', color: '#06b6d4' },
  { icon: MessageSquare, label: 'Pulse Surveys', color: '#f97316' },
  { icon: Newspaper, label: 'Newsletter', color: '#8b5cf6' },
  { icon: Calendar, label: 'Events', color: '#ef4444' },
  { icon: Bot, label: 'AI Chatbot', color: '#10b981' },
];

export function LandingPage({ onStart, onOpenBranding, onOpenDemoInfo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Disclaimer banner — demo + na mieru */}
      <div className="relative z-20">
        <DemoDisclaimerBanner onLearnMore={onOpenDemoInfo} />
      </div>

      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-bg opacity-60 pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, var(--border-subtle) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-20">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-20"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg accent-bg flex items-center justify-center text-white font-bold">
              DE
            </div>
            <div>
              <p className="font-display text-lg leading-none">Digital Evolution</p>
              <p className="text-[11px] text-tertiary uppercase tracking-wider mt-0.5">demo platform</p>
            </div>
          </div>

          <a
            href="https://www.digitalevolution.sk"
            target="_blank"
            rel="noopener"
            className="text-sm text-secondary hover:text-primary"
          >
            www.digitalevolution.sk →
          </a>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-medium bg-secondary text-xs font-medium text-secondary mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 accent-bg"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 accent-bg"></span>
            </span>
            Live demo · žiadna registrácia · 60 sekúnd setup
          </motion.div>

          <h1 className="font-display text-6xl md:text-7xl leading-[1.05] mb-6">
            HR systém,<br />
            ktorý vaši ľudia <em className="gradient-text">naozaj použijú</em>.
          </h1>

          <p className="text-lg text-secondary leading-relaxed max-w-2xl mx-auto mb-10">
            Onboarding s AI, skill maticou, recruiting kanban a 6 ďalších modulov v jednom.
            Postavené pre slovenské firmy, ktoré chcú nahradiť nudné HR systémy z roku 2003.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStart('role-picker')}
              className="btn-primary text-base px-8 py-4"
            >
              <Sparkles size={18} />
              Vyskúšať demo
              <ArrowRight size={18} />
            </motion.button>
            <button
              onClick={onOpenBranding}
              className="btn-secondary text-base px-8 py-4"
            >
              ✨ Skús s tvojím logom
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-sm text-tertiary">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="accent-text" />
              Bez registrácie
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="accent-text" />
              Pred-vyplnené dáta
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="accent-text" />
              3 vizuálne štýly
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="accent-text" />
              Reset jedným klikom
            </span>
          </div>
        </motion.div>

        {/* Feature grid floating */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-20"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ y: -4 }}
                className="card card-hover text-center p-4"
              >
                <div
                  className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ background: f.color + '15', color: f.color }}
                >
                  <Icon size={18} />
                </div>
                <p className="text-xs font-medium text-secondary">{f.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* "Why this is different" section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-3 gap-6 mb-16"
        >
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <Zap size={18} className="accent-text" />
            </div>
            <h3 className="font-medium text-base mb-2">Šitý na Slovensko</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Slovenský pracovný zákon, dovolenky, štátne sviatky, Multisport. Žiadne preklady z angličtiny.
            </p>
          </div>
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <Brain size={18} className="accent-text" />
            </div>
            <h3 className="font-medium text-base mb-2">AI od prvého dňa</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Onboarding buddy "Eva", AI insights pre skill gaps, automaticky generované narodeninové priania.
            </p>
          </div>
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
              <Users size={18} className="accent-text" />
            </div>
            <h3 className="font-medium text-base mb-2">Aj na 10 ľudí</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Nie je to drahý SAP klon. Funguje pre 10-osobový startup aj pre 250-osobovú strednú firmu.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-tertiary"
        >
          Postavené s ❤️ v Bratislave · Digital Evolution s.r.o. · 2026
        </motion.div>
      </div>
    </div>
  );
}

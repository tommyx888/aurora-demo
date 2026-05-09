import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Info, X, Sparkles, Wrench, Users, MessageCircle, ArrowRight } from 'lucide-react';

interface DemoDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContact?: () => void;
}

/**
 * Centralny modal s detailami "co je toto demo a co je real product".
 * Volaju ho landing banner aj sidebar badge.
 */
export function DemoDisclaimerModal({ isOpen, onClose, onContact }: DemoDisclaimerModalProps) {
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
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-2xl w-full p-0 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-subtle mesh-bg flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl accent-bg flex items-center justify-center text-white flex-shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h2 className="font-display text-2xl mb-1">Toto je vzorová simulácia</h2>
                  <p className="text-sm text-secondary">
                    Demo so simulovanou firmou Aurora a 15 fiktívnymi zamestnancami
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="btn-ghost flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <p className="text-sm leading-relaxed">
                Pri demonštrácii vidíte len <strong>časť možností</strong>, ktoré HR systém ponúka.
                Plne integrované riešenia sú výrazne <strong>komplexnejšie a šité na mieru</strong> každej firme.
              </p>

              <div className="grid sm:grid-cols-3 gap-3">
                <FeatureBox
                  icon={Wrench}
                  title="Šité na mieru"
                  body="Žiadny biznis nie je rovnaký. Procesy, schvaľovacie workflow, role a integrácie navrhujeme presne pre vás."
                />
                <FeatureBox
                  icon={Users}
                  title="Plná integrácia"
                  body="Prepojenie s vaším účtovným systémom, payroll, Slack, Microsoft 365, Active Directory či ATS."
                />
                <FeatureBox
                  icon={Sparkles}
                  title="Vlastné moduly"
                  body="Compliance, GDPR, Slovak labor law, špecifické HR processes — všetko podľa vašich požiadaviek."
                />
              </div>

              <div className="card bg-tertiary p-4 border-l-4 accent-border">
                <p className="text-sm leading-relaxed">
                  💬 <strong>Chápeme, že každá organizácia má iné požiadavky a špecifikácie.</strong>
                  {' '}Tie radi vypočujeme a navrhneme riešenie, ktoré zapadne do vašich existujúcich procesov —
                  nie naopak.
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-tertiary mb-2">Čo ďalej?</p>
                <div className="space-y-2 text-sm">
                  <Step n="1" text="Krátky 15-min discovery call kde si povieme vaše potreby" />
                  <Step n="2" text="Pripravíme detailný návrh riešenia + cenovú ponuku" />
                  <Step n="3" text="Pilot s vaším tímom, iterácia, postupný rollout" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-subtle flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-tertiary">
                <a
                  href="https://www.digitalevolution.sk"
                  target="_blank"
                  rel="noopener"
                  className="hover:accent-text transition-colors"
                >
                  Digital Evolution s.r.o. · www.digitalevolution.sk →
                </a>
              </p>
              <div className="flex gap-2">
                <button onClick={onClose} className="btn-secondary text-sm">
                  Pokračovať v demo
                </button>
                {onContact && (
                  <button onClick={onContact} className="btn-primary text-sm">
                    <MessageCircle size={14} />
                    Pozhovárajme sa
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeatureBox({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="card p-3">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mb-2">
        <Icon size={14} className="accent-text" />
      </div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-tertiary leading-snug">{body}</p>
    </div>
  );
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-5 h-5 rounded-full accent-bg text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <p className="text-secondary leading-relaxed">{text}</p>
    </div>
  );
}

// ============================================
// LANDING BANNER (top of landing page)
// ============================================
export function DemoDisclaimerBanner({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full border-b border-subtle"
      style={{ background: 'color-mix(in srgb, var(--accent-primary) 8%, var(--bg-primary))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-base">✨</span>
          <span className="text-secondary">
            <strong className="text-primary">Live demo</strong> · Vzorová simulácia s ukážkovými dátami.
            Plne integrované riešenia <strong>šijeme presne na mieru</strong> vašej firmy.
          </span>
        </div>
        <button
          onClick={onLearnMore}
          className="text-xs font-medium accent-text hover:underline whitespace-nowrap flex items-center gap-1"
        >
          Zistiť viac
          <ArrowRight size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// SIDEBAR BADGE (under logo)
// ============================================
export function DemoDisclaimerBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 mt-1 rounded-lg hover:bg-tertiary transition-colors group"
      title="Klikni pre detaily"
    >
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)' }}
        >
          <Info size={11} className="accent-text" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-tertiary leading-none">Demo</p>
          <p className="text-[10px] text-secondary leading-tight mt-0.5">
            Plné riešenia šijeme na mieru
          </p>
        </div>
      </div>
    </button>
  );
}

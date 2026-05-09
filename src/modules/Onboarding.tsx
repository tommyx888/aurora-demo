import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, Sparkles, ArrowRight, ArrowLeft, Upload,
  Users, Wrench, GraduationCap, PartyPopper, Send, MessageCircle,
  HelpCircle, X, Loader2, SkipForward, Check, Play
} from 'lucide-react';
import { onboardingSteps as initialSteps } from '../data/content';
import { employees } from '../data/employees';
import { fireConfetti, sleep } from '../lib/utils';
import { sendChatMessage, isAILive } from '../lib/ai';
import type { OnboardingStep, ChatMessage } from '../types';

const stepIcons = {
  welcome: Sparkles,
  profile: Users,
  team: Users,
  tools: Wrench,
  training: GraduationCap,
  complete: PartyPopper,
};

interface OnboardingProps {
  onComplete: () => void;
}

const HELP_CONTENT: Record<string, string> = {
  welcome: 'Onboarding má 6 krokov a trvá ~35 minút spolu. Sprevádzam ťa, neboj sa. Môžeš sa kedykoľvek vrátiť späť.',
  profile: 'Vyplň meno, fotku a kontakty. Tieto informácie uvidia tvoji kolegovia v Org Charte. Fotka pomôže rýchlejšie ťa spoznať.',
  team: 'Toto sú ľudia, s ktorými budeš pracovať najviac. Klikni "Pozdraviť" a pošlem im správu cez Slack v tvojom mene.',
  tools: 'Aktivuj prístupy do nástrojov. Slack invite ti chodí na email, GitHub access aktivujem hneď, Notion má pre teba pripravený "Welcome" doc.',
  training: 'GDPR (5 min), Bezpečnosť (5 min) a Code of Conduct (5 min). Krátke videá + kvíz. Buď úprimný/á, nie sú strašné.',
  complete: 'Hotovo! Klikni "Dokončiť" a presunieme ťa do hlavného dashboardu. Ráno ťa privíta káva v kuchyni a o 12:30 obed s tímom.',
};

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(initialSteps);
  const [evaMessage, setEvaMessage] = useState('');
  const [evaTyping, setEvaTyping] = useState(false);

  // Eva chat state
  const [chatMode, setChatMode] = useState<'idle' | 'help' | 'question'>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Action toast
  const [toast, setToast] = useState<string | null>(null);

  // Greeted teammates (so button shows "Pozdravený" after click)
  const [greeted, setGreeted] = useState<Set<string>>(new Set());

  // Activated tools
  const [activatedTools, setActivatedTools] = useState<Set<string>>(new Set());

  // Started trainings
  const [startedTrainings, setStartedTrainings] = useState<Set<string>>(new Set());

  // Eva's intro message based on step
  useEffect(() => {
    const messages = [
      'Ahoj! 👋 Som Eva, tvoja AI buddy. Sprevadzam ťa cez prvý deň v Aurora. Nestresuj — potrvá to len 35 minút a budem pri tebe.',
      'Skvelé! Teraz si nastav profil. Tvoja fotka pomôže kolegom rýchlejšie ťa spoznať. Tip: vyber jednu, kde sa usmievaš 😊',
      'Zoznám sa s tímom! Tu sú tvoji kolegovia. Najbližší ti bude Peter (manažér) — pošlem mu správu, že si prišiel/prišla.',
      'Toto sú tvoje nástroje. Slack invite ti chodí na email, GitHub access aktivujem hneď, Notion má pre teba pripravený "Welcome" doc.',
      'Ešte 3 školenia a hotovo: GDPR (5 min), Bezpečnosť (5 min), Code of Conduct (5 min). Kvíz na konci, ale nie strašný 🎓',
      'Hotovo! 🎉 Si oficiálne v Aurora. Teraz čaká na teba dashboard, prvé tasky a... obed s tímom o 12:30. Užiš si to!',
    ];
    setEvaTyping(true);
    setEvaMessage('');
    sleep(500).then(() => {
      setEvaTyping(false);
      setEvaMessage(messages[currentStep] || '');
    });
  }, [currentStep]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, chatSending]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const nextStep = () => {
    setSteps((prev) =>
      prev.map((s, i) => (i === currentStep ? { ...s, completed: true } : s))
    );
    if (currentStep < steps.length - 1) {
      setCurrentStep((c) => c + 1);
      // Reset chat when changing steps
      setChatMode('idle');
      setChatHistory([]);
    } else {
      fireConfetti();
      setTimeout(onComplete, 1500);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
      setChatMode('idle');
      setChatHistory([]);
    }
  };

  const sendChatToEva = async () => {
    if (!chatInput.trim() || chatSending) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
      timestamp: Date.now(),
    };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setChatInput('');
    setChatSending(true);

    try {
      const reply = await sendChatMessage(
        userMsg.content,
        chatHistory.map((m) => ({ role: m.role, content: m.content }))
      );
      setChatHistory([
        ...newHistory,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        },
      ]);
    } catch (e: any) {
      setChatHistory([
        ...newHistory,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: 'Ups, niečo sa pokazilo 😅 Skús znova.',
          timestamp: Date.now(),
        },
      ]);
    }
    setChatSending(false);
  };

  const handleAskQuestion = () => {
    setChatMode('question');
    if (chatHistory.length === 0) {
      setChatHistory([
        {
          id: 'eva-init',
          role: 'assistant',
          content: 'Pýtaj sa! Som tu pre teba — môžem ti pomôcť s benefitmi, kolegami, eventami, alebo čímkoľvek iným ohľadom Aurory.',
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const handleSkip = () => {
    if (currentStep === steps.length - 1) {
      onComplete();
    } else {
      showToast(`✓ Krok preskočený. Môžeš sa k nemu vrátiť kedykoľvek.`);
      nextStep();
    }
  };

  const handleHelp = () => {
    setChatMode('help');
  };

  const greetTeammate = (empId: string, empName: string) => {
    setGreeted((prev) => new Set(prev).add(empId));
    showToast(`✓ Slack správa odoslaná: ${empName.split(' ')[0]} bude pri tebe ráno o 9:00`);
  };

  const activateTool = (toolName: string) => {
    setActivatedTools((prev) => new Set(prev).add(toolName));
    showToast(`✓ ${toolName} aktivovaný · invite ti dorazil na email`);
  };

  const startTraining = (title: string) => {
    setStartedTrainings((prev) => new Set(prev).add(title));
    showToast(`▶️ ${title} otvorené v novej karte (mock)`);
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="page-enter">
      {/* Header with progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-tertiary uppercase tracking-wider">
              Onboarding · krok {currentStep + 1} z {steps.length}
            </p>
            <h1 className="font-display text-3xl mt-1">{step.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-display">{Math.round(progress)}%</p>
            <p className="text-xs text-tertiary">dokončené</p>
          </div>
        </div>

        <div className="h-1.5 bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full accent-bg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((s, i) => {
          const Icon = stepIcons[s.type];
          const isActive = i === currentStep;
          const isDone = s.completed;
          return (
            <div key={s.id} className="flex flex-col items-center flex-1 relative">
              {i < steps.length - 1 && (
                <div
                  className="absolute top-5 left-1/2 w-full h-0.5 -z-0"
                  style={{
                    background: i < currentStep ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => i <= currentStep && setCurrentStep(i)}
                className="relative z-10 cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isActive
                      ? 'accent-bg border-transparent text-white shadow-md-themed'
                      : isDone
                      ? 'accent-bg border-transparent text-white'
                      : 'bg-secondary border-medium text-tertiary'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                </div>
              </motion.div>
              <p className={`text-[10px] mt-2 text-center ${isActive ? 'text-primary font-medium' : 'text-tertiary'}`}>
                {s.duration}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Eva's chat bubble */}
        <div className="md:col-span-1">
          <div className="card sticky top-6 flex flex-col" style={{ minHeight: 420 }}>
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden ai-ring accent-bg flex items-center justify-center text-white text-xl">
                  🤖
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Eva</p>
                <p className="text-xs text-tertiary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  AI Buddy {isAILive ? '· Live mode 🔥' : '· Demo mode'}
                </p>
              </div>
              {chatMode !== 'idle' && (
                <button
                  onClick={() => setChatMode('idle')}
                  className="btn-ghost p-1"
                  title="Späť"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* IDLE mode — step intro + actions */}
            {chatMode === 'idle' && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep + (evaTyping ? 'typing' : 'msg')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-tertiary rounded-lg rounded-tl-sm p-3 text-sm leading-relaxed text-primary flex-1"
                  >
                    {evaTyping ? (
                      <span className="flex gap-1 items-center">
                        <motion.span
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--text-tertiary)' }}
                        />
                        <motion.span
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--text-tertiary)' }}
                        />
                        <motion.span
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--text-tertiary)' }}
                        />
                      </span>
                    ) : (
                      evaMessage
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-4 pt-4 border-t border-subtle flex-shrink-0">
                  <p className="text-xs text-tertiary mb-2">Rýchle akcie:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={handleAskQuestion}
                      className="badge badge-accent hover:opacity-80 flex items-center gap-1"
                    >
                      <MessageCircle size={11} />
                      Mám otázku
                    </button>
                    <button
                      onClick={handleSkip}
                      className="badge hover:opacity-80 flex items-center gap-1"
                      title={currentStep === steps.length - 1 ? 'Dokončiť' : 'Preskočiť tento krok'}
                    >
                      <SkipForward size={11} />
                      Preskočiť
                    </button>
                    <button
                      onClick={handleHelp}
                      className="badge hover:opacity-80 flex items-center gap-1"
                    >
                      <HelpCircle size={11} />
                      Pomoc
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* HELP mode — context-specific help */}
            {chatMode === 'help' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col"
              >
                <div className="bg-accent rounded-lg p-3 text-sm leading-relaxed mb-3" style={{ color: 'var(--text-on-accent)' }}>
                  <div className="flex items-center gap-2 mb-2 font-medium">
                    <HelpCircle size={14} />
                    Pomoc · {step.title}
                  </div>
                  {HELP_CONTENT[step.type] || 'Nemám konkrétnu pomoc pre tento krok. Skús "Mám otázku" pre voľnú diskusiu s Evou.'}
                </div>
                <button
                  onClick={() => setChatMode('idle')}
                  className="btn-secondary text-xs w-full mt-auto"
                >
                  Naspät na intro
                </button>
              </motion.div>
            )}

            {/* QUESTION mode — live chat with Eva */}
            {chatMode === 'question' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col min-h-0"
              >
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1"
                  style={{ maxHeight: 280 }}
                >
                  {chatHistory.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs leading-relaxed ${
                          m.role === 'user'
                            ? 'accent-bg text-white rounded-tr-sm'
                            : 'bg-tertiary text-primary rounded-tl-sm'
                        }`}
                      >
                        {m.content}
                      </div>
                    </motion.div>
                  ))}
                  {chatSending && (
                    <div className="flex justify-start">
                      <div className="bg-tertiary rounded-lg rounded-tl-sm px-2.5 py-2">
                        <div className="flex gap-1">
                          <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--text-tertiary)' }}
                          />
                          <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--text-tertiary)' }}
                          />
                          <motion.span
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--text-tertiary)' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatToEva()}
                    placeholder="Spýtaj sa Evy..."
                    disabled={chatSending}
                    className="input-field text-xs py-1.5 flex-1"
                    autoFocus
                  />
                  <button
                    onClick={sendChatToEva}
                    disabled={!chatInput.trim() || chatSending}
                    className="btn-primary py-1.5 px-2 disabled:opacity-50"
                  >
                    {chatSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Step content */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="card"
              style={{ minHeight: 400 }}
            >
              <StepContent
                step={step}
                greeted={greeted}
                onGreet={greetTeammate}
                activatedTools={activatedTools}
                onActivate={activateTool}
                startedTrainings={startedTrainings}
                onStartTraining={startTraining}
                showToast={showToast}
              />

              <div className="mt-6 pt-6 border-t border-subtle flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} />
                  Späť
                </button>

                <button onClick={nextStep} className="btn-primary">
                  {currentStep === steps.length - 1 ? (
                    <>
                      Dokončiť
                      <PartyPopper size={16} />
                    </>
                  ) : (
                    <>
                      Pokračovať
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 card shadow-xl-themed px-4 py-3 flex items-center gap-2 max-w-md"
          >
            <Check size={16} className="accent-text flex-shrink-0" />
            <p className="text-sm">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// STEP CONTENT
// ============================================
interface StepContentProps {
  step: OnboardingStep;
  greeted: Set<string>;
  onGreet: (id: string, name: string) => void;
  activatedTools: Set<string>;
  onActivate: (name: string) => void;
  startedTrainings: Set<string>;
  onStartTraining: (title: string) => void;
  showToast: (msg: string) => void;
}

function StepContent({
  step,
  greeted,
  onGreet,
  activatedTools,
  onActivate,
  startedTrainings,
  onStartTraining,
  showToast,
}: StepContentProps) {
  switch (step.type) {
    case 'welcome':
      return (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="font-display text-3xl mb-3">Vitaj v Aurora!</h2>
          <p className="text-secondary mb-8 max-w-md mx-auto">
            Sme radi, že si tu. Poďme cez 6 krokov, ktoré ťa pripravia na prvý deň v práci.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <Stat label="Dní v Aurora" value="0" />
            <Stat label="Tvoj tím" value="6" />
            <Stat label="Buddy" value="Eva 🤖" />
          </div>
        </div>
      );

    case 'profile':
      return (
        <div>
          <h2 className="font-display text-2xl mb-2">Tvoj profil</h2>
          <p className="text-secondary text-sm mb-6">Tieto informácie uvidia tvoji kolegovia.</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-tertiary flex items-center justify-center text-3xl border-2 border-dashed border-medium">
              👤
            </div>
            <button
              onClick={() => showToast('📷 Mock: v plnej verzii by sa otvoril file picker')}
              className="btn-secondary"
            >
              <Upload size={14} />
              Nahrať fotku
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Meno" value="Ty (Demo)" />
            <Field label="Pozícia" value="New Hire" />
            <Field label="Oddelenie" value="IT" />
            <Field label="Lokácia" value="Bratislava" />
            <Field label="Telefón" value="+421 9XX XXX XXX" />
            <Field label="Email" value="demo@aurora.sk" />
          </div>

          <div className="mt-6 p-3 bg-accent rounded-lg">
            <p className="text-sm" style={{ color: 'var(--text-on-accent)' }}>
              💡 <strong>Pro tip:</strong> Pridaj si Linkedin profil a tvoje koníčky — pomôže to pri Friday Beers conversation starters!
            </p>
          </div>
        </div>
      );

    case 'team':
      return (
        <div>
          <h2 className="font-display text-2xl mb-2">Tvoj tím</h2>
          <p className="text-secondary text-sm mb-6">Toto sú ľudia, s ktorými budeš pracovať najviac.</p>

          <div className="space-y-3">
            {employees
              .filter((e) => ['emp-2', 'emp-4', 'emp-6', 'emp-10', 'emp-12'].includes(e.id))
              .map((emp) => {
                const isGreeted = greeted.has(emp.id);
                return (
                  <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-tertiary transition-colors">
                    <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{emp.name}</p>
                      <p className="text-xs text-tertiary">{emp.role} · {emp.location}</p>
                    </div>
                    {emp.id === 'emp-2' && <span className="badge badge-accent">Tvoj manažér</span>}
                    <button
                      onClick={() => !isGreeted && onGreet(emp.id, emp.name)}
                      disabled={isGreeted}
                      className={`btn-ghost text-xs ${isGreeted ? 'opacity-60 cursor-default' : ''}`}
                    >
                      {isGreeted ? (
                        <>
                          <Check size={12} style={{ color: 'var(--success)' }} />
                          Pozdravený
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          Pozdraviť
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      );

    case 'tools':
      return (
        <div>
          <h2 className="font-display text-2xl mb-2">Tvoje nástroje</h2>
          <p className="text-secondary text-sm mb-6">Prístupy sú už pripravené, klikni na "Aktivovať".</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Slack', emoji: '💬', desc: 'Komunikácia tímu' },
              { name: 'Notion', emoji: '📝', desc: 'Wiki & dokumentácia' },
              { name: 'GitHub', emoji: '🐙', desc: 'Code repository' },
              { name: '1Password', emoji: '🔐', desc: 'Heslá tímu' },
              { name: 'Linear', emoji: '📋', desc: 'Issue tracking' },
              { name: 'Figma', emoji: '🎨', desc: 'Design files (read-only)' },
            ].map((tool) => {
              const isActive = activatedTools.has(tool.name);
              return (
                <div key={tool.name} className="card card-hover flex items-center gap-3 p-3">
                  <div className="text-2xl">{tool.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="text-xs text-tertiary truncate">{tool.desc}</p>
                  </div>
                  <button
                    onClick={() => !isActive && onActivate(tool.name)}
                    disabled={isActive}
                    className={`text-xs font-medium whitespace-nowrap ${
                      isActive ? 'opacity-60 cursor-default flex items-center gap-1' : 'accent-text hover:underline'
                    }`}
                    style={isActive ? { color: 'var(--success)' } : {}}
                  >
                    {isActive ? (
                      <>
                        <Check size={12} />
                        Aktívne
                      </>
                    ) : (
                      'Aktivovať →'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'training':
      return (
        <div>
          <h2 className="font-display text-2xl mb-2">Povinné školenia</h2>
          <p className="text-secondary text-sm mb-6">Krátke videá + kvízy. Trvá to ~15 min.</p>

          <div className="space-y-3">
            {[
              { title: 'GDPR & Ochrana osobných údajov', icon: '🛡️', duration: '5 min', q: 7 },
              { title: 'Bezpečnosť & Ochrana zdravia', icon: '🦺', duration: '5 min', q: 5 },
              { title: 'Code of Conduct (Tata štandardy)', icon: '🤝', duration: '5 min', q: 6 },
            ].map((tr) => {
              const isStarted = startedTrainings.has(tr.title);
              return (
                <div key={tr.title} className="card flex items-center gap-3">
                  <div className="text-2xl">{tr.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{tr.title}</p>
                    <p className="text-xs text-tertiary">
                      {tr.duration} video · {tr.q} otázok kvíz
                    </p>
                  </div>
                  <button
                    onClick={() => !isStarted && onStartTraining(tr.title)}
                    disabled={isStarted}
                    className="btn-secondary text-sm"
                  >
                    {isStarted ? (
                      <>
                        <Check size={12} style={{ color: 'var(--success)' }} />
                        Začaté
                      </>
                    ) : (
                      <>
                        <Play size={12} />
                        Začať
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'complete':
      return (
        <div className="text-center py-8">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="font-display text-3xl mb-3">Si v hre!</h2>
          <p className="text-secondary mb-8 max-w-md mx-auto">
            Onboarding hotový. Teraz ťa čaká dashboard, prvé tasky a o 12:30 obed s tímom (Eva ti rezervovala stôl).
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="badge badge-success">✓ Profil</span>
            <span className="badge badge-success">✓ Tím</span>
            <span className="badge badge-success">✓ Nástroje</span>
            <span className="badge badge-success">✓ Školenia</span>
          </div>
        </div>
      );
  }
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-2xl">{value}</p>
      <p className="text-xs text-tertiary uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-tertiary block mb-1">{label}</label>
      <input className="input-field text-sm" defaultValue={value} />
    </div>
  );
}

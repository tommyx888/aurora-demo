import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Stethoscope, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { sendChatMessage, isAILive } from '../lib/ai';
import { runAIDiagnostics } from '../lib/aiDiagnostics';
import { useLanguage } from '../hooks/useLanguage';
import type { ChatMessage } from '../types';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const { lang, t } = useLanguage();
  const copy = {
    welcomeLive:
      lang === 'en'
        ? "Hi! 👋 I'm Eva, your AI buddy in Aurora. I'm live (Live Mode 🔥), ask me anything - benefits, colleagues, events, or just chat!"
        : 'Ahoj! 👋 Som Eva, tvoja AI buddy v Aurora. Som naživo (Live Mode 🔥), opýtaj sa ma na čokoľvek - benefity, kolegov, eventy, alebo si len pokecaj!',
    welcomeDemo:
      lang === 'en'
        ? "Hi! 👋 I'm Eva, your AI buddy. I'm in Demo mode, but I can still answer questions about benefits, colleagues, events... Try it! (For full AI: add VITE_ANTHROPIC_API_KEY)"
        : 'Ahoj! 👋 Som Eva, tvoja AI buddy. Som v Demo móde, ale stále viem odpovedať na otázky o benefitoch, kolegoch, eventoch... Skús! (Pre plné AI: pridaj VITE_ANTHROPIC_API_KEY)',
    error: lang === 'en' ? 'Oops, something went wrong 😅 Try again?' : 'Ups, niečo sa pokazilo 😅 Skús znova?',
    quickPrompts:
      lang === 'en'
        ? ['What are the benefits?', 'When is Friday Beers?', 'Who has a birthday?', "What's new in the company?"]
        : ['Aké sú benefity?', 'Kedy je Friday Beers?', 'Kto má narodeniny?', 'Čo je nové vo firme?'],
    placeholder: lang === 'en' ? 'Type a message...' : 'Napíš správu...',
    footerDemo: lang === 'en' ? 'fake responses · add API key for Live mode' : 'fake responses · pridaj API key pre Live mode',
    typingApiCall: lang === 'en' ? 'Testing API call...' : 'Skúšam API call...',
    diagnosticsTitle: lang === 'en' ? 'AI Diagnostics' : 'AI Diagnostika',
    testLabel: lang === 'en' ? 'Test' : 'Test',
    apiOk: lang === 'en' ? '✅ API works' : '✅ API funguje',
    apiBad: lang === 'en' ? '❌ API issue' : '❌ API problem',
    runAgain: lang === 'en' ? 'Run again' : 'Spustiť znova',
    badKey: lang === 'en' ? '➜ API key is invalid or expired' : '➜ API key je nesprávny alebo expired',
    rateLimit: lang === 'en' ? '➜ You hit the rate limit' : '➜ Prekročil si rate limit',
    badModel: lang === 'en' ? '➜ Model ID or parameters are invalid' : '➜ Model ID je zlý alebo rýchle parametre',
    network: lang === 'en' ? '➜ Probably CORS / network issue' : '➜ Pravdepodobne CORS / network problem',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isAILive
        ? copy.welcomeLive
        : copy.welcomeDemo,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [diagOpen, setDiagOpen] = useState(false);
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState<Awaited<ReturnType<typeof runAIDiagnostics>> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(
        userMsg.content,
        messages.filter((m) => m.id !== 'welcome').map((m) => ({ role: m.role, content: m.content }))
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
        },
      ]);
    } catch (e) {
      console.error('Eva chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: copy.error,
          timestamp: Date.now(),
        },
      ]);
    }
    setIsTyping(false);
  };

  const runDiag = async () => {
    setDiagOpen(true);
    setDiagRunning(true);
    setDiagResult(null);
    try {
      const r = await runAIDiagnostics();
      setDiagResult(r);
    } catch (e: any) {
      setDiagResult({
        timestamp: new Date().toISOString(),
        checks: [{ name: 'Diagnostic itself crashed', pass: false, detail: e?.message || String(e) }],
      });
    }
    setDiagRunning(false);
  };

  const quickPrompts = copy.quickPrompts;

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => onClose()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 left-4 md:bottom-6 md:left-6 w-12 h-12 md:w-14 md:h-14 rounded-full accent-bg shadow-xl-themed flex items-center justify-center text-white z-40 ai-ring"
        title={t('chatbot.title')}
      >
        {isOpen ? <X size={20} /> : <Bot size={20} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] flex items-center justify-center text-white font-bold">
            1
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-3 right-3 md:left-6 md:right-auto md:bottom-24 md:w-96 h-[calc(100vh-7rem)] md:h-[600px] max-h-[calc(100vh-7rem)] md:max-h-[calc(100vh-8rem)] card shadow-xl-themed z-40 flex flex-col p-0 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-subtle flex items-center gap-3">
              <div className="w-10 h-10 rounded-full accent-bg flex items-center justify-center text-white text-xl ai-ring">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Eva</p>
                <p className="text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span className="text-tertiary">
                    AI Buddy {isAILive ? '· Live mode 🔥' : '· Demo mode'}
                  </span>
                </p>
              </div>
              <button onClick={runDiag} className="btn-ghost" title={t('chatbot.diagnostics')}>
                <Stethoscope size={14} />
              </button>
              <button onClick={onClose} className="btn-ghost">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'accent-bg text-white rounded-tr-sm'
                        : 'bg-tertiary text-primary rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-tertiary rounded-2xl rounded-tl-sm px-3 py-3">
                    <div className="flex gap-1">
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-tertiary"
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
                </motion.div>
              )}
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="badge hover:badge-accent text-[11px]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-subtle">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={copy.placeholder}
                  className="input-field text-sm flex-1 py-2"
                  disabled={isTyping}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="btn-primary py-2 px-3 disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-[10px] text-tertiary mt-2 text-center">
                Powered by {isAILive ? 'Claude API 🚀' : copy.footerDemo}
              </p>
            </div>

            {/* Diagnostic overlay */}
            <AnimatePresence>
              {diagOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-secondary z-50 flex flex-col p-4 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={16} className="accent-text" />
                      <p className="font-medium">{copy.diagnosticsTitle}</p>
                    </div>
                    <button onClick={() => setDiagOpen(false)} className="btn-ghost">
                      <X size={16} />
                    </button>
                  </div>

                  {diagRunning && (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Loader2 size={32} className="animate-spin accent-text" />
                      <p className="text-sm text-tertiary">{copy.typingApiCall}</p>
                    </div>
                  )}

                  {diagResult && !diagRunning && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-tertiary uppercase tracking-wider">
                        {copy.testLabel} {new Date(diagResult.timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : 'sk-SK')}
                      </p>
                      {diagResult.checks.map((c, i) => (
                        <div key={i} className="card p-3 text-xs">
                          <div className="flex items-start gap-2">
                            {c.pass ? (
                              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} className="flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle size={14} style={{ color: 'var(--danger)' }} className="flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{c.name}</p>
                              <p className="text-tertiary mt-1 break-all">{c.detail}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {diagResult.apiTest && (
                        <div className="mt-4 pt-4 border-t border-subtle">
                          <p className="text-[10px] text-tertiary uppercase tracking-wider mb-2">
                            {diagResult.apiTest.success ? copy.apiOk : copy.apiBad}
                          </p>
                          {diagResult.apiTest.success && diagResult.apiTest.response && (
                            <div className="card bg-tertiary p-3 text-xs italic">
                              "{diagResult.apiTest.response}"
                            </div>
                          )}
                          {!diagResult.apiTest.success && (
                            <div className="card text-xs" style={{ borderColor: 'var(--danger)' }}>
                              <p className="font-mono break-all">
                                Status {diagResult.apiTest.errorStatus || '?'}: {diagResult.apiTest.error}
                              </p>
                              <div className="mt-3 pt-3 border-t border-subtle space-y-1 text-tertiary">
                                {diagResult.apiTest.errorStatus === 401 && (
                                  <p>{copy.badKey}</p>
                                )}
                                {diagResult.apiTest.errorStatus === 429 && (
                                  <p>{copy.rateLimit}</p>
                                )}
                                {diagResult.apiTest.errorStatus === 400 && (
                                  <p>{copy.badModel}</p>
                                )}
                                {!diagResult.apiTest.errorStatus && (
                                  <p>{copy.network}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={runDiag}
                        className="btn-secondary text-xs w-full mt-4"
                      >
                        {copy.runAgain}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

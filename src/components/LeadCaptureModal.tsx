import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { fireConfetti } from '../lib/utils';
import { useLanguage } from '../hooks/useLanguage';

interface LeadCaptureModalProps {
  isOpen: boolean;
  module?: string;
  onClose: () => void;
}

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

export function LeadCaptureModal({ isOpen, module, onClose }: LeadCaptureModalProps) {
  const { t } = useLanguage();
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    employees: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitState === 'sending') return;

    setSubmitState('sending');
    setErrorMsg('');

    // Always save to localStorage as backup (even if API fails)
    try {
      const leads = JSON.parse(localStorage.getItem('de-demo-leads') || '[]');
      leads.push({
        ...formData,
        timestamp: new Date().toISOString(),
        module,
      });
      localStorage.setItem('de-demo-leads', JSON.stringify(leads));
    } catch (e) { /* ignore */ }

    // Try sending via API
    try {
      const response = await fetch('/api/send-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone || undefined,
          companySize: formData.employees,
          message: formData.notes || undefined,
          module: module || undefined,
          sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      fireConfetti();
      setSubmitState('success');
    } catch (e: any) {
      console.error('[LeadCapture] Submit failed:', e);
      // In local dev /api/send-lead doesn't exist (only on Vercel) — show success anyway
      // because the lead is saved in localStorage and we don't want to break the demo UX.
      const isLocalDev = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

      if (isLocalDev) {
        console.warn('[LeadCapture] Local dev mode — API endpoint not available. Lead saved to localStorage only.');
        fireConfetti();
        setSubmitState('success');
      } else {
        setErrorMsg(e?.message || t('leadCapture.errorTitle'));
        setSubmitState('error');
      }
    }
  };

  const handleClose = () => {
    setSubmitState('idle');
    setErrorMsg('');
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      employees: '',
      notes: '',
    });
    onClose();
  };

  const handleRetry = () => {
    setSubmitState('idle');
    setErrorMsg('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-md w-full p-0 overflow-hidden"
          >
            {(submitState === 'idle' || submitState === 'sending' || submitState === 'error') && (
              <>
                <div className="p-6 mesh-bg border-b border-subtle">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg accent-bg flex items-center justify-center text-white">
                      <Sparkles size={18} />
                    </div>
                    <button onClick={handleClose} className="btn-ghost">
                      <X size={18} />
                    </button>
                  </div>
                  <h2 className="font-display text-2xl mb-2">
                    {t('leadCapture.title')}
                  </h2>
                  <p className="text-sm text-secondary">
                    {module
                      ? t('leadCapture.subtitleWithModule', { module })
                      : t('leadCapture.subtitle')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-tertiary block mb-1">{t('common.name')} *</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-field text-sm"
                        placeholder={t('leadCapture.namePlaceholder')}
                        disabled={submitState === 'sending'}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-tertiary block mb-1">{t('common.company')} *</label>
                      <input
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="input-field text-sm"
                        placeholder={t('leadCapture.companyPlaceholder')}
                        disabled={submitState === 'sending'}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-tertiary block mb-1">{t('common.email')} *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field text-sm"
                      placeholder={t('leadCapture.emailPlaceholder')}
                      disabled={submitState === 'sending'}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-tertiary block mb-1">{t('leadCapture.phoneOptional')}</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field text-sm"
                      placeholder={t('leadCapture.phonePlaceholder')}
                      disabled={submitState === 'sending'}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-tertiary block mb-1">{t('leadCapture.employeeCount')} *</label>
                    <select
                      required
                      value={formData.employees}
                      onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                      className="input-field text-sm"
                      disabled={submitState === 'sending'}
                    >
                      <option value="">{t('leadCapture.selectOption')}</option>
                      <option value="1-10">1-10</option>
                      <option value="11-25">11-25</option>
                      <option value="26-50">26-50</option>
                      <option value="51-100">51-100</option>
                      <option value="101-250">101-250</option>
                      <option value="250+">250+</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-tertiary block mb-1">{t('leadCapture.notesLabel')}</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="input-field text-sm resize-none"
                      rows={2}
                      placeholder="Čo presne potrebujete? Aký je timeline?"
                      disabled={submitState === 'sending'}
                    />
                  </div>

                  {submitState === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card flex items-start gap-2 p-3 text-sm"
                      style={{ background: 'color-mix(in srgb, var(--danger) 10%, transparent)', borderColor: 'var(--danger)' }}
                    >
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium" style={{ color: 'var(--danger)' }}>{t('leadCapture.errorTitle')}</p>
                        <p className="text-xs text-tertiary mt-0.5 break-words">{errorMsg}</p>
                        <p className="text-xs text-tertiary mt-1">
                          {t('leadCapture.errorBody')}{' '}
                          <a href="mailto:t.ficek@gmail.com" className="accent-text hover:underline">
                            t.ficek@gmail.com
                          </a>
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={submitState === 'sending'}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitState === 'sending' ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        {t('common.sending')}
                      </>
                    ) : submitState === 'error' ? (
                      <>
                        {t('leadCapture.retry')}
                        <Sparkles size={14} />
                      </>
                    ) : (
                      <>
                        {t('leadCapture.submit')}
                        <Sparkles size={14} />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-tertiary text-center">
                    {t('leadCapture.gdpr')}
                  </p>
                </form>
              </>
            )}

            {submitState === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--success) 15%, transparent)' }}
                >
                  <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
                </motion.div>
                <h2 className="font-display text-3xl mb-2">{t('leadCapture.successTitle')}</h2>
                <p className="text-secondary mb-6">
                  {t('leadCapture.successBody', { email: formData.email })}
                </p>
                <p className="text-xs text-tertiary mb-6">
                  {t('leadCapture.successLongFooter')}
                </p>
                <button onClick={handleClose} className="btn-primary">
                  {t('demoModal.continueDemo')}
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

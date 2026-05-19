import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Sparkles, BriefcaseBusiness, Users, Target, FileSearch,
  BarChart3, Calendar, MessageSquare, Newspaper, GitBranch, ClipboardList,
  Zap, FileText, ChevronDown, Star, Mail,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';
import { cn } from '../lib/utils';

// ============================================
// PRICING MODEL — central source of truth
// ============================================
const BASE_MONTHLY = 35;          // €/mes, fixný platform fee
const PER_MODULE_MONTHLY = 3;     // €/mes za každý aktivovaný modul
const FIRST_MODULE_PRICE = 500;   // € jednorazovo za prvý modul

// Discount per additional module (capped at 40%)
// Module 1: 0%, Module 2: 10%, Module 3: 20%, Module 4: 30%, Module 5+: 40%
function getDiscountForPosition(position: number): number {
  if (position === 1) return 0;
  if (position === 2) return 0.10;
  if (position === 3) return 0.20;
  if (position === 4) return 0.30;
  return 0.40;
}

function getModulePriceAtPosition(position: number): number {
  return Math.round(FIRST_MODULE_PRICE * (1 - getDiscountForPosition(position)));
}

// ============================================
// MODULE CATALOG
// ============================================
interface ModuleDef {
  id: string;
  name: string;
  nameSk: string;
  icon: any;
  description: string;
  descriptionSk: string;
  hasAI?: boolean;
}

const MODULES: ModuleDef[] = [
  { id: 'recruiting', name: 'Recruiting', nameSk: 'Recruiting', icon: BriefcaseBusiness,
    description: 'Pipeline · AI scoring · interviews', descriptionSk: 'Pipeline · AI scoring · pohovory', hasAI: true },
  { id: 'cv-screener', name: 'CV Screener', nameSk: 'CV Screener', icon: FileSearch,
    description: 'AI parse CVs · match scores · red flags', descriptionSk: 'AI číta CV · match scores · červené vlajky', hasAI: true },
  { id: 'ai-office', name: 'AI Office', nameSk: 'AI Office', icon: Sparkles,
    description: 'Generate contracts, offers, exit interviews', descriptionSk: 'Generuje zmluvy, ponuky, exit interviews', hasAI: true },
  { id: 'performance', name: 'Performance', nameSk: 'Performance', icon: Target,
    description: 'Reviews · goals · OKRs', descriptionSk: 'Hodnotenia · ciele · OKR' },
  { id: 'time-off', name: 'Time Off', nameSk: 'Dovolenky', icon: Calendar,
    description: 'Vacation · capacity · planning', descriptionSk: 'Dovolenky · kapacita · plánovanie' },
  { id: 'skill-matrix', name: 'Skill Matrix', nameSk: 'Skill Matrix', icon: BarChart3,
    description: 'Team competency heatmap', descriptionSk: 'Heatmapa kompetencií tímu' },
  { id: 'requests', name: 'Requests', nameSk: 'Žiadanky', icon: ClipboardList,
    description: 'Approvals workflow · time off, equipment', descriptionSk: 'Schvaľovací workflow · dovolenky, equipment' },
  { id: 'orgchart', name: 'Org Chart', nameSk: 'Org Chart', icon: GitBranch,
    description: 'Visual hierarchy · departments', descriptionSk: 'Vizuálna hierarchia · oddelenia' },
  { id: 'surveys', name: 'Pulse Surveys', nameSk: 'Prieskumy', icon: MessageSquare,
    description: 'eNPS · weekly pulse · trends', descriptionSk: 'eNPS · týždenný pulz · trendy' },
  { id: 'newsletter', name: 'Newsletter', nameSk: 'Newsletter', icon: Newspaper,
    description: 'Internal company news feed', descriptionSk: 'Interný firemný news feed' },
  { id: 'events', name: 'Events', nameSk: 'Eventy', icon: Calendar,
    description: 'Company events · birthdays · holidays', descriptionSk: 'Firemné akcie · narodeniny · sviatky' },
  { id: 'onboarding', name: 'Onboarding', nameSk: 'Onboarding', icon: Users,
    description: 'New hire flow · checklists · Eva chat', descriptionSk: 'Onboarding flow · checklisty · Eva chat', hasAI: true },
];

// ============================================
// BUNDLES — preset selections
// ============================================
interface BundleDef {
  id: 'pilot' | 'starter' | 'growth' | 'complete';
  moduleIds: string[];
  highlight?: 'popular' | 'best-value';
}

const BUNDLES: BundleDef[] = [
  { id: 'pilot', moduleIds: ['recruiting'] },
  { id: 'starter', moduleIds: ['recruiting', 'performance', 'time-off'] },
  { id: 'growth', moduleIds: ['recruiting', 'performance', 'time-off', 'ai-office', 'cv-screener'], highlight: 'popular' },
  { id: 'complete', moduleIds: MODULES.map((m) => m.id), highlight: 'best-value' },
];

// ============================================
// PRICE CALCULATION
// ============================================
function calculatePrice(selectedIds: string[]) {
  const count = selectedIds.length;
  if (count === 0) {
    return { oneTime: 0, monthly: 0, lineItems: [], discount: 0, fullPrice: 0 };
  }

  // One-time license prices with progressive discount
  const lineItems: { name: string; price: number; discount: number; original: number }[] = [];
  let oneTime = 0;
  let fullPrice = 0;

  selectedIds.forEach((id, index) => {
    const mod = MODULES.find((m) => m.id === id);
    if (!mod) return;
    const position = index + 1;
    const price = getModulePriceAtPosition(position);
    const discount = getDiscountForPosition(position);
    oneTime += price;
    fullPrice += FIRST_MODULE_PRICE;
    lineItems.push({
      name: mod.name,
      price,
      discount: Math.round(discount * 100),
      original: FIRST_MODULE_PRICE,
    });
  });

  // Monthly: base fee + per-module surcharge
  const monthly = BASE_MONTHLY + count * PER_MODULE_MONTHLY;

  return {
    oneTime,
    monthly,
    lineItems,
    discount: fullPrice - oneTime,
    fullPrice,
  };
}

// ============================================
// MAIN COMPONENT
// ============================================
interface PricingProps {
  onLeadCapture?: (module: string) => void;
}

export function Pricing({ onLeadCapture }: PricingProps) {
  const { lang, t } = useLanguage();
  const { mode } = useDesignMode();
  const isEn = lang === 'en';
  const isEditorial = mode === 'editorial';
  const isBrutalist = mode === 'brutalist';

  const [selectedIds, setSelectedIds] = useState<string[]>(['recruiting']);
  const [activeBundle, setActiveBundle] = useState<string | null>('pilot');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const price = useMemo(() => calculatePrice(selectedIds), [selectedIds]);

  const toggleModule = (id: string) => {
    setActiveBundle(null);
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const applyBundle = (bundleId: BundleDef['id']) => {
    const bundle = BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) return;
    setSelectedIds(bundle.moduleIds);
    setActiveBundle(bundleId);
  };

  const handleRequestQuote = () => {
    const modulesList = selectedIds.map((id) => MODULES.find((m) => m.id === id)?.name).join(', ');
    onLeadCapture?.(
      isEn
        ? `Quote request · ${selectedIds.length} modules · €${price.oneTime} one-time + €${price.monthly}/mo · ${modulesList}`
        : `Žiadosť o ponuku · ${selectedIds.length} modulov · ${price.oneTime}€ jednorázovo + ${price.monthly}€/mes · ${modulesList}`
    );
  };

  return (
    <div className="page-enter space-y-8">
      {/* ===== HEADER ===== */}
      {isBrutalist ? (
        <div className="br-fade-in">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="br-tag" data-tone="accent">● PRICING</span>
            <span className="br-eyebrow">{t('pricing.eyebrowBrutalist').toUpperCase()}</span>
          </div>
          <h1 className="br-poster text-5xl md:text-7xl mb-4" style={{ lineHeight: 0.9 }}>
            {t('pricing.headlineBrutalist')} <em className="br-italic">{t('pricing.headlineEmBrutalist')}</em>
          </h1>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--br-text-secondary)', letterSpacing: '-0.005em' }}>
            {t('pricing.subtitleBrutalist')}{' '}
            <span style={{ color: 'var(--br-accent)', fontWeight: 600 }}>{t('pricing.subtitleBrutalistAccent')}</span>
          </p>
          <hr className="br-divider mt-6" />
        </div>
      ) : isEditorial ? (
        <div className="ed-fade-in">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="ed-eyebrow">{t('pricing.eyebrowEditorial')}</span>
            <span className="ed-tag" data-status="live">
              <span className="ed-pulse-dot"></span>
              {selectedIds.length} {selectedIds.length === 1 ? t('pricing.moduleLabel') : selectedIds.length < 5 ? t('pricing.modulesLabel') : t('pricing.modulesGenitive')}
            </span>
          </div>
          <h1 className="ed-display text-5xl md:text-6xl mb-3" style={{ lineHeight: 0.95 }}>
            {t('pricing.headlineEditorial')} <em className="ed-italic-flourish">{t('pricing.headlineEmEditorial')}</em>.
          </h1>
          <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--ed-text-secondary)' }}>
            {t('pricing.subtitle')}
          </p>
          <hr className="ed-divider mt-6" />
        </div>
      ) : (
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">{t('pricing.eyebrowEditorial')}</p>
          <h1 className="font-display text-3xl">{t('pricing.headlineClassic')}</h1>
          <p className="text-secondary text-sm mt-1 max-w-2xl">{t('pricing.subtitle')}</p>
        </div>
      )}

      {/* ===== BUNDLES (anchors) ===== */}
      <section>
        <div className="mb-4">
          <h2 className={cn('font-display', isBrutalist ? 'text-3xl' : isEditorial ? 'text-3xl' : 'text-2xl')}>
            {t('pricing.bundles')}
          </h2>
          <p className="text-secondary text-sm mt-1">{t('pricing.bundlesDesc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {BUNDLES.map((bundle) => {
            const bundlePrice = calculatePrice(bundle.moduleIds);
            const isActive = activeBundle === bundle.id;
            const labelKey = `pricing.${bundle.id}Name` as const;
            const descKey = `pricing.${bundle.id}Desc` as const;
            const includesKey = `pricing.${bundle.id}Includes` as const;

            return (
              <motion.button
                key={bundle.id}
                whileHover={{ y: isBrutalist ? -2 : -3 }}
                onClick={() => applyBundle(bundle.id)}
                className={cn(
                  'card text-left p-4 transition-all relative',
                  isActive && 'ring-2',
                  isBrutalist && isActive && 'shadow-[4px_4px_0_var(--br-border)]',
                )}
                style={isActive ? { borderColor: 'var(--accent-primary)', '--tw-ring-color': 'var(--accent-primary)' } as any : {}}
              >
                {bundle.highlight === 'popular' && (
                  <span className="absolute -top-2 right-3 badge badge-accent text-[10px]">
                    ⭐ {t('pricing.mostPopular')}
                  </span>
                )}
                {bundle.highlight === 'best-value' && (
                  <span className="absolute -top-2 right-3 badge badge-accent text-[10px]">
                    💎 {t('pricing.bestValue')}
                  </span>
                )}

                <div className="mb-3">
                  <h3 className={cn('font-display', isBrutalist ? 'text-2xl' : 'text-xl')}>
                    {t(labelKey as any)}
                  </h3>
                  <p className="text-xs text-tertiary mt-0.5">{t(descKey as any)}</p>
                </div>

                <div className="mb-3">
                  <p className={cn('font-display', isBrutalist ? 'text-3xl' : 'text-2xl')}>
                    {bundlePrice.oneTime}€
                  </p>
                  <p className="text-xs text-tertiary">
                    + {bundlePrice.monthly}€/{isEn ? 'mo' : 'mes'}
                  </p>
                </div>

                <p className="text-xs text-secondary leading-relaxed mb-3">
                  {t(includesKey as any)}
                </p>

                {bundlePrice.discount > 0 && (
                  <p className="text-xs accent-text font-medium">
                    {t('pricing.savings')} {bundlePrice.discount}€
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-subtle">
                  <span className={cn('text-xs', isActive ? 'accent-text font-medium' : 'text-tertiary')}>
                    {isActive ? `✓ ${t('pricing.selected')}` : t('pricing.selectBundle')}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ===== MODULE PICKER ===== */}
      <section>
        <div className="mb-4">
          <h2 className={cn('font-display', isBrutalist ? 'text-3xl' : isEditorial ? 'text-3xl' : 'text-2xl')}>
            {t('pricing.pickModules')}
          </h2>
          <p className="text-secondary text-sm mt-1">{t('pricing.pickModulesDesc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {MODULES.map((mod) => {
            const isSelected = selectedIds.includes(mod.id);
            const position = selectedIds.indexOf(mod.id) + 1;
            const ModIcon = mod.icon;

            return (
              <motion.button
                key={mod.id}
                whileHover={{ y: -1 }}
                onClick={() => toggleModule(mod.id)}
                className={cn(
                  'card text-left p-3 transition-all relative',
                  isSelected && 'ring-2',
                )}
                style={isSelected ? { borderColor: 'var(--accent-primary)', '--tw-ring-color': 'var(--accent-primary)' } as any : {}}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 flex items-center justify-center flex-shrink-0',
                      isBrutalist ? '' : 'rounded-lg',
                    )}
                    style={{
                      background: isSelected ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: isSelected ? 'var(--text-on-accent)' : 'var(--text-tertiary)',
                      border: isBrutalist ? '1px solid var(--br-border)' : 'none',
                    }}
                  >
                    <ModIcon size={16} strokeWidth={isBrutalist ? 2 : 1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{isEn ? mod.name : mod.nameSk}</p>
                      {mod.hasAI && (
                        <span className="badge text-[9px] flex items-center gap-0.5">
                          <Sparkles size={8} /> AI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-tertiary leading-snug mt-0.5">
                      {isEn ? mod.description : mod.descriptionSk}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-medium accent-text">
                        {getModulePriceAtPosition(position)}€
                      </span>
                      {position > 1 && (
                        <span className="text-[10px] text-tertiary line-through">
                          {FIRST_MODULE_PRICE}€
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ===== PRICE SUMMARY ===== */}
      <section>
        <AnimatePresence mode="wait">
          {selectedIds.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card text-center py-8 text-tertiary"
            >
              <p>{t('pricing.noModules')}</p>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn('card', isBrutalist && 'border-2')}
              style={isBrutalist ? { borderColor: 'var(--br-border)' } : {}}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Big numbers */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-tertiary uppercase tracking-wider mb-1">{t('pricing.oneTime')}</p>
                    <p className={cn('font-display', isBrutalist ? 'text-5xl' : 'text-4xl')}>
                      {price.oneTime}€
                    </p>
                    {price.discount > 0 && (
                      <p className="text-xs accent-text font-medium mt-1">
                        {t('pricing.savings')} {price.discount}€
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-tertiary uppercase tracking-wider mb-1">{t('pricing.monthly')}</p>
                    <p className={cn('font-display', isBrutalist ? 'text-5xl' : 'text-4xl')}>
                      {price.monthly}€
                    </p>
                    <p className="text-xs text-tertiary mt-1">
                      /{isEn ? 'mo' : 'mes'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-tertiary uppercase tracking-wider mb-1">{t('pricing.yearOne')}</p>
                    <p className={cn('font-display', isBrutalist ? 'text-5xl' : 'text-4xl')}>
                      {(price.oneTime + price.monthly * 12).toLocaleString()}€
                    </p>
                    <p className="text-xs text-tertiary mt-1">
                      {t('pricing.yearTwo')}: {(price.monthly * 12).toLocaleString()}€
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-2 justify-center">
                  <button
                    onClick={handleRequestQuote}
                    className={cn('btn-primary text-sm', isBrutalist && 'br-btn br-btn-accent')}
                  >
                    <Mail size={14} />
                    {t('pricing.getQuote')}
                  </button>
                  <button
                    onClick={handleRequestQuote}
                    className={cn('btn-secondary text-xs', isBrutalist && 'br-btn')}
                  >
                    <MessageSquare size={12} />
                    {t('pricing.talkToUs')}
                  </button>
                </div>
              </div>

              {/* Breakdown */}
              <div className="mt-6 pt-6 border-t border-subtle">
                <p className="text-xs text-tertiary uppercase tracking-wider mb-3">{t('pricing.breakdown')}</p>
                <div className="space-y-1.5 text-sm">
                  {price.lineItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-secondary">
                        {i + 1}. {item.name}
                        {item.discount > 0 && (
                          <span className="badge badge-success text-[10px] ml-2">−{item.discount}%</span>
                        )}
                      </span>
                      <span className="font-medium">
                        {item.discount > 0 && (
                          <span className="text-tertiary text-xs line-through mr-2">{item.original}€</span>
                        )}
                        {item.price}€
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-subtle font-medium">
                    <span>{t('pricing.moduleLicenses')}</span>
                    <span>{price.oneTime}€</span>
                  </div>
                  <div className="text-xs text-tertiary pt-3 space-y-1">
                    <div className="flex justify-between">
                      <span>+ {t('pricing.baseFee')}</span>
                      <span>{BASE_MONTHLY}€/{isEn ? 'mo' : 'mes'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ {selectedIds.length} × {PER_MODULE_MONTHLY}€ ({t('pricing.perModule')})</span>
                      <span>{selectedIds.length * PER_MODULE_MONTHLY}€/{isEn ? 'mo' : 'mes'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ===== FAQ ===== */}
      <section>
        <h2 className={cn('font-display mb-4', isBrutalist ? 'text-3xl' : isEditorial ? 'text-3xl' : 'text-2xl')}>
          {t('pricing.faqTitle')}
        </h2>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((n) => {
            const isOpen = openFaq === n;
            return (
              <div key={n} className="card p-0 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : n)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-tertiary transition-colors"
                >
                  <span className="font-medium text-sm pr-4">
                    {t(`pricing.faq${n}Q` as any)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn('text-tertiary flex-shrink-0 transition-transform', isOpen && 'rotate-180')}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm text-secondary leading-relaxed">
                        {t(`pricing.faq${n}A` as any)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="card mt-4 bg-accent flex items-center gap-3">
          <Star size={18} className="accent-text flex-shrink-0" />
          <p className="text-sm" style={{ color: 'var(--text-on-accent)' }}>
            {t('pricing.customNote')}
          </p>
        </div>
      </section>
    </div>
  );
}

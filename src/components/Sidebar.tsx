import { motion } from 'framer-motion';
import {
  Home, Users, BarChart3, BriefcaseBusiness, GitBranch, MessageSquare,
  Newspaper, Calendar, FileText, Brain, Crown, UserCircle, ChevronRight, Sparkles,
  Plane, Target, FileSearch, Wand2, Tag
} from 'lucide-react';
import type { Page, UserRole } from '../types';
import { cn } from '../lib/utils';
import { useBranding } from '../hooks/useBranding';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';
import { DemoDisclaimerBadge } from './DemoDisclaimer';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  role: UserRole;
  onToggleRole: () => void;
  onOpenDemoInfo: () => void;
  className?: string;
  onNavigateComplete?: () => void;
}

const employeeNav: { page: Page; labelKey: string; icon: any; badge?: string }[] = [
  { page: 'employee-dashboard', labelKey: 'nav.home', icon: Home },
  { page: 'onboarding', labelKey: 'nav.onboarding', icon: Sparkles, badge: '6' },
  { page: 'newsletter', labelKey: 'nav.news', icon: Newspaper, badge: 'NEW' },
  { page: 'events', labelKey: 'nav.events', icon: Calendar },
  { page: 'time-off', labelKey: 'nav.timeOff', icon: Plane, badge: 'NEW' },
  { page: 'requests', labelKey: 'nav.requests', icon: FileText },
  { page: 'performance', labelKey: 'nav.performance', icon: Target, badge: 'NEW' },
  { page: 'orgchart', labelKey: 'nav.orgChart', icon: GitBranch },
  { page: 'surveys', labelKey: 'nav.surveys', icon: MessageSquare },
  { page: 'pricing', labelKey: 'nav.pricing', icon: Tag, badge: 'NEW' },
];

const adminNav: { page: Page; labelKey: string; icon: any; badge?: string }[] = [
  { page: 'admin-dashboard', labelKey: 'nav.adminDashboard', icon: BarChart3 },
  { page: 'skill-matrix', labelKey: 'nav.skillMatrix', icon: Brain, badge: 'AI' },
  { page: 'recruiting', labelKey: 'nav.recruiting', icon: BriefcaseBusiness, badge: '23' },
  { page: 'cv-screener', labelKey: 'nav.cvScreener', icon: FileSearch, badge: 'AI' },
  { page: 'time-off', labelKey: 'nav.timeOffAdmin', icon: Plane, badge: 'AI' },
  { page: 'performance', labelKey: 'nav.performance', icon: Target },
  { page: 'ai-office', labelKey: 'nav.aiOffice', icon: Wand2, badge: 'AI' },
  { page: 'requests', labelKey: 'nav.approvals', icon: FileText, badge: '4' },
  { page: 'orgchart', labelKey: 'nav.orgChart', icon: GitBranch },
  { page: 'newsletter', labelKey: 'nav.newsAdmin', icon: Newspaper },
  { page: 'events', labelKey: 'nav.eventsAdmin', icon: Calendar },
  { page: 'surveys', labelKey: 'nav.surveysAdmin', icon: MessageSquare },
  { page: 'pricing', labelKey: 'nav.pricing', icon: Tag, badge: 'NEW' },
];

export function Sidebar(props: SidebarProps) {
  const { mode } = useDesignMode();
  if (mode === 'editorial') return <SidebarEditorial {...props} />;
  if (mode === 'brutalist') return <SidebarBrutalist {...props} />;
  return <SidebarClassic {...props} />;
}

// ============================================
// CLASSIC SIDEBAR — original look
// ============================================
function SidebarClassic({
  currentPage,
  onNavigate,
  role,
  onToggleRole,
  onOpenDemoInfo,
  className,
  onNavigateComplete,
}: SidebarProps) {
  const isAdmin = role === 'admin';
  const items = isAdmin ? adminNav : employeeNav;
  const { branding } = useBranding();
  const { t } = useLanguage();
  const navigateAndClose = (page: Page) => {
    onNavigate(page);
    onNavigateComplete?.();
  };
  const toggleRoleAndClose = () => {
    onToggleRole();
    onNavigateComplete?.();
  };

  return (
    <aside className={cn('w-64 border-r border-subtle bg-secondary flex flex-col h-screen sticky top-0', className)}>
      <div className="p-5 pb-3 border-b border-subtle">
        <button
          onClick={() => navigateAndClose(isAdmin ? 'admin-dashboard' : 'employee-dashboard')}
          className="flex items-center gap-2 group w-full"
        >
          {branding.isActive && branding.logoDataUrl ? (
            <div className="w-9 h-9 rounded-lg bg-white border border-medium flex items-center justify-center overflow-hidden">
              <img src={branding.logoDataUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg accent-bg flex items-center justify-center text-white font-bold text-lg">
              {branding.companyName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="text-left min-w-0">
            <p className="font-display text-lg leading-none truncate">{branding.companyName}</p>
            <p className="text-[10px] text-tertiary uppercase tracking-wider">{t('sidebar.poweredBy')}</p>
          </div>
        </button>

        <DemoDisclaimerBadge onClick={onOpenDemoInfo} />
      </div>

      <div className="p-3 border-b border-subtle">
        <button
          onClick={toggleRoleAndClose}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg flex items-center justify-between transition-all',
            isAdmin ? 'bg-accent text-on-accent' : 'bg-tertiary text-primary'
          )}
          style={isAdmin ? { background: 'var(--bg-accent)', color: 'var(--text-on-accent)' } : { background: 'var(--bg-tertiary)' }}
        >
          <div className="flex items-center gap-2">
            {isAdmin ? <Crown size={16} /> : <UserCircle size={16} />}
            <span className="text-sm font-medium">
              {isAdmin ? t('nav.adminView') : t('nav.employeeView')}
            </span>
          </div>
          <ChevronRight size={14} className="opacity-60" />
        </button>
        <p className="text-[10px] text-tertiary mt-2 px-1">
          💡 {t('nav.switchView')}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <motion.button
              key={item.page + i}
              onClick={() => navigateAndClose(item.page)}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all',
                isActive
                  ? 'accent-bg text-white shadow-sm-themed'
                  : 'text-secondary hover:bg-tertiary hover:text-primary'
              )}
            >
              <Icon size={16} />
              <span className="flex-1 text-left font-medium">{t(item.labelKey)}</span>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded font-semibold',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'badge-accent'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-subtle">
        <div className="flex items-center gap-2 px-2 py-2">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=demo-user&backgroundColor=ffd5dc`}
            alt="You"
            className="w-9 h-9 rounded-full border-2 border-medium"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-primary">{t('sidebar.you')}</p>
            <p className="text-xs text-tertiary truncate">{isAdmin ? t('sidebar.hrManager') : t('sidebar.newHire')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================
// EDITORIAL SIDEBAR — refined Mix A+B aesthetic
// ============================================
function SidebarEditorial({
  currentPage,
  onNavigate,
  role,
  onToggleRole,
  onOpenDemoInfo,
  className,
  onNavigateComplete,
}: SidebarProps) {
  const isAdmin = role === 'admin';
  const items = isAdmin ? adminNav : employeeNav;
  const { branding } = useBranding();
  const { t } = useLanguage();
  const navigateAndClose = (page: Page) => {
    onNavigate(page);
    onNavigateComplete?.();
  };
  const toggleRoleAndClose = () => {
    onToggleRole();
    onNavigateComplete?.();
  };

  return (
    <aside
      className={cn('ed-root w-64 flex flex-col h-screen sticky top-0', className)}
      style={{
        borderRight: '1px solid var(--ed-border)',
        background: 'var(--ed-surface)',
      }}
    >
      {/* Logo block */}
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--ed-border)' }}>
        <button
          onClick={() => navigateAndClose(isAdmin ? 'admin-dashboard' : 'employee-dashboard')}
          className="flex items-center gap-3 group w-full"
        >
          {branding.isActive && branding.logoDataUrl ? (
            <div
              className="w-9 h-9 flex items-center justify-center overflow-hidden"
              style={{
                background: 'var(--ed-surface)',
                border: '1px solid var(--ed-border)',
                borderRadius: 3,
              }}
            >
              <img src={branding.logoDataUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-9 h-9 flex items-center justify-center text-sm"
              style={{
                background: 'var(--ed-text)',
                color: 'var(--ed-bg)',
                borderRadius: 3,
                fontFamily: 'var(--font-editorial-mono)',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {branding.companyName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="text-left min-w-0">
            <p
              className="ed-headline text-lg leading-none truncate"
              style={{ fontSize: '1.125rem', fontWeight: 500 }}
            >
              {branding.companyName}
            </p>
            <p
              className="ed-eyebrow mt-1"
              style={{ fontSize: '0.5625rem', letterSpacing: '0.14em' }}
            >
              {t('sidebar.poweredBy')}
            </p>
          </div>
        </button>

        {/* Demo badge — editorial style */}
        <button
          onClick={onOpenDemoInfo}
          className="w-full text-left mt-4 group"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="ed-pulse-dot" />
            <span className="ed-eyebrow" style={{ fontSize: '0.5625rem' }}>Demo</span>
          </div>
          <p
            className="text-xs leading-snug transition-colors"
            style={{ color: 'var(--ed-text-secondary)' }}
          >
            {t('sidebar.demoTagline')} <span style={{ color: 'var(--ed-text)' }}>→</span>
          </p>
        </button>
      </div>

      {/* Role toggle */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--ed-border)' }}>
        <button
          onClick={toggleRoleAndClose}
          className="w-full flex items-center justify-between group transition-colors"
          style={{
            padding: '0.625rem 0.75rem',
            background: isAdmin ? 'var(--ed-text)' : 'var(--ed-surface-2)',
            color: isAdmin ? 'var(--ed-bg)' : 'var(--ed-text)',
            borderRadius: 4,
          }}
        >
          <div className="flex items-center gap-2">
            {isAdmin ? <Crown size={14} strokeWidth={1.5} /> : <UserCircle size={14} strokeWidth={1.5} />}
            <span className="text-xs font-medium" style={{ letterSpacing: '-0.005em' }}>
              {isAdmin ? t('nav.adminView') : t('nav.employeeView')}
            </span>
          </div>
          <ChevronRight size={12} strokeWidth={1.5} style={{ opacity: 0.6 }} />
        </button>
        <p
          className="ed-mono mt-2"
          style={{ fontSize: '0.625rem', color: 'var(--ed-text-tertiary)' }}
        >
          {t('nav.switchView')}
        </p>
      </div>

      {/* Section eyebrow */}
      <div className="px-5 pt-4 pb-2">
        <p className="ed-eyebrow" style={{ fontSize: '0.5625rem' }}>
          {isAdmin ? t('sidebarDesign.workspaceAdmin') : t('sidebarDesign.workspaceEmployee')}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.page + i}
              onClick={() => navigateAndClose(item.page)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-all"
              style={{
                background: isActive ? 'var(--ed-text)' : 'transparent',
                color: isActive ? 'var(--ed-bg)' : 'var(--ed-text-secondary)',
                borderRadius: 3,
                fontWeight: isActive ? 500 : 400,
                letterSpacing: '-0.005em',
                fontSize: '0.8125rem',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--ed-surface-2)';
                  e.currentTarget.style.color = 'var(--ed-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--ed-text-secondary)';
                }
              }}
            >
              <Icon size={14} strokeWidth={1.5} />
              <span className="flex-1 text-left">{t(item.labelKey)}</span>
              {item.badge && (
                <span
                  className="ed-mono"
                  style={{
                    fontSize: '0.5625rem',
                    padding: '1px 5px',
                    background: isActive ? 'rgba(255,255,255,0.15)' : 'var(--ed-surface-2)',
                    color: isActive ? 'var(--ed-bg)' : 'var(--ed-text-tertiary)',
                    borderRadius: 2,
                    letterSpacing: '0.04em',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--ed-border)' }}>
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=demo-user&backgroundColor=e4e4e7`}
            alt="You"
            className="w-9 h-9"
            style={{
              border: '1px solid var(--ed-border)',
              borderRadius: '50%',
            }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--ed-text)', letterSpacing: '-0.01em' }}
            >
              {t('sidebar.you')}
            </p>
            <p
              className="ed-mono truncate"
              style={{ fontSize: '0.625rem', color: 'var(--ed-text-tertiary)' }}
            >
              {isAdmin ? t('sidebar.hrManager') : t('sidebar.newHire')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================
// BRUTALIST SIDEBAR — hard borders, mono labels, signal red active
// ============================================
function SidebarBrutalist({
  currentPage,
  onNavigate,
  role,
  onToggleRole,
  onOpenDemoInfo,
  className,
  onNavigateComplete,
}: SidebarProps) {
  const isAdmin = role === 'admin';
  const items = isAdmin ? adminNav : employeeNav;
  const { branding } = useBranding();
  const { t } = useLanguage();
  const navigateAndClose = (page: Page) => {
    onNavigate(page);
    onNavigateComplete?.();
  };
  const toggleRoleAndClose = () => {
    onToggleRole();
    onNavigateComplete?.();
  };

  return (
    <aside
      className={cn('br-root w-64 flex flex-col h-screen sticky top-0', className)}
      style={{
        borderRight: '1px solid var(--br-border)',
        background: 'var(--br-surface)',
      }}
    >
      {/* Logo block */}
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--br-border)' }}>
        <button
          onClick={() => navigateAndClose(isAdmin ? 'admin-dashboard' : 'employee-dashboard')}
          className="flex items-center gap-3 group w-full"
        >
          {branding.isActive && branding.logoDataUrl ? (
            <div
              className="w-9 h-9 flex items-center justify-center overflow-hidden"
              style={{
                background: 'var(--br-surface)',
                border: '1px solid var(--br-border)',
              }}
            >
              <img src={branding.logoDataUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{
                background: 'var(--br-text)',
                color: 'var(--br-bg)',
                fontFamily: 'var(--font-editorial-mono)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                letterSpacing: '0.05em',
              }}
            >
              {branding.companyName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="text-left min-w-0">
            <p
              className="br-headline text-lg leading-none truncate"
              style={{ fontSize: '1.0625rem', fontWeight: 500 }}
            >
              {branding.companyName}
            </p>
            <p
              className="br-eyebrow mt-1"
              style={{ fontSize: '0.5625rem', letterSpacing: '0.16em' }}
            >
              {t('sidebar.poweredBy').toUpperCase()}
            </p>
          </div>
        </button>

        {/* Demo badge — brutalist style with red dot */}
        <button
          onClick={onOpenDemoInfo}
          className="w-full text-left mt-4 group"
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-1.5 h-1.5"
              style={{ background: 'var(--br-accent)' }}
            />
            <span className="br-eyebrow" style={{ fontSize: '0.5625rem' }}>DEMO</span>
          </div>
          <p
            className="text-xs leading-snug transition-colors"
            style={{ color: 'var(--br-text-secondary)' }}
          >
            {t('sidebar.demoTagline')} <span style={{ color: 'var(--br-accent)', fontWeight: 700 }}>→</span>
          </p>
        </button>
      </div>

      {/* Role toggle */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--br-border)' }}>
        <button
          onClick={toggleRoleAndClose}
          className="w-full flex items-center justify-between group transition-all"
          style={{
            padding: '0.625rem 0.75rem',
            background: isAdmin ? 'var(--br-text)' : 'var(--br-surface)',
            color: isAdmin ? 'var(--br-bg)' : 'var(--br-text)',
            border: '1px solid var(--br-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '3px 3px 0 var(--br-border)';
            e.currentTarget.style.transform = 'translate(-1px, -1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div className="flex items-center gap-2">
            {isAdmin ? <Crown size={14} strokeWidth={2} /> : <UserCircle size={14} strokeWidth={2} />}
            <span
              className="text-xs"
              style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {isAdmin ? t('nav.adminView') : t('nav.employeeView')}
            </span>
          </div>
          <ChevronRight size={12} strokeWidth={2} style={{ opacity: 0.6 }} />
        </button>
        <p
          className="br-mono mt-2"
          style={{ fontSize: '0.625rem', color: 'var(--br-text-tertiary)' }}
        >
          {t('nav.switchView')}
        </p>
      </div>

      {/* Section eyebrow */}
      <div className="px-5 pt-4 pb-2">
        <p className="br-eyebrow" style={{ fontSize: '0.5625rem' }}>
          / 01 — {isAdmin ? t('sidebarDesign.workspaceAdminUpper') : t('sidebarDesign.workspaceEmployeeUpper')}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = currentPage === item.page;

          return (
            <button
              key={item.page + i}
              onClick={() => navigateAndClose(item.page)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-all"
              style={{
                background: isActive ? 'var(--br-text)' : 'transparent',
                color: isActive ? 'var(--br-bg)' : 'var(--br-text-secondary)',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '-0.005em',
                fontSize: '0.8125rem',
                borderLeft: isActive ? '2px solid var(--br-accent)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--br-surface-2)';
                  e.currentTarget.style.color = 'var(--br-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--br-text-secondary)';
                }
              }}
            >
              <Icon size={14} strokeWidth={2} />
              <span className="flex-1 text-left">{t(item.labelKey)}</span>
              {item.badge && (
                <span
                  className="br-mono"
                  style={{
                    fontSize: '0.5625rem',
                    padding: '1px 5px',
                    background: isActive ? 'var(--br-accent)' : 'var(--br-surface-2)',
                    color: isActive ? 'var(--br-bg)' : 'var(--br-text)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--br-border)' }}>
        <div className="flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=demo-user&backgroundColor=ebe7df`}
            alt="You"
            className="w-9 h-9"
            style={{ border: '1px solid var(--br-border)' }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm truncate"
              style={{ color: 'var(--br-text)', fontWeight: 600, letterSpacing: '-0.01em' }}
            >
              {t('sidebar.you')}
            </p>
            <p
              className="br-mono truncate"
              style={{ fontSize: '0.625rem', color: 'var(--br-text-tertiary)' }}
            >
              {(isAdmin ? t('sidebar.hrManager') : t('sidebar.newHire')).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

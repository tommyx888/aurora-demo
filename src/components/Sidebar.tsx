import { motion } from 'framer-motion';
import {
  Home, Users, BarChart3, BriefcaseBusiness, GitBranch, MessageSquare,
  Newspaper, Calendar, FileText, Brain, Crown, UserCircle, ChevronRight, Sparkles,
  Plane, Target, FileSearch, Wand2
} from 'lucide-react';
import type { Page, UserRole } from '../types';
import { cn } from '../lib/utils';
import { useBranding } from '../hooks/useBranding';
import { useLanguage } from '../hooks/useLanguage';
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
];

export function Sidebar({
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
      {/* Logo */}
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

        {/* Demo disclaimer badge */}
        <DemoDisclaimerBadge onClick={onOpenDemoInfo} />
      </div>

      {/* Role toggle */}
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

      {/* Navigation */}
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

      {/* User profile */}
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

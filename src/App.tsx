import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LandingPage } from './pages/LandingPage';
import { RolePicker } from './pages/RolePicker';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Onboarding } from './modules/Onboarding';
import { SkillMatrix } from './modules/SkillMatrix';
import { Recruiting } from './modules/Recruiting';
import { Requests } from './modules/Requests';
import { Orgchart } from './modules/Orgchart';
import { Surveys } from './modules/Surveys';
import { Newsletter } from './modules/Newsletter';
import { Events } from './modules/Events';
import { CVScreener } from './modules/CVScreener';
import { TimeOff } from './modules/TimeOff';
import { AIOffice } from './modules/AIOffice';
import { Performance } from './modules/Performance';
import { Pricing } from './pages/Pricing';
import { Sidebar } from './components/Sidebar';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { AIChatbot } from './components/AIChatbot';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { BrandingStudio } from './components/BrandingStudio';
import { BrandingCTA } from './components/BrandingCTA';
import { OnboardingTour } from './components/OnboardingTour';
import { DemoDisclaimerModal } from './components/DemoDisclaimer';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { useTheme } from './hooks/useTheme';
import { useKonami } from './hooks/useKonami';
import { useBranding } from './hooks/useBranding';
import { useLanguage } from './hooks/useLanguage';
import { fireConfetti } from './lib/utils';
import type { Page, UserRole } from './types';

function App() {
  // initialize theme + branding on mount
  useTheme();
  useBranding();
  const { t, lang } = useLanguage();
  const isEn = lang === 'en';

  const [page, setPage] = useState<Page>('landing');
  const [role, setRole] = useState<UserRole>('both');
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [leadModal, setLeadModal] = useState<{ open: boolean; module?: string }>({ open: false });
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [demoInfoOpen, setDemoInfoOpen] = useState(false);

  // Konami code easter egg
  useKonami(() => {
    fireConfetti();
    setTimeout(() => {
      alert(t('app.konamiAlert'));
    }, 500);
  });

  const handleRoleSelect = (selectedRole: UserRole, targetPage: Page) => {
    setRole(selectedRole);
    setPage(targetPage);
  };

  const handleToggleRole = () => {
    if (role === 'admin') {
      setRole('employee');
      setPage('employee-dashboard');
    } else {
      setRole('admin');
      setPage('admin-dashboard');
    }
  };

  const handleLeadCapture = (module: string) => {
    setLeadModal({ open: true, module });
  };

  const pageTitleMap: Partial<Record<Page, string>> = {
    'employee-dashboard': t('nav.home'),
    'admin-dashboard': t('nav.adminDashboard'),
    onboarding: t('nav.onboarding'),
    'skill-matrix': t('nav.skillMatrix'),
    recruiting: t('nav.recruiting'),
    'cv-screener': t('nav.cvScreener'),
    'time-off': role === 'admin' ? t('nav.timeOffAdmin') : t('nav.timeOff'),
    'ai-office': t('nav.aiOffice'),
    performance: t('nav.performance'),
    requests: role === 'admin' ? t('nav.approvals') : t('nav.requests'),
    orgchart: t('nav.orgChart'),
    surveys: role === 'admin' ? t('nav.surveysAdmin') : t('nav.surveys'),
    newsletter: role === 'admin' ? t('nav.newsAdmin') : t('nav.news'),
    events: role === 'admin' ? t('nav.eventsAdmin') : t('nav.events'),
    pricing: isEn ? 'Pricing' : 'Cenník',
  };

  const globalOverlays = (
    <>
      <LanguageSwitcher />
      <ThemeSwitcher onOpenBranding={() => setBrandingOpen(true)} />
      <BrandingStudio isOpen={brandingOpen} onClose={() => setBrandingOpen(false)} />
      <BrandingCTA onLeadCapture={() => setLeadModal({ open: true, module: t('app.customBrandingModule') })} />
      <LeadCaptureModal
        isOpen={leadModal.open}
        module={leadModal.module}
        onClose={() => setLeadModal({ open: false })}
      />
      <DemoDisclaimerModal
        isOpen={demoInfoOpen}
        onClose={() => setDemoInfoOpen(false)}
        onContact={() => {
          setDemoInfoOpen(false);
          setLeadModal({ open: true, module: t('app.consultationModule') });
        }}
      />
    </>
  );

  // Landing & role picker - no sidebar
  if (page === 'landing') {
    return (
      <>
        <LandingPage
          onStart={setPage}
          onOpenBranding={() => setBrandingOpen(true)}
          onOpenDemoInfo={() => setDemoInfoOpen(true)}
        />
        {globalOverlays}
      </>
    );
  }

  if (page === 'role-picker') {
    return (
      <>
        <RolePicker onSelect={handleRoleSelect} />
        {globalOverlays}
      </>
    );
  }

  // Main app with sidebar
  return (
    <div className="flex min-h-screen bg-primary">
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-secondary/95 backdrop-blur border-b border-subtle">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="btn-ghost p-2"
            title="Open menu"
          >
            <Menu size={18} />
          </button>
          <p className="text-sm font-medium truncate px-2">{pageTitleMap[page] ?? t('nav.home')}</p>
          <div className="w-9" />
        </div>
      </header>

      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        role={role === 'admin' ? 'admin' : 'employee'}
        onToggleRole={handleToggleRole}
        onOpenDemoInfo={() => setDemoInfoOpen(true)}
        className="hidden md:flex md:shrink-0"
      />

      {mobileNavOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-50"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50">
            <Sidebar
              currentPage={page}
              onNavigate={setPage}
              role={role === 'admin' ? 'admin' : 'employee'}
              onToggleRole={handleToggleRole}
              onOpenDemoInfo={() => setDemoInfoOpen(true)}
              onNavigateComplete={() => setMobileNavOpen(false)}
            />
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-3 right-3 btn-ghost p-2 bg-secondary border border-subtle"
              title={t('common.close')}
            >
              <X size={16} />
            </button>
          </div>
        </>
      )}

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto pt-20 md:pt-0 p-4 md:p-8">
          {page === 'employee-dashboard' && (
            <EmployeeDashboard onNavigate={setPage} onOpenChat={() => setChatOpen(true)} />
          )}
          {page === 'admin-dashboard' && <AdminDashboard />}
          {page === 'onboarding' && <Onboarding onComplete={() => setPage('employee-dashboard')} />}
          {page === 'skill-matrix' && <SkillMatrix />}
          {page === 'recruiting' && <Recruiting />}
          {page === 'cv-screener' && <CVScreener onLeadCapture={handleLeadCapture} />}
          {page === 'time-off' && <TimeOff onLeadCapture={handleLeadCapture} />}
          {page === 'ai-office' && <AIOffice onLeadCapture={handleLeadCapture} />}
          {page === 'performance' && <Performance onLeadCapture={handleLeadCapture} />}
          {page === 'requests' && <Requests onLeadCapture={handleLeadCapture} />}
          {page === 'orgchart' && <Orgchart onLeadCapture={handleLeadCapture} />}
          {page === 'surveys' && <Surveys onLeadCapture={handleLeadCapture} />}
          {page === 'newsletter' && <Newsletter onLeadCapture={handleLeadCapture} />}
          {page === 'events' && <Events onLeadCapture={handleLeadCapture} />}
          {page === 'pricing' && <Pricing onLeadCapture={handleLeadCapture} />}
        </div>
      </main>

      <AIChatbot isOpen={chatOpen} onClose={() => setChatOpen(!chatOpen)} />
      <OnboardingTour />
      {globalOverlays}
    </div>
  );
}

export default App;

import { useState } from 'react';
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
import { Sidebar } from './components/Sidebar';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { AIChatbot } from './components/AIChatbot';
import { LeadCaptureModal } from './components/LeadCaptureModal';
import { BrandingStudio } from './components/BrandingStudio';
import { BrandingCTA } from './components/BrandingCTA';
import { OnboardingTour } from './components/OnboardingTour';
import { DemoDisclaimerModal } from './components/DemoDisclaimer';
import { useTheme } from './hooks/useTheme';
import { useKonami } from './hooks/useKonami';
import { useBranding } from './hooks/useBranding';
import { fireConfetti } from './lib/utils';
import type { Page, UserRole } from './types';

function App() {
  // initialize theme + branding on mount
  useTheme();
  useBranding();

  const [page, setPage] = useState<Page>('landing');
  const [role, setRole] = useState<UserRole>('both');
  const [chatOpen, setChatOpen] = useState(false);
  const [leadModal, setLeadModal] = useState<{ open: boolean; module?: string }>({ open: false });
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [demoInfoOpen, setDemoInfoOpen] = useState(false);

  // Konami code easter egg
  useKonami(() => {
    fireConfetti();
    setTimeout(() => {
      alert('🎮 Konami code unlocked! \n\nVyhrávaš... môj rešpekt 😄\n\nMimochodom, toto demo postavila AI za pár minút.');
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

  const globalOverlays = (
    <>
      <ThemeSwitcher onOpenBranding={() => setBrandingOpen(true)} />
      <BrandingStudio isOpen={brandingOpen} onClose={() => setBrandingOpen(false)} />
      <BrandingCTA onLeadCapture={() => setLeadModal({ open: true, module: 'Custom Branding (logo + farby)' })} />
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
          setLeadModal({ open: true, module: 'Konzultacia o riesenii na mieru' });
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
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        role={role === 'admin' ? 'admin' : 'employee'}
        onToggleRole={handleToggleRole}
        onOpenDemoInfo={() => setDemoInfoOpen(true)}
      />

      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
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
        </div>
      </main>

      <AIChatbot isOpen={chatOpen} onClose={() => setChatOpen(!chatOpen)} />
      <OnboardingTour />
      {globalOverlays}
    </div>
  );
}

export default App;

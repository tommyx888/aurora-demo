import type { TimeOffEntry, PerformanceReview, CVAnalysis } from '../types';

// ============================================
// TIME-OFF / DOVOLENKY
// ============================================
export const timeOffEntries: TimeOffEntry[] = [
  // May 2026
  { id: 'to-1', employeeId: 'emp-11', startDate: '2026-05-01', endDate: '2026-05-31', type: 'parental', status: 'approved', note: 'Materska dovolenka' },
  { id: 'to-2', employeeId: 'emp-5', startDate: '2026-05-07', endDate: '2026-05-07', type: 'sick', status: 'approved', note: 'Migrena' },
  { id: 'to-3', employeeId: 'emp-8', startDate: '2026-05-12', endDate: '2026-05-16', type: 'vacation', status: 'approved', note: 'Predlzeny vikend' },
  { id: 'to-4', employeeId: 'emp-15', startDate: '2026-05-18', endDate: '2026-05-22', type: 'vacation', status: 'approved' },
  { id: 'to-5', employeeId: 'emp-2', startDate: '2026-05-26', endDate: '2026-05-30', type: 'vacation', status: 'pending', note: 'Rodinny vylet' },
  // June 2026
  { id: 'to-6', employeeId: 'emp-4', startDate: '2026-06-09', endDate: '2026-06-20', type: 'vacation', status: 'approved', note: 'Chorvatsko' },
  { id: 'to-7', employeeId: 'emp-6', startDate: '2026-06-16', endDate: '2026-06-27', type: 'vacation', status: 'approved' },
  { id: 'to-8', employeeId: 'emp-12', startDate: '2026-06-23', endDate: '2026-07-04', type: 'vacation', status: 'approved', note: 'Letny break' },
  { id: 'to-9', employeeId: 'emp-10', startDate: '2026-06-30', endDate: '2026-07-11', type: 'vacation', status: 'pending' },
  // July 2026 - peak season
  { id: 'to-10', employeeId: 'emp-7', startDate: '2026-07-07', endDate: '2026-07-18', type: 'vacation', status: 'approved', note: 'Taliansko' },
  { id: 'to-11', employeeId: 'emp-3', startDate: '2026-07-14', endDate: '2026-07-25', type: 'vacation', status: 'approved' },
  { id: 'to-12', employeeId: 'emp-9', startDate: '2026-07-21', endDate: '2026-08-01', type: 'vacation', status: 'approved' },
  { id: 'to-13', employeeId: 'emp-1', startDate: '2026-07-28', endDate: '2026-08-08', type: 'vacation', status: 'approved', note: 'CEO sa odpojil' },
  { id: 'to-14', employeeId: 'emp-13', startDate: '2026-07-04', endDate: '2026-07-04', type: 'sick', status: 'approved' },
];

// ============================================
// PERFORMANCE REVIEWS
// ============================================
export const performanceReviews: PerformanceReview[] = [
  {
    id: 'pr-1',
    employeeId: 'emp-4',
    reviewerId: 'emp-2',
    period: 'Q2 2026',
    status: 'in-progress',
    scheduledDate: '2026-05-15',
    overallScore: 4.5,
    strengths: ['Technicka excellence v React', 'Mentoring juniorov', 'Dobre zvlada kritiku'],
    improvements: ['Public speaking pri prezentaciach', 'Obcas berie prilis vela prace naraz'],
    goals: [
      { id: 'g1', title: 'Lead frontend rebuild Q2', description: 'Novy design system + migracia 3 modulov', progress: 65, dueDate: '2026-06-30', status: 'on-track' },
      { id: 'g2', title: 'Mentoring 2 juniorov', description: 'Tyzdenne 1:1 s Filipom a Barborou', progress: 80, dueDate: '2026-07-31', status: 'on-track' },
      { id: 'g3', title: 'Conference talk', description: 'Prezentovat na React Summit', progress: 30, dueDate: '2026-09-30', status: 'at-risk' },
    ],
    feedback360: [
      { fromId: 'emp-2', fromRole: 'manager', rating: 5, comment: 'Moj #1 senior. Bez neho by som nezvladol tento kvartal.', anonymous: false },
      { fromId: 'emp-6', fromRole: 'peer', rating: 5, comment: 'Vzdy ochotny pomoct, code reviewy su top.', anonymous: false },
      { fromId: 'emp-14', fromRole: 'peer', rating: 5, comment: 'Najlepsi mentor co som mal.', anonymous: true },
      { fromId: 'emp-10', fromRole: 'peer', rating: 4, comment: 'Skvela spolupraca na deploymentoch.', anonymous: false },
    ],
  },
  {
    id: 'pr-2',
    employeeId: 'emp-5',
    reviewerId: 'emp-7',
    period: 'Q2 2026',
    status: 'scheduled',
    scheduledDate: '2026-05-20',
    goals: [
      { id: 'g4', title: 'Redesign celeho app suite', description: 'Konzistentny design language', progress: 45, dueDate: '2026-08-30', status: 'on-track' },
      { id: 'g5', title: 'Onboard Barbora', description: 'Mentoring novej Junior Designer', progress: 70, dueDate: '2026-06-30', status: 'on-track' },
    ],
  },
  {
    id: 'pr-3',
    employeeId: 'emp-8',
    reviewerId: 'emp-1',
    period: 'Q2 2026',
    status: 'completed',
    scheduledDate: '2026-04-22',
    overallScore: 4.2,
    strengths: ['Tatra Bank deal', 'Timova kultura', 'Strategicke myslenie'],
    improvements: ['Reporting Sprint Excel-y', 'Delegovanie viac na Evu'],
    goals: [
      { id: 'g6', title: 'Q2 Revenue: 2.5M EUR', description: 'Zatvorit 3 deals nad 500k', progress: 100, dueDate: '2026-06-30', status: 'achieved' },
    ],
  },
  {
    id: 'pr-4',
    employeeId: 'emp-14',
    reviewerId: 'emp-2',
    period: 'Q2 2026',
    status: 'scheduled',
    scheduledDate: '2026-05-25',
  },
  {
    id: 'pr-5',
    employeeId: 'emp-10',
    reviewerId: 'emp-2',
    period: 'Q2 2026',
    status: 'in-progress',
    scheduledDate: '2026-05-10',
    goals: [
      { id: 'g7', title: 'AWS migration complete', description: 'Migracia z Hetzner na AWS', progress: 90, dueDate: '2026-05-31', status: 'on-track' },
      { id: 'g8', title: 'CI/CD pipeline rewrite', description: 'GitHub Actions + Terraform', progress: 50, dueDate: '2026-07-15', status: 'on-track' },
    ],
  },
];

// ============================================
// CV SCREENING SAMPLES
// ============================================
export const sampleCVs: { name: string; cv: string; expectedAnalysis: CVAnalysis }[] = [
  {
    name: 'Patrik Sura - Senior React Developer',
    cv: `Patrik Sura
Email: patrik.sura@email.cz | Phone: +421 911 234 567

PROFESSIONAL SUMMARY
Senior React Developer with 7 years of experience.
Open source contributor with 2.5k GitHub stars.

EXPERIENCE
Senior Frontend Engineer | TechCorp Slovakia | 2021-Present
- Lead architect on enterprise SaaS platform (15M users)
- React, TypeScript, Next.js, GraphQL
- Mentored team of 6 developers

Frontend Developer | StartupX | 2018-2021
- Built mobile-first PWA from scratch
- Reduced bundle size by 60%

EDUCATION: M.Sc. CS, FIIT STU Bratislava (2018)

SKILLS: React, TypeScript, Next.js, GraphQL, Node.js, AWS, Docker, Cypress

LANGUAGES: Slovak (native), English (C1), Czech (native)`,
    expectedAnalysis: {
      candidateName: 'Patrik Sura',
      position: 'Senior React Developer',
      matchScore: 92,
      skillMatch: 95,
      experienceMatch: 90,
      cultureMatch: 88,
      extractedSkills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Node.js', 'AWS', 'Docker', 'Cypress'],
      yearsExperience: 7,
      redFlags: [],
      highlights: ['7 rokov React skusenosti', 'Open source 2.5k GitHub stars', 'Mentoring tímu 6 ludi', 'Lead architect na enterprise SaaS'],
      recommendation: 'strong-fit',
      summary: 'Vynikajuci kandidat. 7 rokov React expertizy + leadership + open source. Top 5% kandidatov. Odporucam preskocit screening a ist rovno na technicky pohovor.',
    },
  },
  {
    name: 'Tomas Fischer - DevOps Engineer',
    cv: `Tomas Fischer
DevOps Engineer | tomas.f@protonmail.com

ABOUT: AWS Certified Solutions Architect, 7 years infrastructure.

EXPERIENCE
Senior DevOps Engineer | CloudTech | 2020-Present
- Multi-region AWS architecture for 50M req/day
- Kubernetes (EKS), Terraform IaC
- Reduced cloud costs by 40%

DevOps Engineer | DataCo | 2018-2020
- Migrated legacy monolith to microservices
- CI/CD pipelines (GitLab CI, ArgoCD)

CERTIFICATIONS
- AWS Solutions Architect Professional (2024)
- AWS DevOps Engineer Professional (2023)
- Certified Kubernetes Administrator (CKA)

SKILLS: AWS, Kubernetes, Terraform, Docker, Python, Bash, GitOps, Prometheus

EDUCATION: B.Sc. CS, TU Kosice (2018)`,
    expectedAnalysis: {
      candidateName: 'Tomas Fischer',
      position: 'DevOps Engineer',
      matchScore: 89,
      skillMatch: 94,
      experienceMatch: 88,
      cultureMatch: 85,
      extractedSkills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Python', 'GitOps', 'Prometheus'],
      yearsExperience: 7,
      redFlags: [],
      highlights: ['AWS Solutions Architect Professional certified', '7 rokov skusenosti', 'Reduced cloud costs by 40%', 'CKA certified'],
      recommendation: 'strong-fit',
      summary: 'Senior DevOps s AWS Pro certifikatom a CKA. Doplni Michalov tim. Silny kandidat, odporucam rychlo posunut do offer fazy.',
    },
  },
  {
    name: 'Stefan Husar - Junior Developer',
    cv: `Stefan Husar
stefan.husar@email.sk

EXPERIENCE
Junior Web Developer | LocalAgency | 2024-Present (8 months)
- WordPress sites with custom themes
- Some React work on smaller projects
- jQuery for legacy clients

Internship | TechStartup | 2023 (3 months)
- HTML/CSS landing pages

EDUCATION: B.Sc. Informatics, UCM Trnava (2024)

SKILLS: HTML, CSS, JavaScript, jQuery, WordPress, basic React, basic Git

LANGUAGES: Slovak (native), English (B1)`,
    expectedAnalysis: {
      candidateName: 'Stefan Husar',
      position: 'Senior React Developer',
      matchScore: 32,
      skillMatch: 25,
      experienceMatch: 18,
      cultureMatch: 60,
      extractedSkills: ['HTML', 'CSS', 'JavaScript', 'jQuery', 'WordPress'],
      yearsExperience: 1,
      redFlags: ['Iba 1 rok skusenosti (poziaduje sa 5+)', 'Ziadny TypeScript', 'Iba "basic React"', 'Prevazne WordPress/jQuery (legacy stack)'],
      highlights: ['Cerstvy absolvent', 'Slovak native'],
      recommendation: 'not-fit',
      summary: 'Pre Senior React poziciu nedostatocna seniorita. Skusenosti su prevazne s legacy stack-om. Odporucam zvazit pre Junior poziciu.',
    },
  },
  {
    name: 'Linda Brezovicka - Account Manager',
    cv: `Linda Brezovicka
Sales / Account Management

EXPERIENCE
Account Manager | SaaS Co | 2022-Present (4 years)
- Managed 35 enterprise accounts (2M EUR ARR)
- 92% customer retention rate
- Upsell rate +28% YoY

Junior Sales Rep | TelcoStartup | 2020-2022

SKILLS: B2B Sales, CRM (Salesforce, HubSpot), Negotiation, Customer Success
LANGUAGES: Slovak, English (C2), German (B2)
EDUCATION: M.Sc. Marketing, EU Bratislava`,
    expectedAnalysis: {
      candidateName: 'Linda Brezovicka',
      position: 'Account Manager',
      matchScore: 78,
      skillMatch: 82,
      experienceMatch: 75,
      cultureMatch: 80,
      extractedSkills: ['B2B Sales', 'Salesforce', 'HubSpot', 'Customer Success', 'Negotiation'],
      yearsExperience: 4,
      redFlags: [],
      highlights: ['92% retention rate', '2M EUR ARR portfolio', 'Trojjazycna (SK/EN/DE)', '+28% upsell'],
      recommendation: 'good-fit',
      summary: 'Solidny mid-level Account Manager. 4 roky relevantnej skusenosti, vyborne retention metriky, jazykovo vhodna. Odporucam pozvat na pohovor.',
    },
  },
];

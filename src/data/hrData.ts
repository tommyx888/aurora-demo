import type { TimeOffEntry, PerformanceReview, CVAnalysis } from '../types';

// ============================================
// TIME-OFF
// ============================================
export const timeOffEntries: TimeOffEntry[] = [
  // May 2026
  { id: 'to-1', employeeId: 'emp-11', startDate: '2026-05-01', endDate: '2026-05-31', type: 'parental', status: 'approved', note: 'Parental leave' },
  { id: 'to-2', employeeId: 'emp-5', startDate: '2026-05-07', endDate: '2026-05-07', type: 'sick', status: 'approved', note: 'Migraine' },
  { id: 'to-3', employeeId: 'emp-8', startDate: '2026-05-12', endDate: '2026-05-16', type: 'vacation', status: 'approved', note: 'Extended weekend' },
  { id: 'to-4', employeeId: 'emp-15', startDate: '2026-05-18', endDate: '2026-05-22', type: 'vacation', status: 'approved' },
  { id: 'to-5', employeeId: 'emp-2', startDate: '2026-05-26', endDate: '2026-05-30', type: 'vacation', status: 'pending', note: 'Family trip' },
  // June 2026
  { id: 'to-6', employeeId: 'emp-4', startDate: '2026-06-09', endDate: '2026-06-20', type: 'vacation', status: 'approved', note: 'Croatia' },
  { id: 'to-7', employeeId: 'emp-6', startDate: '2026-06-16', endDate: '2026-06-27', type: 'vacation', status: 'approved' },
  { id: 'to-8', employeeId: 'emp-12', startDate: '2026-06-23', endDate: '2026-07-04', type: 'vacation', status: 'approved', note: 'Summer break' },
  { id: 'to-9', employeeId: 'emp-10', startDate: '2026-06-30', endDate: '2026-07-11', type: 'vacation', status: 'pending' },
  // July 2026 - peak season
  { id: 'to-10', employeeId: 'emp-7', startDate: '2026-07-07', endDate: '2026-07-18', type: 'vacation', status: 'approved', note: 'Italy' },
  { id: 'to-11', employeeId: 'emp-3', startDate: '2026-07-14', endDate: '2026-07-25', type: 'vacation', status: 'approved' },
  { id: 'to-12', employeeId: 'emp-9', startDate: '2026-07-21', endDate: '2026-08-01', type: 'vacation', status: 'approved' },
  { id: 'to-13', employeeId: 'emp-1', startDate: '2026-07-28', endDate: '2026-08-08', type: 'vacation', status: 'approved', note: 'CEO offline' },
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
    strengths: ['Technical excellence in React', 'Mentoring juniors', 'Handles feedback well'],
    improvements: ['Public speaking during presentations', 'Sometimes takes too much work at once'],
    goals: [
      { id: 'g1', title: 'Lead frontend rebuild Q2', description: 'New design system + migration of 3 modules', progress: 65, dueDate: '2026-06-30', status: 'on-track' },
      { id: 'g2', title: 'Mentor 2 juniors', description: 'Weekly 1:1 with Filip and Barbora', progress: 80, dueDate: '2026-07-31', status: 'on-track' },
      { id: 'g3', title: 'Conference talk', description: 'Present at React Summit', progress: 30, dueDate: '2026-09-30', status: 'at-risk' },
    ],
    feedback360: [
      { fromId: 'emp-2', fromRole: 'manager', rating: 5, comment: 'My #1 senior. I would not handle this quarter without him.', anonymous: false },
      { fromId: 'emp-6', fromRole: 'peer', rating: 5, comment: 'Always willing to help, top-quality code reviews.', anonymous: false },
      { fromId: 'emp-14', fromRole: 'peer', rating: 5, comment: 'Best mentor I have had.', anonymous: true },
      { fromId: 'emp-10', fromRole: 'peer', rating: 4, comment: 'Great collaboration on deployments.', anonymous: false },
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
      { id: 'g4', title: 'Redesign whole app suite', description: 'Consistent design language', progress: 45, dueDate: '2026-08-30', status: 'on-track' },
      { id: 'g5', title: 'Onboard Barbora', description: 'Mentoring new Junior Designer', progress: 70, dueDate: '2026-06-30', status: 'on-track' },
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
    strengths: ['Tatra Bank deal', 'Team culture', 'Strategic thinking'],
    improvements: ['Sprint reporting in spreadsheets', 'Delegate more to Eva'],
    goals: [
      { id: 'g6', title: 'Q2 Revenue: 2.5M EUR', description: 'Close 3 deals above 500k', progress: 100, dueDate: '2026-06-30', status: 'achieved' },
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
      { id: 'g7', title: 'AWS migration complete', description: 'Migration from Hetzner to AWS', progress: 90, dueDate: '2026-05-31', status: 'on-track' },
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
      highlights: ['7 years of React experience', 'Open source 2.5k GitHub stars', 'Mentored team of 6 people', 'Lead architect on enterprise SaaS'],
      recommendation: 'strong-fit',
      summary: 'Excellent candidate. 7 years of React expertise + leadership + open source. Top 5% candidate. Recommend skipping screening and moving straight to technical interview.',
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
      highlights: ['AWS Solutions Architect Professional certified', '7 years of experience', 'Reduced cloud costs by 40%', 'CKA certified'],
      recommendation: 'strong-fit',
      summary: 'Senior DevOps with AWS Pro certification and CKA. Great addition to Michal team. Strong candidate, recommend fast-tracking to offer stage.',
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
      redFlags: ['Only 1 year of experience (role requires 5+)', 'No TypeScript', 'Only "basic React"', 'Mostly WordPress/jQuery (legacy stack)'],
      highlights: ['Recent graduate', 'Slovak native'],
      recommendation: 'not-fit',
      summary: 'Insufficient seniority for Senior React role. Experience is mostly with legacy stack. Recommend considering for a junior position.',
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
      highlights: ['92% retention rate', '2M EUR ARR portfolio', 'Trilingual (SK/EN/DE)', '+28% upsell'],
      recommendation: 'good-fit',
      summary: 'Solid mid-level Account Manager. 4 years of relevant experience, excellent retention metrics, strong language fit. Recommend inviting to interview.',
    },
  },
];

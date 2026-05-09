import type { Request, NewsItem, Event, Survey, OnboardingStep } from '../types';

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

// ============================================
// REQUESTS
// ============================================
export const requests: Request[] = [
  {
    id: 'r-1',
    type: 'leave',
    title: 'Vacation 15-22 Jul 2026',
    requester: 'Peter Novák',
    requesterAvatar: avatar('peter-n'),
    date: '2026-05-06',
    status: 'pending',
    description: '7 days of summer vacation. Croatia with family 🏖️',
  },
  {
    id: 'r-2',
    type: 'equipment',
    title: 'MacBook Pro M4 16"',
    requester: 'Tomáš Polák',
    requesterAvatar: avatar('tomas-p'),
    date: '2026-05-04',
    status: 'pending',
    description: 'Current laptop is slowing me down, I need a stronger one for AI work',
    amount: 3200,
  },
  {
    id: 'r-3',
    type: 'training',
    title: 'AWS Certified Solutions Architect',
    requester: 'Michal Krajčí',
    requesterAvatar: avatar('michal-k'),
    date: '2026-05-03',
    status: 'approved',
    description: 'Online course + exam, strengthens our cloud capability',
    amount: 450,
  },
  {
    id: 'r-4',
    type: 'travel',
    title: 'React Conference Berlin',
    requester: 'Martin Baláž',
    requesterAvatar: avatar('martin-b'),
    date: '2026-05-02',
    status: 'pending',
    description: 'Two-day conference, I want to network with the European community',
    amount: 890,
  },
  {
    id: 'r-5',
    type: 'leave',
    title: 'Sick day - 7.5.',
    requester: 'Lucia Štefánková',
    requesterAvatar: avatar('lucia-s'),
    date: '2026-05-07',
    status: 'approved',
    description: 'Migraine 🤕',
  },
  {
    id: 'r-6',
    type: 'equipment',
    title: '4K monitor for design team',
    requester: 'Lucia Štefánková',
    requesterAvatar: avatar('lucia-s'),
    date: '2026-04-29',
    status: 'rejected',
    description: 'LG 32" UltraFine for more accurate color matching',
    amount: 1100,
  },
  {
    id: 'r-7',
    type: 'other',
    title: 'Home office Fridays',
    requester: 'Adam Hornák',
    requesterAvatar: avatar('adam-h'),
    date: '2026-05-05',
    status: 'pending',
    description: 'Work from home every Friday permanently',
  },
];

// ============================================
// NEWS
// ============================================
export const news: NewsItem[] = [
  {
    id: 'n-1',
    title: '🎉 Aurora closed the biggest deal in company history!',
    excerpt: 'After three months of negotiations, we signed a 2.4M EUR contract with Tatra Bank. Huge thanks to the whole Sales team — Jakub, Eva, Mária, you are stars!',
    author: 'Mária Kováčová',
    date: '2026-05-06',
    category: 'Milestones',
    emoji: '🎉',
    reactions: [
      { emoji: '🎉', count: 24 },
      { emoji: '🚀', count: 18 },
      { emoji: '👏', count: 15 },
      { emoji: '❤️', count: 12 },
    ],
  },
  {
    id: 'n-2',
    title: '☕ New coffee machine in the kitchen!',
    excerpt: 'We finally decided — we now have La Marzocco. Yes, the same one used by "Friends Coffee" in Bratislava. Barista skills workshop is on Wednesday at 14:00.',
    author: 'Simona Šimončičová',
    date: '2026-05-05',
    category: 'Office Life',
    emoji: '☕',
    reactions: [
      { emoji: '☕', count: 32 },
      { emoji: '😍', count: 19 },
      { emoji: '🔥', count: 14 },
    ],
  },
  {
    id: 'n-3',
    title: '🤖 AI Hackathon - registration is open!',
    excerpt: 'We are preparing our first internal 24h AI hackathon. Teams of 3-4 people, topic: "How AI improves our company." The winning project gets a 2000 EUR implementation budget.',
    author: 'Peter Novák',
    date: '2026-05-04',
    category: 'Events',
    emoji: '🤖',
    reactions: [
      { emoji: '🤖', count: 28 },
      { emoji: '🚀', count: 22 },
      { emoji: '💡', count: 16 },
    ],
  },
  {
    id: 'n-4',
    title: '🌱 Update: Wellness program',
    excerpt: 'Multisport cards for everyone, monthly office massages, and company-covered BetterHelp therapy from June. Your health is our priority.',
    author: 'Janka Horváthová',
    date: '2026-05-02',
    category: 'Benefits',
    emoji: '🌱',
    reactions: [
      { emoji: '❤️', count: 41 },
      { emoji: '🙏', count: 27 },
      { emoji: '💪', count: 18 },
    ],
  },
  {
    id: 'n-5',
    title: '📊 Q1 results: we beat target by 12%',
    excerpt: 'Revenue: 4.2M EUR (target: 3.75M). Best quarter in company history. Details at Monday All-Hands. 🎯',
    author: 'Mária Kováčová',
    date: '2026-04-30',
    category: 'Business',
    emoji: '📊',
    reactions: [
      { emoji: '🎯', count: 35 },
      { emoji: '🚀', count: 29 },
      { emoji: '👏', count: 24 },
    ],
  },
];

// ============================================
// EVENTS
// ============================================
export const events: Event[] = [
  // Birthdays this/next month
  { id: 'e-1', title: '🎂 Lucia Štefánková', date: '2026-07-22', type: 'birthday', description: '33rd birthday' },
  { id: 'e-2', title: '🎂 Mária Kováčová', date: '2026-05-12', type: 'birthday', description: '44th birthday - CEO 👑' },
  { id: 'e-3', title: '🎂 Tomáš Polák', date: '2026-03-18', type: 'birthday', description: '35th birthday' },

  // Anniversaries
  { id: 'e-4', title: '🎊 5 years at Aurora', date: '2026-06-15', type: 'anniversary', description: 'Peter Novák celebrates his 5th anniversary!' },
  { id: 'e-5', title: '🎊 1 year at Aurora', date: '2026-05-15', type: 'anniversary', description: 'Andrea Mikušová celebrates her first anniversary' },

  // Company events
  { id: 'e-6', title: '🏃 Devin Run', date: '2026-05-25', type: 'company', description: 'Traditional company run - the whole company joins!' },
  { id: 'e-7', title: '🤖 AI Hackathon', date: '2026-06-08', type: 'company', description: '24h hackathon, registration open' },
  { id: 'e-8', title: '🍻 Friday Beers', date: '2026-05-09', type: 'company', description: 'Weekly tradition - kitchen, 17:00' },
  { id: 'e-9', title: '☀️ Summer teambuilding', date: '2026-07-12', type: 'company', description: 'Low Tatras, 3-day teambuilding' },

  // Holidays
  { id: 'e-10', title: '🇸🇰 Labour Day', date: '2026-05-01', type: 'holiday', description: 'Public holiday' },
  { id: 'e-11', title: '🕊️ Cyril and Methodius Day', date: '2026-07-05', type: 'holiday', description: 'Public holiday' },

  // Meetings
  { id: 'e-12', title: '📊 All-Hands Meeting', date: '2026-05-12', type: 'meeting', description: 'Monthly update, 10:00' },
  { id: 'e-13', title: '🎯 OKR Planning Q3', date: '2026-06-25', type: 'meeting', description: 'Defining goals for next quarter' },
];

// ============================================
// SURVEYS / PULSE
// ============================================
export const surveys: Survey[] = [
  {
    id: 's-1',
    title: 'Weekly Pulse Check',
    question: 'How are you feeling this week?',
    type: 'pulse',
    responses: 13,
    total: 15,
    averageScore: 4.2,
    date: '2026-05-05',
  },
  {
    id: 's-2',
    title: 'eNPS Q2 2026',
    question: 'On a 0-10 scale, how likely are you to recommend Aurora as a place to work?',
    type: 'enps',
    responses: 14,
    total: 15,
    averageScore: 8.4,
    date: '2026-04-15',
  },
  {
    id: 's-3',
    title: 'Office Setup Feedback',
    question: 'How satisfied are you with the new office layout?',
    type: 'feedback',
    responses: 11,
    total: 15,
    averageScore: 4.5,
    date: '2026-04-28',
  },
];

// ============================================
// ONBOARDING STEPS
// ============================================
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to Aurora! 👋',
    description: 'A quick intro from Eva, your AI buddy',
    type: 'welcome',
    completed: false,
    duration: '2 min',
  },
  {
    id: 2,
    title: 'Profile & basics',
    description: 'Fill in basic details and upload a photo',
    type: 'profile',
    completed: false,
    duration: '5 min',
  },
  {
    id: 3,
    title: 'Your team',
    description: 'Meet your colleagues and manager',
    type: 'team',
    completed: false,
    duration: '3 min',
  },
  {
    id: 4,
    title: 'Your tools',
    description: 'Slack, Notion, GitHub - access and tutorials',
    type: 'tools',
    completed: false,
    duration: '8 min',
  },
  {
    id: 5,
    title: 'Mandatory training',
    description: 'GDPR, workplace safety, Code of Conduct',
    type: 'training',
    completed: false,
    duration: '15 min',
  },
  {
    id: 6,
    title: 'Done! 🎉',
    description: 'You are ready to go!',
    type: 'complete',
    completed: false,
    duration: '1 min',
  },
];

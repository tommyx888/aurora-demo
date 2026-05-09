import type { Request, NewsItem, Event, Survey, OnboardingStep } from '../types';

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

// ============================================
// REQUESTS / ŽIADANKY
// ============================================
export const requests: Request[] = [
  {
    id: 'r-1',
    type: 'leave',
    title: 'Dovolenka 15.-22.7.2026',
    requester: 'Peter Novák',
    requesterAvatar: avatar('peter-n'),
    date: '2026-05-06',
    status: 'pending',
    description: '7 dní letnej dovolenky. Chorvátsko s rodinou 🏖️',
  },
  {
    id: 'r-2',
    type: 'equipment',
    title: 'MacBook Pro M4 16"',
    requester: 'Tomáš Polák',
    requesterAvatar: avatar('tomas-p'),
    date: '2026-05-04',
    status: 'pending',
    description: 'Aktuálny notebook spomaluje, potrebujem výkonnejší pre AI prácu',
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
    description: 'Online kurz + skúška, posilní naše cloud capability',
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
    description: 'Dvojdňová konferencia, chcem networking s európskou komunitou',
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
    description: 'Migréna 🤕',
  },
  {
    id: 'r-6',
    type: 'equipment',
    title: '4K monitor pre design tím',
    requester: 'Lucia Štefánková',
    requesterAvatar: avatar('lucia-s'),
    date: '2026-04-29',
    status: 'rejected',
    description: 'LG 32" UltraFine pre presnejšie color matching',
    amount: 1100,
  },
  {
    id: 'r-7',
    type: 'other',
    title: 'Home office Piatky',
    requester: 'Adam Hornák',
    requesterAvatar: avatar('adam-h'),
    date: '2026-05-05',
    status: 'pending',
    description: 'Trvale pracovať z domu každý piatok',
  },
];

// ============================================
// NEWS / FIREMNÝ NEWSLETTER
// ============================================
export const news: NewsItem[] = [
  {
    id: 'n-1',
    title: '🎉 Aurora zatvorila najväčší deal v histórii!',
    excerpt: 'Po troch mesiacoch rokovaní sme podpísali kontrakt s Tatra Bank na 2.4M EUR. Special díky celému Sales tímu — Jakub, Eva, Mária, ste hviezdy!',
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
    title: '☕ Nový kávovar v kuchynke!',
    excerpt: 'Konečne sme sa rozhodli — máme La Marzocco. Áno, ten istý čo používa "Friends Coffee" v Bratislave. Workshop barista zručností bude v stredu o 14:00.',
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
    title: '🤖 AI Hackaton - registrácia otvorená!',
    excerpt: 'Pripravujeme náš prvý interný 24h AI hackaton. Tímy 3-4 ľudí, téma: "Ako AI zlepší našu firmu?". Víťazný projekt dostane 2000€ rozpočet na realizáciu.',
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
    excerpt: 'Multisport karty pre všetkých, mesačné masáže v office, a od júna BetterHelp psychoterapia preplácaná firmou. Tvoje zdravie = naša priorita.',
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
    title: '📊 Q1 výsledky: predbehli sme target o 12%',
    excerpt: 'Revenue: 4.2M EUR (target: 3.75M). Najlepší Q v histórii firmy. Detaily v Pondelňajšom All-Hands. 🎯',
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
// EVENTS / KALENDÁR
// ============================================
export const events: Event[] = [
  // Birthdays this/next month
  { id: 'e-1', title: '🎂 Lucia Štefánková', date: '2026-07-22', type: 'birthday', description: '33 narodeniny' },
  { id: 'e-2', title: '🎂 Mária Kováčová', date: '2026-05-12', type: 'birthday', description: '44 narodeniny - CEO 👑' },
  { id: 'e-3', title: '🎂 Tomáš Polák', date: '2026-03-18', type: 'birthday', description: '35 narodeniny' },

  // Anniversaries
  { id: 'e-4', title: '🎊 5 rokov v Aurora', date: '2026-06-15', type: 'anniversary', description: 'Peter Novák oslavuje 5-té výročie!' },
  { id: 'e-5', title: '🎊 1 rok v Aurora', date: '2026-05-15', type: 'anniversary', description: 'Andrea Mikušová oslavuje prvé výročie' },

  // Company events
  { id: 'e-6', title: '🏃 Devín Run', date: '2026-05-25', type: 'company', description: 'Tradičný firemný beh - ide celá firma!' },
  { id: 'e-7', title: '🤖 AI Hackaton', date: '2026-06-08', type: 'company', description: '24h hackaton, registrácia otvorená' },
  { id: 'e-8', title: '🍻 Friday Beers', date: '2026-05-09', type: 'company', description: 'Týždenná tradícia - kuchyňa, 17:00' },
  { id: 'e-9', title: '☀️ Letný teambuilding', date: '2026-07-12', type: 'company', description: 'Nízke Tatry, 3-dňový teambuilding' },

  // Holidays
  { id: 'e-10', title: '🇸🇰 Sviatok práce', date: '2026-05-01', type: 'holiday', description: 'Štátny sviatok' },
  { id: 'e-11', title: '🕊️ Konstantín a Metod', date: '2026-07-05', type: 'holiday', description: 'Štátny sviatok' },

  // Meetings
  { id: 'e-12', title: '📊 All-Hands Meeting', date: '2026-05-12', type: 'meeting', description: 'Mesačný update, 10:00' },
  { id: 'e-13', title: '🎯 OKR Planning Q3', date: '2026-06-25', type: 'meeting', description: 'Definujeme ciele na ďalší kvartál' },
];

// ============================================
// SURVEYS / PULSE
// ============================================
export const surveys: Survey[] = [
  {
    id: 's-1',
    title: 'Týždenný Pulse Check',
    question: 'Ako sa cítiš tento týždeň?',
    type: 'pulse',
    responses: 13,
    total: 15,
    averageScore: 4.2,
    date: '2026-05-05',
  },
  {
    id: 's-2',
    title: 'eNPS Q2 2026',
    question: 'Na škále 0-10, akú pravdepodobnosťou by si odporučil/a Aurora ako miesto pre prácu?',
    type: 'enps',
    responses: 14,
    total: 15,
    averageScore: 8.4,
    date: '2026-04-15',
  },
  {
    id: 's-3',
    title: 'Office Setup Spätná väzba',
    question: 'Ako spokojnosť s novým layoutom kancelárie?',
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
    title: 'Vitaj v Aurora! 👋',
    description: 'Krátky úvod od Evy, tvojho AI buddy',
    type: 'welcome',
    completed: false,
    duration: '2 min',
  },
  {
    id: 2,
    title: 'Profil & základné info',
    description: 'Vyplň základné údaje, nahraj fotku',
    type: 'profile',
    completed: false,
    duration: '5 min',
  },
  {
    id: 3,
    title: 'Tvoj tím',
    description: 'Spoznaj kolegov a manažéra',
    type: 'team',
    completed: false,
    duration: '3 min',
  },
  {
    id: 4,
    title: 'Tvoje nástroje',
    description: 'Slack, Notion, GitHub - prístupy a tutoriály',
    type: 'tools',
    completed: false,
    duration: '8 min',
  },
  {
    id: 5,
    title: 'Povinné školenia',
    description: 'GDPR, Bezpečnosť práce, Code of Conduct',
    type: 'training',
    completed: false,
    duration: '15 min',
  },
  {
    id: 6,
    title: 'Hotovo! 🎉',
    description: 'Si pripravený, nech ti to ide!',
    type: 'complete',
    completed: false,
    duration: '1 min',
  },
];

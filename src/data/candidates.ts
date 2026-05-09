import type { Candidate } from '../types';

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffd5dc,c0aede,b6e3f4,d1d4f9,ffdfbf`;

export const candidates: Candidate[] = [
  // APPLIED
  {
    id: 'c-1',
    name: 'Roman Bednár',
    email: 'roman.bednar@gmail.com',
    position: 'Senior React Developer',
    stage: 'applied',
    appliedDate: '2026-05-04',
    source: 'LinkedIn',
    rating: 0,
    notes: 'Profil vyzerá zaujímavo, 5 rokov skúseností',
    avatar: avatar('roman-b'),
  },
  {
    id: 'c-2',
    name: 'Katarína Lehotská',
    email: 'k.lehotska@protonmail.com',
    position: 'UX Designer',
    stage: 'applied',
    appliedDate: '2026-05-05',
    source: 'Referral - Lucia Š.',
    rating: 4,
    notes: 'Odporúčaná Luciou, silné portfólio',
    avatar: avatar('katarina-l'),
  },
  {
    id: 'c-3',
    name: 'Jozef Mokrý',
    email: 'jozef.mokry@email.sk',
    position: 'Senior React Developer',
    stage: 'applied',
    appliedDate: '2026-05-06',
    source: 'Profesia.sk',
    rating: 0,
    notes: '',
    avatar: avatar('jozef-m'),
  },

  // SCREENING
  {
    id: 'c-4',
    name: 'Veronika Halászová',
    email: 'v.halaszova@gmail.com',
    position: 'Marketing Specialist',
    stage: 'screening',
    appliedDate: '2026-05-01',
    source: 'LinkedIn',
    rating: 4,
    notes: 'Telefonický rozhovor naplánovaný na 8.5.',
    avatar: avatar('veronika-h'),
  },
  {
    id: 'c-5',
    name: 'Patrik Sůra',
    email: 'patrik.sura@email.cz',
    position: 'Senior React Developer',
    stage: 'screening',
    appliedDate: '2026-04-28',
    source: 'GitHub',
    rating: 5,
    notes: 'Veľmi silný kandidát, open source contributions',
    avatar: avatar('patrik-s'),
  },

  // INTERVIEW
  {
    id: 'c-6',
    name: 'Linda Brezovická',
    email: 'linda.b@gmail.com',
    position: 'Account Manager',
    stage: 'interview',
    appliedDate: '2026-04-22',
    source: 'Profesia.sk',
    rating: 4,
    notes: 'Druhé kolo - technický pohovor 10.5.',
    avatar: avatar('linda-b'),
  },
  {
    id: 'c-7',
    name: 'Tomáš Fischer',
    email: 'tomas.f@protonmail.com',
    position: 'DevOps Engineer',
    stage: 'interview',
    appliedDate: '2026-04-25',
    source: 'LinkedIn',
    rating: 5,
    notes: 'Fenomenálny kandidát, AWS certified, 7 rokov skúseností',
    avatar: avatar('tomas-f'),
  },

  // OFFER
  {
    id: 'c-8',
    name: 'Magdaléna Pavlová',
    email: 'magdalena.p@gmail.com',
    position: 'Junior Developer',
    stage: 'offer',
    appliedDate: '2026-04-15',
    source: 'University Career Fair',
    rating: 4,
    notes: 'Ponuka odoslaná 5.5., čakáme odpoveď do 12.5.',
    avatar: avatar('magdalena-p'),
  },

  // HIRED
  {
    id: 'c-9',
    name: 'Marek Sokol',
    email: 'marek.sokol@gmail.com',
    position: 'Backend Developer',
    stage: 'hired',
    appliedDate: '2026-03-12',
    source: 'Referral',
    rating: 5,
    notes: 'Nastupuje 1.6.2026',
    avatar: avatar('marek-sokol'),
  },

  // REJECTED
  {
    id: 'c-10',
    name: 'Štefan Husár',
    email: 'stefan.husar@email.sk',
    position: 'Senior React Developer',
    stage: 'rejected',
    appliedDate: '2026-04-10',
    source: 'Profesia.sk',
    rating: 2,
    notes: 'Nevyhovel technickým požiadavkám',
    avatar: avatar('stefan-h'),
  },
];

export const openPositions = [
  { title: 'Senior React Developer', department: 'IT', applicants: 23, daysOpen: 18 },
  { title: 'UX Designer', department: 'Marketing', applicants: 14, daysOpen: 12 },
  { title: 'Account Manager', department: 'Sales', applicants: 8, daysOpen: 25 },
  { title: 'DevOps Engineer', department: 'IT', applicants: 11, daysOpen: 7 },
  { title: 'Marketing Specialist', department: 'Marketing', applicants: 19, daysOpen: 14 },
];

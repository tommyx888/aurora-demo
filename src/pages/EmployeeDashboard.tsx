import { motion } from 'framer-motion';
import {
  Sparkles, Calendar, Newspaper, FileText, MessageSquare,
  ArrowRight, Cake, Trophy, Coffee, Heart, Bot
} from 'lucide-react';
import { news, events } from '../data/content';
import { employees } from '../data/employees';
import { useLanguage } from '../hooks/useLanguage';
import { daysUntil, formatDate, getAge } from '../lib/utils';
import type { Page } from '../types';

interface EmployeeDashboardProps {
  onNavigate: (page: Page) => void;
  onOpenChat: () => void;
}

export function EmployeeDashboard({ onNavigate, onOpenChat }: EmployeeDashboardProps) {
  const { lang, t } = useLanguage();
  const isEn = lang === 'en';
  const upcomingBirthdays = employees
    .map((e) => {
      const bday = new Date(e.birthday);
      const now = new Date();
      bday.setFullYear(now.getFullYear());
      if (bday < now) bday.setFullYear(now.getFullYear() + 1);
      return { ...e, daysUntil: Math.ceil((bday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 4);

  const upcomingEvents = events
    .map((e) => ({ ...e, days: daysUntil(e.date) }))
    .filter((e) => e.days >= 0 && e.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const localizedNews = news.map((item) => {
    if (lang === 'en') return item;
    const categoryMap: Record<string, string> = {
      Milestones: t('newsletterContent.milestone'),
      'Office Life': t('newsletterContent.officeLife'),
      Events: t('newsletterContent.events'),
      Benefits: t('newsletterContent.benefits'),
      Business: t('newsletterContent.business'),
    };
    const byId: Record<string, { title: string; excerpt: string }> = {
      'n-1': { title: t('newsletterContent.n1Title'), excerpt: t('newsletterContent.n1Excerpt') },
      'n-2': { title: t('newsletterContent.n2Title'), excerpt: t('newsletterContent.n2Excerpt') },
      'n-3': { title: t('newsletterContent.n3Title'), excerpt: t('newsletterContent.n3Excerpt') },
      'n-4': { title: t('newsletterContent.n4Title'), excerpt: t('newsletterContent.n4Excerpt') },
      'n-5': { title: t('newsletterContent.n5Title'), excerpt: t('newsletterContent.n5Excerpt') },
    };
    return {
      ...item,
      title: byId[item.id]?.title ?? item.title,
      excerpt: byId[item.id]?.excerpt ?? item.excerpt,
      category: categoryMap[item.category] ?? item.category,
    };
  });

  const latestNews = localizedNews.slice(0, 3);

  return (
    <div className="page-enter space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 mesh-bg border border-subtle"
      >
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-10">
          ☕
        </div>
        <div className="relative">
          <p className="text-sm uppercase tracking-wider text-tertiary mb-2">
            {new Date().toLocaleDateString(isEn ? 'en-US' : 'sk-SK', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display text-4xl mb-2">{isEn ? 'Good morning, Demo! 👋' : 'Dobré ráno, Demo! 👋'}</h1>
          <p className="text-secondary mb-6 max-w-lg">
            {isEn ? (
              <>You have <strong>3 new tasks</strong>, <strong>1 approval</strong>, and a 2:00 PM meeting with Peter. Coffee is waiting in the kitchen 🤤</>
            ) : (
              <>Máš <strong>3 nové úlohy</strong>, <strong>1 schvaľovanie</strong> a o 14:00 stretnutie s Petrom. Káva v kuchyni voňia 🤤</>
            )}
          </p>

          <div className="flex gap-3 flex-wrap">
            <button onClick={() => onNavigate('onboarding')} className="btn-primary">
              <Sparkles size={16} />
              {isEn ? 'Continue onboarding' : 'Pokračovať v onboardingu'}
              <span className="badge bg-white/20 text-white ml-1">3/6</span>
            </button>
            <button onClick={onOpenChat} className="btn-secondary">
              <Bot size={16} />
              {isEn ? 'Ask Eva' : 'Spýtať sa Evy'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat icon={Trophy} label={isEn ? 'Your score' : 'Tvoje skóre'} value="847" change={isEn ? '+12 today' : '+12 dnes'} color="#f59e0b" />
        <QuickStat icon={Heart} label="Pulse" value="4.5/5" change={isEn ? 'Last week' : 'Posledný týždeň'} color="#ec4899" />
        <QuickStat icon={Coffee} label={isEn ? 'Coffee count' : 'Koľko káv'} value="143" change={isEn ? 'This year' : 'Tento rok'} color="#8b5cf6" />
        <QuickStat icon={Calendar} label={isEn ? 'Vacation' : 'Dovolenka'} value="18 / 25" change={isEn ? 'Days left' : 'Dní zostáva'} color="#10b981" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Newsletter */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper size={18} className="text-tertiary" />
              <h2 className="font-medium">{isEn ? 'Company News' : 'Firemné správy'}</h2>
              <span className="badge badge-danger text-[10px]">{news.length} NEW</span>
            </div>
            <button onClick={() => onNavigate('newsletter')} className="text-xs accent-text font-medium hover:underline">
              {isEn ? 'All →' : 'Všetky →'}
            </button>
          </div>

          <div className="space-y-3">
            {latestNews.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="p-3 rounded-lg hover:bg-tertiary transition-colors cursor-pointer flex gap-3"
              >
                <div className="text-3xl">{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm mb-1 truncate">{item.title}</p>
                  <p className="text-xs text-tertiary mb-2 line-clamp-2">{item.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-tertiary">
                    <span>{item.author}</span>
                    <span>·</span>
                    <span>{formatDate(item.date)}</span>
                    <span>·</span>
                    <span className="flex gap-1">
                      {item.reactions.slice(0, 3).map((r) => (
                        <span key={r.emoji}>{r.emoji}{r.count}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Birthdays */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Cake size={18} className="text-tertiary" />
            <h2 className="font-medium">{isEn ? 'Birthdays' : 'Narodeniny'}</h2>
          </div>

          <div className="space-y-3">
            {upcomingBirthdays.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-xs text-tertiary">
                    {emp.daysUntil === 0
                      ? (isEn ? '🎉 Today!' : '🎉 Dnes!')
                      : (isEn
                        ? `In ${emp.daysUntil} ${emp.daysUntil === 1 ? 'day' : 'days'}`
                        : `Za ${emp.daysUntil} ${emp.daysUntil === 1 ? 'deň' : emp.daysUntil < 5 ? 'dni' : 'dní'}`)}
                    {isEn ? ' · turning ' : ' · bude mať '}{getAge(emp.birthday) + (emp.daysUntil > 0 ? 1 : 0)}
                  </p>
                </div>
                {emp.daysUntil <= 7 && (
                  <button className="text-xs accent-text font-medium hover:underline">
                    {isEn ? 'AI wish' : 'AI prianie'}
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-subtle">
            <p className="text-xs text-tertiary leading-relaxed">
              {isEn
                ? '💡 Tip: AI can write a personalized birthday wish in 5 seconds based on what the company knows about that teammate.'
                : '💡 Tip: AI vie napísať personalizované prianie za 5 sekúnd, založené na tom, čo o danom kolegovi vie firma.'}
            </p>
          </div>
        </div>

        {/* Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-tertiary" />
              <h2 className="font-medium">{isEn ? 'Upcoming events' : 'Najbližšie udalosti'}</h2>
            </div>
            <button onClick={() => onNavigate('events')} className="text-xs accent-text font-medium hover:underline">
              {isEn ? 'Calendar →' : 'Kalendár →'}
            </button>
          </div>

          <div className="space-y-2">
            {upcomingEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-tertiary transition-colors"
              >
                <div className="w-12 text-center">
                  <p className="font-display text-2xl leading-none">{new Date(ev.date).getDate()}</p>
                  <p className="text-[10px] uppercase text-tertiary">
                    {new Date(ev.date).toLocaleString(isEn ? 'en-US' : 'sk-SK', { month: 'short' })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.title}</p>
                  <p className="text-xs text-tertiary truncate">{ev.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 card">
          <h2 className="font-medium mb-4">{isEn ? 'Quick actions' : 'Rýchle akcie'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickAction
              icon={FileText}
              label={isEn ? 'New request' : 'Nová žiadanka'}
              hint={isEn ? 'Vacation, equipment...' : 'Dovolenka, equipment...'}
              onClick={() => onNavigate('requests')}
            />
            <QuickAction
              icon={MessageSquare}
              label="Pulse Survey"
              hint={isEn ? '2 min · optional' : '2 min · voliteľné'}
              onClick={() => onNavigate('surveys')}
            />
            <QuickAction
              icon={Bot}
              label={isEn ? 'Ask Eva' : 'Spýtaj sa Evy'}
              hint="AI buddy"
              onClick={onOpenChat}
            />
            <QuickAction
              icon={ArrowRight}
              label="Org Chart"
              hint={isEn ? 'Meet teammates' : 'Spoznaj kolegov'}
              onClick={() => onNavigate('orgchart')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, change, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: color + '20', color }}
        >
          <Icon size={16} />
        </div>
      </div>
      <p className="font-display text-2xl mb-0.5">{value}</p>
      <p className="text-xs text-tertiary">{label}</p>
      <p className="text-[11px] mt-1" style={{ color }}>{change}</p>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, hint, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="card card-hover text-left p-4 flex flex-col gap-2"
    >
      <Icon size={18} className="accent-text" />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-tertiary">{hint}</p>
      </div>
    </button>
  );
}

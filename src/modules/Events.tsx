import { motion } from 'framer-motion';
import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Cake, Users, MapPin, Sparkles, Plus } from 'lucide-react';
import { events } from '../data/content';
import { employees } from '../data/employees';
import { useLanguage } from '../hooks/useLanguage';
import { LeadCTA } from './Requests';
import { formatDate, daysUntil, getAge, cn } from '../lib/utils';

interface EventsProps {
  onLeadCapture: (module: string) => void;
}

const typeConfig = {
  birthday: { color: '#ec4899', label: 'Narodeniny', icon: '🎂' },
  anniversary: { color: '#8b5cf6', label: 'Výročie', icon: '🎊' },
  company: { color: '#10b981', label: 'Firemný', icon: '🏢' },
  holiday: { color: '#f59e0b', label: 'Sviatok', icon: '🇸🇰' },
  meeting: { color: '#3b82f6', label: 'Meeting', icon: '📅' },
};

export function Events({ onLeadCapture }: EventsProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const upcomingBirthdays = employees
    .map((e) => {
      const bday = new Date(e.birthday);
      const now = new Date();
      bday.setFullYear(now.getFullYear());
      if (bday < now) bday.setFullYear(now.getFullYear() + 1);
      return { ...e, daysUntil: Math.ceil((bday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6);

  const upcomingEvents = events
    .map((e) => ({ ...e, days: daysUntil(e.date) }))
    .filter((e) => e.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 8);

  // Calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsInMonth = events.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const navigate = (dir: 1 | -1) => {
    setCurrentMonth(new Date(year, month + dir, 1));
  };

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">Calendar</p>
          <h1 className="font-display text-3xl">{isEn ? 'Events & Birthdays' : 'Eventy & Narodeniny'}</h1>
          <p className="text-secondary text-sm mt-1">
            {isEn ? 'Company events, public holidays and team birthdays in one place' : 'Firemné akcie, štátne sviatky, narodeniny tímu na jednom mieste'}
          </p>
        </div>
        <button className="btn-primary text-sm">
          <Plus size={14} />
          {isEn ? 'New event' : 'Nový event'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="btn-ghost">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-display text-xl capitalize">
              {currentMonth.toLocaleDateString(isEn ? 'en-US' : 'sk-SK', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => navigate(1)} className="btn-ghost">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {(isEn ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne']).map((d) => (
              <div key={d} className="text-center text-xs font-medium text-tertiary py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayDate = new Date(year, month, day);
              const dayEvents = eventsInMonth.filter(
                (e) => new Date(e.date).getDate() === day
              );
              const isToday =
                dayDate.toDateString() === new Date().toDateString();

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    'aspect-square rounded-lg p-1 cursor-pointer transition-all border',
                    isToday ? 'accent-bg text-white border-transparent' : 'border-subtle hover:bg-tertiary'
                  )}
                >
                  <div className={cn('text-sm font-medium', isToday ? 'text-white' : 'text-primary')}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[10px] truncate rounded px-1"
                        style={{
                          background: typeConfig[ev.type].color + '20',
                          color: typeConfig[ev.type].color,
                        }}
                      >
                        {typeConfig[ev.type].icon} {ev.title.replace(/^\W+/, '').slice(0, 12)}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-tertiary text-center">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Birthdays */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Cake size={16} className="text-tertiary" />
            <h2 className="font-medium">{isEn ? 'Upcoming birthdays' : 'Najbližšie narodeniny'}</h2>
          </div>

          <div className="space-y-3">
            {upcomingBirthdays.map((emp, i) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <img src={emp.avatar} className="w-10 h-10 rounded-full" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-xs text-tertiary">
                    {emp.daysUntil === 0 ? (isEn ? '🎉 Today!' : '🎉 Dnes!') : (isEn ? `In ${emp.daysUntil} days` : `Za ${emp.daysUntil} dní`)} ·
                    {' '}{getAge(emp.birthday) + (emp.daysUntil > 0 ? 1 : 0)} {isEn ? 'years' : 'rokov'}
                  </p>
                </div>
                <button className="text-xs accent-text font-medium">
                  <Sparkles size={12} className="inline mr-0.5" />
                  AI
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-subtle">
            <p className="text-xs text-tertiary leading-relaxed">
              {isEn
                ? '💡 AI tip: Press "AI" to generate a personalized birthday wish in 5 seconds.'
                : '💡 AI tip: Stlač "AI" pre vygenerované personalizované prianie za 5 sekúnd.'}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="card">
        <h2 className="font-medium mb-4">{isEn ? 'Upcoming events' : 'Nadchádzajúce udalosti'}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {upcomingEvents.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-tertiary transition-colors"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: typeConfig[ev.type].color + '20',
                  color: typeConfig[ev.type].color,
                }}
              >
                {typeConfig[ev.type].icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{ev.title}</p>
                <p className="text-xs text-tertiary">{ev.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">
                  {ev.days === 0 ? (isEn ? 'Today' : 'Dnes') : `+${ev.days}d`}
                </p>
                <p className="text-[10px] text-tertiary">{formatDate(ev.date)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <LeadCTA module="Events kalendár" onLeadCapture={onLeadCapture} />
    </div>
  );
}

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plane, Heart,
  Briefcase, Baby, AlertTriangle, TrendingDown, Users, Sparkles
} from 'lucide-react';
import { timeOffEntries } from '../data/hrData';
import { employees, getEmployeeById } from '../data/employees';
import { useLanguage } from '../hooks/useLanguage';
import { LeadCTA } from './Requests';
import { cn } from '../lib/utils';
import type { TimeOffEntry } from '../types';

interface TimeOffProps {
  onLeadCapture: (module: string) => void;
}

const typeConfig = {
  vacation: { color: '#10b981', label: 'Dovolenka', icon: Plane, emoji: '🏖️' },
  sick: { color: '#ef4444', label: 'PN', icon: Heart, emoji: '🤒' },
  personal: { color: '#8b5cf6', label: 'Osobne', icon: Briefcase, emoji: '👤' },
  parental: { color: '#ec4899', label: 'Materska', icon: Baby, emoji: '👶' },
  other: { color: '#64748b', label: 'Ine', icon: CalendarIcon, emoji: '📅' },
};

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isDateInRange(date: Date, start: string, end: string): boolean {
  const d = dateKey(date);
  return d >= start && d <= end;
}

export function TimeOff({ onLeadCapture }: TimeOffProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // May 2026
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<TimeOffEntry | null>(null);

  const filteredEntries = filterType === 'all'
    ? timeOffEntries
    : timeOffEntries.filter((e) => e.type === filterType);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate capacity per day (heat-map data)
  const capacityByDay = useMemo(() => {
    const totalEmployees = employees.length;
    const map = new Map<string, { count: number; entries: TimeOffEntry[] }>();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const key = dateKey(date);
      const entriesOnDay = filteredEntries.filter((e) =>
        isDateInRange(date, e.startDate, e.endDate) && e.status === 'approved'
      );
      map.set(key, { count: entriesOnDay.length, entries: entriesOnDay });
    }
    return { map, totalEmployees };
  }, [filteredEntries, year, month, daysInMonth]);

  const navigate = (dir: 1 | -1) => {
    setCurrentMonth(new Date(year, month + dir, 1));
  };

  const getCapacityColor = (count: number, total: number): string => {
    const ratio = count / total;
    if (ratio === 0) return 'transparent';
    if (ratio < 0.15) return 'color-mix(in srgb, var(--success) 25%, transparent)';
    if (ratio < 0.3) return 'color-mix(in srgb, var(--warning) 35%, transparent)';
    return 'color-mix(in srgb, var(--danger) 45%, transparent)';
  };

  // Find AI insights
  const aiInsights = useMemo(() => {
    const insights: { severity: 'high' | 'medium' | 'low'; text: string }[] = [];
    let maxAbsentDay: { date: string; count: number } | null = null;

    capacityByDay.map.forEach((value, key) => {
      if (!maxAbsentDay || value.count > maxAbsentDay.count) {
        maxAbsentDay = { date: key, count: value.count };
      }
    });

    if (maxAbsentDay && (maxAbsentDay as any).count >= 4) {
      const date = new Date((maxAbsentDay as any).date);
      insights.push({
        severity: 'high',
        text: `Kriticky vykryt: ${date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'long' })} bude prec ${(maxAbsentDay as any).count} ludi (${Math.round(((maxAbsentDay as any).count / employees.length) * 100)}% timu).`,
      });
    }

    // Detect overlapping vacations within same dept
    const vacationsByDept = new Map<string, number>();
    filteredEntries.forEach((e) => {
      if (e.type !== 'vacation' || e.status !== 'approved') return;
      const emp = getEmployeeById(e.employeeId);
      if (!emp) return;
      vacationsByDept.set(emp.department, (vacationsByDept.get(emp.department) || 0) + 1);
    });
    vacationsByDept.forEach((count, dept) => {
      if (count >= 3) {
        insights.push({
          severity: 'medium',
          text: `${dept}: ${count} ludi planuje dovolenku v tomto obdobi. Skontroluj prekrytia.`,
        });
      }
    });

    return insights;
  }, [filteredEntries, capacityByDay]);

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">People Operations</p>
            <h1 className="font-display text-3xl">{isEn ? 'Time Off & Team Capacity' : 'Dovolenky & Kapacita timu'}</h1>
          <p className="text-secondary text-sm mt-1">
            {isEn
              ? 'Planning tool for HR · see who is away and where coverage is critical'
              : 'Planovacie nastroj pre HR · vidis kedy je kazdy prec a kde su kriticke vykryty'}
          </p>
        </div>
      </div>

      {/* AI insights bar */}
      {aiInsights.length > 0 && (
        <div className="card border-l-4" style={{ borderLeftColor: aiInsights[0].severity === 'high' ? 'var(--danger)' : 'var(--warning)' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="accent-text" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm mb-2">{isEn ? 'AI insights · planning warnings' : 'AI insights · plánovacie warnings'}</p>
              <ul className="space-y-1.5">
                {aiInsights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle size={12} className="mt-1 flex-shrink-0" style={{ color: ins.severity === 'high' ? 'var(--danger)' : 'var(--warning)' }} />
                    <span>{ins.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* CALENDAR (heat-map) */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)} className="btn-ghost"><ChevronLeft size={18} /></button>
              <h2 className="font-display text-xl capitalize min-w-[170px] text-center">
                {currentMonth.toLocaleDateString(isEn ? 'en-US' : 'sk-SK', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => navigate(1)} className="btn-ghost"><ChevronRight size={18} /></button>
            </div>

            {/* Type filter */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFilterType('all')}
                className={cn('badge text-[11px]', filterType === 'all' && 'badge-accent')}
              >
                {isEn ? 'All' : 'Vsetko'}
              </button>
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={cn('badge text-[11px]', filterType === key && 'badge-accent')}
                >
                  {cfg.emoji} {isEn
                    ? ({ vacation: 'Vacation', sick: 'Sick', personal: 'Personal', parental: 'Parental', other: 'Other' } as any)[key]
                    : cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days grid */}
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
              const date = new Date(year, month, day);
              const key = dateKey(date);
              const data = capacityByDay.map.get(key) || { count: 0, entries: [] };
              const isToday = date.toDateString() === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <motion.div
                  key={day}
                  whileHover={{ scale: 1.05, zIndex: 5 }}
                  className={cn(
                    'aspect-square rounded-lg p-1 cursor-pointer transition-all border relative',
                    isToday ? 'accent-bg text-white border-transparent ring-2 ring-offset-2' : 'border-subtle hover:border-medium',
                    isWeekend && !isToday && 'opacity-50'
                  )}
                  style={!isToday ? { background: getCapacityColor(data.count, employees.length) } : {}}
                >
                  <div className={cn('text-xs font-medium', isToday ? 'text-white' : 'text-primary')}>
                    {day}
                  </div>
                  {data.count > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-0.5">
                      {data.entries.slice(0, 3).map((e) => {
                        const emp = getEmployeeById(e.employeeId);
                        return emp ? (
                          <img
                            key={e.id}
                            src={emp.avatar}
                            className="w-5 h-5 rounded-full border border-white"
                            alt=""
                            title={`${emp.name} - ${typeConfig[e.type].label}`}
                          />
                        ) : null;
                      })}
                      {data.entries.length > 3 && (
                        <span className="text-[9px] font-medium" style={{ color: isToday ? 'white' : 'var(--text-secondary)' }}>
                          +{data.entries.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-subtle flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 text-xs">
              <span className="text-tertiary">{isEn ? 'Team coverage:' : 'Vykryt timu:'}</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: 'color-mix(in srgb, var(--success) 25%, transparent)' }} />
                <span>{isEn ? 'OK' : 'OK'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: 'color-mix(in srgb, var(--warning) 35%, transparent)' }} />
                <span>{isEn ? 'Watch' : 'Sledovat'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ background: 'color-mix(in srgb, var(--danger) 45%, transparent)' }} />
                <span>{isEn ? 'Critical' : 'Kriticke'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: List + stats */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-tertiary mb-3">{isEn ? 'This month' : 'Tento mesiac'}</p>
            <div className="space-y-3">
              <Stat icon={Plane} label={isEn ? 'Vacation' : 'Dovolenky'} value={timeOffEntries.filter((e) => e.type === 'vacation' && e.status === 'approved').length} color="#10b981" />
              <Stat icon={Heart} label="PN" value={timeOffEntries.filter((e) => e.type === 'sick').length} color="#ef4444" />
              <Stat icon={Baby} label={isEn ? 'Parental' : 'Materska'} value={timeOffEntries.filter((e) => e.type === 'parental').length} color="#ec4899" />
              <Stat icon={Users} label="Pending" value={timeOffEntries.filter((e) => e.status === 'pending').length} color="#f59e0b" />
            </div>
          </div>

          {/* Upcoming list */}
          <div className="card">
            <p className="text-xs uppercase tracking-wider text-tertiary mb-3">{isEn ? 'Upcoming absences' : 'Najblizsie absencie'}</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {timeOffEntries
                .filter((e) => new Date(e.endDate) >= new Date('2026-05-08'))
                .sort((a, b) => a.startDate.localeCompare(b.startDate))
                .slice(0, 10)
                .map((entry) => {
                  const emp = getEmployeeById(entry.employeeId);
                  if (!emp) return null;
                  const cfg = typeConfig[entry.type];
                  const start = new Date(entry.startDate);
                  const end = new Date(entry.endDate);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-tertiary transition-colors text-left"
                    >
                      <img src={emp.avatar} className="w-8 h-8 rounded-full" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{emp.name}</p>
                        <p className="text-[10px] text-tertiary">
                          {start.toLocaleDateString(isEn ? 'en-US' : 'sk-SK', { day: 'numeric', month: 'short' })}
                          {' - '}
                          {end.toLocaleDateString(isEn ? 'en-US' : 'sk-SK', { day: 'numeric', month: 'short' })}
                          {' · '}{days}d
                        </p>
                      </div>
                      <span
                        className="badge text-[10px] flex-shrink-0"
                        style={{ background: cfg.color + '20', color: cfg.color }}
                      >
                        {cfg.emoji}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      <LeadCTA module={isEn ? 'Time Off Calendar' : 'Dovolenky kalendar'} onLeadCapture={onLeadCapture} />
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '20', color }}>
        <Icon size={14} />
      </div>
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm text-secondary">{label}</span>
        <span className="font-display text-xl">{value}</span>
      </div>
    </div>
  );
}

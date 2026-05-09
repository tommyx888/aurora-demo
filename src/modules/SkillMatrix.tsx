import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Brain, AlertTriangle, TrendingUp, Lightbulb, Filter,
  Sparkles, Download, BarChart3, X, Check, Plus, Calendar as CalendarIcon,
  Users, Target, Euro, BookOpen, Zap, GraduationCap, Trash2, RotateCcw
} from 'lucide-react';
import { employees as initialEmployees } from '../data/employees';
import { useLanguage } from '../hooks/useLanguage';
import { cn, fireConfetti } from '../lib/utils';
import type { Employee, Training, TrainingType } from '../types';

// ============================================
// PERSISTENCE KEYS
// ============================================
const SKILLS_KEY = 'de-demo-skills-overrides';
const TRAININGS_KEY = 'de-demo-trainings';

// Aggregate all unique skills
function getAllSkills(employees: Employee[]): string[] {
  const set = new Set<string>();
  employees.forEach((e) => Object.keys(e.skills).forEach((s) => set.add(s)));
  return Array.from(set).sort();
}

const heatColor = (level: number) => {
  if (level === 0) return 'bg-tertiary';
  if (level === 1) return 'heat-1';
  if (level === 2) return 'heat-2';
  if (level === 3) return 'heat-3';
  if (level === 4) return 'heat-4';
  return 'heat-5';
};

// ============================================
// MAIN COMPONENT
// ============================================
export function SkillMatrix() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  // Employees with overrides applied
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const overrides = localStorage.getItem(SKILLS_KEY);
      if (overrides) {
        const parsed = JSON.parse(overrides) as Record<string, Record<string, number>>;
        return initialEmployees.map((emp) => ({
          ...emp,
          skills: { ...emp.skills, ...(parsed[emp.id] || {}) },
        }));
      }
    } catch (e) { /* ignore */ }
    return initialEmployees;
  });

  const [trainings, setTrainings] = useState<Training[]>(() => {
    try {
      const saved = localStorage.getItem(TRAININGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return [];
  });

  const [filterDept, setFilterDept] = useState<string>('all');
  const [highlightSkill, setHighlightSkill] = useState<string | null>(null);
  const [editCell, setEditCell] = useState<{ empId: string; skill: string; level: number; rect: DOMRect } | null>(null);
  const [trainingModal, setTrainingModal] = useState<{ open: boolean; prefill?: Partial<Training> & { participantIds?: string[] } }>({ open: false });
  const [toast, setToast] = useState<string | null>(null);

  const allSkills = useMemo(() => getAllSkills(employees), [employees]);
  const filteredEmployees = filterDept === 'all' ? employees : employees.filter((e) => e.department === filterDept);
  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))];

  // Persist skill overrides
  useEffect(() => {
    const overrides: Record<string, Record<string, number>> = {};
    employees.forEach((emp) => {
      const initial = initialEmployees.find((i) => i.id === emp.id);
      if (!initial) return;
      const diff: Record<string, number> = {};
      Object.entries(emp.skills).forEach(([skill, level]) => {
        if (initial.skills[skill] !== level) diff[skill] = level;
      });
      // Also include removed skills (level 0 but had value before)
      Object.keys(initial.skills).forEach((skill) => {
        if (!(skill in emp.skills) && initial.skills[skill] > 0) diff[skill] = 0;
      });
      if (Object.keys(diff).length > 0) overrides[emp.id] = diff;
    });
    localStorage.setItem(SKILLS_KEY, JSON.stringify(overrides));
  }, [employees]);

  // Persist trainings
  useEffect(() => {
    localStorage.setItem(TRAININGS_KEY, JSON.stringify(trainings));
  }, [trainings]);

  // ============================================
  // ACTIONS
  // ============================================
  const updateSkillLevel = (empId: string, skill: string, level: number) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== empId) return e;
        const newSkills = { ...e.skills };
        if (level === 0) {
          delete newSkills[skill];
        } else {
          newSkills[skill] = level;
        }
        return { ...e, skills: newSkills };
      })
    );
    setEditCell(null);
    showToast(level === 0
      ? (isEn ? `Skill ${skill} removed` : `Skill ${skill} odstránený`)
      : (isEn ? `${skill} updated to level ${level}` : `${skill} aktualizované na úroveň ${level}`));
  };

  const addTraining = (training: Omit<Training, 'id' | 'createdAt'>) => {
    const newTraining: Training = {
      ...training,
      id: `tr-${Date.now()}`,
      createdAt: Date.now(),
    };
    setTrainings((prev) => [newTraining, ...prev]);
    setTrainingModal({ open: false });
    fireConfetti();
    showToast(isEn
      ? `✓ Training "${training.skillName}" planned for ${training.participantIds.length} participant(s)`
      : `✓ Školenie "${training.skillName}" naplánované pre ${training.participantIds.length} ${training.participantIds.length === 1 ? 'osobu' : 'ľudí'}`);
  };

  const removeTraining = (id: string) => {
    setTrainings((prev) => prev.filter((t) => t.id !== id));
    showToast(isEn ? 'Training canceled' : 'Školenie zrušené');
  };

  const resetAllChanges = () => {
    if (!window.confirm(isEn ? 'Do you really want to reset all skill matrix changes?' : 'Naozaj chceš resetovať všetky zmeny v skill matici?')) return;
    setEmployees(initialEmployees);
    localStorage.removeItem(SKILLS_KEY);
    showToast(isEn ? 'Changes reset to original state' : 'Zmeny resetnuté na pôvodný stav');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ============================================
  // AI INSIGHTS (recomputed from current state)
  // ============================================
  const insights = useMemo(() => {
    const skillStats = allSkills.map((skill) => {
      const levels = employees.map((e) => e.skills[skill] || 0).filter((l) => l > 0);
      const avg = levels.reduce((s, l) => s + l, 0) / (levels.length || 1);
      return { skill, avg, count: levels.length };
    });
    const lowCoverage = skillStats.filter((s) => s.count <= 2 && s.count > 0).slice(0, 3);
    const strongAreas = skillStats.filter((s) => s.avg >= 4 && s.count >= 3).slice(0, 3);
    return { lowCoverage, strongAreas };
  }, [allSkills, employees]);

  // Has any edits?
  const hasEdits = useMemo(() => {
    return employees.some((emp) => {
      const initial = initialEmployees.find((i) => i.id === emp.id);
      if (!initial) return false;
      return JSON.stringify(emp.skills) !== JSON.stringify(initial.skills);
    });
  }, [employees]);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">Admin · Talent</p>
          <h1 className="font-display text-3xl">Skill Heatmap</h1>
          <p className="text-secondary text-sm mt-1">
            {isEn
              ? `Team competency visualization · ${employees.length} employees · ${allSkills.length} skills · `
              : `Vizualizácia kompetencií tímu · ${employees.length} zamestnancov · ${allSkills.length} skillov · `}
            <strong className="accent-text">{isEn ? 'Click a cell to edit' : 'Klik na bunku pre úpravu'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <div className="flex items-center gap-1 p-1 bg-tertiary rounded-lg overflow-x-auto max-w-full">
            <Filter size={14} className="text-tertiary mx-2" />
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all',
                  filterDept === dept ? 'bg-secondary shadow-sm-themed text-primary' : 'text-secondary hover:text-primary'
                )}
              >
                {dept === 'all' ? (isEn ? 'All' : 'Všetky') : dept}
              </button>
            ))}
          </div>
          <button
            onClick={() => setTrainingModal({ open: true })}
            className="btn-primary text-sm flex-1 sm:flex-none"
          >
            <GraduationCap size={14} />
            {isEn ? 'Plan training' : 'Naplánovať školenie'}
          </button>
          {hasEdits && (
            <button onClick={resetAllChanges} className="btn-secondary text-sm" title="Reset">
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-4"
      >
        {/* Critical Gap */}
        <div className="card relative overflow-hidden border-l-4" style={{ borderLeftColor: 'var(--danger)' }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--danger) 15%, transparent)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-tertiary mb-0.5">⚠️ AI Insight</p>
              <p className="font-medium text-sm">Critical skill gap</p>
            </div>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            {isEn
              ? <><strong>Vue.js</strong> has only 1 person (Martin, level 2). If he leaves, coverage drops to zero.</>
              : <><strong>Vue.js</strong> má len 1 osobu (Martin, level 2). Ak Martin odíde, máte zero coverage.</>}
          </p>
          <button
            onClick={() => setTrainingModal({
              open: true,
              prefill: { skillName: 'Vue.js', targetLevel: 3, type: 'online-course', durationDays: 5, budget: 350 }
            })}
            className="text-xs accent-text font-medium mt-3 hover:underline flex items-center gap-1"
          >
            <Plus size={11} /> {isEn ? 'Plan training →' : 'Naplánovať tréning →'}
          </button>
        </div>

        {/* Strong area */}
        <div className="card relative overflow-hidden border-l-4" style={{ borderLeftColor: 'var(--success)' }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--success) 15%, transparent)' }}>
              <TrendingUp size={16} style={{ color: 'var(--success)' }} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-tertiary mb-0.5">💪 Strong area</p>
              <p className="font-medium text-sm">React expertise</p>
            </div>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            {isEn
              ? <><strong>3 Senior + 2 Mid</strong> developers have React level 4-5. This is your competitive advantage.</>
              : <><strong>3 Senior + 2 Mid</strong> developeri majú React level 4-5. Vaša competitive advantage.</>}
          </p>
          <button
            onClick={() => showToast(isEn ? '💡 Marketing: added to website and LinkedIn brand story' : '💡 Marketing: pridáme do brand story na webe a LinkedIn-e')}
            className="text-xs accent-text font-medium mt-3 hover:underline"
          >
            {isEn ? 'Add to brand story →' : 'Pridať do brand story →'}
          </button>
        </div>

        {/* Recommendation */}
        <div className="card relative overflow-hidden border-l-4" style={{ borderLeftColor: 'var(--accent-primary)' }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-accent">
              <Lightbulb size={16} className="accent-text" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-tertiary mb-0.5">💡 Suggestion</p>
              <p className="font-medium text-sm">Hire prioritization</p>
            </div>
          </div>
          <p className="text-sm text-secondary leading-relaxed">
            {isEn
              ? '"Senior React" now has lower priority than Vue/Backend. Consider reallocating sourcing.'
              : '"Senior React" má nižšiu prioritu než Vue/Backend. Zvážte presunutie zdrojov.'}
          </p>
          <button
            onClick={() => showToast(isEn ? '✓ Recruiting priorities reordered (mock)' : '✓ Recruiting priority preusporiadané (mock)')}
            className="text-xs accent-text font-medium mt-3 hover:underline"
          >
            Re-prioritize roles →
          </button>
        </div>
      </motion.div>

      {/* Heatmap */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-medium">{isEn ? 'Heatmap matrix' : 'Heatmap matica'}</h2>
            <p className="text-xs text-tertiary mt-0.5">
              {isEn
                ? <>💡 <strong>Click a cell</strong> → change level · Hover header to filter</>
                : <>💡 <strong>Klik na bunku</strong> → zmena úrovne · Hover na header pre filter</>}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-tertiary mr-2">{isEn ? 'Level:' : 'Úroveň:'}</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div key={lvl} className="flex items-center gap-1">
                <div className={cn('w-4 h-4 rounded', heatColor(lvl))} />
                <span className="text-tertiary mr-2">{lvl}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-tertiary p-2 sticky left-0 bg-secondary z-10">
                  {isEn ? 'Employee' : 'Zamestnanec'}
                </th>
                {allSkills.map((skill) => (
                  <th
                    key={skill}
                    onMouseEnter={() => setHighlightSkill(skill)}
                    onMouseLeave={() => setHighlightSkill(null)}
                    className={cn(
                      'text-xs font-medium text-tertiary p-1 cursor-pointer transition-colors',
                      highlightSkill === skill && 'accent-text'
                    )}
                    style={{ minWidth: 28, height: 120 }}
                  >
                    <div className="rotate-180 h-full flex items-end justify-center" style={{ writingMode: 'vertical-rl' }}>
                      {skill}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, idx) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-tertiary/30"
                >
                  <td className="p-2 sticky left-0 bg-secondary z-10 border-r border-subtle">
                    <div className="flex items-center gap-2 min-w-[180px]">
                      <img src={emp.avatar} className="w-7 h-7 rounded-full" alt="" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{emp.name}</p>
                        <p className="text-[10px] text-tertiary truncate">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  {allSkills.map((skill) => {
                    const lvl = emp.skills[skill] || 0;
                    return (
                      <td
                        key={skill}
                        className={cn(
                          'p-0.5 transition-all',
                          highlightSkill === skill && 'opacity-100',
                          highlightSkill && highlightSkill !== skill && 'opacity-30'
                        )}
                      >
                        <motion.button
                          whileHover={{ scale: 1.2, zIndex: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setEditCell({ empId: emp.id, skill, level: lvl, rect });
                          }}
                          className={cn(
                            'w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all',
                            heatColor(lvl)
                          )}
                          style={{
                            // @ts-ignore
                            '--tw-ring-color': 'var(--accent-primary)',
                          }}
                          title={`${emp.name} · ${skill}: ${lvl > 0 ? `Level ${lvl}` : (isEn ? 'None' : 'Žiadne')} · ${isEn ? 'click to edit' : 'klik pre úpravu'}`}
                        >
                          {lvl > 0 ? lvl : ''}
                        </motion.button>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom: 2 columns */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top covered skills */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-tertiary" />
            <h2 className="font-medium">{isEn ? 'Top 5 best-covered skills' : 'Top 5 najpokrytejších skillov'}</h2>
          </div>
          <div className="space-y-3">
            {allSkills
              .map((skill) => ({
                skill,
                count: employees.filter((e) => (e.skills[skill] || 0) >= 3).length,
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)
              .map(({ skill, count }) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{skill}</span>
                    <span className="text-tertiary">{isEn ? `${count} people` : `${count} ľudí`}</span>
                  </div>
                  <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / employees.length) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full accent-bg"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-tertiary" />
            <h2 className="font-medium">{isEn ? 'AI: Growth recommendations' : 'AI: Odporúčania pre rast'}</h2>
          </div>
          <div className="space-y-3">
            {[
              { person: 'Filip Dudáš', empId: 'emp-14', skill: 'React', suggestion: isEn ? 'React workshop with Tomáš Polák (mentor matching)' : 'React workshop s Tomášom Polákom (mentor matching)', priority: 'high', type: 'mentor' as TrainingType, days: 30, budget: 0, level: 3 },
              { person: 'Barbora Sedláková', empId: 'emp-11', skill: 'UI Design', suggestion: isEn ? 'Figma Advanced course - strong UX potential' : 'Figma Advanced course - má talent na UX', priority: 'medium', type: 'online-course' as TrainingType, days: 14, budget: 280, level: 4 },
              { person: 'Andrea Mikušová', empId: 'emp-15', skill: 'Video Editing', suggestion: isEn ? 'Video editing certificate - increases seniority' : 'Video editing certifikát - zvýši seniority', priority: 'medium', type: 'external-course' as TrainingType, days: 21, budget: 450, level: 4 },
              { person: 'Adam Hornák', empId: 'emp-12', skill: 'Kubernetes', suggestion: isEn ? 'Kubernetes course - complements Michal skills' : 'Kubernetes course - dopĺňa Michalove skills', priority: 'low', type: 'online-course' as TrainingType, days: 28, budget: 320, level: 3 },
            ].map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-tertiary transition-colors">
                <div className={cn(
                  'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                  rec.priority === 'high' && 'bg-red-500',
                  rec.priority === 'medium' && 'bg-amber-500',
                  rec.priority === 'low' && 'bg-blue-500',
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{rec.person}</p>
                  <p className="text-xs text-tertiary">{rec.suggestion}</p>
                </div>
                <button
                  onClick={() => setTrainingModal({
                    open: true,
                    prefill: {
                      skillName: rec.skill,
                      participantIds: [rec.empId],
                      type: rec.type,
                      durationDays: rec.days,
                      budget: rec.budget,
                      targetLevel: rec.level,
                    }
                  })}
                  className="text-xs accent-text font-medium hover:underline whitespace-nowrap"
                >
                  {isEn ? 'Plan' : 'Naplánovať'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Planned trainings */}
      {trainings.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-tertiary" />
              <h2 className="font-medium">{isEn ? `Planned trainings (${trainings.length})` : `Naplánované školenia (${trainings.length})`}</h2>
            </div>
            <p className="text-xs text-tertiary w-full sm:w-auto">
              {isEn ? 'Total budget:' : 'Celkový rozpočet:'} <strong className="text-primary">{trainings.reduce((sum, t) => sum + t.budget, 0)} €</strong>
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {trainings.map((t) => (
              <TrainingCard
                key={t.id}
                training={t}
                allEmployees={employees}
                onRemove={() => removeTraining(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cell editor popover */}
      <AnimatePresence>
        {editCell && (
          <CellEditor
            cell={editCell}
            employee={employees.find((e) => e.id === editCell.empId)!}
            onSelect={(level) => updateSkillLevel(editCell.empId, editCell.skill, level)}
            onClose={() => setEditCell(null)}
            onPlanTraining={() => {
              const emp = employees.find((e) => e.id === editCell.empId)!;
              setTrainingModal({
                open: true,
                prefill: {
                  skillName: editCell.skill,
                  participantIds: [emp.id],
                  targetLevel: Math.min(5, editCell.level + 2),
                },
              });
              setEditCell(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Training modal */}
      <AnimatePresence>
        {trainingModal.open && (
          <TrainingModal
            allEmployees={employees}
            allSkills={allSkills}
            prefill={trainingModal.prefill}
            onClose={() => setTrainingModal({ open: false })}
            onSubmit={addTraining}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-50 card shadow-xl-themed px-3 sm:px-4 py-3 flex items-center gap-2 max-w-[calc(100vw-1.5rem)] sm:max-w-md"
          >
            <Check size={16} className="accent-text flex-shrink-0" />
            <p className="text-sm">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// CELL EDITOR — Popover for changing skill level
// ============================================
function CellEditor({
  cell,
  employee,
  onSelect,
  onClose,
  onPlanTraining,
}: {
  cell: { empId: string; skill: string; level: number; rect: DOMRect };
  employee: Employee;
  onSelect: (level: number) => void;
  onClose: () => void;
  onPlanTraining: () => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const popoverRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Position popover near cell, but constrain to viewport
  const top = Math.min(window.innerHeight - 280, cell.rect.bottom + 8);
  const left = Math.min(window.innerWidth - 280, Math.max(8, cell.rect.left - 110));

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/10"
      />
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, scale: 0.95, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 card shadow-xl-themed p-4"
        style={{ top, left, width: 260 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-tertiary">{isEn ? 'Skill level' : 'Úroveň zručnosti'}</p>
            <p className="text-sm font-medium">{cell.skill}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3 p-2 bg-tertiary rounded-md">
          <img src={employee.avatar} className="w-7 h-7 rounded-full" alt="" />
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{employee.name}</p>
            <p className="text-[10px] text-tertiary truncate">{employee.role}</p>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          {[
            { lvl: 0, label: isEn ? 'None' : 'Žiadne', desc: isEn ? 'No knowledge' : 'Bez znalosti' },
            { lvl: 1, label: isEn ? 'Beginner' : 'Začiatočník', desc: isEn ? 'Basic theory' : 'Základná teória' },
            { lvl: 2, label: 'Junior', desc: isEn ? 'With supervision' : 'Pod dohľadom' },
            { lvl: 3, label: 'Mid', desc: isEn ? 'Independent' : 'Samostatne' },
            { lvl: 4, label: 'Senior', desc: isEn ? 'Mentors others' : 'Mentoring iných' },
            { lvl: 5, label: 'Expert', desc: 'Industry expert' },
          ].map(({ lvl, label, desc }) => (
            <button
              key={lvl}
              onClick={() => onSelect(lvl)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
                cell.level === lvl ? 'bg-accent' : 'hover:bg-tertiary'
              )}
            >
              <div className={cn('w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center', heatColor(lvl))}>
                {lvl > 0 ? lvl : '–'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-tight">{label}</p>
                <p className="text-[10px] text-tertiary leading-tight">{desc}</p>
              </div>
              {cell.level === lvl && <Check size={12} className="accent-text" />}
            </button>
          ))}
        </div>

        <button
          onClick={onPlanTraining}
          className="btn-primary text-xs w-full"
        >
          <GraduationCap size={12} />
          {isEn ? 'Plan training' : 'Naplánovať školenie'}
        </button>
      </motion.div>
    </>
  );
}

// ============================================
// TRAINING MODAL — Full plan form
// ============================================
function TrainingModal({
  allEmployees,
  allSkills,
  prefill,
  onClose,
  onSubmit,
}: {
  allEmployees: Employee[];
  allSkills: string[];
  prefill?: Partial<Training> & { participantIds?: string[] };
  onClose: () => void;
  onSubmit: (training: Omit<Training, 'id' | 'createdAt'>) => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [skillName, setSkillName] = useState(prefill?.skillName || allSkills[0] || '');
  const [customSkill, setCustomSkill] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [participantIds, setParticipantIds] = useState<string[]>(prefill?.participantIds || []);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [durationDays, setDurationDays] = useState(prefill?.durationDays || 7);
  const [type, setType] = useState<TrainingType>(prefill?.type || 'online-course');
  const [provider, setProvider] = useState('');
  const [budget, setBudget] = useState(prefill?.budget ?? 350);
  const [targetLevel, setTargetLevel] = useState(prefill?.targetLevel || 3);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');

  const finalSkill = useCustom ? customSkill : skillName;

  const filteredEmployees = search
    ? allEmployees.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase())
      )
    : allEmployees;

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!finalSkill.trim()) return alert(isEn ? 'Select or enter a skill' : 'Vyber alebo zadaj skill');
    if (participantIds.length === 0) return alert(isEn ? 'Select at least 1 participant' : 'Vyber aspoň 1 účastníka');

    onSubmit({
      skillName: finalSkill,
      participantIds,
      startDate,
      durationDays,
      type,
      provider: provider.trim() || undefined,
      budget,
      targetLevel,
      status: 'planned',
      notes: notes.trim() || undefined,
    });
  };

  const totalCost = budget * participantIds.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card max-w-3xl w-full p-0 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-subtle mesh-bg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg accent-bg flex items-center justify-center text-white">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="font-display text-2xl">{isEn ? 'Plan training' : 'Naplánovať školenie'}</h2>
              <p className="text-xs text-tertiary">{isEn ? 'Choose skill, participants, and parameters' : 'Vyber skill, účastníkov a parametre'}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Skill */}
          <div>
            <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
              {isEn ? 'Skill / Training' : 'Skill / Tréning'} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setUseCustom(false)}
                className={cn('badge', !useCustom && 'badge-accent')}
              >
                {isEn ? 'Existing skill' : 'Existujúci skill'}
              </button>
              <button
                onClick={() => setUseCustom(true)}
                className={cn('badge', useCustom && 'badge-accent')}
              >
                {isEn ? '+ New skill' : '+ Nový skill'}
              </button>
            </div>
            {useCustom ? (
              <input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder={isEn ? 'e.g. Kubernetes, Public Speaking, ...' : 'napr. Kubernetes, Public Speaking, ...'}
                className="input-field text-sm"
              />
            ) : (
              <select
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                className="input-field text-sm"
              >
                {allSkills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          {/* Type + Target level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">{isEn ? 'Type' : 'Typ'}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TrainingType)}
                className="input-field text-sm"
              >
                <option value="online-course">📺 {isEn ? 'Online course' : 'Online kurz'}</option>
                <option value="internal-workshop">🏢 {isEn ? 'Internal workshop' : 'Interný workshop'}</option>
                <option value="mentor">👨‍🏫 Mentor matching</option>
                <option value="external-course">🎓 {isEn ? 'External course' : 'Externý kurz'}</option>
                <option value="conference">🎤 {isEn ? 'Conference' : 'Konferencia'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
                {isEn ? 'Target level' : 'Cieľová úroveň'}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setTargetLevel(lvl)}
                    className={cn(
                      'flex-1 h-9 rounded font-bold text-sm transition-all',
                      targetLevel === lvl ? 'ring-2 ring-offset-1 scale-105' : 'opacity-60 hover:opacity-100',
                      heatColor(lvl)
                    )}
                    style={targetLevel === lvl ? { '--tw-ring-color': 'var(--accent-primary)' } as any : {}}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
              {isEn ? 'Participants' : 'Účastníci'} <span className="text-red-500">*</span>
              {participantIds.length > 0 && (
                <span className="ml-2 badge badge-accent">{isEn ? `${participantIds.length} selected` : `${participantIds.length} vybraných`}</span>
              )}
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isEn ? 'Search employee...' : 'Hľadať zamestnanca...'}
              className="input-field text-sm mb-2"
            />
            <div className="border border-subtle rounded-lg max-h-48 overflow-y-auto">
              {filteredEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-3 p-2 hover:bg-tertiary cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={participantIds.includes(emp.id)}
                    onChange={() => toggleParticipant(emp.id)}
                    className="cursor-pointer"
                  />
                  <img src={emp.avatar} className="w-7 h-7 rounded-full" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{emp.name}</p>
                    <p className="text-[10px] text-tertiary truncate">{emp.role} · {emp.department}</p>
                  </div>
                  {finalSkill && emp.skills[finalSkill] !== undefined && (
                    <div className={cn('w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center', heatColor(emp.skills[finalSkill] || 0))}>
                      {emp.skills[finalSkill] || 0}
                    </div>
                  )}
                </label>
              ))}
              {filteredEmployees.length === 0 && (
                <p className="text-center text-xs text-tertiary py-4">{isEn ? 'No results' : 'Žiadne výsledky'}</p>
              )}
            </div>
          </div>

          {/* Date + Duration + Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">{isEn ? 'Start date' : 'Termín'}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
                {isEn ? 'Duration (days)' : 'Trvanie (dni)'}
              </label>
              <input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
                {isEn ? 'Budget / person' : 'Rozpočet / osoba'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-field text-sm pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tertiary">€</span>
              </div>
            </div>
          </div>

          {/* Provider */}
          <div>
            <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
              {isEn ? 'Provider (optional)' : 'Poskytovateľ (voliteľné)'}
            </label>
            <input
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder={isEn ? 'e.g. Udemy, EXPONEA Academy, internal...' : 'napr. Udemy, EXPONEA Academy, interne...'}
              className="input-field text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
              {isEn ? 'Notes' : 'Poznámky'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isEn ? 'Reason, goals, context...' : 'Dôvod, ciele, kontext...'}
              className="input-field text-sm resize-none"
              rows={2}
            />
          </div>

          {/* Cost summary */}
          {participantIds.length > 0 && (
            <div className="card bg-tertiary p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">
                  {participantIds.length} {isEn ? (participantIds.length === 1 ? 'participant' : 'participants') : (participantIds.length === 1 ? 'účastník' : 'účastníkov')} × {budget} €
                </span>
                <span className="font-display text-2xl">{totalCost} €</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-subtle flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary text-sm">{isEn ? 'Cancel' : 'Zrušiť'}</button>
          <button onClick={handleSubmit} className="btn-primary text-sm">
            <Sparkles size={14} />
            {isEn ? 'Plan training' : 'Naplánovať školenie'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// TRAINING CARD — Display planned training
// ============================================
function TrainingCard({
  training,
  allEmployees,
  onRemove,
}: {
  training: Training;
  allEmployees: Employee[];
  onRemove: () => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const participants = training.participantIds
    .map((id) => allEmployees.find((e) => e.id === id))
    .filter(Boolean) as Employee[];

  const typeLabels: Record<TrainingType, { label: string; emoji: string; color: string }> = {
    'online-course': { label: isEn ? 'Online course' : 'Online kurz', emoji: '📺', color: '#3b82f6' },
    'internal-workshop': { label: isEn ? 'Internal workshop' : 'Interný workshop', emoji: '🏢', color: '#8b5cf6' },
    'mentor': { label: 'Mentor', emoji: '👨‍🏫', color: '#10b981' },
    'external-course': { label: isEn ? 'External course' : 'Externý kurz', emoji: '🎓', color: '#f59e0b' },
    'conference': { label: isEn ? 'Conference' : 'Konferencia', emoji: '🎤', color: '#ec4899' },
  };

  const tcfg = typeLabels[training.type];
  const startDate = new Date(training.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + training.durationDays);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card border-l-4 hover:shadow-md-themed transition-all"
      style={{ borderLeftColor: tcfg.color }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{tcfg.emoji}</span>
            <p className="font-medium text-sm truncate">{training.skillName}</p>
            <span className="badge badge-accent text-[10px]">→ L{training.targetLevel}</span>
          </div>
          <p className="text-xs text-tertiary">
            {tcfg.label}
            {training.provider && ` · ${training.provider}`}
          </p>
        </div>
        <button onClick={onRemove} className="btn-ghost text-tertiary hover:text-red-500 p-1" title={isEn ? 'Cancel' : 'Zrušiť'}>
          <Trash2 size={12} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-subtle">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-tertiary">{isEn ? 'Date' : 'Termín'}</p>
          <p className="text-xs font-medium">
            {startDate.toLocaleDateString(isEn ? 'en-US' : 'sk-SK', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-tertiary">{isEn ? 'Duration' : 'Trvanie'}</p>
          <p className="text-xs font-medium">{training.durationDays}d</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-tertiary">{isEn ? 'Budget' : 'Rozpočet'}</p>
          <p className="text-xs font-medium">{training.budget * participants.length} €</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-tertiary mb-1.5">
          {isEn ? `Participants (${participants.length})` : `Účastníci (${participants.length})`}
        </p>
        <div className="flex -space-x-2">
          {participants.slice(0, 5).map((p) => (
            <img
              key={p.id}
              src={p.avatar}
              alt={p.name}
              title={p.name}
              className="w-7 h-7 rounded-full border-2 border-white"
            />
          ))}
          {participants.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-tertiary border-2 border-white flex items-center justify-center text-[10px] font-medium">
              +{participants.length - 5}
            </div>
          )}
        </div>
      </div>

      {training.notes && (
        <p className="text-xs text-tertiary mt-3 pt-3 border-t border-subtle italic">
          {training.notes}
        </p>
      )}
    </motion.div>
  );
}

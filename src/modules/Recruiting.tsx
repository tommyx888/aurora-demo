import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  BriefcaseBusiness, Star, Filter, Plus, Sparkles,
  Mail, Calendar as CalendarIcon, X, Phone, Linkedin, FileText,
  Loader2, Check, MessageCircle, Clock, ChevronRight, Edit3, Trash2, UserPlus
} from 'lucide-react';
import { candidates as initialCandidates, openPositions } from '../data/candidates';
import { useLanguage } from '../hooks/useLanguage';
import { cn, formatDate, fireConfetti } from '../lib/utils';
import type { Candidate, ActivityEntry } from '../types';

const stages = [
  { id: 'applied', label: 'Aplikoval/a', color: '#94a3b8' },
  { id: 'screening', label: 'Screening', color: '#3b82f6' },
  { id: 'interview', label: 'Pohovor', color: '#8b5cf6' },
  { id: 'offer', label: 'Ponuka', color: '#f59e0b' },
  { id: 'hired', label: 'Prijatý/á', color: '#10b981' },
  { id: 'rejected', label: 'Zamietnutý/á', color: '#ef4444' },
] as const;

const RECRUITING_KEY = 'de-demo-recruiting-state';

// AI source pool — pre-fabricated candidates that "appear" when user clicks AI Source
const AI_SOURCE_POOL: Omit<Candidate, 'id' | 'appliedDate' | 'stage' | 'activity'>[] = [
  {
    name: 'Patrik Sůra',
    email: 'patrik.sura@email.cz',
    position: 'Senior React Developer',
    source: 'AI Source · LinkedIn',
    rating: 5,
    matchScore: 92,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=patrik',
    notes: 'AI: 7 years of React expertise, 2.5k GitHub stars, lead architect on enterprise SaaS. Top 5% candidate.',
    phone: '+421 911 234 567',
    linkedin: 'linkedin.com/in/patriksura',
  },
  {
    name: 'Tomáš Fischer',
    email: 'tomas.f@protonmail.com',
    position: 'DevOps Engineer',
    source: 'AI Source · GitHub',
    rating: 5,
    matchScore: 89,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tomas',
    notes: 'AI: AWS Solutions Architect Professional + CKA. Reduced cloud costs by 40% in current company.',
    phone: '+421 905 887 332',
    linkedin: 'linkedin.com/in/tomasfischer',
  },
  {
    name: 'Eva Jankovičová',
    email: 'eva.jankovicova@gmail.com',
    position: 'UX Designer',
    source: 'AI Source · Dribbble',
    rating: 4,
    matchScore: 81,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=evajank',
    notes: 'AI: Senior UX Designer, 5 years of experience in B2B SaaS, portfolio includes work for Slovak Telecom.',
    linkedin: 'linkedin.com/in/evajankovicova',
  },
  {
    name: 'Marek Sokol',
    email: 'marek.sokol@email.sk',
    position: 'Senior React Developer',
    source: 'AI Source · Profesia',
    rating: 4,
    matchScore: 78,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mareksokol',
    notes: 'AI: 6 years of React, currently at ESET. Strong culture fit.',
    phone: '+421 944 123 456',
  },
];

export function Recruiting() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const stageLabel = (id: string) =>
    isEn
      ? ({ applied: 'Applied', screening: 'Screening', interview: 'Interview', offer: 'Offer', hired: 'Hired', rejected: 'Rejected' } as any)[id] || id
      : ({ applied: 'Aplikoval/a', screening: 'Screening', interview: 'Pohovor', offer: 'Ponuka', hired: 'Prijatý/á', rejected: 'Zamietnutý/á' } as any)[id] || id;
  // Load persisted state or initial
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem(RECRUITING_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    // Initialize with activity logs
    return initialCandidates.map((c) => ({
      ...c,
      activity: [{
        id: 'init-' + c.id,
        timestamp: new Date(c.appliedDate).getTime(),
        type: 'created' as const,
        description: `Aplikoval/a sa cez ${c.source}`,
      }],
    }));
  });

  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Modals
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [aiSourceOpen, setAiSourceOpen] = useState(false);
  const [interviewModalCandidate, setInterviewModalCandidate] = useState<Candidate | null>(null);
  const [emailModalCandidate, setEmailModalCandidate] = useState<Candidate | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Persist
  useEffect(() => {
    localStorage.setItem(RECRUITING_KEY, JSON.stringify(candidates));
  }, [candidates]);

  // Re-sync selectedCandidate when candidates change (so detail panel shows fresh data)
  useEffect(() => {
    if (selectedCandidate) {
      const fresh = candidates.find((c) => c.id === selectedCandidate.id);
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(selectedCandidate)) {
        setSelectedCandidate(fresh);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates]);

  const filtered = filterPosition === 'all'
    ? candidates
    : candidates.filter((c) => c.position === filterPosition);

  const positions = Array.from(new Set(candidates.map((c) => c.position)));

  // ==========================
  // ACTIONS
  // ==========================
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addActivity = (candidateId: string, type: ActivityEntry['type'], description: string) => {
    const entry: ActivityEntry = {
      id: `act-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      description,
    };
    setCandidates((prev) => prev.map((c) =>
      c.id === candidateId
        ? { ...c, activity: [entry, ...(c.activity || [])] }
        : c
    ));
  };

  const moveCandidate = (id: string, newStage: Candidate['stage']) => {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate || candidate.stage === newStage) return;
    const oldStageLabel = stageLabel(candidate.stage);
    const newStageLabel = stageLabel(newStage);

    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: newStage } : c))
    );
    addActivity(id, 'stage-change', isEn ? `Moved: ${oldStageLabel} → ${newStageLabel}` : `Posunutý: ${oldStageLabel} → ${newStageLabel}`);

    if (newStage === 'hired') {
      fireConfetti();
      showToast(isEn ? `🎉 ${candidate.name} was hired!` : `🎉 ${candidate.name} bol prijatý!`);
    } else {
      showToast(`✓ ${candidate.name}: ${newStageLabel}`);
    }
  };

  const updateCandidate = (id: string, updates: Partial<Candidate>) => {
    setCandidates((prev) => prev.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const updateNotes = (id: string, notes: string) => {
    updateCandidate(id, { notes });
    addActivity(id, 'note-added', isEn ? 'Updated notes' : 'Aktualizoval poznámky');
  };

  const updateRating = (id: string, rating: number) => {
    updateCandidate(id, { rating });
    addActivity(id, 'rating-changed', isEn ? `Rating changed to ${rating}/5` : `Hodnotenie zmenené na ${rating}/5`);
    showToast(isEn ? '✓ Rating updated' : '✓ Hodnotenie aktualizované');
  };

  const addCandidate = (data: Omit<Candidate, 'id' | 'activity' | 'appliedDate' | 'stage'>) => {
    const newCandidate: Candidate = {
      ...data,
      id: `cand-${Date.now()}`,
      stage: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      activity: [{
        id: `act-${Date.now()}`,
        timestamp: Date.now(),
        type: 'created',
        description: isEn ? `Manually added via ${data.source}` : `Manuálne pridaný cez ${data.source}`,
      }],
    };
    setCandidates((prev) => [newCandidate, ...prev]);
    setAddCandidateOpen(false);
    fireConfetti();
    showToast(isEn ? `✓ ${data.name} added to pipeline` : `✓ ${data.name} pridaný do pipeline`);
  };

  const removeCandidate = (id: string) => {
    if (!window.confirm(isEn ? 'Really remove this candidate?' : 'Naozaj odstrániť tohto kandidáta?')) return;
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setSelectedCandidate(null);
    showToast(isEn ? 'Candidate removed' : 'Kandidát odstránený');
  };

  const scheduleInterview = (id: string, date: string, time: string) => {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;
    const interviewDate = `${date}T${time}`;
    updateCandidate(id, { interviewDate, stage: 'interview' });
    addActivity(id, 'interview-scheduled', isEn ? `Interview scheduled for ${date} at ${time}` : `Pohovor naplánovaný na ${date} o ${time}`);
    setInterviewModalCandidate(null);
    showToast(isEn ? `📅 Interview scheduled · ${candidate.name}` : `📅 Pohovor naplánovaný · ${candidate.name}`);
  };

  const sendEmail = (id: string, subject: string, body: string) => {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;
    // Open mailto in new tab
    window.open(`mailto:${candidate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    addActivity(id, 'email-sent', isEn ? `Email sent: "${subject}"` : `Email odoslaný: "${subject}"`);
    setEmailModalCandidate(null);
    showToast(isEn ? '✉️ Email opened in default mail client' : '✉️ Email otvorený v default mail klientovi');
  };

  // ==========================
  // DRAG & DROP
  // ==========================
  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    setDraggedId(candidateId);
    e.dataTransfer.effectAllowed = 'move';
    // Create custom drag image (transparent)
    const img = new Image();
    img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) setDragOverStage(stageId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column entirely
    const related = e.relatedTarget as HTMLElement | null;
    if (related && (e.currentTarget as HTMLElement).contains(related)) return;
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: Candidate['stage']) => {
    e.preventDefault();
    if (draggedId) {
      moveCandidate(draggedId, newStage);
    }
    setDraggedId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStage(null);
  };

  // ==========================
  // AI INSIGHT ACTIONS
  // ==========================
  const aiInsightCandidates = useMemo(() => {
    // Find Patrik & Tomas in the current candidates list
    return candidates
      .filter((c) => c.matchScore && c.matchScore >= 85)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 2);
  }, [candidates]);

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">Admin · Talent Acquisition</p>
            <h1 className="font-display text-3xl">Recruiting Pipeline</h1>
          <p className="text-secondary text-sm mt-1">
            {isEn
              ? `${candidates.length} candidates · ${openPositions.length} open positions ·`
              : `${candidates.length} kandidátov · ${openPositions.length} otvorených pozícií ·`}
            <span className="accent-text font-medium">{isEn ? ' AI scoring enabled' : ' AI scoring zapnutý'}</span>
          </p>
        </div>

        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setAiSourceOpen(true)}
            className="btn-secondary text-sm flex-1 sm:flex-none"
          >
            <Sparkles size={14} />
            AI Source
          </button>
          <button
            onClick={() => setAddCandidateOpen(true)}
            className="btn-primary text-sm flex-1 sm:flex-none"
          >
            <Plus size={14} />
            {isEn ? 'Add candidate' : 'Pridať kandidáta'}
          </button>
        </div>
      </div>

      {/* Open positions row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {openPositions.map((pos, i) => (
          <motion.button
            key={pos.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setFilterPosition(filterPosition === pos.title ? 'all' : pos.title)}
            className={cn(
              'card text-left p-3 transition-all',
              filterPosition === pos.title && 'accent-border ring-2',
            )}
            style={filterPosition === pos.title ? { borderColor: 'var(--accent-primary)' } : {}}
          >
            <div className="flex items-start justify-between mb-1">
              <BriefcaseBusiness size={14} className="text-tertiary" />
              <span className="text-[10px] text-tertiary">{pos.daysOpen}d open</span>
            </div>
            <p className="text-sm font-medium leading-tight mb-1">{pos.title}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-tertiary">{pos.department}</span>
              <span className="badge badge-accent">{pos.applicants}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-tertiary" />
        <button
          onClick={() => setFilterPosition('all')}
          className={cn('badge transition-all', filterPosition === 'all' ? 'badge-accent' : '')}
        >
          {isEn ? `All positions (${candidates.length})` : `Všetky pozície (${candidates.length})`}
        </button>
        {positions.map((pos) => (
          <button
            key={pos}
            onClick={() => setFilterPosition(pos)}
            className={cn('badge transition-all', filterPosition === pos ? 'badge-accent' : '')}
          >
            {pos} ({candidates.filter((c) => c.position === pos).length})
          </button>
        ))}
      </div>

      {/* Kanban board with drag & drop */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2 md:overflow-visible md:pb-0 -mx-1 px-1">
        {stages.map((stage) => {
          const stageCandidates = filtered.filter((c) => c.stage === stage.id);
          const isDragOver = dragOverStage === stage.id;
          return (
            <div
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id as Candidate['stage'])}
              className={cn(
                'rounded-xl p-2 min-h-[340px] md:min-h-[400px] flex flex-col transition-all flex-shrink-0 w-[82vw] sm:w-[62vw] md:w-auto',
                isDragOver
                  ? 'bg-accent ring-2 ring-offset-2'
                  : 'bg-tertiary'
              )}
              style={isDragOver ? { '--tw-ring-color': stage.color } as any : {}}
            >
              <div className="px-2 py-2 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                  <p className="text-xs font-medium uppercase tracking-wider">{stageLabel(stage.id)}</p>
                </div>
                <span className="text-xs text-tertiary font-medium">{stageCandidates.length}</span>
              </div>

              <div className="space-y-2 flex-1">
                {stageCandidates.map((candidate, i) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: draggedId === candidate.id ? 0.4 : 1,
                      y: 0,
                      scale: draggedId === candidate.id ? 0.95 : 1,
                    }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ y: -2 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as any, candidate.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedCandidate(candidate)}
                    className="bg-secondary rounded-lg p-3 shadow-sm-themed cursor-pointer hover:shadow-md-themed transition-all border border-subtle group relative"
                    style={{ cursor: draggedId === candidate.id ? 'grabbing' : 'grab' }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <img src={candidate.avatar} alt="" className="w-8 h-8 rounded-full" draggable={false} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{candidate.name}</p>
                        <p className="text-[10px] text-tertiary truncate">{candidate.position}</p>
                      </div>
                      {candidate.matchScore && candidate.matchScore >= 85 && (
                        <span
                          className="badge text-[10px] flex-shrink-0"
                          style={{
                            background: 'color-mix(in srgb, var(--success) 20%, transparent)',
                            color: 'var(--success)',
                          }}
                          title="AI match score"
                        >
                          {candidate.matchScore}%
                        </span>
                      )}
                    </div>

                    {candidate.rating > 0 && (
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            size={10}
                            className={cn(idx < candidate.rating ? 'fill-amber-400 text-amber-400' : 'text-tertiary')}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-tertiary">
                      <span className="truncate">{candidate.source}</span>
                      <span className="flex-shrink-0 ml-1">{formatDate(candidate.appliedDate)}</span>
                    </div>

                    {candidate.interviewDate && (
                      <div className="mt-2 pt-2 border-t border-subtle flex items-center gap-1 text-[10px]" style={{ color: 'var(--info)' }}>
                        <CalendarIcon size={10} />
                        {new Date(candidate.interviewDate).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {new Date(candidate.interviewDate).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </motion.div>
                ))}

                {stageCandidates.length === 0 && (
                  <div className="text-center py-8 text-xs text-tertiary border-2 border-dashed border-subtle rounded-lg">
                    {isDragOver ? (isEn ? '⬇️ Drop here' : '⬇️ Pustite tu') : (isEn ? 'No candidate' : 'Žiadny kandidát')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI insights row */}
      {aiInsightCandidates.length > 0 && (
        <div className="card border-l-4" style={{ borderLeftColor: 'var(--accent-primary)' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="accent-text" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm mb-1">{isEn ? 'AI Insight: Top candidates this week' : 'AI Insight: Top kandidáti tento týždeň'}</p>
              <p className="text-sm text-secondary leading-relaxed mb-3">
                {aiInsightCandidates.map((c, i) => (
                  <span key={c.id}>
                    <strong>{c.name}</strong> ({c.position}) {isEn ? 'has' : 'má'} <strong>{c.matchScore}% match</strong> — {c.notes.replace(/^AI:\s*/, '')}
                    {i < aiInsightCandidates.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <div className="flex gap-2 flex-wrap">
                {aiInsightCandidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setInterviewModalCandidate(c)}
                    className="badge badge-accent hover:opacity-80"
                  >
                    {isEn ? `📅 Schedule ${c.name.split(' ')[0]}` : `📅 Naplánovať ${c.name.split(' ')[0]}`}
                  </button>
                ))}
                <button
                  onClick={() => {
                    // Filter to show only AI-sourced
                    const sortedIds = [...candidates]
                      .filter((c) => c.matchScore)
                      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                    if (sortedIds[0]) setSelectedCandidate(sortedIds[0]);
                  }}
                  className="badge hover:opacity-80"
                >
                  {isEn ? 'Show all AI scores →' : 'Zobraziť všetky AI scores →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailPanel
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            onMove={moveCandidate}
            onUpdateNotes={updateNotes}
            onUpdateRating={updateRating}
            onScheduleInterview={() => setInterviewModalCandidate(selectedCandidate)}
            onSendEmail={() => setEmailModalCandidate(selectedCandidate)}
            onRemove={() => removeCandidate(selectedCandidate.id)}
          />
        )}
        {addCandidateOpen && (
          <AddCandidateModal
            onClose={() => setAddCandidateOpen(false)}
            onSubmit={addCandidate}
          />
        )}
        {aiSourceOpen && (
          <AISourceModal
            existingCandidates={candidates}
            onClose={() => setAiSourceOpen(false)}
            onAdd={(data) => {
              addCandidate(data);
            }}
          />
        )}
        {interviewModalCandidate && (
          <InterviewModal
            candidate={interviewModalCandidate}
            onClose={() => setInterviewModalCandidate(null)}
            onSchedule={scheduleInterview}
          />
        )}
        {emailModalCandidate && (
          <EmailModal
            candidate={emailModalCandidate}
            onClose={() => setEmailModalCandidate(null)}
            onSend={sendEmail}
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
// CANDIDATE DETAIL PANEL (rozšírený)
// ============================================
function CandidateDetailPanel({
  candidate,
  onClose,
  onMove,
  onUpdateNotes,
  onUpdateRating,
  onScheduleInterview,
  onSendEmail,
  onRemove,
}: {
  candidate: Candidate;
  onClose: () => void;
  onMove: (id: string, stage: Candidate['stage']) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onScheduleInterview: () => void;
  onSendEmail: () => void;
  onRemove: () => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(candidate.notes);

  // Sync draft when candidate changes (e.g. after stage move from outside)
  useEffect(() => {
    setNotesDraft(candidate.notes);
  }, [candidate.id, candidate.notes]);

  const handleSaveNotes = () => {
    if (notesDraft !== candidate.notes) {
      onUpdateNotes(candidate.id, notesDraft);
    }
    setEditingNotes(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-end"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-secondary h-full w-full max-w-md overflow-y-auto"
      >
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <img src={candidate.avatar} className="w-14 h-14 rounded-full" alt="" />
              <div>
                <h2 className="font-display text-2xl">{candidate.name}</h2>
                <p className="text-sm text-tertiary">{candidate.position}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost"><X size={18} /></button>
          </div>

          {/* AI score */}
          {candidate.matchScore && (
            <div className="card bg-accent mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: 'var(--text-on-accent)' }}>AI Match Score</p>
                <span className="font-display text-2xl" style={{ color: 'var(--text-on-accent)' }}>
                  {candidate.matchScore}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${candidate.matchScore}%` }}
                  className="h-full"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                />
              </div>
            </div>
          )}

          {/* Contact actions */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button onClick={onSendEmail} className="btn-secondary text-xs flex-col py-3">
              <Mail size={14} />
              Email
            </button>
            <a
              href={candidate.phone ? `tel:${candidate.phone}` : undefined}
              onClick={(e) => {
                if (!candidate.phone) {
                  e.preventDefault();
                  alert(isEn ? 'Phone number is not available' : 'Telefónne číslo nie je k dispozícii');
                }
              }}
              className={cn('btn-secondary text-xs flex-col py-3', !candidate.phone && 'opacity-50 cursor-not-allowed')}
            >
              <Phone size={14} />
              {isEn ? 'Call' : 'Hovor'}
            </a>
            <button onClick={onScheduleInterview} className="btn-secondary text-xs flex-col py-3">
              <CalendarIcon size={14} />
              {isEn ? 'Interview' : 'Pohovor'}
            </button>
          </div>

          {/* Inline rating */}
          <div className="card bg-tertiary mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider text-tertiary">{isEn ? 'Rating' : 'Hodnotenie'}</p>
              <span className="text-xs text-tertiary">{candidate.rating}/5</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onUpdateRating(candidate.id, i + 1)}
                  className="hover:scale-125 transition-transform"
                  title={isEn ? `${i + 1} stars` : `${i + 1} hviezdičiek`}
                >
                  <Star
                    size={20}
                    className={cn(i < candidate.rating ? 'fill-amber-400 text-amber-400' : 'text-tertiary')}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 text-sm mb-4">
            <Row label="Email" value={
              <a href={`mailto:${candidate.email}`} className="accent-text hover:underline truncate block max-w-[200px]">
                {candidate.email}
              </a>
            } />
            {candidate.phone && (
              <Row label={isEn ? 'Phone' : 'Telefón'} value={
                <a href={`tel:${candidate.phone}`} className="accent-text hover:underline">
                  {candidate.phone}
                </a>
              } />
            )}
            {candidate.linkedin && (
              <Row label="LinkedIn" value={
                <a href={`https://${candidate.linkedin}`} target="_blank" rel="noreferrer" className="accent-text hover:underline flex items-center gap-1">
                  <Linkedin size={11} />
                  {isEn ? 'Profile' : 'Profil'}
                </a>
              } />
            )}
            <Row label={isEn ? 'Position' : 'Pozícia'} value={candidate.position} />
            <Row label={isEn ? 'Source' : 'Zdroj'} value={candidate.source} />
            <Row label={isEn ? 'Applied' : 'Aplikoval/a'} value={formatDate(candidate.appliedDate)} />
            {candidate.interviewDate && (
              <Row label={isEn ? 'Interview' : 'Pohovor'} value={
                <span className="font-medium" style={{ color: 'var(--info)' }}>
                  {new Date(candidate.interviewDate).toLocaleString(isEn ? 'en-US' : 'sk-SK', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              } />
            )}
          </div>

          {/* Notes (editable) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-tertiary">{isEn ? 'Notes' : 'Poznámky'}</p>
              {!editingNotes && (
                <button onClick={() => setEditingNotes(true)} className="btn-ghost text-xs">
                  <Edit3 size={11} />
                  {isEn ? 'Edit' : 'Upraviť'}
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  className="input-field text-sm resize-none w-full"
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveNotes} className="btn-primary text-xs flex-1">
                    <Check size={11} />
                    {isEn ? 'Save' : 'Uložiť'}
                  </button>
                  <button onClick={() => { setNotesDraft(candidate.notes); setEditingNotes(false); }} className="btn-secondary text-xs">
                    {isEn ? 'Cancel' : 'Zrušiť'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card bg-tertiary text-sm leading-relaxed">
                {candidate.notes || <span className="text-tertiary italic">{isEn ? 'No notes' : 'Žiadne poznámky'}</span>}
              </div>
            )}
          </div>

          {/* Move stage */}
          <p className="text-xs uppercase tracking-wider text-tertiary mb-2">{isEn ? 'Move to' : 'Posunúť do'}</p>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {stages.map((s) => (
              <button
                key={s.id}
                onClick={() => onMove(candidate.id, s.id as Candidate['stage'])}
                disabled={candidate.stage === s.id}
                className={cn(
                  'btn-secondary text-xs justify-start',
                  candidate.stage === s.id && 'accent-bg text-white border-transparent'
                )}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                {isEn
                  ? ({ applied: 'Applied', screening: 'Screening', interview: 'Interview', offer: 'Offer', hired: 'Hired', rejected: 'Rejected' } as any)[s.id]
                  : s.label}
              </button>
            ))}
          </div>

          {/* Activity timeline */}
          {candidate.activity && candidate.activity.length > 0 && (
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wider text-tertiary mb-3 flex items-center gap-2">
                <Clock size={11} />
                Aktivita ({candidate.activity.length})
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {candidate.activity.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                      {activityIcon(entry.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-secondary leading-snug">{entry.description}</p>
                      <p className="text-[10px] text-tertiary">
                        {new Date(entry.timestamp).toLocaleString('sk-SK', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger zone */}
          <div className="pt-4 border-t border-subtle">
            <button
              onClick={onRemove}
              className="btn-ghost text-xs text-red-500 hover:bg-red-500/10 w-full"
            >
              <Trash2 size={11} />
              {isEn ? 'Remove candidate' : 'Odstrániť kandidáta'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function activityIcon(type: ActivityEntry['type']) {
  const Icon = {
    'stage-change': ChevronRight,
    'note-added': MessageCircle,
    'rating-changed': Star,
    'email-sent': Mail,
    'interview-scheduled': CalendarIcon,
    'created': UserPlus,
  }[type];
  return <Icon size={11} className="text-tertiary" />;
}

// ============================================
// ADD CANDIDATE MODAL
// ============================================
function AddCandidateModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState(openPositions[0]?.title || '');
  const [source, setSource] = useState('LinkedIn');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      alert(isEn ? 'Name and email are required' : 'Meno a email sú povinné');
      return;
    }
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      position,
      source,
      phone: phone.trim() || undefined,
      rating,
      notes: notes.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });
  };

  return (
    <ModalShell onClose={onClose} title={isEn ? 'Add candidate' : 'Pridať kandidáta'} icon={UserPlus}>
      <div className="space-y-3">
        <Field label={isEn ? 'Name *' : 'Meno *'} required>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field text-sm" placeholder={isEn ? 'John Doe' : 'Ján Novák'} autoFocus />
        </Field>
        <Field label="Email *" required>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field text-sm" placeholder="jan.novak@email.com" />
        </Field>
        <Field label={isEn ? 'Phone' : 'Telefón'}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field text-sm" placeholder="+421 ..." />
        </Field>
        <Field label={isEn ? 'Position' : 'Pozícia'}>
          <select value={position} onChange={(e) => setPosition(e.target.value)} className="input-field text-sm">
            {openPositions.map((p) => <option key={p.title} value={p.title}>{p.title}</option>)}
          </select>
        </Field>
        <Field label={isEn ? 'Source' : 'Zdroj'}>
          <select value={source} onChange={(e) => setSource(e.target.value)} className="input-field text-sm">
            <option>LinkedIn</option>
            <option>Profesia</option>
            <option>Referral</option>
            <option>GitHub</option>
            <option>Email priamo</option>
            <option>{isEn ? 'Other' : 'Iný'}</option>
          </select>
        </Field>
        <Field label={isEn ? 'Rating' : 'Hodnotenie'}>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setRating(i + 1)}
                className="hover:scale-125 transition-transform"
              >
                <Star size={20} className={cn(i < rating ? 'fill-amber-400 text-amber-400' : 'text-tertiary')} />
              </button>
            ))}
          </div>
        </Field>
        <Field label={isEn ? 'Notes' : 'Poznámky'}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field text-sm resize-none" rows={3} placeholder={isEn ? 'First impression, context...' : 'Prvý dojem, kontext...'} />
        </Field>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-subtle">
        <button onClick={onClose} className="btn-secondary text-sm">{isEn ? 'Cancel' : 'Zrušiť'}</button>
        <button onClick={handleSubmit} className="btn-primary text-sm">
          <Plus size={14} />
          {isEn ? 'Add to pipeline' : 'Pridať do pipeline'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============================================
// AI SOURCE MODAL
// ============================================
function AISourceModal({
  existingCandidates,
  onClose,
  onAdd,
}: {
  existingCandidates: Candidate[];
  onClose: () => void;
  onAdd: (data: any) => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [isSearching, setIsSearching] = useState(true);
  const [results, setResults] = useState<typeof AI_SOURCE_POOL>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Simulate AI sourcing
  useEffect(() => {
    const t = setTimeout(() => {
      // Filter out candidates already in the pipeline (by email)
      const existingEmails = new Set(existingCandidates.map((c) => c.email.toLowerCase()));
      const fresh = AI_SOURCE_POOL.filter((p) => !existingEmails.has(p.email.toLowerCase()));
      setResults(fresh);
      setIsSearching(false);
    }, 1800);
    return () => clearTimeout(t);
  }, [existingCandidates]);

  const handleAdd = (cand: typeof AI_SOURCE_POOL[number]) => {
    onAdd(cand);
    setAddedIds((prev) => new Set(prev).add(cand.email));
  };

  return (
    <ModalShell onClose={onClose} title={isEn ? 'AI Source: Candidate discovery' : 'AI Source: Hľadanie kandidátov'} icon={Sparkles}>
      {isSearching ? (
        <div className="text-center py-12">
          <Loader2 size={40} className="mx-auto accent-text animate-spin mb-3" />
          <p className="font-medium text-sm">{isEn ? 'AI is scanning LinkedIn, GitHub, job portals...' : 'AI prehľadáva LinkedIn, GitHub, Profesia...'}</p>
          <p className="text-xs text-tertiary mt-1">{isEn ? 'Looking for best matches for your open roles' : 'Hľadáme najlepšie matche pre vaše otvorené pozície'}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <Check size={40} className="mx-auto text-success mb-3" />
          <p className="font-medium text-sm">{isEn ? 'All top candidates are already in your pipeline! 🎉' : 'Všetci top kandidáti už sú v pipeline! 🎉'}</p>
          <p className="text-xs text-tertiary mt-1">{isEn ? 'AI found no new matches.' : 'AI nenašlo žiadnych nových matchov.'}</p>
        </div>
      ) : (
        <>
          <div className="card bg-accent mb-4">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-on-accent)' }}>
              {isEn
                ? <>✨ We found <strong>{results.length} candidates</strong> matching your open roles (match score ≥ 75%).</>
                : <>✨ Našli sme <strong>{results.length} kandidátov</strong> ktorí matchujú vaše otvorené pozície (match score ≥ 75%).</>}
            </p>
          </div>
          <div className="space-y-3">
            {results.map((cand) => {
              const isAdded = addedIds.has(cand.email);
              return (
                <motion.div
                  key={cand.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card hover:shadow-md-themed transition-all"
                >
                  <div className="flex items-start gap-3">
                    <img src={cand.avatar} alt="" className="w-12 h-12 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{cand.name}</p>
                        <span
                          className="badge text-[10px]"
                          style={{
                            background: 'color-mix(in srgb, var(--success) 20%, transparent)',
                            color: 'var(--success)',
                          }}
                        >
                          {cand.matchScore}% match
                        </span>
                      </div>
                      <p className="text-xs text-tertiary mb-2">{cand.position} · {cand.source}</p>
                      <p className="text-xs text-secondary leading-relaxed">{cand.notes}</p>
                    </div>
                    <button
                      onClick={() => handleAdd(cand)}
                      disabled={isAdded}
                      className={cn(
                        'btn-primary text-xs flex-shrink-0',
                        isAdded && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {isAdded ? (
                        <>
                          <Check size={11} />
                          {isEn ? 'Added' : 'Pridané'}
                        </>
                      ) : (
                        <>
                          <Plus size={11} />
                          {isEn ? 'Add' : 'Pridať'}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-subtle">
        <button onClick={onClose} className="btn-secondary text-sm">{isEn ? 'Close' : 'Zatvoriť'}</button>
      </div>
    </ModalShell>
  );
}

// ============================================
// INTERVIEW SCHEDULER MODAL
// ============================================
function InterviewModal({
  candidate,
  onClose,
  onSchedule,
}: {
  candidate: Candidate;
  onClose: () => void;
  onSchedule: (id: string, date: string, time: string) => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('14:00');
  const [type, setType] = useState<'video' | 'in-person' | 'phone'>('video');
  const [duration, setDuration] = useState(60);

  const handleSubmit = () => {
    onSchedule(candidate.id, date, time);
  };

  return (
    <ModalShell onClose={onClose} title={`${isEn ? 'Interview' : 'Pohovor'} · ${candidate.name}`} icon={CalendarIcon}>
      <div className="space-y-4">
        <div className="card bg-tertiary flex items-center gap-3">
          <img src={candidate.avatar} className="w-10 h-10 rounded-full" alt="" />
          <div>
            <p className="text-sm font-medium">{candidate.name}</p>
            <p className="text-xs text-tertiary">{candidate.position}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={isEn ? 'Date' : 'Dátum'}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field text-sm" />
          </Field>
          <Field label={isEn ? 'Time' : 'Čas'}>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-field text-sm" />
          </Field>
        </div>

        <Field label={isEn ? 'Interview type' : 'Typ pohovoru'}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'video', label: 'Video', emoji: '📹' },
              { id: 'in-person', label: isEn ? 'In-person' : 'Osobný', emoji: '🤝' },
              { id: 'phone', label: isEn ? 'Phone' : 'Telefón', emoji: '📞' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id as any)}
                className={cn(
                  'btn-secondary text-xs flex-col py-2',
                  type === t.id && 'accent-bg text-white border-transparent'
                )}
              >
                <span className="text-base">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={isEn ? 'Duration' : 'Trvanie'}>
          <select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="input-field text-sm">
            <option value={30}>{isEn ? '30 minutes' : '30 minút'}</option>
            <option value={45}>{isEn ? '45 minutes' : '45 minút'}</option>
            <option value={60}>{isEn ? '60 minutes' : '60 minút'}</option>
            <option value={90}>{isEn ? '90 minutes' : '90 minút'}</option>
            <option value={120}>{isEn ? '120 minutes' : '120 minút'}</option>
          </select>
        </Field>

        <div className="card bg-accent text-xs leading-relaxed" style={{ color: 'var(--text-on-accent)' }}>
          {isEn
            ? `✨ AI: after scheduling we auto-send a calendar invite, prepare a Zoom link, and generate baseline technical questions for ${candidate.position}.`
            : `✨ AI: Po naplánovaní automaticky pošleme kalendárovú pozvánku, pripravíme Zoom link a vygenerujeme základné technické otázky pre ${candidate.position}.`}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-subtle">
        <button onClick={onClose} className="btn-secondary text-sm">{isEn ? 'Cancel' : 'Zrušiť'}</button>
        <button onClick={handleSubmit} className="btn-primary text-sm">
          <CalendarIcon size={14} />
          {isEn ? 'Schedule interview' : 'Naplánovať pohovor'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============================================
// EMAIL MODAL
// ============================================
function EmailModal({
  candidate,
  onClose,
  onSend,
}: {
  candidate: Candidate;
  onClose: () => void;
  onSend: (id: string, subject: string, body: string) => void;
}) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const templates = [
    {
      id: 'screening',
      label: isEn ? 'Screening invite' : 'Screening pozvánka',
      subject: `Re: ${candidate.position} · Aurora`,
      body: isEn
        ? `Hello ${candidate.name.split(' ')[0]},

thank you for your interest in the ${candidate.position} role.

After reviewing your CV, we would like to schedule a short screening interview (30 min, video). Would any slot this week work for you?

Best regards,
Janka Horváthová
HR Manager · Aurora`
        : `Dobrý deň, ${candidate.name.split(' ')[0]},

ďakujeme za Váš záujem o pozíciu ${candidate.position}.

Po preštudovaní Vášho CV by sme s Vami radi absolvovali krátky screening pohovor (30 min, video). Vyhovuje Vám niektorý termín tento týždeň?

S pozdravom,
Janka Horváthová
HR Manager · Aurora`,
    },
    {
      id: 'interview',
      label: isEn ? 'Interview invite' : 'Pozvánka na pohovor',
      subject: isEn ? `Interview invitation · ${candidate.position}` : `Pozvánka na pohovor · ${candidate.position}`,
      body: isEn
        ? `Hello ${candidate.name.split(' ')[0]},

we are pleased to invite you to an interview for the ${candidate.position} role. The interview will be a video call (Zoom), duration ~60 minutes.

Topics:
- Your previous experience
- Technical questions relevant to the role
- Discussion about our team and culture
- Your questions for us

Best regards,
Janka Horváthová
HR Manager · Aurora`
        : `Dobrý deň, ${candidate.name.split(' ')[0]},

s potešením Vás pozývame na pohovor na pozíciu ${candidate.position}. Pohovor bude prebiehať vo formáte video calls (Zoom), trvanie ~60 minút.

Témy:
- Vaša doterajšia skúsenosť
- Technické otázky relevantné pre pozíciu
- Diskusia o našom tíme a kultúre
- Vaše otázky na nás

S pozdravom,
Janka Horváthová
HR Manager · Aurora`,
    },
    {
      id: 'offer',
      label: isEn ? 'Job offer' : 'Ponuka práce',
      subject: isEn ? `Job offer · ${candidate.position}` : `Ponuka práce · ${candidate.position}`,
      body: isEn
        ? `Hello ${candidate.name.split(' ')[0]},

we are happy to offer you the ${candidate.position} role in our company.

Details:
- Position: ${candidate.position}
- Salary: agreed during interview process
- Start date: negotiable
- Location: Bratislava / Remote
- Benefits: 25 vacation days, Multisport, BetterHelp, MacBook setup

You can find the full offer in the attachment. The offer is valid for 7 days.

We look forward to welcoming you to the team!

Janka Horváthová
HR Manager · Aurora`
        : `Dobrý deň, ${candidate.name.split(' ')[0]},

s potešením Vám ponúkame pozíciu ${candidate.position} v našej firme.

Detaily:
- Pozícia: ${candidate.position}
- Plat: dohodnutý počas pohovoru
- Nástup: dohodnuteľný
- Lokalita: Bratislava / Remote
- Benefity: 25 dní dovolenky, Multisport, BetterHelp, MacBook setup

Plné znenie ponuky nájdete v prílohe. Ponuka platí 7 dní.

Tešíme sa na Vás v tíme!

Janka Horváthová
HR Manager · Aurora`,
    },
    {
      id: 'rejection',
      label: isEn ? 'Rejection' : 'Zamietnutie',
      subject: `Re: ${candidate.position}`,
      body: isEn
        ? `Hello ${candidate.name.split(' ')[0]},

thank you for your time and interest in the ${candidate.position} role.

After careful consideration, we decided to continue with another candidate whose experience aligns more closely with our current needs.

We appreciate your application and will keep your CV in our database for relevant future opportunities.

We wish you all the best.

Best regards,
Janka Horváthová
HR Manager · Aurora`
        : `Dobrý deň, ${candidate.name.split(' ')[0]},

ďakujeme za Váš čas a záujem o pozíciu ${candidate.position}.

Po dôkladnom zvážení sme sa rozhodli pokračovať s iným kandidátom, ktorého skúsenosti viac zodpovedajú našim súčasným potrebám.

Ceníme si Vašu kandidatúru a Vaše CV si necháme v našej databáze pre prípad relevantných pozícií v budúcnosti.

Prajeme Vám veľa úspechov.

S pozdravom,
Janka Horváthová
HR Manager · Aurora`,
    },
  ];

  const [templateId, setTemplateId] = useState(templates[0].id);
  const [subject, setSubject] = useState(templates[0].subject);
  const [body, setBody] = useState(templates[0].body);

  const selectTemplate = (id: string) => {
    const t = templates.find((tt) => tt.id === id);
    if (!t) return;
    setTemplateId(id);
    setSubject(t.subject);
    setBody(t.body);
  };

  const handleSend = () => {
    onSend(candidate.id, subject, body);
  };

  return (
    <ModalShell onClose={onClose} title={`Email · ${candidate.name}`} icon={Mail}>
      <div className="space-y-4">
        <Field label={isEn ? 'To' : 'Pre'}>
          <input value={candidate.email} disabled className="input-field text-sm opacity-70" />
        </Field>

        <Field label={isEn ? 'Template' : 'Šablóna'}>
          <div className="flex flex-wrap gap-1">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t.id)}
                className={cn('badge', templateId === t.id && 'badge-accent')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={isEn ? 'Subject' : 'Predmet'}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field text-sm" />
        </Field>

        <Field label={isEn ? 'Message' : 'Správa'}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input-field text-sm resize-none font-mono"
            rows={12}
          />
        </Field>

        <div className="card bg-accent text-xs" style={{ color: 'var(--text-on-accent)' }}>
          {isEn
            ? '💡 Clicking "Open in mail" opens your default mail client with this draft. You can still edit it before sending.'
            : '💡 Po kliknutí "Otvoriť v Mail" sa otvorí Váš default email klient s vyplnenou správou. Môžete ju ešte upraviť pred odoslaním.'}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-subtle">
        <button onClick={onClose} className="btn-secondary text-sm">{isEn ? 'Cancel' : 'Zrušiť'}</button>
        <button onClick={handleSend} className="btn-primary text-sm">
          <Mail size={14} />
          {isEn ? 'Open in mail' : 'Otvoriť v Mail'}
        </button>
      </div>
    </ModalShell>
  );
}

// ============================================
// SHARED MODAL SHELL
// ============================================
function ModalShell({
  onClose,
  title,
  icon: Icon,
  children,
  closeOnBackdrop = false,
}: {
  onClose: () => void;
  title: string;
  icon: any;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
}) {
  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={closeOnBackdrop ? onClose : undefined}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="card max-w-2xl w-full p-0 overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col"
      >
        <div className="p-5 border-b border-subtle mesh-bg flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg accent-bg flex items-center justify-center text-white">
              <Icon size={18} />
            </div>
            <h2 className="font-display text-2xl">{title}</h2>
          </div>
          <button onClick={onClose} className="btn-ghost"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-tertiary block mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-tertiary text-xs">{label}</span>
      <span className="text-primary text-right">{value}</span>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Target, Star, MessageSquare, TrendingUp, CheckCircle2,
  Clock, AlertCircle, Sparkles, X, ChevronRight, Award
} from 'lucide-react';
import { performanceReviews } from '../data/hrData';
import { getEmployeeById } from '../data/employees';
import { LeadCTA } from './Requests';
import { cn, formatDate } from '../lib/utils';
import type { PerformanceReview, PerformanceGoal } from '../types';

interface PerformanceProps {
  onLeadCapture: (module: string) => void;
}

const statusConfig = {
  scheduled: { label: 'Naplanovane', color: '#3b82f6', icon: Clock },
  'in-progress': { label: 'Prebieha', color: '#f59e0b', icon: TrendingUp },
  completed: { label: 'Dokoncene', color: '#10b981', icon: CheckCircle2 },
};

const goalStatusConfig = {
  'on-track': { label: 'V case', color: '#10b981' },
  'at-risk': { label: 'V riziku', color: '#f59e0b' },
  'off-track': { label: 'Mimo planu', color: '#ef4444' },
  achieved: { label: 'Splneny', color: '#10b981' },
};

export function Performance({ onLeadCapture }: PerformanceProps) {
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in-progress' | 'completed'>('all');

  const filtered = filter === 'all' ? performanceReviews : performanceReviews.filter((r) => r.status === filter);

  const stats = {
    total: performanceReviews.length,
    completed: performanceReviews.filter((r) => r.status === 'completed').length,
    inProgress: performanceReviews.filter((r) => r.status === 'in-progress').length,
    scheduled: performanceReviews.filter((r) => r.status === 'scheduled').length,
    avgScore: performanceReviews
      .filter((r) => r.overallScore)
      .reduce((sum, r) => sum + (r.overallScore || 0), 0) /
      performanceReviews.filter((r) => r.overallScore).length || 0,
  };

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">People Development</p>
          <h1 className="font-display text-3xl">Performance Reviews</h1>
          <p className="text-secondary text-sm mt-1">
            Q2 2026 cycle · {stats.completed}/{stats.total} dokoncenych · Average score {stats.avgScore.toFixed(1)}
          </p>
        </div>
        <button className="btn-primary text-sm">
          <Sparkles size={14} />
          Spustit Q3 cyklus
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Total reviews"
          value={stats.total}
          color="#3b82f6"
        />
        <StatCard
          icon={CheckCircle2}
          label="Dokoncene"
          value={stats.completed}
          color="#10b981"
        />
        <StatCard
          icon={TrendingUp}
          label="Prebiehaju"
          value={stats.inProgress}
          color="#f59e0b"
        />
        <StatCard
          icon={Star}
          label="Avg score"
          value={stats.avgScore.toFixed(1)}
          color="#8b5cf6"
        />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Vsetko' },
          { key: 'scheduled', label: 'Naplanovane' },
          { key: 'in-progress', label: 'Prebiehaju' },
          { key: 'completed', label: 'Dokoncene' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={cn('badge', filter === f.key && 'badge-accent')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((review) => {
          const emp = getEmployeeById(review.employeeId);
          const reviewer = getEmployeeById(review.reviewerId);
          const cfg = statusConfig[review.status];
          const StatusIcon = cfg.icon;
          if (!emp) return null;

          return (
            <motion.button
              key={review.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedReview(review)}
              className="card text-left card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img src={emp.avatar} className="w-12 h-12 rounded-full" alt="" />
                  <div>
                    <p className="font-medium text-sm">{emp.name}</p>
                    <p className="text-xs text-tertiary">{emp.role}</p>
                  </div>
                </div>
                <span
                  className="badge text-[10px] flex items-center gap-1"
                  style={{ background: cfg.color + '20', color: cfg.color }}
                >
                  <StatusIcon size={10} />
                  {cfg.label}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-tertiary mb-3">
                <span>{review.period}</span>
                <span>·</span>
                <span>{formatDate(review.scheduledDate)}</span>
                {reviewer && (
                  <>
                    <span>·</span>
                    <span>Reviewer: {reviewer.name.split(' ')[0]}</span>
                  </>
                )}
              </div>

              {review.overallScore && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.floor(review.overallScore!) ? 'fill-amber-400 text-amber-400' : 'text-tertiary'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.overallScore} / 5.0</span>
                </div>
              )}

              {review.goals && review.goals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-subtle">
                  <p className="text-[10px] uppercase tracking-wider text-tertiary mb-2">
                    {review.goals.length} {review.goals.length === 1 ? 'ciel' : 'cielov'}
                  </p>
                  <div className="space-y-1.5">
                    {review.goals.slice(0, 2).map((g) => (
                      <MiniGoalBar key={g.id} goal={g} />
                    ))}
                    {review.goals.length > 2 && (
                      <p className="text-[10px] text-tertiary text-center">+{review.goals.length - 2} dalsie</p>
                    )}
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedReview && (
          <ReviewDetailPanel
            review={selectedReview}
            onClose={() => setSelectedReview(null)}
          />
        )}
      </AnimatePresence>

      <LeadCTA module="Performance Reviews" onLeadCapture={onLeadCapture} />
    </div>
  );
}

function MiniGoalBar({ goal }: { goal: PerformanceGoal }) {
  const cfg = goalStatusConfig[goal.status];
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="truncate flex-1 text-secondary">{goal.title}</span>
        <span className="font-mono ml-2" style={{ color: cfg.color }}>{goal.progress}%</span>
      </div>
      <div className="h-1 bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${goal.progress}%`, background: cfg.color }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div whileHover={{ y: -2 }} className="card">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
        style={{ background: color + '20', color }}
      >
        <Icon size={16} />
      </div>
      <p className="font-display text-2xl">{value}</p>
      <p className="text-xs text-tertiary">{label}</p>
    </motion.div>
  );
}

function ReviewDetailPanel({ review, onClose }: { review: PerformanceReview; onClose: () => void }) {
  const emp = getEmployeeById(review.employeeId);
  const reviewer = getEmployeeById(review.reviewerId);
  if (!emp) return null;

  const cfg = statusConfig[review.status];

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
        className="bg-secondary h-full w-full max-w-2xl overflow-y-auto"
      >
        {/* Hero */}
        <div className="relative p-6 text-white" style={{ background: cfg.color }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3">
            <img src={emp.avatar} alt={emp.name} className="w-16 h-16 rounded-full border-4 border-white/40" />
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">{review.period} Performance Review</p>
              <h2 className="font-display text-2xl">{emp.name}</h2>
              <p className="text-sm opacity-90">{emp.role}</p>
            </div>
          </div>
          {review.overallScore && (
            <div className="mt-4 flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} className={i < Math.floor(review.overallScore!) ? 'fill-white' : ''} />
                ))}
              </div>
              <span className="font-display text-2xl">{review.overallScore} / 5.0</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Strengths */}
          {review.strengths && review.strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award size={16} style={{ color: 'var(--success)' }} />
                <p className="font-medium">Silne stranky</p>
              </div>
              <ul className="space-y-2">
                {review.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 size={14} style={{ color: 'var(--success)' }} className="mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {review.improvements && review.improvements.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} style={{ color: 'var(--warning)' }} />
                <p className="font-medium">Oblasti na rozvoj</p>
              </div>
              <ul className="space-y-2">
                {review.improvements.map((i, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertCircle size={14} style={{ color: 'var(--warning)' }} className="mt-0.5 flex-shrink-0" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Goals */}
          {review.goals && review.goals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} className="accent-text" />
                <p className="font-medium">Ciele ({review.goals.length})</p>
              </div>
              <div className="space-y-3">
                {review.goals.map((g) => {
                  const gcfg = goalStatusConfig[g.status];
                  return (
                    <div key={g.id} className="card p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{g.title}</p>
                          <p className="text-xs text-tertiary mt-0.5">{g.description}</p>
                        </div>
                        <span
                          className="badge text-[10px] flex-shrink-0"
                          style={{ background: gcfg.color + '20', color: gcfg.color }}
                        >
                          {gcfg.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-tertiary">Pokrok</span>
                        <span className="font-mono font-medium" style={{ color: gcfg.color }}>{g.progress}%</span>
                      </div>
                      <div className="h-2 bg-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${g.progress}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full rounded-full"
                          style={{ background: gcfg.color }}
                        />
                      </div>
                      <p className="text-[10px] text-tertiary mt-2">Deadline: {formatDate(g.dueDate)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 360 Feedback */}
          {review.feedback360 && review.feedback360.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={16} style={{ color: '#8b5cf6' }} />
                <p className="font-medium">360° Feedback ({review.feedback360.length})</p>
              </div>
              <div className="space-y-2">
                {review.feedback360.map((fb, i) => {
                  const from = getEmployeeById(fb.fromId);
                  return (
                    <div key={i} className="card p-3">
                      <div className="flex items-start gap-2 mb-2">
                        {fb.anonymous ? (
                          <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-xs">
                            👤
                          </div>
                        ) : (
                          from && <img src={from.avatar} className="w-8 h-8 rounded-full" alt="" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">
                            {fb.anonymous ? 'Anonymny' : from?.name || 'Unknown'}
                          </p>
                          <p className="text-[10px] text-tertiary capitalize">{fb.fromRole}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              size={10}
                              className={idx < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-tertiary'}
                            />
                          ))}
                        </div>
                      </div>
                      {fb.comment && (
                        <p className="text-sm text-secondary italic">"{fb.comment}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviewer */}
          {reviewer && (
            <div className="pt-4 border-t border-subtle">
              <p className="text-xs uppercase tracking-wider text-tertiary mb-2">Reviewer</p>
              <div className="flex items-center gap-2">
                <img src={reviewer.avatar} className="w-9 h-9 rounded-full" alt="" />
                <div>
                  <p className="text-sm font-medium">{reviewer.name}</p>
                  <p className="text-xs text-tertiary">{reviewer.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

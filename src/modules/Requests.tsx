import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FileText, CheckCircle2, XCircle, Clock, Plus, Sparkles,
  Plane, Laptop, GraduationCap, MapPin, MoreHorizontal
} from 'lucide-react';
import { requests as initialRequests } from '../data/content';
import { useLanguage } from '../hooks/useLanguage';
import { formatDate, cn } from '../lib/utils';
import type { Request } from '../types';

interface RequestsProps {
  onLeadCapture: (module: string) => void;
}

const typeIcons = {
  leave: Plane,
  equipment: Laptop,
  training: GraduationCap,
  travel: MapPin,
  other: FileText,
};

const typeLabels = {
  leave: 'Dovolenka',
  equipment: 'Vybavenie',
  training: 'Školenie',
  travel: 'Cesta',
  other: 'Iné',
};

export function Requests({ onLeadCapture }: RequestsProps) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const updateStatus = (id: string, status: Request['status']) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-tertiary uppercase tracking-wider mb-1">Workflow</p>
          <h1 className="font-display text-3xl">{isEn ? 'Requests & Approvals' : 'Žiadanky & Schvaľovanie'}</h1>
          <p className="text-secondary text-sm mt-1">
            {isEn ? 'Central place for vacation, equipment, training and more' : 'Centrálne miesto pre dovolenky, equipment, školenia a viac'}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary text-sm">
            <Plus size={14} />
            {isEn ? 'New request' : 'Nová žiadanka'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: requests.filter((r) => r.status === 'pending').length, icon: Clock, color: '#f59e0b' },
          { label: isEn ? 'Approved' : 'Schválené', value: requests.filter((r) => r.status === 'approved').length, icon: CheckCircle2, color: '#10b981' },
          { label: isEn ? 'Rejected' : 'Zamietnuté', value: requests.filter((r) => r.status === 'rejected').length, icon: XCircle, color: '#ef4444' },
          { label: isEn ? 'Total' : 'Celkom', value: requests.length, icon: FileText, color: '#3b82f6' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card cursor-pointer"
            onClick={() => setFilter(s.label.toLowerCase() as any)}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
              style={{ background: s.color + '20', color: s.color }}
            >
              <s.icon size={16} />
            </div>
            <p className="font-display text-2xl">{s.value}</p>
            <p className="text-xs text-tertiary">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all', label: isEn ? 'All' : 'Všetky' },
          { key: 'pending', label: isEn ? 'Pending' : 'Čakajú' },
          { key: 'approved', label: isEn ? 'Approved' : 'Schválené' },
          { key: 'rejected', label: isEn ? 'Rejected' : 'Zamietnuté' },
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

      {/* Requests list */}
      <div className="card p-0 overflow-hidden">
        <div className="divide-y divide-subtle">
          {filtered.map((req, i) => {
            const Icon = typeIcons[req.type];
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 hover:bg-tertiary/30 transition-colors flex items-center gap-4"
              >
                <img src={req.requesterAvatar} className="w-10 h-10 rounded-full" alt="" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon size={14} className="text-tertiary" />
                    <span className="text-xs text-tertiary uppercase tracking-wider">
                      {isEn
                        ? ({ leave: 'Vacation', equipment: 'Equipment', training: 'Training', travel: 'Travel', other: 'Other' } as any)[req.type]
                        : typeLabels[req.type]}
                    </span>
                    {req.amount && <span className="text-xs text-tertiary">· {req.amount} €</span>}
                  </div>
                  <p className="font-medium text-sm">{req.title}</p>
                  <p className="text-xs text-tertiary mt-0.5">
                    {req.requester} · {formatDate(req.date)}
                  </p>
                </div>

                <div className="hidden md:block max-w-xs text-xs text-secondary truncate">
                  {req.description}
                </div>

                <div>
                  {req.status === 'pending' ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateStatus(req.id, 'approved')}
                        className="px-3 py-1.5 rounded text-xs font-medium text-white"
                        style={{ background: 'var(--success)' }}
                      >
                        {isEn ? 'Approve' : 'Schváliť'}
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, 'rejected')}
                        className="px-3 py-1.5 rounded text-xs font-medium"
                        style={{ background: 'color-mix(in srgb, var(--danger) 15%, transparent)', color: 'var(--danger)' }}
                      >
                        {isEn ? 'Reject' : 'Zamietnuť'}
                      </button>
                    </div>
                  ) : (
                    <span className={cn(
                      'badge',
                      req.status === 'approved' ? 'badge-success' : 'badge-danger'
                    )}>
                      {req.status === 'approved'
                        ? (isEn ? '✓ Approved' : '✓ Schválené')
                        : (isEn ? '✗ Rejected' : '✗ Zamietnuté')}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lead capture CTA */}
      <LeadCTA module={isEn ? 'Requests & Approvals' : 'Žiadanky & Schvaľovanie'} onLeadCapture={onLeadCapture} />
    </div>
  );
}

export function LeadCTA({ module, onLeadCapture }: { module: string; onLeadCapture: (m: string) => void }) {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden mesh-bg border-2 border-medium"
    >
      <div className="relative flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl accent-bg flex items-center justify-center text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-medium">{isEn ? `Do you like "${module}" module?` : `Páči sa ti modul "${module}"?`}</p>
            <p className="text-sm text-secondary">{isEn ? 'We will tailor it to your company.' : 'Postavíme ti to na mieru pre tvoju firmu.'}</p>
          </div>
        </div>
        <button
          onClick={() => onLeadCapture(module)}
          className="btn-primary"
        >
          {isEn ? 'I want this in my company →' : 'Chcem to v mojej firme →'}
        </button>
      </div>
    </motion.div>
  );
}

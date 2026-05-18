import { motion } from 'framer-motion';
import { UserCircle, Crown, Eye, ArrowRight } from 'lucide-react';
import type { UserRole, Page } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useDesignMode } from '../hooks/useDesignMode';

interface RolePickerProps {
  onSelect: (role: UserRole, page: Page) => void;
}

export function RolePicker(props: RolePickerProps) {
  const { mode } = useDesignMode();
  if (mode === 'editorial') return <RolePickerEditorial {...props} />;
  if (mode === 'brutalist') return <RolePickerBrutalist {...props} />;
  return <RolePickerClassic {...props} />;
}

function getRoles(t: (key: string) => string) {
  return [
    {
      id: 'employee' as UserRole,
      icon: UserCircle,
      title: t('rolePicker.employeeTitle'),
      description: t('rolePicker.employeeBody'),
      color: '#10b981',
      target: 'employee-dashboard' as Page,
    },
    {
      id: 'admin' as UserRole,
      icon: Crown,
      title: t('rolePicker.adminTitle'),
      description: t('rolePicker.adminBody'),
      color: '#f97316',
      target: 'admin-dashboard' as Page,
    },
    {
      id: 'both' as UserRole,
      icon: Eye,
      title: t('rolePicker.bothTitle'),
      description: t('rolePicker.bothBody'),
      color: '#2563eb',
      target: 'employee-dashboard' as Page,
      recommended: true,
    },
  ];
}

// ============================================
// CLASSIC ROLE PICKER — original look
// ============================================
function RolePickerClassic({ onSelect }: RolePickerProps) {
  const { t } = useLanguage();
  const roles = getRoles(t);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-wider text-tertiary mb-3">{t('rolePicker.step')}</p>
          <h1 className="font-display text-5xl mb-4">
            {t('rolePicker.headline')}
          </h1>
          <p className="text-secondary max-w-md mx-auto">
            {t('rolePicker.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => onSelect(role.id, role.target)}
                className="card card-hover text-left relative group p-6"
                style={{ minHeight: 220 }}
              >
                {role.recommended && (
                  <span className="absolute -top-2 right-4 badge badge-accent">
                    ⭐ {t('rolePicker.recommended')}
                  </span>
                )}

                <div
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                  style={{ background: role.color + '20', color: role.color }}
                >
                  <Icon size={24} />
                </div>

                <h3 className="font-medium text-lg mb-2">{role.title}</h3>
                <p className="text-sm text-secondary mb-4 leading-relaxed">
                  {role.description}
                </p>

                <div className="flex items-center gap-1 text-sm font-medium accent-text group-hover:gap-2 transition-all">
                  {t('rolePicker.start')}
                  <ArrowRight size={14} />
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-tertiary mt-8"
        >
          💡 {t('rolePicker.tip')}
        </motion.p>
      </div>
    </div>
  );
}

// ============================================
// EDITORIAL ROLE PICKER — Mix A+B aesthetic
// ============================================
function RolePickerEditorial({ onSelect }: RolePickerProps) {
  const { t } = useLanguage();
  const roles = getRoles(t);

  return (
    <div className="ed-root min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ed-bg)' }}>
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="ed-section-num">00 — Setup</span>
            <span className="ed-tag">{t('rolePicker.step')}</span>
          </div>

          <h1 className="ed-display text-5xl md:text-6xl mb-4 max-w-3xl" style={{ lineHeight: 0.95 }}>
            {t('rolePicker.headline')}
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl"
            style={{ color: 'var(--ed-text-secondary)', letterSpacing: '-0.01em' }}
          >
            {t('rolePicker.subtitle')}
          </p>
        </motion.div>

        <hr className="ed-divider mb-10" />

        {/* Role tiles — editorial grid with 1px dividers */}
        <div className="grid md:grid-cols-3 gap-px" style={{ background: 'var(--ed-border)' }}>
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                onClick={() => onSelect(role.id, role.target)}
                className="text-left p-8 group transition-colors relative"
                style={{ background: 'var(--ed-surface)', minHeight: 280 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--ed-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--ed-surface)';
                }}
              >
                {role.recommended && (
                  <span
                    className="absolute top-4 right-4 ed-tag"
                    data-status="live"
                  >
                    {t('rolePicker.recommended')}
                  </span>
                )}

                <span className="ed-section-num mb-6 block">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <Icon size={28} strokeWidth={1.5} style={{ color: 'var(--ed-text)' }} className="mb-6" />

                <h3 className="ed-headline text-2xl mb-3" style={{ fontWeight: 500 }}>
                  {role.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: 'var(--ed-text-secondary)' }}
                >
                  {role.description}
                </p>

                <div
                  className="ed-mono flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{ color: 'var(--ed-text)', fontSize: '0.75rem' }}
                >
                  {t('rolePicker.start')}
                  <ArrowRight size={12} strokeWidth={1.5} />
                </div>
              </motion.button>
            );
          })}
        </div>

        <hr className="ed-divider mt-10 mb-6" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="ed-mono"
          style={{ color: 'var(--ed-text-tertiary)' }}
        >
          — {t('rolePicker.tip')}
        </motion.p>
      </div>
    </div>
  );
}

// ============================================
// BRUTALIST ROLE PICKER — hard borders, signal red
// ============================================
function RolePickerBrutalist({ onSelect }: RolePickerProps) {
  const { t } = useLanguage();
  const roles = getRoles(t);

  return (
    <div className="br-root min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--br-bg)' }}>
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="br-index-large">/ 00</span>
            <span className="br-eyebrow">SETUP</span>
            <span className="br-tag" data-tone="outline">{t('rolePicker.step').toUpperCase()}</span>
          </div>

          <h1 className="br-poster text-6xl md:text-8xl mb-6 max-w-4xl" style={{ lineHeight: 0.9 }}>
            {t('rolePicker.headline')}
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed max-w-2xl"
            style={{ color: 'var(--br-text-secondary)', letterSpacing: '-0.005em' }}
          >
            {t('rolePicker.subtitle')}
          </p>
        </motion.div>

        <hr className="br-divider mb-0" />

        {/* Role tiles — hard grid */}
        <div
          className="grid md:grid-cols-3 gap-0"
          style={{ border: '1px solid var(--br-border)', borderTop: 'none' }}
        >
          {roles.map((role, i) => {
            const Icon = role.icon;
            const isLast = i === roles.length - 1;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                onClick={() => onSelect(role.id, role.target)}
                className="text-left p-8 group transition-colors relative"
                style={{
                  background: role.recommended ? 'var(--br-text)' : 'var(--br-surface)',
                  color: role.recommended ? 'var(--br-bg)' : 'var(--br-text)',
                  minHeight: 300,
                  borderRight: isLast ? 'none' : '1px solid var(--br-border)',
                }}
                onMouseEnter={(e) => {
                  if (!role.recommended) {
                    e.currentTarget.style.background = 'var(--br-surface-2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!role.recommended) {
                    e.currentTarget.style.background = 'var(--br-surface)';
                  }
                }}
              >
                {role.recommended && (
                  <span
                    className="absolute top-6 right-6 br-tag"
                    style={{ background: 'var(--br-accent)' }}
                  >
                    {t('rolePicker.recommended').toUpperCase()}
                  </span>
                )}

                <span
                  className="br-index-large mb-6 block"
                  style={{ color: role.recommended ? 'var(--br-accent)' : 'var(--br-text)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <Icon
                  size={32}
                  strokeWidth={2}
                  style={{ color: role.recommended ? 'var(--br-bg)' : 'var(--br-text)' }}
                  className="mb-6"
                />

                <h3 className="br-headline text-3xl mb-3" style={{ fontWeight: 500 }}>
                  {role.title}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: role.recommended ? 'rgba(244, 241, 236, 0.8)' : 'var(--br-text-secondary)' }}
                >
                  {role.description}
                </p>

                <div
                  className="br-mono flex items-center gap-1 group-hover:gap-2 transition-all"
                  style={{
                    color: role.recommended ? 'var(--br-accent)' : 'var(--br-text)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('rolePicker.start')}
                  <ArrowRight size={12} strokeWidth={2} />
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="br-mono mt-8"
          style={{ color: 'var(--br-text-tertiary)' }}
        >
          <span style={{ color: 'var(--br-accent)', fontWeight: 700 }}>×</span> {t('rolePicker.tip').toUpperCase()}
        </motion.p>
      </div>
    </div>
  );
}

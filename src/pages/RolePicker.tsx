import { motion } from 'framer-motion';
import { UserCircle, Crown, Eye, ArrowRight } from 'lucide-react';
import type { UserRole, Page } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface RolePickerProps {
  onSelect: (role: UserRole, page: Page) => void;
}

export function RolePicker({ onSelect }: RolePickerProps) {
  const { t } = useLanguage();
  const roles = [
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

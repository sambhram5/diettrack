import React from 'react';
import { clsx } from 'clsx';

// ProgressBar
interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value, max = 100, color = 'var(--brand)', size = 'md', showLabel = false
}) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const heights = { sm: '4px', md: '6px', lg: '10px' };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
        </div>
      )}
      <div className="progress-bar" style={{ height: heights[size] }}>
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
        />
      </div>
    </div>
  );
};

// MacroPill
interface MacroPillProps {
  label: string;
  value: number;
  target?: number | null;
  unit?: string;
  color: string;
}

export const MacroPill: React.FC<MacroPillProps> = ({ label, value, target, unit = 'g', color }) => (
  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl flex-1 min-w-0"
    style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>{label}</span>
    <span className="text-xl font-bold" style={{ color, fontFamily: 'Syne' }}>{Math.round(value)}{unit}</span>
    {target && (
      <div className="w-full">
        <ProgressBar value={value} max={target} color={color} size="sm" />
        <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>/ {Math.round(target)}{unit}</p>
      </div>
    )}
  </div>
);

// StatCard
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, color = 'var(--brand)', trend, className }) => (
  <div className={clsx('card', className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="label">{label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold" style={{ fontFamily: 'Syne', color }}>{value}</span>
          {unit && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{unit}</span>}
        </div>
        {trend && (
          <p className="text-xs mt-2" style={{ color: trend.value >= 0 ? '#4ade80' : '#f87171' }}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
          </p>
        )}
      </div>
      {icon && (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, color }}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

// Skeleton
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('skeleton', className)} />
);

export const CardSkeleton: React.FC = () => (
  <div className="card space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-2 w-full" />
  </div>
);

// Empty state
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Syne' }}>{title}</h3>
    <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>{description}</p>
    {action}
  </div>
);

// Modal
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, width = '500px' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl overflow-hidden w-full" style={{
        maxWidth: width, background: 'var(--surface-2)',
        border: '1px solid var(--border-bright)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
      }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne' }}>{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// Streak badge
interface StreakBadgeProps { count: number; label: string; icon: string; }
export const StreakBadge: React.FC<StreakBadgeProps> = ({ count, label, icon }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl"
    style={{ background: 'var(--surface-3)', border: count > 0 ? '1px solid rgba(34,197,94,0.2)' : '1px solid var(--border)' }}>
    <span className="text-xl">{icon}</span>
    <span className="text-2xl font-bold" style={{ fontFamily: 'Syne', color: count > 0 ? 'var(--brand)' : 'var(--text-muted)' }}>{count}</span>
    <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
  </div>
);

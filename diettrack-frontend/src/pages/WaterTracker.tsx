import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Droplets, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { waterService } from '../services/water.service';
import { useAuth } from '../contexts/AuthContext';
import { ProgressBar, EmptyState, Skeleton } from '../components/ui';
import { getErrorMessage } from '../utils';
import toast from 'react-hot-toast';

const QUICK_AMOUNTS = [250, 500, 750, 1000];

export const WaterTracker: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [custom, setCustom] = useState('');
  const isToday = date === format(new Date(), 'yyyy-MM-dd');

  const changeDate = (dir: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  const { data, isLoading } = useQuery({
    queryKey: ['water', date],
    queryFn: () => waterService.getWater(date),
    staleTime: 30_000,
  });

  const logWater = useMutation({
    mutationFn: (amount: number) => waterService.logWater({ amount, date }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['water', date] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Water logged! 💧');
      setCustom('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteLog = useMutation({
    mutationFn: waterService.deleteWater,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['water', date] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Entry removed');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const total = data?.total ?? 0;
  const logs = data?.logs ?? [];
  const goal = user?.waterGoal ?? 2000;
  const progress = Math.min(100, Math.round((total / goal) * 100));
  const remaining = Math.max(0, goal - total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne' }}>Water Tracker</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
            {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => changeDate(-1)} className="btn-secondary p-2"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))} className="btn-secondary px-3 py-2 text-sm" disabled={isToday}>Today</button>
          <button onClick={() => changeDate(1)} className="btn-secondary p-2" disabled={isToday}><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Main progress card */}
      <div className="card animate-fade-up" style={{ background: 'linear-gradient(135deg, var(--surface-2) 0%, rgba(56,189,248,0.05) 100%)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}>
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="label">Daily Hydration</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ fontFamily: 'Syne', color: '#38bdf8' }}>
                {total >= 1000 ? `${(total / 1000).toFixed(1)}L` : `${total}ml`}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>/ {goal >= 1000 ? `${(goal / 1000).toFixed(1)}L` : `${goal}ml`}</span>
            </div>
          </div>
          <div className="ml-auto">
            <span className={`badge ${progress >= 100 ? 'badge-green' : 'badge-blue'}`}>
              {progress >= 100 ? '✓ Goal met!' : `${progress}%`}
            </span>
          </div>
        </div>
        <ProgressBar value={total} max={goal} color="#38bdf8" size="lg" />
        {remaining > 0 && (
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{remaining >= 1000 ? `${(remaining / 1000).toFixed(1)}L` : `${remaining}ml`}</strong> remaining to reach your goal
          </p>
        )}

        {/* Visual cups */}
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {Array.from({ length: Math.ceil(goal / 250) }).map((_, i) => {
            const filled = (i + 1) * 250 <= total;
            const partial = !filled && i * 250 < total;
            return (
              <div key={i} className="w-7 h-8 rounded-md transition-all duration-300 text-sm flex items-end justify-center pb-0.5"
                style={{
                  background: filled ? 'rgba(56,189,248,0.4)' : partial ? 'rgba(56,189,248,0.15)' : 'var(--surface-4)',
                  border: `1px solid ${filled ? 'rgba(56,189,248,0.5)' : 'var(--border)'}`,
                  fontSize: '10px',
                }}>
                {filled ? '💧' : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick add */}
      <div className="card animate-fade-up stagger-1">
        <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne' }}>Quick Add</h2>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {QUICK_AMOUNTS.map(amount => (
            <button key={amount} onClick={() => logWater.mutate(amount)}
              disabled={logWater.isPending}
              className="flex flex-col items-center gap-1.5 py-4 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                fontFamily: 'Syne',
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                color: '#38bdf8',
              }}>
              <Droplets className="w-5 h-5" />
              <span className="text-sm">{amount >= 1000 ? `${amount / 1000}L` : `${amount}ml`}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <input type="number" className="input" placeholder="Custom amount (ml)"
            value={custom} onChange={e => setCustom(e.target.value)}
            min={1} max={5000} />
          <button className="btn-primary px-5" disabled={!custom || logWater.isPending}
            onClick={() => { if (custom) logWater.mutate(parseInt(custom)); }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Log history */}
      <div className="card animate-fade-up stagger-2">
        <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne' }}>Today's Log</h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : logs.length === 0 ? (
          <EmptyState icon={<Droplets className="w-6 h-6" />} title="No water logged"
            description="Use the quick-add buttons above to log your water intake" />
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">💧</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ fontFamily: 'Syne', color: '#38bdf8' }}>
                      {log.amount >= 1000 ? `${(log.amount / 1000).toFixed(1)}L` : `${log.amount}ml`}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {format(new Date(log.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <button className="btn-ghost p-1.5" style={{ color: '#f87171' }}
                  onClick={() => deleteLog.mutate(log.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Scale, Plus, Trash2, Edit2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { weightService } from '../services/weight.service';
import { useAuth } from '../contexts/AuthContext';
import { StatCard, EmptyState, Skeleton, Modal } from '../components/ui';
import { getErrorMessage, round1 } from '../utils';
import { WeightLog } from '../types';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';

export const WeightTracker: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [period, setPeriod] = useState<30 | 90 | 365>(30);
  const [showAdd, setShowAdd] = useState(false);
  const [editLog, setEditLog] = useState<WeightLog | null>(null);
  const [form, setForm] = useState({ weight: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['weights', period],
    queryFn: () => weightService.getWeights(period),
    staleTime: 30_000,
  });

  const createMut = useMutation({
    mutationFn: weightService.createWeight,
    onSuccess: () => { toast.success('Weight logged!'); qc.invalidateQueries({ queryKey: ['weights'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); setShowAdd(false); setForm({ weight: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { weight?: number; notes?: string } }) => weightService.updateWeight(id, data),
    onSuccess: () => { toast.success('Updated!'); qc.invalidateQueries({ queryKey: ['weights'] }); setEditLog(null); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMut = useMutation({
    mutationFn: weightService.deleteWeight,
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['weights'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const chartData = [...logs].reverse().map(l => ({
    date: format(parseISO(l.date), 'MMM d'),
    weight: l.weight,
  }));

  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latest = sorted[0]?.weight;
  const earliest = sorted[sorted.length - 1]?.weight;
  const change = latest && earliest ? round1(latest - earliest) : 0;
  const minW = logs.length ? Math.min(...logs.map(l => l.weight)) - 1 : 50;
  const maxW = logs.length ? Math.max(...logs.map(l => l.weight)) + 1 : 100;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string } }> }) => {
    if (active && payload?.length) return (
      <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)' }}>{payload[0].payload.date}</p>
        <p className="font-bold" style={{ color: '#a78bfa' }}>{payload[0].value} kg</p>
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne' }}>Weight Tracker</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Monitor your progress over time</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Log Weight
        </button>
      </div>

      {/* Stats row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Current Weight" value={latest ?? user?.weight ?? '—'} unit="kg" icon={<Scale className="w-5 h-5" />} color="#a78bfa" className="animate-fade-up" />
        <StatCard label={`${period}d Change`} value={change >= 0 ? `+${change}` : change} unit="kg"
          icon={change < 0 ? <TrendingDown className="w-5 h-5" /> : change > 0 ? <TrendingUp className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
          color={change < 0 ? '#4ade80' : change > 0 ? '#f87171' : '#94a3b8'} className="animate-fade-up stagger-1" />
        <StatCard label="Entries Logged" value={logs.length} unit="entries" icon={<Scale className="w-5 h-5" />} color="#60a5fa" className="animate-fade-up stagger-2" />
      </div>

      {/* Chart */}
      <div className="card animate-fade-up stagger-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold" style={{ fontFamily: 'Syne' }}>Weight Trend</h2>
          <div className="flex gap-1">
            {([30, 90, 365] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={period === p ? 'btn-primary py-1.5 px-3 text-sm' : 'btn-secondary py-1.5 px-3 text-sm'}>
                {p === 365 ? '1y' : `${p}d`}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? <Skeleton className="h-48" /> : chartData.length < 2 ? (
          <div className="h-48 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
            Log at least 2 entries to see your trend
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
              <YAxis domain={[minW, maxW]} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} unit="kg" width={40} />
              <Tooltip content={<CustomTooltip />} />
              {user?.weight && <ReferenceLine y={user.weight} stroke="rgba(167,139,250,0.3)" strokeDasharray="4 4" />}
              <Line type="monotone" dataKey="weight" stroke="#a78bfa" strokeWidth={2.5}
                dot={{ fill: '#a78bfa', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#c084fc' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Log history */}
      <div className="card animate-fade-up stagger-4">
        <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne' }}>History</h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : sorted.length === 0 ? (
          <EmptyState icon={<Scale className="w-6 h-6" />} title="No entries yet"
            description="Log your first weight entry to start tracking progress"
            action={<button className="btn-primary" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Log Weight</button>} />
        ) : (
          <div className="space-y-2">
            {sorted.map((log, i) => {
              const prev = sorted[i + 1];
              const diff = prev ? round1(log.weight - prev.weight) : null;
              return (
                <div key={log.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <Scale className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                    <div>
                      <p className="font-bold" style={{ fontFamily: 'Syne', color: '#a78bfa' }}>{log.weight} kg</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {format(parseISO(log.date), 'EEE, MMM d, yyyy')}
                      </p>
                    </div>
                    {diff !== null && (
                      <span className="badge" style={{ background: diff < 0 ? 'rgba(74,222,128,0.15)' : diff > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(148,163,184,0.15)', color: diff < 0 ? '#4ade80' : diff > 0 ? '#f87171' : '#94a3b8', border: 'none' }}>
                        {diff > 0 ? '+' : ''}{diff} kg
                      </span>
                    )}
                    {log.notes && <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>📝 {log.notes}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="btn-ghost p-1.5" onClick={() => { setEditLog(log); setForm({ weight: String(log.weight), date: log.date, notes: log.notes || '' }); }}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn-ghost p-1.5" style={{ color: '#f87171' }}
                      onClick={() => { if (confirm('Delete this entry?')) deleteMut.mutate(log.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={showAdd || !!editLog} onClose={() => { setShowAdd(false); setEditLog(null); }}
        title={editLog ? 'Edit Weight Entry' : 'Log Weight'}>
        <div className="space-y-4">
          <div>
            <label className="label">Weight (kg)</label>
            <input type="number" step="0.1" min="20" max="500" className="input"
              placeholder="e.g. 74.5" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
          </div>
          {!editLog && (
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="e.g. morning, after workout..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-1">
            <button className="btn-secondary flex-1" onClick={() => { setShowAdd(false); setEditLog(null); }}>Cancel</button>
            <button className="btn-primary flex-1" disabled={!form.weight || createMut.isPending || updateMut.isPending}
              onClick={() => {
                if (editLog) {
                  updateMut.mutate({ id: editLog.id, data: { weight: parseFloat(form.weight), notes: form.notes } });
                } else {
                  createMut.mutate({ weight: parseFloat(form.weight), date: form.date, notes: form.notes });
                }
              }}>
              {createMut.isPending || updateMut.isPending ? 'Saving...' : editLog ? 'Update' : 'Log Weight'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

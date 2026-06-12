import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Target, Droplets, TrendingDown, TrendingUp, Minus, Calendar } from 'lucide-react';
import { exportService } from '../../services/export.service';
import { Modal, ProgressBar } from './index';

interface WeeklyData {
  week: { start: string; end: string };
  summary: {
    daysLogged: number;
    avgCalories: number;
    avgProtein: number;
    avgWater: number;
    goalDays: number;
    weightChange: number | null;
  };
  targets: { calories: number | null; protein: number | null; water: number };
  streak: { mealStreak: number; waterStreak: number; weightStreak: number };
  dailyBreakdown: Array<{ date: string; calories: number; protein: number; carbs: number; fat: number; water: number }>;
}

export const WeeklyReportButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery<WeeklyData>({
    queryKey: ['weekly-report'],
    queryFn: exportService.getWeeklyReport,
    enabled: open,
    staleTime: 5 * 60_000,
  });

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary gap-2">
        <BarChart2 className="w-4 h-4" /> Weekly Report
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="📊 Weekly Summary" width="560px">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand)' }} />
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Week header */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <Calendar className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              <span className="text-sm font-semibold" style={{ fontFamily: 'Syne', color: 'var(--brand)' }}>
                {data.week.start} → {data.week.end}
              </span>
              <span className="badge badge-green ml-auto">{data.summary.daysLogged}/7 days</span>
            </div>

            {/* Key stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Avg Calories', value: data.summary.avgCalories, unit: 'kcal', target: data.targets.calories, color: 'var(--brand)' },
                { label: 'Avg Protein', value: data.summary.avgProtein, unit: 'g', target: data.targets.protein, color: '#f97316' },
                { label: 'Avg Water', value: data.summary.avgWater, unit: 'ml', target: data.targets.water, color: '#38bdf8' },
                { label: 'Goal Days', value: data.summary.goalDays, unit: '/7 days', target: null, color: '#60a5fa' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                  <p className="label">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ fontFamily: 'Syne', color: stat.color }}>
                    {stat.value}<span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{stat.unit}</span>
                  </p>
                  {stat.target && (
                    <div className="mt-2">
                      <ProgressBar value={stat.value} max={stat.target} color={stat.color} size="sm" />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Target: {stat.target}{stat.unit}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Weight change */}
            {data.summary.weightChange !== null && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                {data.summary.weightChange < 0
                  ? <TrendingDown className="w-5 h-5" style={{ color: '#4ade80' }} />
                  : data.summary.weightChange > 0
                  ? <TrendingUp className="w-5 h-5" style={{ color: '#f87171' }} />
                  : <Minus className="w-5 h-5" style={{ color: '#94a3b8' }} />}
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: 'Syne' }}>
                    Weight {data.summary.weightChange === 0 ? 'unchanged' : data.summary.weightChange < 0 ? `lost ${Math.abs(data.summary.weightChange)} kg` : `gained ${data.summary.weightChange} kg`}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Over the last 7 days</p>
                </div>
              </div>
            )}

            {/* Daily breakdown mini-chart */}
            <div>
              <p className="label mb-3">Daily Calorie Breakdown</p>
              <div className="flex items-end gap-1.5 h-20">
                {data.dailyBreakdown.map(day => {
                  const maxCal = Math.max(...data.dailyBreakdown.map(d => d.calories), data.targets.calories ?? 1);
                  const height = day.calories > 0 ? Math.max(8, (day.calories / maxCal) * 100) : 4;
                  const onTarget = data.targets.calories && day.calories >= data.targets.calories * 0.9 && day.calories <= data.targets.calories * 1.1;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: ${Math.round(day.calories)} kcal`}>
                      <div className="w-full rounded-t-sm transition-all"
                        style={{
                          height: `${height}%`,
                          background: day.calories === 0 ? 'var(--surface-4)' : onTarget ? 'var(--brand)' : 'rgba(34,197,94,0.4)',
                          minHeight: 4,
                        }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                        {day.date.slice(8)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {data.targets.calories && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Bright green = on target (±10% of {data.targets.calories} kcal)
                </p>
              )}
            </div>

            {/* Streaks */}
            <div className="flex gap-3">
              {[
                { label: 'Meal', icon: '🍽️', count: data.streak.mealStreak },
                { label: 'Water', icon: '💧', count: data.streak.waterStreak },
                { label: 'Weight', icon: '⚖️', count: data.streak.weightStreak },
              ].map(s => (
                <div key={s.label} className="flex-1 flex flex-col items-center gap-1 p-2.5 rounded-xl"
                  style={{ background: 'var(--surface-3)', border: `1px solid ${s.count > 0 ? 'rgba(34,197,94,0.2)' : 'var(--border)'}` }}>
                  <span>{s.icon}</span>
                  <span className="font-bold text-lg" style={{ fontFamily: 'Syne', color: s.count > 0 ? 'var(--brand)' : 'var(--text-muted)' }}>{s.count}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Syne', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
};

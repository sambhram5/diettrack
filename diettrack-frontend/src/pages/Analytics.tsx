import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { Skeleton } from '../components/ui';
import { TrendingUp, Droplets, Scale, Flame, Target, Lightbulb } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';

type Period = '7d' | '30d' | '90d';
const PERIODS: { label: string; value: Period }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl text-sm space-y-1" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <p className="font-bold text-xs mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'Syne' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}: </span>
          <strong>{typeof p.value === 'number' ? Math.round(p.value) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<Period>('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => dashboardService.getAnalytics(period),
    staleTime: 60_000,
  });

  const calorieTarget = data?.summary.targets?.calorieTarget;
  const waterGoal = data?.summary.targets?.waterGoal;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne' }}>Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Your nutrition and fitness trends</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={period === p.value ? 'btn-primary py-2 px-4 text-sm' : 'btn-secondary py-2 px-4 text-sm'}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : data && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Avg Calories', value: data.summary.avgCalories, unit: 'kcal', icon: <Flame className="w-5 h-5" />, color: 'var(--brand)' },
            { label: 'Goal Achievement', value: `${data.summary.goalAchievementRate}%`, unit: '', icon: <Target className="w-5 h-5" />, color: '#60a5fa' },
            { label: 'Weight Change', value: data.summary.weightChange >= 0 ? `+${data.summary.weightChange}` : data.summary.weightChange, unit: 'kg', icon: <Scale className="w-5 h-5" />, color: data.summary.weightChange <= 0 ? '#4ade80' : '#f87171' },
            { label: 'Days Tracked', value: data.summary.daysTracked, unit: 'days', icon: <TrendingUp className="w-5 h-5" />, color: '#a78bfa' },
          ].map((stat, i) => (
            <div key={stat.label} className="card animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="label">{stat.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold" style={{ fontFamily: 'Syne', color: stat.color }}>{stat.value}</span>
                    {stat.unit && <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.unit}</span>}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calorie trend */}
      <div className="card animate-fade-up stagger-2">
        <h2 className="font-bold mb-5" style={{ fontFamily: 'Syne' }}>
          <Flame className="w-4 h-4 inline mr-2" style={{ color: 'var(--brand)' }} />
          Calorie Trend
        </h2>
        {isLoading ? <Skeleton className="h-56" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.nutritionTrend ?? []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false}
                tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} />
              {calorieTarget && <ReferenceLine y={calorieTarget} stroke="rgba(34,197,94,0.4)" strokeDasharray="4 4" label={{ value: 'Goal', fill: 'var(--brand)', fontSize: 10 }} />}
              <Bar dataKey="calories" fill="var(--brand)" radius={[4, 4, 0, 0]} name="Calories" fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Macro trends */}
      <div className="card animate-fade-up stagger-3">
        <h2 className="font-bold mb-5" style={{ fontFamily: 'Syne' }}>
          Macronutrient Trends
        </h2>
        {isLoading ? <Skeleton className="h-56" /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.nutritionTrend ?? []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false}
                tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} unit="g" width={35} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Syne' }} />
              <Line type="monotone" dataKey="protein" stroke="#f97316" strokeWidth={2} dot={false} name="Protein" />
              <Line type="monotone" dataKey="carbs" stroke="#60a5fa" strokeWidth={2} dot={false} name="Carbs" />
              <Line type="monotone" dataKey="fat" stroke="#a78bfa" strokeWidth={2} dot={false} name="Fat" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Water + Weight side by side */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card animate-fade-up stagger-4">
          <h2 className="font-bold mb-5" style={{ fontFamily: 'Syne' }}>
            <Droplets className="w-4 h-4 inline mr-2" style={{ color: '#38bdf8' }} />
            Water Intake
          </h2>
          {isLoading ? <Skeleton className="h-44" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data?.waterTrend ?? []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} width={35} />
                <Tooltip content={<ChartTooltip />} />
                {waterGoal && <ReferenceLine y={waterGoal} stroke="rgba(56,189,248,0.4)" strokeDasharray="4 4" />}
                <Bar dataKey="amount" fill="#38bdf8" radius={[3, 3, 0, 0]} name="Water (ml)" fillOpacity={0.75} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card animate-fade-up stagger-5">
          <h2 className="font-bold mb-5" style={{ fontFamily: 'Syne' }}>
            <Scale className="w-4 h-4 inline mr-2" style={{ color: '#a78bfa' }} />
            Weight Progress
          </h2>
          {isLoading ? <Skeleton className="h-44" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data?.weightTrend ?? []} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} unit="kg" width={38} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="weight" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 2.5, fill: '#a78bfa', strokeWidth: 0 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {data?.insights && data.insights.length > 0 && (
        <div className="card animate-fade-up stagger-6" style={{ border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.04)' }}>
          <h2 className="font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne', color: 'var(--brand)' }}>
            <Lightbulb className="w-4 h-4" /> Smart Insights
          </h2>
          <div className="space-y-3">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)' }}>
                <span className="text-lg flex-shrink-0">
                  {i === 0 ? '🎯' : i === 1 ? '📉' : i === 2 ? '🏆' : '💡'}
                </span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

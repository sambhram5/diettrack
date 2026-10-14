import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Flame, Droplets, Scale, Utensils, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { dashboardService } from '../services/dashboard.service';
import { useAuth } from '../contexts/AuthContext';
import { ProgressBar, MacroPill, StatCard, CardSkeleton, EmptyState, StreakBadge } from '../components/ui';
import { ActivityTimeline } from '../components/ui/ActivityTimeline';
import { AchievementBadges } from '../components/ui/Badges';
import { WeeklyReportButton } from '../components/ui/WeeklyReport';
import { MEAL_LABELS, MEAL_EMOJIS, GOAL_LABELS, calcMealNutrition } from '../utils';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', date],
    queryFn: () => dashboardService.getDashboard(date),
    staleTime: 30_000,
  });

  const changeDate = (dir: number) => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + dir);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  const isToday = date === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne' }}>
            {isToday ? `Good ${getTimeGreeting()}, ${user?.name?.split(' ')[0]}` : 'Daily Summary'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
            {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <WeeklyReportButton />
          <div className="flex items-center gap-1">
            <button onClick={() => changeDate(-1)} className="btn-secondary p-2"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))} className="btn-secondary px-3 py-2 text-sm" disabled={isToday}>Today</button>
            <button onClick={() => changeDate(1)} className="btn-secondary p-2" disabled={isToday}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : data ? (
        <>
          {/* Calorie overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card sm:col-span-2 animate-fade-up">
              <div className="flex items-center justify-between mb-1">
                <span className="label">Calories Today</span>
                <div className="badge badge-green">{data.nutrition.progress.calories}%</div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-5xl font-bold text-gradient" style={{ fontFamily: 'Syne' }}>
                  {data.nutrition.consumed.calories.toLocaleString()}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>/ {data.nutrition.targets.calories?.toLocaleString()} kcal</span>
              </div>
              <ProgressBar value={data.nutrition.consumed.calories} max={data.nutrition.targets.calories || 2000} size="lg" />
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{data.nutrition.remaining.calories.toLocaleString()} kcal</strong> remaining
              </p>
            </div>
            <StatCard label="Current Weight" value={data.currentWeight} unit="kg" icon={<Scale className="w-5 h-5" />}
              color="#a78bfa" className="animate-fade-up stagger-1" />
            <StatCard label="Goal" value={GOAL_LABELS[data.user.goal]} icon={<TrendingUp className="w-5 h-5" />}
              color="#60a5fa" className="animate-fade-up stagger-2" />
          </div>

          {/* Macros */}
          <div className="card animate-fade-up stagger-2">
            <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne' }}>Macronutrients</h2>
            <div className="flex gap-3">
              <MacroPill label="Protein" value={data.nutrition.consumed.protein} target={data.nutrition.targets.protein} color="#f97316" />
              <MacroPill label="Carbs" value={data.nutrition.consumed.carbs} target={data.nutrition.targets.carbs} color="#60a5fa" />
              <MacroPill label="Fat" value={data.nutrition.consumed.fat} target={data.nutrition.targets.fat} color="#a78bfa" />
              <MacroPill label="Fiber" value={data.nutrition.consumed.fiber} color="#4ade80" />
            </div>
          </div>

          {/* Water + Streaks */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card animate-fade-up stagger-3">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-4 h-4" style={{ color: '#38bdf8' }} />
                <h2 className="font-bold" style={{ fontFamily: 'Syne' }}>Hydration</h2>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold" style={{ color: '#38bdf8', fontFamily: 'Syne' }}>
                  {data.water.consumed.toLocaleString()}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>/ {data.water.goal.toLocaleString()} ml</span>
                <span className="badge badge-blue ml-auto">{data.water.progress}%</span>
              </div>
              <ProgressBar value={data.water.consumed} max={data.water.goal} color="#38bdf8" size="md" />
              <div className="flex gap-2 mt-3 flex-wrap">
                {data.water.logs.slice(0, 5).map(log => (
                  <span key={log.id} className="badge badge-blue">{log.amount}ml</span>
                ))}
              </div>
            </div>

            <div className="card animate-fade-up stagger-4">
              <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne' }}>Streaks 🔥</h2>
              <div className="flex gap-3 justify-center">
                <StreakBadge count={data.streak.mealStreak} label="Meal" icon="🍽️" />
                <StreakBadge count={data.streak.waterStreak} label="Water" icon="💧" />
                <StreakBadge count={data.streak.weightStreak} label="Weight" icon="⚖️" />
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card animate-fade-up stagger-4">
            <AchievementBadges data={data} />
          </div>

          {/* Today's Meals + Activity Timeline */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card animate-fade-up stagger-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold" style={{ fontFamily: 'Syne' }}>
                  <Utensils className="w-4 h-4 inline mr-2" style={{ color: 'var(--brand)' }} />
                  Today's Meals
                </h2>
                <Link to="/meals" className="text-sm" style={{ color: 'var(--brand)' }}>Log meal →</Link>
              </div>
              {data.meals.length === 0 ? (
                <EmptyState icon={<Utensils className="w-6 h-6" />} title="No meals logged"
                  description="Log your first meal to track nutrition today" />
              ) : (
                <div className="space-y-3">
                  {data.meals.map(meal => {
                    const nut = calcMealNutrition(meal.items);
                    return (
                      <div key={meal.id} className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{MEAL_EMOJIS[meal.mealType]}</span>
                          <div>
                            <p className="font-semibold text-sm" style={{ fontFamily: 'Syne' }}>{MEAL_LABELS[meal.mealType]}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{meal.items.length} item{meal.items.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm" style={{ color: 'var(--brand)' }}>{Math.round(nut.calories)} kcal</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>P:{Math.round(nut.protein)}g C:{Math.round(nut.carbs)}g</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card animate-fade-up stagger-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold" style={{ fontFamily: 'Syne' }}>Recent Activity</h2>
              </div>
              <ActivityTimeline limit={8} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

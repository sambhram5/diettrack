import React from 'react';
import { DashboardData } from '../../types';

interface Badge {
  id: string;
  icon: string;
  label: string;
  desc: string;
  unlocked: boolean;
  color: string;
}

const getBadges = (data: DashboardData): Badge[] => [
  {
    id: 'first_meal',
    icon: '🍽️',
    label: 'First Bite',
    desc: 'Log your first meal',
    unlocked: data.meals.length > 0,
    color: 'var(--brand)',
  },
  {
    id: 'calorie_goal',
    icon: '🎯',
    label: 'On Target',
    desc: 'Hit your calorie goal',
    unlocked: data.nutrition.progress.calories >= 90 && data.nutrition.progress.calories <= 110,
    color: '#f97316',
  },
  {
    id: 'water_goal',
    icon: '💧',
    label: 'Hydrated',
    desc: 'Reach your daily water goal',
    unlocked: data.water.progress >= 100,
    color: '#38bdf8',
  },
  {
    id: 'streak_3',
    icon: '🔥',
    label: 'On Fire',
    desc: '3-day meal streak',
    unlocked: data.streak.mealStreak >= 3,
    color: '#f97316',
  },
  {
    id: 'streak_7',
    icon: '⚡',
    label: 'Week Warrior',
    desc: '7-day meal streak',
    unlocked: data.streak.mealStreak >= 7,
    color: '#fbbf24',
  },
  {
    id: 'streak_30',
    icon: '🏆',
    label: 'Habit Builder',
    desc: '30-day meal streak',
    unlocked: data.streak.mealStreak >= 30,
    color: '#a78bfa',
  },
  {
    id: 'protein_hero',
    icon: '💪',
    label: 'Protein Hero',
    desc: 'Hit your protein target',
    unlocked: (data.nutrition.targets.protein ?? 0) > 0 &&
              data.nutrition.consumed.protein >= (data.nutrition.targets.protein ?? 0) * 0.9,
    color: '#f97316',
  },
  {
    id: 'weight_logged',
    icon: '⚖️',
    label: 'Scale Buddy',
    desc: 'Start a weight streak',
    unlocked: data.streak.weightStreak >= 1,
    color: '#a78bfa',
  },
];

export const AchievementBadges: React.FC<{ data: DashboardData }> = ({ data }) => {
  const badges = getBadges(data);
  const unlocked = badges.filter(b => b.unlocked).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold" style={{ fontFamily: 'Syne' }}>Achievements</h2>
        <span className="badge badge-green">{unlocked} / {badges.length}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {badges.map(badge => (
          <div key={badge.id}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all"
            style={{
              background: badge.unlocked ? `${badge.color}15` : 'var(--surface-3)',
              border: `1px solid ${badge.unlocked ? `${badge.color}30` : 'var(--border)'}`,
              opacity: badge.unlocked ? 1 : 0.4,
            }}
            title={badge.desc}>
            <span className="text-xl" style={{ filter: badge.unlocked ? 'none' : 'grayscale(1)' }}>
              {badge.icon}
            </span>
            <span className="text-xs font-bold leading-tight" style={{
              fontFamily: 'Syne',
              color: badge.unlocked ? badge.color : 'var(--text-muted)',
            }}>
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

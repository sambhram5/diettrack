import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Utensils, Scale, Droplets } from 'lucide-react';
import { exportService } from '../../services/export.service';
import { Skeleton } from './index';
import { MEAL_LABELS } from '../../utils';
import { MealType } from '../../types';

interface ActivityItem {
  type: 'meal' | 'weight' | 'water';
  id: string;
  date: string;
  createdAt: string;
  data: {
    mealType?: string;
    itemCount?: number;
    preview?: string;
    calories?: number;
    weight?: number;
    amount?: number;
  };
}

export const ActivityTimeline: React.FC<{ limit?: number }> = ({ limit = 10 }) => {
  const { data = [], isLoading } = useQuery<ActivityItem[]>({
    queryKey: ['activity', limit],
    queryFn: () => exportService.getActivity(limit),
    staleTime: 30_000,
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}
    </div>
  );

  if (data.length === 0) return (
    <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
      No activity yet — start tracking!
    </p>
  );

  const getIcon = (type: string) => {
    if (type === 'meal')   return <Utensils className="w-4 h-4" />;
    if (type === 'weight') return <Scale className="w-4 h-4" />;
    return <Droplets className="w-4 h-4" />;
  };

  const getColor = (type: string) => {
    if (type === 'meal')   return 'var(--brand)';
    if (type === 'weight') return '#a78bfa';
    return '#38bdf8';
  };

  const getLabel = (item: ActivityItem) => {
    if (item.type === 'meal') {
      const mealLabel = MEAL_LABELS[(item.data.mealType as MealType) ?? 'SNACK'];
      return `Logged ${mealLabel} · ${item.data.itemCount} item${item.data.itemCount !== 1 ? 's' : ''} · ${Math.round(item.data.calories ?? 0)} kcal`;
    }
    if (item.type === 'weight') return `Weight logged · ${item.data.weight} kg`;
    const ml = item.data.amount ?? 0;
    return `Water logged · ${ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`}`;
  };

  const getSubLabel = (item: ActivityItem) => {
    if (item.type === 'meal' && item.data.preview) return item.data.preview;
    return null;
  };

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-4 bottom-4 w-px" style={{ background: 'var(--border)' }} />

      {data.map((item, i) => (
        <div key={item.id} className="flex gap-3 py-2 relative">
          {/* Dot */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
            style={{ background: `${getColor(item.type)}20`, color: getColor(item.type), border: `1px solid ${getColor(item.type)}40` }}>
            {getIcon(item.type)}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p className="text-sm font-medium leading-tight" style={{ fontFamily: 'Syne' }}>
              {getLabel(item)}
            </p>
            {getSubLabel(item) && (
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {getSubLabel(item)}
              </p>
            )}
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

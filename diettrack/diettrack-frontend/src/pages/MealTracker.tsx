import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Trash2, Search, X, Utensils } from 'lucide-react';
import { mealService } from '../services/meal.service';
import { foodService } from '../services/food.service';
import { Food, MealType } from '../types';
import { MacroPill, EmptyState, Skeleton } from '../components/ui';
import { MEAL_LABELS, MEAL_EMOJIS, calcMealNutrition, getErrorMessage } from '../utils';
import toast from 'react-hot-toast';

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

interface FoodRow { foodId: string; quantity: number; food: Food; }

export const MealTracker: React.FC = () => {
  const qc = useQueryClient();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showModal, setShowModal] = useState(false);
  const [mealType, setMealType] = useState<MealType>('BREAKFAST');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<FoodRow[]>([]);
  const [notes, setNotes] = useState('');
  const isToday = date === format(new Date(), 'yyyy-MM-dd');

  const changeDate = (dir: number) => {
    const d = new Date(date); d.setDate(d.getDate() + dir);
    setDate(format(d, 'yyyy-MM-dd'));
  };

  const { data: mealData, isLoading } = useQuery({
    queryKey: ['meals', date],
    queryFn: () => mealService.getMeals(date),
    staleTime: 30_000,
  });

  const { data: foods = [] } = useQuery({
    queryKey: ['foods', search],
    queryFn: () => foodService.getFoods(search || undefined),
    enabled: search.length > 0 || showModal,
    staleTime: 60_000,
  });

  const createMeal = useMutation({
    mutationFn: mealService.createMeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meals', date] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Meal logged!');
      closeModal();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMeal = useMutation({
    mutationFn: mealService.deleteMeal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meals', date] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Meal deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const closeModal = () => { setShowModal(false); setItems([]); setNotes(''); setSearch(''); };

  const addFood = (food: Food) => {
    if (items.find(i => i.foodId === food.id)) { toast('Already added', { icon: 'ℹ️' }); return; }
    setItems(prev => [...prev, { foodId: food.id, quantity: 1, food }]);
    setSearch('');
  };

  const updateQty = (idx: number, delta: number) => {
    setItems(prev => prev.map((it, i) => i === idx
      ? { ...it, quantity: Math.max(0.25, +( it.quantity + delta).toFixed(2)) } : it));
  };

  const handleSubmit = () => {
    if (items.length === 0) { toast.error('Add at least one food'); return; }
    createMeal.mutate({ mealType, date, items: items.map(i => ({ foodId: i.foodId, quantity: i.quantity })), notes });
  };

  const meals = mealData?.meals ?? [];
  const totals = mealData?.totals;
  const filteredFoods = search ? foods : foods.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne' }}>Meal Tracker</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">
            {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <button onClick={() => changeDate(-1)} className="btn-secondary p-2"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))} className="btn-secondary px-3 py-2 text-sm" disabled={isToday}>Today</button>
            <button onClick={() => changeDate(1)} className="btn-secondary p-2" disabled={isToday}><ChevronRight className="w-4 h-4" /></button>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Log Meal
          </button>
        </div>
      </div>

      {/* Daily totals */}
      {totals && (
        <div className="card animate-fade-up">
          <h2 className="font-bold mb-4" style={{ fontFamily: 'Syne' }}>Day Total</h2>
          <div className="flex gap-3">
            <MacroPill label="Calories" value={totals.calories} unit="kcal" color="var(--brand)" />
            <MacroPill label="Protein" value={totals.protein} color="#f97316" />
            <MacroPill label="Carbs" value={totals.carbs} color="#60a5fa" />
            <MacroPill label="Fat" value={totals.fat} color="#a78bfa" />
          </div>
        </div>
      )}

      {/* Meals list */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : meals.length === 0 ? (
        <EmptyState icon={<Utensils className="w-6 h-6" />} title="No meals logged"
          description={`Nothing logged for ${isToday ? 'today' : 'this day'} yet.`}
          action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> Log First Meal</button>} />
      ) : (
        <div className="space-y-3">
          {meals.map((meal, mi) => {
            const n = calcMealNutrition(meal.items);
            return (
              <div key={meal.id} className="card animate-fade-up" style={{ animationDelay: `${mi * 0.05}s` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{MEAL_EMOJIS[meal.mealType]}</span>
                    <div>
                      <p className="font-bold" style={{ fontFamily: 'Syne' }}>{MEAL_LABELS[meal.mealType]}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{meal.items.length} item{meal.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg" style={{ fontFamily: 'Syne', color: 'var(--brand)' }}>{Math.round(n.calories)} kcal</span>
                    <button className="btn-ghost p-1.5" style={{ color: '#f87171' }}
                      onClick={() => { if (confirm('Delete this meal?')) deleteMeal.mutate(meal.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {meal.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--surface-3)' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{item.food.name}
                        <span style={{ color: 'var(--text-muted)' }}> × {item.quantity}</span>
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {Math.round(item.food.calories * item.quantity)} kcal
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 pt-2 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: '#f97316' }}>P: {Math.round(n.protein)}g</span>
                  <span style={{ color: '#60a5fa' }}>C: {Math.round(n.carbs)}g</span>
                  <span style={{ color: '#a78bfa' }}>F: {Math.round(n.fat)}g</span>
                  {meal.notes && <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>📝 {meal.notes}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Meal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-bright)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'Syne' }}>Log Meal</h2>
              <button onClick={closeModal} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>

            <div className="overflow-auto p-5 space-y-5 flex-1">
              {/* Meal type */}
              <div>
                <label className="label">Meal Type</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {MEAL_TYPES.map(type => (
                    <button key={type} onClick={() => setMealType(type)}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        fontFamily: 'Syne',
                        background: mealType === type ? 'rgba(34,197,94,0.12)' : 'var(--surface-3)',
                        border: `1px solid ${mealType === type ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                        color: mealType === type ? 'var(--brand)' : 'var(--text-secondary)',
                      }}>
                      <span className="text-lg">{MEAL_EMOJIS[type]}</span>
                      {MEAL_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food search */}
              <div>
                <label className="label">Add Foods</label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input className="input" style={{ paddingLeft: '2.25rem' }}
                    placeholder="Search food library..." value={search}
                    onChange={e => setSearch(e.target.value)} />
                </div>
                {filteredFoods.length > 0 && (
                  <div className="mt-1 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface-3)' }}>
                    {filteredFoods.slice(0, 8).map((food, i) => (
                      <button key={food.id} onClick={() => addFood(food)}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                        style={{ borderBottom: i < Math.min(filteredFoods.length, 8) - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{food.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{food.servingSize}g serving</p>
                        </div>
                        <span className="font-bold text-xs" style={{ color: 'var(--brand)' }}>{food.calories} kcal</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Added items */}
              {items.length > 0 && (
                <div>
                  <label className="label">Added Items ({items.length})</label>
                  <div className="space-y-2 mt-1">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.food.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {Math.round(item.food.calories * item.quantity)} kcal
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(idx, -0.25)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{ background: 'var(--surface-4)', color: 'var(--text-primary)' }}>−</button>
                          <span className="text-sm font-mono w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(idx, 0.25)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                            style={{ background: 'var(--surface-4)', color: 'var(--text-primary)' }}>+</button>
                        </div>
                        <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                          className="btn-ghost p-1" style={{ color: 'var(--text-muted)' }}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="label">Notes (optional)</label>
                <input className="input mt-1" placeholder="e.g. post workout, at restaurant..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 p-5 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <button className="btn-secondary flex-1" onClick={closeModal}>Cancel</button>
              <button className="btn-primary flex-2" style={{ flex: 2 }} onClick={handleSubmit} disabled={createMeal.isPending || items.length === 0}>
                {createMeal.isPending ? 'Logging...' : `Log ${MEAL_LABELS[mealType]}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

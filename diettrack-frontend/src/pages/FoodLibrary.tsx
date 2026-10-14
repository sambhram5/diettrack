import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Edit2, Trash2, Apple } from 'lucide-react';
import toast from 'react-hot-toast';
import { foodService } from '../services/food.service';
import { Food } from '../types';
import { Modal, EmptyState, Skeleton } from '../components/ui';
import { getErrorMessage } from '../utils';
import { useAuth } from '../contexts/AuthContext';

const FoodForm: React.FC<{ food?: Food; onSave: (data: Omit<Food, 'id' | 'isCustom' | 'createdBy'>) => void; onCancel: () => void; loading: boolean }> = ({ food, onSave, onCancel, loading }) => {
  const [form, setForm] = useState({
    name: food?.name || '', servingSize: food?.servingSize || 100,
    calories: food?.calories || 0, protein: food?.protein || 0,
    carbs: food?.carbs || 0, fat: food?.fat || 0,
    fiber: food?.fiber || 0, sugar: food?.sugar || 0,
  });
  const upd = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Food name</label>
        <input className="input" value={form.name} onChange={e => upd('name', e.target.value)} placeholder="e.g. Chicken Breast" />
      </div>
      <div>
        <label className="label">Serving size (g)</label>
        <input type="number" className="input" value={form.servingSize} onChange={e => upd('servingSize', +e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[['Calories (kcal)', 'calories'], ['Protein (g)', 'protein'], ['Carbs (g)', 'carbs'], ['Fat (g)', 'fat'], ['Fiber (g)', 'fiber'], ['Sugar (g)', 'sugar']].map(([label, key]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input type="number" step="0.1" min="0" className="input" value={(form as Record<string, number | string>)[key]} onChange={e => upd(key, +e.target.value)} />
          </div>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button className="btn-secondary flex-1" onClick={onCancel}>Cancel</button>
        <button className="btn-primary flex-1" onClick={() => onSave(form)} disabled={!form.name || loading}>
          {loading ? 'Saving...' : food ? 'Update Food' : 'Add Food'}
        </button>
      </div>
    </div>
  );
};

export const FoodLibrary: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalState, setModalState] = useState<{ type: 'add' | 'edit'; food?: Food } | null>(null);
  const [filter, setFilter] = useState<'all' | 'custom'>('all');

  const { data: foods = [], isLoading } = useQuery({
    queryKey: ['foods', search],
    queryFn: () => foodService.getFoods(search || undefined),
    staleTime: 60_000,
  });

  const createMut = useMutation({
    mutationFn: foodService.createFood,
    onSuccess: () => { toast.success('Food added!'); qc.invalidateQueries({ queryKey: ['foods'] }); setModalState(null); },
    onError: err => toast.error(getErrorMessage(err)),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Food> }) => foodService.updateFood(id, data),
    onSuccess: () => { toast.success('Food updated!'); qc.invalidateQueries({ queryKey: ['foods'] }); setModalState(null); },
    onError: err => toast.error(getErrorMessage(err)),
  });

  const deleteMut = useMutation({
    mutationFn: foodService.deleteFood,
    onSuccess: () => { toast.success('Food deleted'); qc.invalidateQueries({ queryKey: ['foods'] }); },
    onError: err => toast.error(getErrorMessage(err)),
  });

  const filtered = filter === 'custom' ? foods.filter(f => f.isCustom) : foods;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne' }}>Food Library</h1>
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1">{foods.length} foods available</p>
        </div>
        <button className="btn-primary" onClick={() => setModalState({ type: 'add' })}>
          <Plus className="w-4 h-4" /> Add Custom Food
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search foods..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(['all', 'custom'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={filter === f ? 'btn-primary py-2 px-4' : 'btn-secondary py-2 px-4'}>
              {f === 'all' ? 'All Foods' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Food list */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Apple className="w-6 h-6" />} title="No foods found"
          description={search ? `No foods match "${search}"` : 'Add your first custom food'}
          action={<button className="btn-primary" onClick={() => setModalState({ type: 'add' })}><Plus className="w-4 h-4" /> Add Food</button>} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-3)' }}>
                  {['Food', 'Serving', 'Calories', 'Protein', 'Carbs', 'Fat', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 label">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((food, i) => (
                  <tr key={food.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm" style={{ fontFamily: 'Syne' }}>{food.name}</p>
                        {food.isCustom && <span className="badge badge-amber">Custom</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{food.servingSize}g</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--brand)' }}>{food.calories}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#f97316' }}>{food.protein}g</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#60a5fa' }}>{food.carbs}g</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#a78bfa' }}>{food.fat}g</td>
                    <td className="px-4 py-3">
                      {food.isCustom && food.createdBy === user?.id && (
                        <div className="flex items-center gap-1">
                          <button className="btn-ghost p-1.5" onClick={() => setModalState({ type: 'edit', food })}><Edit2 className="w-3.5 h-3.5" /></button>
                          <button className="btn-ghost p-1.5" style={{ color: '#f87171' }}
                            onClick={() => { if (confirm('Delete this food?')) deleteMut.mutate(food.id); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!modalState} onClose={() => setModalState(null)}
        title={modalState?.type === 'edit' ? 'Edit Food' : 'Add Custom Food'}>
        <FoodForm
          food={modalState?.food}
          loading={createMut.isPending || updateMut.isPending}
          onCancel={() => setModalState(null)}
          onSave={(data) => {
            if (modalState?.type === 'edit' && modalState.food) {
              updateMut.mutate({ id: modalState.food.id, data });
            } else {
              createMut.mutate(data);
            }
          }}
        />
      </Modal>
    </div>
  );
};

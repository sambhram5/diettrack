import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Utensils, Apple } from 'lucide-react';
import { exportService } from '../../services/export.service';
import { format, parseISO } from 'date-fns';
import { MEAL_LABELS } from '../../utils';
import { MealType } from '../../types';

interface SearchResults {
  query: string;
  meals: Array<{
    id: string; date: string; mealType: string;
    items: Array<{ food: { name: string; calories: number }; quantity: number }>;
  }>;
  foods: Array<{
    id: string; name: string; calories: number; protein: number;
    carbs: number; fat: number; servingSize: number;
  }>;
}

interface GlobalSearchProps {
  onClose?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const data = await exportService.searchHistory(q.trim());
      setResults(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 350);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="relative w-full max-w-xl" style={{
      background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
      borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
    }}>
      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--brand)' }} />
        <input
          autoFocus
          className="flex-1 bg-transparent outline-none text-base"
          style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans' }}
          placeholder="Search meals, foods, history..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {loading && (
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
            style={{ borderColor: 'var(--brand)' }} />
        )}
        <button onClick={onClose} className="btn-ghost p-1 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-auto p-2">
        {!results && !loading && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Type at least 2 characters to search your history
          </p>
        )}
        {results && results.foods.length === 0 && results.meals.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
            No results for &ldquo;{results.query}&rdquo;
          </p>
        )}
        {results && results.foods.length > 0 && (
          <div className="mb-3">
            <p className="label px-2 mb-2">Foods</p>
            {results.foods.map(food => (
              <div key={food.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 cursor-pointer hover:bg-white/5 transition-colors"
                style={{ background: 'var(--surface-3)' }}
                onClick={() => { navigate('/foods'); onClose?.(); }}>
                <div className="flex items-center gap-2.5">
                  <Apple className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--brand)' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'Syne' }}>{food.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{food.servingSize}g serving</p>
                  </div>
                </div>
                <div className="text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <p className="font-bold" style={{ color: 'var(--brand)' }}>{food.calories} kcal</p>
                  <p>P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {results && results.meals.length > 0 && (
          <div>
            <p className="label px-2 mb-2">Meal History</p>
            {results.meals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 cursor-pointer hover:bg-white/5 transition-colors"
                style={{ background: 'var(--surface-3)' }}
                onClick={() => { navigate('/meals'); onClose?.(); }}>
                <div className="flex items-center gap-2.5">
                  <Utensils className="w-4 h-4 flex-shrink-0" style={{ color: '#f97316' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'Syne' }}>
                      {MEAL_LABELS[meal.mealType as MealType]}
                    </p>
                    <p className="text-xs truncate max-w-xs" style={{ color: 'var(--text-muted)' }}>
                      {meal.items.map(i => i.food.name).join(', ')}
                    </p>
                  </div>
                </div>
                <p className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
                  {format(parseISO(meal.date), 'MMM d')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 border-t flex gap-4 items-center" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          <kbd className="px-1.5 py-0.5 rounded mr-1"
            style={{ background: 'var(--surface-4)', fontFamily: 'monospace', fontSize: '10px' }}>Esc</kbd>
          to close
        </span>
      </div>
    </div>
  );
};

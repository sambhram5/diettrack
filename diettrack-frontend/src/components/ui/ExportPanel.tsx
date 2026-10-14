import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportService } from '../../services/export.service';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utils';
import { format, subDays } from 'date-fns';

export const ExportPanel: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleExport = async (type: 'meals' | 'weights' | 'water') => {
    setLoading(type);
    try {
      await exportService.downloadCSV(
        type,
        type === 'meals' ? dateRange.from : undefined,
        type === 'meals' ? dateRange.to : undefined,
      );
      toast.success(`${type} data exported!`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date range for meals */}
      <div>
        <p className="label mb-2">Meal Export Date Range</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>From</label>
            <input type="date" className="input" value={dateRange.from}
              onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>To</label>
            <input type="date" className="input" value={dateRange.to}
              onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="space-y-2">
        {[
          { type: 'meals' as const, label: 'Meal History', desc: 'All logged meals with full nutrition data', icon: '🍽️' },
          { type: 'weights' as const, label: 'Weight Log', desc: 'Complete weight tracking history', icon: '⚖️' },
          { type: 'water' as const, label: 'Water Log', desc: 'All water intake entries', icon: '💧' },
        ].map(exp => (
          <div key={exp.type} className="flex items-center justify-between p-3.5 rounded-xl"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{exp.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ fontFamily: 'Syne' }}>{exp.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{exp.desc}</p>
              </div>
            </div>
            <button className="btn-secondary py-2 px-3 text-sm flex items-center gap-1.5"
              onClick={() => handleExport(exp.type)}
              disabled={loading !== null}>
              {loading === exp.type
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />}
              CSV
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Files download as CSV and open in Excel, Google Sheets, or any spreadsheet app.
      </p>
    </div>
  );
};

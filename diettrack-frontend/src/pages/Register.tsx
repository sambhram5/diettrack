import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils';

const ACTIVITY_OPTIONS = [
  { value: 'SEDENTARY', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active', desc: '1–3 days/week' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately Active', desc: '3–5 days/week' },
  { value: 'VERY_ACTIVE', label: 'Very Active', desc: '6–7 days/week' },
  { value: 'EXTREMELY_ACTIVE', label: 'Extremely Active', desc: 'Physical job + training' },
];

const GOAL_OPTIONS = [
  { value: 'WEIGHT_LOSS', label: 'Weight Loss', desc: '−500 cal/day deficit', emoji: '🔥' },
  { value: 'WEIGHT_MAINTENANCE', label: 'Maintain Weight', desc: 'Stay at current weight', emoji: '⚖️' },
  { value: 'WEIGHT_GAIN', label: 'Weight Gain', desc: '+300 cal/day surplus', emoji: '📈' },
  { value: 'MUSCLE_GAIN', label: 'Muscle Gain', desc: '+200 cal/day + high protein', emoji: '💪' },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', gender: 'MALE', height: '', weight: '',
    activityLevel: 'MODERATELY_ACTIVE', goal: 'WEIGHT_MAINTENANCE',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await register({
        ...form,
        age: parseInt(form.age),
        height: parseFloat(form.height),
        weight: parseFloat(form.weight),
      });
      navigate('/dashboard');
      toast.success('Account created! Welcome to DietTrack 🎉');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--surface-0)' }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(ellipse, #22c55e 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="w-full max-w-md relative">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
            <Zap className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-2xl text-gradient" style={{ fontFamily: 'Syne' }}>DietTrack</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-6">
          {[1,2,3].map(s => (
            <React.Fragment key={s}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ fontFamily: 'Syne',
                  background: s <= step ? 'var(--brand)' : 'var(--surface-3)',
                  color: s <= step ? '#000' : 'var(--text-muted)' }}>
                {s}
              </div>
              {s < 3 && <div className="h-px w-8" style={{ background: s < step ? 'var(--brand)' : 'var(--border)' }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {/* Step 1 - Personal info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne' }}>Create account</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Your personal information</p>
              </div>
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} />
              </div>
              <button className="btn-primary w-full py-2.5 mt-2"
                onClick={() => { if (!form.name || !form.email || form.password.length < 8) { toast.error('Fill all fields correctly'); return; } setStep(2); }}>
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2 - Body metrics */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne' }}>Body metrics</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Used to calculate your calorie targets</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Age</label>
                  <input type="number" className="input" placeholder="25" min={13} max={120} value={form.age} onChange={e => update('age', e.target.value)} />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={e => update('gender', e.target.value)}
                    style={{ appearance: 'none', cursor: 'pointer' }}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Height (cm)</label>
                  <input type="number" className="input" placeholder="175" value={form.height} onChange={e => update('height', e.target.value)} />
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  <input type="number" className="input" placeholder="70" value={form.weight} onChange={e => update('weight', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Activity level</label>
                <div className="space-y-2">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                      style={{ background: form.activityLevel === opt.value ? 'rgba(34,197,94,0.1)' : 'var(--surface-3)', border: `1px solid ${form.activityLevel === opt.value ? 'rgba(34,197,94,0.3)' : 'var(--border)'}` }}>
                      <input type="radio" name="activity" value={opt.value} checked={form.activityLevel === opt.value} onChange={e => update('activityLevel', e.target.value)} className="hidden" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ fontFamily: 'Syne', color: form.activityLevel === opt.value ? 'var(--brand)' : 'var(--text-primary)' }}>{opt.label}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: form.activityLevel === opt.value ? 'var(--brand)' : 'var(--text-muted)' }}>
                        {form.activityLevel === opt.value && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--brand)' }} />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 py-2.5" onClick={() => setStep(1)}><ChevronLeft className="w-4 h-4" /> Back</button>
                <button className="btn-primary flex-1 py-2.5"
                  onClick={() => { if (!form.age || !form.height || !form.weight) { toast.error('Fill all fields'); return; } setStep(3); }}>
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Goal */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne' }}>Your goal</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>We'll personalize your calorie targets</p>
              </div>
              <div className="space-y-2.5">
                {GOAL_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                    style={{ background: form.goal === opt.value ? 'rgba(34,197,94,0.1)' : 'var(--surface-3)', border: `1px solid ${form.goal === opt.value ? 'rgba(34,197,94,0.3)' : 'var(--border)'}` }}>
                    <input type="radio" name="goal" value={opt.value} checked={form.goal === opt.value} onChange={e => update('goal', e.target.value)} className="hidden" />
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ fontFamily: 'Syne', color: form.goal === opt.value ? 'var(--brand)' : 'var(--text-primary)' }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: form.goal === opt.value ? 'var(--brand)' : 'var(--text-muted)' }}>
                      {form.goal === opt.value && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--brand)' }} />}
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 py-2.5" onClick={() => setStep(2)}><ChevronLeft className="w-4 h-4" /> Back</button>
                <button className="btn-primary flex-1 py-2.5" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
          Have an account? <Link to="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

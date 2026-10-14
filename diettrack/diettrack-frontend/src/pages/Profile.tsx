import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Lock, Save, Download } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { ProgressBar } from '../components/ui';
import { ExportPanel } from '../components/ui/ExportPanel';
import { GOAL_LABELS, ACTIVITY_LABELS, GENDER_LABELS, getErrorMessage } from '../utils';
import { ActivityLevel, Gender, Goal } from '../types';
import toast from 'react-hot-toast';

const ACTIVITY_OPTS: ActivityLevel[] = ['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTREMELY_ACTIVE'];
const GOAL_OPTS: Goal[] = ['WEIGHT_LOSS', 'WEIGHT_MAINTENANCE', 'WEIGHT_GAIN', 'MUSCLE_GAIN'];

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'password' | 'export'>('profile');

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    age: user?.age ? String(user.age) : '',
    gender: user?.gender ?? 'MALE',
    height: user?.height ? String(user.height) : '',
    weight: user?.weight ? String(user.weight) : '',
    activityLevel: user?.activityLevel ?? 'MODERATELY_ACTIVE',
    goal: user?.goal ?? 'WEIGHT_MAINTENANCE',
    waterGoal: user?.waterGoal ? String(user.waterGoal) : '',
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name, age: String(user.age), gender: user.gender,
        height: String(user.height), weight: String(user.weight),
        activityLevel: user.activityLevel, goal: user.goal, waterGoal: String(user.waterGoal),
      });
    }
  }, [user]);

  const profileMut = useMutation({
    mutationFn: (data: typeof profileForm) => {
      const parsedWaterGoal = parseInt(data.waterGoal);
      return authService.updateProfile({
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender as Gender,
        height: parseFloat(data.height),
        weight: parseFloat(data.weight),
        activityLevel: data.activityLevel as ActivityLevel,
        goal: data.goal as Goal,
        waterGoal: !isNaN(parsedWaterGoal) && parsedWaterGoal > 0 ? parsedWaterGoal : undefined,
      });
    },
    onSuccess: (updated) => {
      updateUser(updated);
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Profile updated! Targets recalculated.');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const passwordMut = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => authService.updateProfile(data),
    onSuccess: () => { toast.success('Password changed!'); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const upd = (k: string, v: string) => setProfileForm(f => ({ ...f, [k]: v }));

  const TABS = [
    { key: 'profile', icon: <Settings className="w-4 h-4" />, label: 'Profile' },
    { key: 'password', icon: <Lock className="w-4 h-4" />, label: 'Password' },
    { key: 'export', icon: <Download className="w-4 h-4" />, label: 'Export Data' },
  ] as const;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'Syne' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }} className="mt-1">Manage your account, targets, and data</p>
      </div>

      {/* Profile summary */}
      <div className="card animate-fade-up" style={{ background: 'linear-gradient(135deg, var(--surface-2), rgba(34,197,94,0.05))' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-black flex-shrink-0"
            style={{ background: 'var(--brand)', fontFamily: 'Syne' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Syne' }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="badge badge-green">{GOAL_LABELS[user?.goal ?? 'WEIGHT_MAINTENANCE']}</span>
              <span className="badge badge-blue">{ACTIVITY_LABELS[user?.activityLevel ?? 'MODERATELY_ACTIVE']}</span>
              <span className="badge badge-purple">{user?.gender ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        {user?.calorieTarget && (
          <div className="mt-5 pt-5 border-t grid grid-cols-2 sm:grid-cols-4 gap-4" style={{ borderColor: 'var(--border)' }}>
            {[
              { label: 'Calories', value: user.calorieTarget, unit: 'kcal', color: 'var(--brand)' },
              { label: 'Protein', value: user.proteinTarget, unit: 'g', color: '#f97316' },
              { label: 'Carbs', value: user.carbsTarget, unit: 'g', color: '#60a5fa' },
              { label: 'Fat', value: user.fatTarget, unit: 'g', color: '#a78bfa' },
            ].map(t => (
              <div key={t.label} className="text-center">
                <p className="label">{t.label}</p>
                <p className="text-xl font-bold" style={{ fontFamily: 'Syne', color: t.color }}>
                  {Math.round(t.value ?? 0)}<span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.unit}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ fontFamily: 'Syne', background: tab === t.key ? 'var(--surface-4)' : 'transparent', color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {tab === 'profile' && (
        <div className="card animate-fade-up space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input className="input" value={profileForm.name} onChange={e => upd('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Age</label>
              <input type="number" className="input" value={profileForm.age} onChange={e => upd('age', e.target.value)} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={profileForm.gender} onChange={e => upd('gender', e.target.value)} style={{ cursor: 'pointer' }}>
                {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map(g => <option key={g} value={g}>{GENDER_LABELS[g]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" className="input" value={profileForm.height} onChange={e => upd('height', e.target.value)} />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" step="0.1" className="input" value={profileForm.weight} onChange={e => upd('weight', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Daily Water Goal (ml)</label>
              <input type="number" className="input" value={profileForm.waterGoal} onChange={e => upd('waterGoal', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Activity Level</label>
            <div className="space-y-2 mt-1">
              {ACTIVITY_OPTS.map(opt => (
                <label key={opt} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: profileForm.activityLevel === opt ? 'rgba(34,197,94,0.08)' : 'var(--surface-3)', border: `1px solid ${profileForm.activityLevel === opt ? 'rgba(34,197,94,0.25)' : 'var(--border)'}` }}>
                  <input type="radio" name="activity" value={opt} checked={profileForm.activityLevel === opt} onChange={() => upd('activityLevel', opt)} className="hidden" />
                  <p className="text-sm font-semibold flex-1" style={{ fontFamily: 'Syne', color: profileForm.activityLevel === opt ? 'var(--brand)' : 'var(--text-primary)' }}>{ACTIVITY_LABELS[opt]}</p>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: profileForm.activityLevel === opt ? 'var(--brand)' : 'var(--text-muted)' }}>
                    {profileForm.activityLevel === opt && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--brand)' }} />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Fitness Goal</label>
            <div className="grid sm:grid-cols-2 gap-2 mt-1">
              {GOAL_OPTS.map(opt => (
                <label key={opt} className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: profileForm.goal === opt ? 'rgba(34,197,94,0.08)' : 'var(--surface-3)', border: `1px solid ${profileForm.goal === opt ? 'rgba(34,197,94,0.25)' : 'var(--border)'}` }}>
                  <input type="radio" name="goal" value={opt} checked={profileForm.goal === opt} onChange={() => upd('goal', opt)} className="hidden" />
                  <p className="text-sm font-semibold flex-1" style={{ fontFamily: 'Syne', color: profileForm.goal === opt ? 'var(--brand)' : 'var(--text-primary)' }}>{GOAL_LABELS[opt]}</p>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: profileForm.goal === opt ? 'var(--brand)' : 'var(--text-muted)' }}>
                    {profileForm.goal === opt && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--brand)' }} />}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full py-3" onClick={() => profileMut.mutate(profileForm)} disabled={profileMut.isPending}>
            <Save className="w-4 h-4" />
            {profileMut.isPending ? 'Saving...' : 'Save Changes & Recalculate Targets'}
          </button>
        </div>
      )}

      {/* Password form */}
      {tab === 'password' && (
        <div className="card animate-fade-up space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" placeholder="••••••••"
              value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="Min 8 characters"
              value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" placeholder="Repeat new password"
              value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} />
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-xs mt-1.5" style={{ color: '#f87171' }}>Passwords don&apos;t match</p>
            )}
          </div>
          {passwordForm.newPassword && (
            <div>
              <p className="label mb-2">Password strength</p>
              <ProgressBar
                value={Math.min(100, (passwordForm.newPassword.length / 16) * 100 + ((/[A-Z]/.test(passwordForm.newPassword) ? 1 : 0) + (/[0-9]/.test(passwordForm.newPassword) ? 1 : 0) + (/[^A-Za-z0-9]/.test(passwordForm.newPassword) ? 1 : 0)) * 15)}
                color={passwordForm.newPassword.length >= 12 ? 'var(--brand)' : passwordForm.newPassword.length >= 8 ? '#fbbf24' : '#f87171'}
              />
            </div>
          )}
          <button className="btn-primary w-full py-3 mt-2"
            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || passwordMut.isPending}
            onClick={() => {
              if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error("Passwords don't match"); return; }
              if (passwordForm.newPassword.length < 8) { toast.error('Min 8 characters'); return; }
              passwordMut.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
            }}>
            <Lock className="w-4 h-4" />
            {passwordMut.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}

      {/* Export tab */}
      {tab === 'export' && (
        <div className="card animate-fade-up">
          <h2 className="font-bold mb-5" style={{ fontFamily: 'Syne' }}>
            <Download className="w-4 h-4 inline mr-2" style={{ color: 'var(--brand)' }} />
            Export Your Data
          </h2>
          <ExportPanel />
        </div>
      )}
    </div>
  );
};

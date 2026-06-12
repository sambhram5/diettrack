import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, BarChart2, Droplets, Scale, Flame, Shield, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: Flame, title: 'Smart Calorie Tracking', desc: 'Auto-calculates your TDEE using Mifflin-St Jeor. Personalized targets for your exact goal.', color: '#f97316' },
  { icon: BarChart2, title: 'Rich Analytics', desc: 'Interactive charts showing nutrition trends, weight progress and goal achievement over time.', color: '#60a5fa' },
  { icon: Droplets, title: 'Water Tracking', desc: 'Monitor daily hydration with quick-add buttons and streaks to keep you consistent.', color: '#38bdf8' },
  { icon: Scale, title: 'Weight Logging', desc: 'Track your body weight history and visualize your progress over weeks and months.', color: '#a78bfa' },
  { icon: Shield, title: 'Streak System', desc: 'Build habits with daily tracking streaks for meals, water, and weight logging.', color: '#4ade80' },
  { icon: Zap, title: '60+ Foods Pre-loaded', desc: 'Searchable food library with full macros. Add your own custom foods in seconds.', color: '#fbbf24' },
];

export const Landing: React.FC = () => (
  <div style={{ background: 'var(--surface-0)', minHeight: '100vh' }}>
    <nav className="flex items-center justify-between px-6 lg:px-16 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
          <Zap className="w-4 h-4 text-black" />
        </div>
        <span className="font-bold text-xl text-gradient" style={{ fontFamily: 'Syne' }}>DietTrack</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
        <Link to="/register" className="btn-primary text-sm">Get started free</Link>
      </div>
    </nav>

    <section className="text-center px-6 pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #22c55e 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      <div className="relative max-w-4xl mx-auto">
        <div className="badge badge-green inline-flex mb-6"><Zap className="w-3 h-3" /> Production Ready · Free Forever</div>
        <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Syne' }}>
          Track smarter,<br /><span className="text-gradient">eat better.</span>
        </h1>
        <p className="text-lg lg:text-xl max-w-xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
          A complete nutrition command center — calories, macros, water, weight, and deep analytics, all in one beautiful dashboard.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary text-base px-8 py-3">Start tracking free <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/login" className="btn-secondary text-base px-8 py-3">Sign in</Link>
        </div>
      </div>
    </section>

    <section className="px-6 lg:px-16 pb-16">
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {[['60+', 'Foods in library'], ['8', 'Tracking metrics'], ['∞', 'History stored']].map(([val, label]) => (
          <div key={label} className="text-center p-6 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <p className="text-3xl font-bold text-gradient" style={{ fontFamily: 'Syne' }}>{val}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="px-6 lg:px-16 py-16" style={{ background: 'var(--surface-1)' }}>
      <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'Syne' }}>Everything you need to reach your goals</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card" style={{ background: 'var(--surface-2)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20`, color }}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base mb-2" style={{ fontFamily: 'Syne' }}>{title}</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="px-6 py-24 text-center">
      <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Syne' }}>Ready to transform your nutrition?</h2>
      <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>Create your free account in under 60 seconds.</p>
      <Link to="/register" className="btn-primary text-base px-10 py-3">Create free account <ArrowRight className="w-4 h-4" /></Link>
    </section>

    <footer className="text-center py-8 text-sm border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
      © {new Date().getFullYear()} DietTrack. Built for healthy living.
    </footer>
  </div>
);

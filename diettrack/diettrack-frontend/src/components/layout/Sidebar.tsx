import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LayoutDashboard, Utensils, Apple, Droplets, Scale, BarChart2, User, LogOut, Menu, X, Zap, Sun, Moon, Search } from 'lucide-react';
import { GlobalSearch } from '../ui/GlobalSearch';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/meals', icon: Utensils, label: 'Meal Tracker' },
  { path: '/foods', icon: Apple, label: 'Food Library' },
  { path: '/water', icon: Droplets, label: 'Water Tracker' },
  { path: '/weight', icon: Scale, label: 'Weight Tracker' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); toast.success('Logged out'); }
    catch { toast.error('Logout failed'); }
  };

  // Keyboard shortcut for search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
          <Zap className="w-4 h-4 text-black" />
        </div>
        <span className="font-bold text-lg text-gradient" style={{ fontFamily: 'Syne' }}>DietTrack</span>
        <button onClick={toggleTheme} className="btn-ghost p-1.5 ml-auto" title="Toggle theme">
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Search button */}
      <div className="px-3 mb-2">
        <button onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="text-xs px-1 rounded" style={{ background: 'var(--surface-4)', fontFamily: 'monospace', fontSize: '10px' }}>⌘K</kbd>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}>
            <Icon className="w-4 h-4 flex-shrink-0" /><span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl mt-4" style={{ background: 'var(--surface-3)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0" style={{ background: 'var(--brand)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ fontFamily: 'Syne' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost p-1.5 flex-shrink-0" title="Logout">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Global search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <GlobalSearch onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-60 z-40 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}>
        <Content />
      </div>
      <div className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0"
        style={{ background: 'var(--surface-1)', borderRight: '1px solid var(--border)' }}>
        <Content />
      </div>
    </>
  );
};

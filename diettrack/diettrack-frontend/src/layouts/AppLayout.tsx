import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { path: '/meals', icon: '🍽', label: 'Meal Tracker' },
  { path: '/foods', icon: '📚', label: 'Food Library' },
  { path: '/water', icon: '💧', label: 'Water' },
  { path: '/weight', icon: '⚖', label: 'Weight' },
  { path: '/analytics', icon: '📈', label: 'Analytics' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#0d1410',
      borderRight: '1px solid #263329', display: 'flex', flexDirection: 'column',
      padding: '1.5rem 0.75rem', gap: 0, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 0.5rem 1.75rem', borderBottom: '1px solid #1a231d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #22c55e, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 0 16px rgba(34,197,94,.25)',
          }}>🥗</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
            Diet<span style={{ color: '#22c55e' }}>Track</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.65rem', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
          Menu
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            onClick={() => setSidebarOpen(false)}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profile at bottom */}
      <div style={{ borderTop: '1px solid #1a231d', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink
          to="/profile"
          className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          onClick={() => setSidebarOpen(false)}
        >
          <span style={{ fontSize: 16 }}>👤</span>
          <span>Profile</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: '#ef4444' }}
        >
          <span style={{ fontSize: 16 }}>→</span>
          <span>Logout</span>
        </button>

        {/* User info */}
        <div style={{
          marginTop: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
          background: '#121a15', border: '1px solid #1a231d',
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e5e7eb', lineHeight: 1.3 }}>
            {user?.name}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: 2 }}>
            {user?.goal?.replace(/_/g, ' ')}
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block" style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile topbar */}
        <div
          className="md:hidden"
          style={{
            height: 56, background: '#0d1410', borderBottom: '1px solid #263329',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 1rem', position: 'sticky', top: 0, zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #22c55e, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🥗</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
              Diet<span style={{ color: '#22c55e' }}>Track</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.5rem', fontSize: 20 }}
          >
            ☰
          </button>
        </div>

        <div style={{ flex: 1, padding: '1.5rem 1.5rem 2rem', maxWidth: 1200 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

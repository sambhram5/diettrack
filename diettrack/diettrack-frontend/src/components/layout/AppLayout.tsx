import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => (
  <div className="flex min-h-screen" style={{ background: 'var(--surface-0)' }}>
    <Sidebar />
    <main className="flex-1 min-w-0 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 pt-16 lg:pt-8">
        <Outlet />
      </div>
    </main>
  </div>
);

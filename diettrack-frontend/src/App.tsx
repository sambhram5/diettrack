import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MealTracker } from './pages/MealTracker';
import { FoodLibrary } from './pages/FoodLibrary';
import { WaterTracker } from './pages/WaterTracker';
import { WeightTracker } from './pages/WeightTracker';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen" style={{ background: 'var(--surface-0)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>⚡</div>
      <div className="w-32 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
        <div className="h-full w-3/5 rounded-full animate-pulse" style={{ background: 'var(--brand)' }} />
      </div>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meals" element={<MealTracker />} />
        <Route path="/foods" element={<FoodLibrary />} />
        <Route path="/water" element={<WaterTracker />} />
        <Route path="/weight" element={<WeightTracker />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-bright)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: 'var(--surface-2)' } },
                error: { iconTheme: { primary: '#f87171', secondary: 'var(--surface-2)' } },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

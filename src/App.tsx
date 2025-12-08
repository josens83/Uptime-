import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import './index.css';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/game/Dashboard').then(m => ({ default: m.Dashboard })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark-400 text-sm">로딩 중...</p>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    // Check if user exists in auth store
    if (user) {
      setIsAuthenticated(true);
    }
  }, [user]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AuthPage onSuccess={handleAuthSuccess} />
      </Suspense>
    );
  }

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pricing" element={
            <div className="min-h-screen bg-dark-950 p-8">
              <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-gradient from-primary-400 to-purple-400">
                  프리미엄 플랜
                </h1>
                <PricingPage onClose={() => window.history.back()} />
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

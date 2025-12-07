import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/game/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { PricingPage } from './pages/PricingPage';
import { useAuthStore } from './store/authStore';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
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
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return (
    <Router>
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
    </Router>
  );
}

export default App;

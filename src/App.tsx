import React from 'react';
import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { useTheme } from './hooks/useTheme';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  
  // Initialize theme system
  useTheme();

  if (!isAuthenticated) {
    return showSignUp ? (
      <SignUpPage onSwitchToLogin={() => setShowSignUp(false)} />
    ) : (
      <LoginPage onSwitchToSignUp={() => setShowSignUp(true)} />
    );
  }

  return user?.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
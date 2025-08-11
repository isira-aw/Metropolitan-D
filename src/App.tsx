import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Generators } from './pages/Generators';
import { JobCards } from './pages/JobCards';
import { MyTasks } from './pages/MyTasks';
import { ActivityLogs } from './pages/ActivityLogs';

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user role
  // Admins go to dashboard, Employees go to my-tasks
  return <Navigate to={isAdmin ? "/dashboard" : "/my-tasks"} replace />;
};

// Enhanced ProtectedRoute component for admin-only routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute adminOnly>
      {children}
    </ProtectedRoute>
  );
};

// Employee route protection - ONLY allows /my-tasks for employees
const EmployeeOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  
  // If admin tries to access employee route, redirect to dashboard
  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Block employees from accessing any other routes
const BlockEmployeeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAuth();
  
  // If employee tries to access admin/other routes, redirect to my-tasks
  if (!isAdmin) {
    return <Navigate to="/my-tasks" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Root redirect based on role */}
      <Route path="/" element={<RoleBasedRedirect />} />
      
      {/* Protected routes with Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Admin-only routes - Employees will be redirected to /my-tasks */}
        <Route path="dashboard" element={
          <BlockEmployeeRoute>
            <Dashboard />
          </BlockEmployeeRoute>
        } />
        
        <Route path="employees" element={
          <AdminRoute>
            <Employees />
          </AdminRoute>
        } />
        
        <Route path="generators" element={
          <BlockEmployeeRoute>
            <Generators />
          </BlockEmployeeRoute>
        } />
        
        <Route path="jobs" element={
          <AdminRoute>
            <JobCards />
          </AdminRoute>
        } />
        
        <Route path="activity" element={
          <AdminRoute>
            <ActivityLogs />
          </AdminRoute>
        } />
        
        {/* Employee-only route - Only accessible to employees */}
        <Route path="my-tasks" element={
          <EmployeeOnlyRoute>
            <MyTasks />
          </EmployeeOnlyRoute>
        } />
        
        {/* Block this route from employees completely */}
        <Route path="my-activity" element={
          <BlockEmployeeRoute>
            <ActivityLogs />
          </BlockEmployeeRoute>
        } />
        
        {/* Catch-all redirect - Employees go to my-tasks, Admins go to dashboard */}
        <Route path="*" element={<RoleBasedRedirect />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
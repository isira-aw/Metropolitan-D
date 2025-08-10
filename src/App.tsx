import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="generators" element={<Generators />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="my-activity" element={<ActivityLogs />} />
            
            {/* Admin Only Routes */}
            <Route path="employees" element={
              <ProtectedRoute adminOnly>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="jobs" element={
              <ProtectedRoute adminOnly>
                <JobCards />
              </ProtectedRoute>
            } />
            <Route path="tasks" element={
              <ProtectedRoute adminOnly>
                <MyTasks />
              </ProtectedRoute>
            } />
            <Route path="activity" element={
              <ProtectedRoute adminOnly>
                <ActivityLogs />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
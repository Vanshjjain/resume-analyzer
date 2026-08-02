import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { ResumeComparison } from './pages/ResumeComparison';
import { JobMatch } from './pages/JobMatch';
import { JobRoles } from './pages/JobRoles';
import { InterviewPrep } from './pages/InterviewPrep';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';
import { Landing } from './pages/Landing';

const queryClient = new QueryClient();

// Route wrapper for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Route wrapper for admin-only routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Unauthenticated public pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Authenticated workspace routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analyzer"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ResumeAnalyzer />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compare"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ResumeComparison />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job-match"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <JobMatch />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job-roles"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <JobRoles />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interview"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InterviewPrep />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Settings />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Admin-only routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Layout>
                      <Admin />
                    </Layout>
                  </AdminRoute>
                }
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

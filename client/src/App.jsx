import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { IssueProvider } from './context/IssueContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { BoardPage } from './pages/BoardPage.jsx';
import { IssuesPage } from './pages/IssuesPage.jsx';
import { InsightsPage } from './pages/InsightsPage.jsx';
import { ActivityPage } from './pages/ActivityPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { Layers } from 'lucide-react';

function ProtectedRoute() {
  const { isAuthenticated, isGuest, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col items-center justify-center transition-colors">
        <div className="w-12 h-12 rounded-2xl theme-btn-primary flex items-center justify-center text-white shadow-xl animate-pulse mb-3">
          <Layers className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-xs font-semibold tracking-wide text-[var(--theme-text-muted)] animate-pulse">
          Loading DevTrack workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <IssueProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/board" element={<BoardPage />} />
                  <Route path="/issues" element={<IssuesPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Routes>
          </IssueProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


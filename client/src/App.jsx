import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { IssueProvider } from './context/IssueContext.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { BoardPage } from './pages/BoardPage.jsx';
import { IssuesPage } from './pages/IssuesPage.jsx';
import { InsightsPage } from './pages/InsightsPage.jsx';
import { ActivityPage } from './pages/ActivityPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <IssueProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/board" element={<BoardPage />} />
                <Route path="/issues" element={<IssuesPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </IssueProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

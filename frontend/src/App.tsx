import React, { useState, useEffect, useCallback } from 'react';
import { ApolloProvider, useLazyQuery } from '@apollo/client';
import { apolloClient, ME, GET_DASHBOARD } from './utils/apollo';
import { User, DashboardData, Theme, AppView } from './types';
import { Navbar } from './components/shared/Navbar';
import { Auth } from './components/auth/Auth';
import { Landing } from './components/pages/Landing';
import { Upload } from './components/pages/Upload';
import { Overview } from './components/dashboard/Overview';
import { SalesAnalysis } from './components/pages/SalesAnalysis';
import { Segmentation } from './components/pages/Segmentation';
import { SentimentPage } from './components/pages/SentimentPage';
import { AIInsights } from './components/pages/AIInsights';
import './styles/globals.css';
import './components/pages/AIInsights.css';

const AppInner: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  const [view, setView] = useState<AppView>('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [fetchMe] = useLazyQuery(ME);
  const [fetchDashboard] = useLazyQuery(GET_DASHBOARD);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('insightforge_theme', theme);
  }, [theme]);

  // Restore theme
  useEffect(() => {
    const saved = localStorage.getItem('insightforge_theme') as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  // Auto-login from token
  useEffect(() => {
    const token = localStorage.getItem('insightforge_token');
    if (!token) { setAuthChecked(true); return; }
    fetchMe().then(res => {
      if (res.data?.me) setUser(res.data.me);
      else localStorage.removeItem('insightforge_token');
      setAuthChecked(true);
    }).catch(() => { localStorage.removeItem('insightforge_token'); setAuthChecked(true); });
  }, [fetchMe]);

  const handleAuthSuccess = useCallback((u: User) => {
    setUser(u);
    setShowAuth(false);
    setView('landing');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('insightforge_token');
    setUser(null);
    setDashboard(null);
    setView('landing');
  }, []);

  const handleUploadComplete = useCallback((data: DashboardData) => {
    setDashboard(data);
    setView('dashboard');
  }, []);

  const handleSelectHistory = useCallback(async (id: string) => {
    try {
      const res = await fetchDashboard({ variables: { id } });
      if (res.data?.getDashboardData) {
        setDashboard(res.data.getDashboardData);
        setView('dashboard');
      }
    } catch (err) {
      console.error('Failed to load history item', err);
    }
  }, [fetchDashboard]);

  const handleNavigate = useCallback((v: AppView) => {
    if (['sales', 'segmentation', 'sentiment', 'insights', 'dashboard'].includes(v) && !dashboard) {
      setView('landing');
      return;
    }
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dashboard]);

  const handleShowAuth = useCallback(() => {
    if (user) return;
    setShowAuth(true);
  }, [user]);

  const handleUploadNew = useCallback(() => {
    if (!user) { setShowAuth(true); return; }
    setView('upload');
  }, [user]);

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 12 }}>
        <span className="spinner spinner-lg" />
        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Loading InsightForge...</span>
      </div>
    );
  }

  const hasDashboard = !!dashboard;

  return (
    <>
      <Navbar
        user={user}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onShowAuth={handleShowAuth}
        onLogout={handleLogout}
        currentView={view}
        onNavigate={handleNavigate}
        hasDashboard={hasDashboard}
      />

      {showAuth && !user && (
        <Auth onSuccess={handleAuthSuccess} onBack={() => setShowAuth(false)} />
      )}

      <main style={{ flex: 1 }}>
        {view === 'landing' && (
          <Landing
            user={user}
            onShowAuth={handleShowAuth}
            onSelectHistory={handleSelectHistory}
            onUploadNew={handleUploadNew}
          />
        )}
        {view === 'upload' && user && (
          <Upload onComplete={handleUploadComplete} onCancel={() => setView('landing')} />
        )}
        {view === 'dashboard' && dashboard && (
          <Overview data={dashboard} onNavigate={handleNavigate} onUploadNew={handleUploadNew} />
        )}
        {view === 'sales' && dashboard && (
          <SalesAnalysis data={dashboard} onBack={() => handleNavigate('dashboard')} />
        )}
        {view === 'segmentation' && dashboard && (
          <Segmentation data={dashboard} onBack={() => handleNavigate('dashboard')} />
        )}
        {view === 'sentiment' && dashboard && (
          <SentimentPage data={dashboard} onBack={() => handleNavigate('dashboard')} />
        )}
        {view === 'insights' && dashboard && (
          <AIInsights data={dashboard} onBack={() => handleNavigate('dashboard')} />
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
        InsightForge v2.0 · AI-Powered Business Intelligence · Built with React, GraphQL & AI
      </footer>
    </>
  );
};

const App: React.FC = () => (
  <ApolloProvider client={apolloClient}>
    <AppInner />
  </ApolloProvider>
);

export default App;

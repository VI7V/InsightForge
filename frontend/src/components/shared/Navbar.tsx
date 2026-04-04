import React from 'react';
import { User, Theme, AppView } from '../../types';
import './Navbar.css';

interface NavbarProps {
  user: User | null;
  theme: Theme;
  onToggleTheme: () => void;
  onShowAuth: () => void;
  onLogout: () => void;
  currentView: AppView;
  onNavigate: (v: AppView) => void;
  hasDashboard: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, theme, onToggleTheme, onShowAuth, onLogout, currentView, onNavigate, hasDashboard }) => {
  const dashViews: { view: AppView; label: string }[] = [
    { view: 'dashboard', label: 'Overview' },
    { view: 'sales', label: 'Sales Analysis' },
    { view: 'segmentation', label: 'Customers' },
    { view: 'sentiment', label: 'Sentiment' },
    { view: 'insights', label: 'AI Insights' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <button className="navbar__brand" onClick={() => onNavigate('landing')}>
          <div className="navbar__logo">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="var(--accent)" />
              <path d="M7 21V13M12 21V9M17 21V15M22 21V7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="navbar__name">InsightForge</span>
        </button>

        {hasDashboard && (
          <div className="navbar__tabs">
            {dashViews.map(({ view, label }) => (
              <button
                key={view}
                className={`navbar__tab ${currentView === view ? 'navbar__tab--active' : ''}`}
                onClick={() => onNavigate(view)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="navbar__actions">
          <button className="navbar__theme-btn" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {user ? (
            <div className="navbar__user">
              <div className="navbar__avatar">{user.name.charAt(0).toUpperCase()}</div>
              <span className="navbar__username">{user.name.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onShowAuth}>Sign In</button>
          )}
        </div>
      </div>
    </nav>
  );
};

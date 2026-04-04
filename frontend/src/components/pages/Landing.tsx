import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_HISTORY, DELETE_HISTORY } from '../../utils/apollo';
import { User, CSVHistory } from '../../types';
import './Landing.css';

interface LandingProps {
  user: User | null;
  onShowAuth: () => void;
  onSelectHistory: (id: string) => void;
  onUploadNew: () => void;
}

const FeatureCard: React.FC<{ icon: string; title: string; desc: string; delay: number }> = ({ icon, title, desc, delay }) => (
  <div className="feature-card fade-in" style={{ animationDelay: `${delay}ms` }}>
    <div className="feature-card__icon">{icon}</div>
    <h3 className="feature-card__title">{title}</h3>
    <p className="feature-card__desc">{desc}</p>
  </div>
);

const HistoryItem: React.FC<{ item: CSVHistory; onSelect: () => void; onDelete: () => void }> = ({ item, onSelect, onDelete }) => (
  <div className="history-item">
    <button className="history-item__main" onClick={onSelect}>
      <div className="history-item__icon">📊</div>
      <div className="history-item__info">
        <div className="history-item__name">{item.fileName}</div>
        <div className="history-item__meta">
          {item.rowCount.toLocaleString()} rows · {new Date(item.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
      <div className="history-item__stats">
        <div className="history-item__revenue">${(item.totalRevenue / 1000).toFixed(0)}K</div>
        <div className={`history-item__growth ${item.growthRate >= 0 ? 'positive' : 'negative'}`}>
          {item.growthRate >= 0 ? '↑' : '↓'} {Math.abs(item.growthRate)}%
        </div>
      </div>
    </button>
    <button className="history-item__delete btn btn-ghost btn-sm" onClick={onDelete} title="Remove">✕</button>
  </div>
);

export const Landing: React.FC<LandingProps> = ({ user, onShowAuth, onSelectHistory, onUploadNew }) => {
  const { data: historyData, refetch } = useQuery(GET_HISTORY, { skip: !user });
  const [deleteHistory] = useMutation(DELETE_HISTORY);
  const history: CSVHistory[] = historyData?.getUserHistory || [];

  const handleDelete = async (id: string) => {
    await deleteHistory({ variables: { historyId: id } });
    refetch();
  };

  return (
    <div className="landing">
      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-bg" />
        <div className="landing__hero-content">
          <div className="badge badge-blue fade-in" style={{ marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            Enterprise Business Intelligence
          </div>
          <h1 className="landing__title fade-in fade-in-1">
            Transform Data Into
            <span className="landing__title-accent">Strategic Intelligence</span>
          </h1>
          <p className="landing__desc fade-in fade-in-2">
            Upload your sales CSV and receive executive-grade analytics — AI-powered forecasts,
            customer segmentation, anomaly detection, and sentiment analysis in under 60 seconds.
          </p>
          <div className="landing__cta fade-in fade-in-3">
            {user ? (
              <button className="btn btn-primary btn-lg" onClick={onUploadNew}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                Analyze New Dataset
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-lg" onClick={onShowAuth}>Get Started Free</button>
                <button className="btn btn-secondary btn-lg" onClick={onShowAuth}>Sign In</button>
              </>
            )}
          </div>
          <div className="landing__trust fade-in fade-in-4">
            <span className="landing__trust-item">✓ No credit card required</span>
            <span className="landing__trust-item">✓ 1,500 free AI analyses/day</span>
            <span className="landing__trust-item">✓ Enterprise-grade security</span>
          </div>
        </div>
      </section>

      {/* History panel — shown only when logged in */}
      {user && (
        <section className="landing__history">
          <div className="landing__section-header">
            <div>
              <h2 className="landing__section-title">Recent Analyses</h2>
              <p className="landing__section-sub">Click any file to revisit its full dashboard</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={onUploadNew}>
              + New Analysis
            </button>
          </div>
          {history.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty__icon">📂</div>
              <p>No analyses yet. Upload your first CSV to get started.</p>
              <button className="btn btn-primary btn-sm" onClick={onUploadNew} style={{ marginTop: 12 }}>Upload CSV</button>
            </div>
          ) : (
            <div className="history-list">
              {history.map(item => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onSelect={() => onSelectHistory(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Features */}
      <section className="landing__features">
        <div className="landing__section-header" style={{ marginBottom: 32 }}>
          <h2 className="landing__section-title">Everything You Need</h2>
        </div>
        <div className="features-grid">
          <FeatureCard icon="📈" title="Sales Forecasting" desc="Linear regression and moving average models project the next quarter's revenue with confidence intervals and trend decomposition." delay={0} />
          <FeatureCard icon="⚡" title="Anomaly Detection" desc="Z-score statistical analysis automatically identifies revenue spikes and drops with business context explanations." delay={60} />
          <FeatureCard icon="👥" title="Customer Segmentation" desc="RFM-based clustering divides your customer base into actionable segments: high-value, medium, low-value, and churn risk." delay={120} />
          <FeatureCard icon="💬" title="Sentiment Analysis" desc="NLP analysis of customer feedback produces a sentiment score and thematic breakdown across all reviews." delay={180} />
          <FeatureCard icon="🤖" title="AI-Generated Insights" desc="Executive-ready intelligence reports generated by leading AI models, tailored for strategic business decisions." delay={240} />
          <FeatureCard icon="🔐" title="Secure & Private" desc="Your data is encrypted in transit and at rest. Each user's analyses are completely isolated. GDPR-compliant." delay={300} />
        </div>
      </section>
    </div>
  );
};

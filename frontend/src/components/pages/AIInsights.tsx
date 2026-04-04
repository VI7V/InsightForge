import React, { useState } from 'react';
import { DashboardData } from '../../types';
import './DetailPage.css';

interface AIInsightsProps { data: DashboardData; onBack: () => void; }

type InsightTab = 'sales' | 'anomaly' | 'marketing' | 'sentiment';

const tabs: { key: InsightTab; label: string; icon: string; color: string; badge: string }[] = [
  { key: 'sales', label: 'Sales Intelligence', icon: '📊', color: '#3b82f6', badge: 'badge-blue' },
  { key: 'anomaly', label: 'Anomaly Report', icon: '⚡', color: '#f59e0b', badge: 'badge-amber' },
  { key: 'marketing', label: 'Marketing Strategy', icon: '🎯', color: '#8b5cf6', badge: 'badge-blue' },
  { key: 'sentiment', label: 'Customer Voice', icon: '💬', color: '#10b981', badge: 'badge-green' },
];

function renderInsight(text: string) {
  return text.split('\n').filter(l => l.trim()).map((line, i) => {
    const isHeading = /^\*\*/.test(line) || /^#{1,3}\s/.test(line) || /^\d+\.\s/.test(line);
    const clean = line.replace(/\*\*/g, '').replace(/^#{1,3}\s/, '').trim();
    return isHeading
      ? <h4 key={i} className="insight-heading">{clean}</h4>
      : <p key={i} className="insight-para">{clean}</p>;
  });
}

export const AIInsights: React.FC<AIInsightsProps> = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState<InsightTab>('sales');

  const contentMap: Record<InsightTab, string> = {
    sales: data.salesInsights,
    anomaly: data.anomalyExplanation,
    marketing: data.marketingStrategies,
    sentiment: data.feedbackSummary,
  };

  const activeConfig = tabs.find(t => t.key === activeTab)!;

  return (
    <div className="detail-page">
      <div className="detail-page__inner">
        <div className="detail-header fade-in">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Overview</button>
          <div className="detail-header__title-group">
            <div className="detail-header__icon" style={{ background: '#f59e0b18', color: '#f59e0b' }}>🤖</div>
            <div>
              <h1 className="detail-header__title">AI-Generated Insights</h1>
              <p className="detail-header__sub">Executive-grade intelligence reports powered by AI — ready for board presentations</p>
            </div>
          </div>
        </div>

        {/* Tab grid */}
        <div className="insights-tab-grid fade-in fade-in-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`insights-tab-card ${activeTab === tab.key ? 'insights-tab-card--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{ '--tab-color': tab.color } as React.CSSProperties}
            >
              <span className="insights-tab-card__icon">{tab.icon}</span>
              <span className="insights-tab-card__label">{tab.label}</span>
              {activeTab === tab.key && <span className="insights-tab-card__dot" />}
            </button>
          ))}
        </div>

        {/* Active insight */}
        <div className="card fade-in" key={activeTab}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{activeConfig.icon}</span>
              <h3 className="card-title">{activeConfig.label}</h3>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge ${activeConfig.badge}`}>AI Generated</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigator.clipboard?.writeText(contentMap[activeTab])}>
                Copy
              </button>
            </div>
          </div>
          <div className="insight-body">
            {renderInsight(contentMap[activeTab])}
          </div>
        </div>

        {/* Key metrics summary */}
        <div className="card fade-in fade-in-2">
          <div className="card-header"><h3 className="card-title">Executive Dashboard Summary</h3></div>
          <div className="exec-summary-grid">
            {[
              { section: 'Financial Performance', items: [
                { label: 'Total Revenue', value: `$${(data.totalRevenue / 1000).toFixed(1)}K` },
                { label: 'Growth Rate', value: `${data.growthRate > 0 ? '+' : ''}${data.growthRate}%` },
                { label: 'Avg Order Value', value: `$${data.avgOrderValue.toFixed(0)}` },
                { label: 'Revenue/Customer', value: `$${data.revenuePerCustomer.toFixed(0)}` },
              ]},
              { section: 'Customer Intelligence', items: [
                { label: 'Total Customers', value: data.totalCustomers.toLocaleString() },
                { label: 'High Value', value: `${data.customerSegments.find(s => s.name === 'High Value')?.percentage || 0}%` },
                { label: 'Churn Risk', value: `${data.customerSegments.find(s => s.name === 'Churn Risk')?.percentage || 0}%` },
                { label: 'Sentiment Score', value: `${data.sentiment.overallScore.toFixed(0)}/100` },
              ]},
              { section: 'Market Position', items: [
                { label: 'Top Category', value: data.topCategory },
                { label: 'Top Region', value: data.topRegion },
                { label: 'Peak Month', value: data.peakMonth },
                { label: 'Anomalies Detected', value: String(data.anomalies.length) },
              ]},
            ].map((section, i) => (
              <div key={i} className="exec-section">
                <h4 className="exec-section__title">{section.section}</h4>
                {section.items.map((item, j) => (
                  <div key={j} className="exec-row">
                    <span className="exec-row__label">{item.label}</span>
                    <span className="exec-row__value">{item.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Processed at */}
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', paddingTop: 8 }}>
          Analysis generated: {new Date(data.processedAt).toLocaleString()} · {data.totalOrders.toLocaleString()} records processed
        </div>
      </div>
    </div>
  );
};

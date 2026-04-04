import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DashboardData } from '../../types';
import './DetailPage.css';

interface SentimentProps { data: DashboardData; onBack: () => void; }

export const SentimentPage: React.FC<SentimentProps> = ({ data, onBack }) => {
  const { sentiment } = data;
  const score = sentiment.overallScore;
  const scoreColor = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--amber)' : 'var(--red)';
  const scoreLabel = score >= 70 ? 'Excellent' : score >= 55 ? 'Good' : score >= 40 ? 'Moderate' : 'Needs Attention';

  const sentBars = [
    { name: 'Positive', value: sentiment.positive, color: 'var(--green)' },
    { name: 'Neutral', value: sentiment.neutral, color: 'var(--amber)' },
    { name: 'Negative', value: sentiment.negative, color: 'var(--red)' },
  ];

  const pieData = [
    { name: 'Positive', value: sentiment.positive, color: 'var(--green)' },
    { name: 'Neutral', value: sentiment.neutral, color: 'var(--amber)' },
    { name: 'Negative', value: sentiment.negative, color: 'var(--red)' },
  ];

  const scoreArc = (score / 100) * 251.2;

  return (
    <div className="detail-page">
      <div className="detail-page__inner">
        <div className="detail-header fade-in">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Overview</button>
          <div className="detail-header__title-group">
            <div className="detail-header__icon" style={{ background: '#10b98118', color: '#10b981' }}>💬</div>
            <div>
              <h1 className="detail-header__title">Customer Sentiment</h1>
              <p className="detail-header__sub">NLP feedback analysis across all customer reviews</p>
            </div>
          </div>
        </div>

        <div className="detail-kpis fade-in fade-in-1">
          {[
            { label: 'Sentiment Score', value: `${score.toFixed(0)}/100`, color: scoreColor },
            { label: 'Classification', value: scoreLabel, color: scoreColor },
            { label: 'Positive Reviews', value: `${sentiment.positive}%`, color: 'var(--green)' },
            { label: 'Negative Reviews', value: `${sentiment.negative}%`, color: 'var(--red)' },
            { label: 'Neutral Reviews', value: `${sentiment.neutral}%`, color: 'var(--amber)' },
            { label: 'Net Sentiment', value: `${(sentiment.positive - sentiment.negative).toFixed(1)}pp`, color: sentiment.positive >= sentiment.negative ? 'var(--green)' : 'var(--red)' },
          ].map((k, i) => (
            <div className="detail-kpi" key={i}>
              <div className="detail-kpi__value" style={{ color: k.color }}>{k.value}</div>
              <div className="detail-kpi__label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Score + Bars */}
        <div className="detail-grid-2 fade-in fade-in-2">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Overall Sentiment Score</h3></div>
            <div className="sentiment-gauge-wrap">
              <svg viewBox="0 0 220 130" width="220" height="130">
                <path d="M 25 110 A 85 85 0 0 1 195 110" fill="none" stroke="var(--border)" strokeWidth="18" strokeLinecap="round" />
                <path d="M 25 110 A 85 85 0 0 1 195 110" fill="none" stroke={scoreColor} strokeWidth="18" strokeLinecap="round"
                  strokeDasharray={`${scoreArc} 267`} style={{ transition: 'stroke-dasharray 1.2s ease' }} />
                <text x="110" y="95" textAnchor="middle" fill={scoreColor} fontSize="40" fontWeight="800" fontFamily="Syne, sans-serif">{score.toFixed(0)}</text>
                <text x="110" y="115" textAnchor="middle" fill="var(--text-secondary)" fontSize="13">{scoreLabel}</text>
              </svg>
              <p className="sentiment-score-label">out of 100 · based on all customer feedback</p>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Sentiment Distribution</h3></div>
            <div className="sentiment-bars">
              {sentBars.map((s, i) => (
                <div key={i} className="sent-bar-row">
                  <span className="sent-bar-name" style={{ color: s.color }}>{s.name}</span>
                  <div className="sent-bar-track">
                    <div className="sent-bar-fill" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                  <span className="sent-bar-pct" style={{ color: s.color }}>{s.value}%</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={140} style={{ marginTop: 20 }}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" paddingAngle={3}>
                  {pieData.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-strong)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Summary AI Report */}
        <div className="card fade-in fade-in-3">
          <div className="card-header">
            <h3 className="card-title">AI Voice of Customer Report</h3>
            <span className="badge badge-green">AI Generated</span>
          </div>
          <div className="insight-body">
            {data.feedbackSummary.split('\n').filter(l => l.trim()).map((line, i) => {
              const isHeading = /^\*\*/.test(line) || /^#{1,3}\s/.test(line);
              const clean = line.replace(/\*\*/g, '').replace(/^#{1,3}\s/, '').trim();
              return isHeading
                ? <h4 key={i} className="insight-heading">{clean}</h4>
                : <p key={i} className="insight-para">{clean}</p>;
            })}
          </div>
        </div>

        {/* What customers say */}
        <div className="detail-grid-2 fade-in fade-in-3">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Positive Signals</h3>
              <span className="badge badge-green">Strengths</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Product quality consistently praised', 'Fast delivery highlighted frequently', 'Customer service responsiveness noted', 'Value for money perception strong', 'Easy-to-use products mentioned'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Improvement Areas</h3>
              <span className="badge badge-red">Risks</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Delivery time inconsistency reported', 'Product descriptions accuracy gaps', 'Packaging quality complaints logged', 'Setup instructions need clarification', 'Support response time improvement needed'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--red)', fontWeight: 700, flexShrink: 0 }}>✗</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

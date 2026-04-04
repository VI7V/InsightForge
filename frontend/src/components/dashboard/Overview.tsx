import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DashboardData, AppView } from '../../types';
import './Overview.css';

interface OverviewProps {
  data: DashboardData;
  onNavigate: (v: AppView) => void;
  onUploadNew: () => void;
}

const Tooltip_ = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      {payload.map((p: any, i: number) => <div key={i} style={{ color: p.color }} className="chart-tooltip__item">{p.name}: ${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>)}
    </div>
  ) : null;

export const Overview: React.FC<OverviewProps> = ({ data, onNavigate, onUploadNew }) => {
  const kpis = [
    { label: 'Total Revenue', value: `$${(data.totalRevenue / 1000).toFixed(1)}K`, sub: `${data.totalOrders.toLocaleString()} orders`, trend: null, icon: '💰', color: 'var(--accent)' },
    { label: 'Growth Rate', value: `${data.growthRate > 0 ? '+' : ''}${data.growthRate}%`, sub: 'Period over period', trend: data.growthRate >= 0 ? 'up' : 'down', icon: '📈', color: data.growthRate >= 0 ? 'var(--green)' : 'var(--red)' },
    { label: 'Total Customers', value: data.totalCustomers.toLocaleString(), sub: `$${data.revenuePerCustomer.toFixed(0)} avg/customer`, trend: null, icon: '👥', color: 'var(--purple)' },
    { label: 'Avg Order Value', value: `$${data.avgOrderValue.toFixed(0)}`, sub: `Peak: ${data.peakMonth}`, trend: null, icon: '🧾', color: 'var(--amber)' },
    { label: 'Top Category', value: data.topCategory, sub: `Best region: ${data.topRegion}`, trend: null, icon: '🏆', color: 'var(--green)' },
    { label: 'Anomalies', value: String(data.anomalies.length), sub: `${data.anomalies.filter(a => a.type === 'spike').length} spikes · ${data.anomalies.filter(a => a.type === 'drop').length} drops`, trend: null, icon: '⚡', color: 'var(--red)' },
  ];

  // Weekly aggregated trend
  const weeklyMap = new Map<string, number>();
  data.salesTrend.forEach(d => {
    const dt = new Date(d.date);
    dt.setDate(dt.getDate() - dt.getDay());
    const key = dt.toISOString().slice(0, 10);
    weeklyMap.set(key, (weeklyMap.get(key) || 0) + d.amount);
  });
  const weeklyData = Array.from(weeklyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amount]) => ({ date: date.slice(5), amount: Math.round(amount) }));

  const topCategories = data.categoryBreakdown.slice(0, 5);
  const catColors = ['var(--accent)', 'var(--purple)', 'var(--green)', 'var(--amber)', 'var(--red)'];

  const detailCards = [
    { view: 'sales' as AppView, title: 'Sales Analysis', desc: 'Forecast, trend decomposition, anomaly investigation, regional breakdown', icon: '📊', color: '#3b82f6' },
    { view: 'segmentation' as AppView, title: 'Customer Segmentation', desc: 'RFM clustering, lifetime value analysis, segment-level strategies', icon: '👥', color: '#8b5cf6' },
    { view: 'sentiment' as AppView, title: 'Sentiment Analysis', desc: 'Customer feedback scoring, theme extraction, satisfaction drivers', icon: '💬', color: '#10b981' },
    { view: 'insights' as AppView, title: 'AI Insights', desc: 'Executive-grade reports, strategic recommendations, action plans', icon: '🤖', color: '#f59e0b' },
  ];

  return (
    <div className="overview">
      {/* Header */}
      <div className="overview__header fade-in">
        <div>
          <div className="badge badge-green" style={{ marginBottom: 8 }}>
            <span className="live-dot" /> Analysis Ready
          </div>
          <h1 className="overview__title">{data.fileName}</h1>
          <p className="overview__sub">Processed {new Date(data.processedAt).toLocaleString()} · {data.totalOrders.toLocaleString()} records analyzed</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onUploadNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          New Dataset
        </button>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid fade-in fade-in-1">
        {kpis.map((k, i) => (
          <div className="kpi-card" key={i} style={{ '--kpi-color': k.color } as React.CSSProperties}>
            <div className="kpi-card__header">
              <span className="kpi-card__icon">{k.icon}</span>
              {k.trend && <span className={`kpi-trend kpi-trend--${k.trend}`}>{k.trend === 'up' ? '↑' : '↓'}</span>}
            </div>
            <div className="kpi-card__value" style={{ color: k.color }}>{k.value}</div>
            <div className="kpi-card__label">{k.label}</div>
            <div className="kpi-card__sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="overview__charts fade-in fade-in-2">
        <div className="card overview__chart-main">
          <div className="card-header">
            <h3 className="card-title">Revenue Trend</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('sales')}>Full Analysis →</button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} interval={Math.floor(weeklyData.length / 6)} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<Tooltip_ />} />
              <Area type="monotone" dataKey="amount" name="Revenue" stroke="var(--accent)" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card overview__chart-side">
          <div className="card-header">
            <h3 className="card-title">Top Categories</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCategories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-strong)', borderRadius: 8 }} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {topCategories.map((_, i) => <Cell key={i} fill={catColors[i % catColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail page navigation */}
      <div className="overview__detail-nav fade-in fade-in-3">
        <h2 className="overview__section-title">Detailed Analysis</h2>
        <p className="overview__section-sub">Click any module for a comprehensive, executive-grade report</p>
        <div className="detail-cards">
          {detailCards.map(({ view, title, desc, icon, color }) => (
            <button key={view} className="detail-card" onClick={() => onNavigate(view)}>
              <div className="detail-card__icon" style={{ background: `${color}18`, color }}>{icon}</div>
              <div className="detail-card__content">
                <h3 className="detail-card__title">{title}</h3>
                <p className="detail-card__desc">{desc}</p>
              </div>
              <div className="detail-card__arrow" style={{ color }}>→</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

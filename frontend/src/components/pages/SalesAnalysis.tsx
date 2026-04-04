import React, { useState } from 'react';
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell, BarChart
} from 'recharts';
import { DashboardData } from '../../types';
import './DetailPage.css';

interface SalesAnalysisProps { data: DashboardData; onBack: () => void; }

const ChartTooltip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }} className="chart-tooltip__item">
          {p.name}: ${Number(p.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </div>
      ))}
    </div>
  ) : null;

type Tab = 'trend' | 'forecast' | 'anomalies' | 'breakdown';

export const SalesAnalysis: React.FC<SalesAnalysisProps> = ({ data, onBack }) => {
  const [tab, setTab] = useState<Tab>('trend');

  const weeklyData = (() => {
    const m = new Map<string, number>();
    data.salesTrend.forEach(d => {
      const dt = new Date(d.date); dt.setDate(dt.getDate() - dt.getDay());
      const k = dt.toISOString().slice(0, 10);
      m.set(k, (m.get(k) || 0) + d.amount);
    });
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date: date.slice(5), amount: Math.round(amount) }));
  })();

  const forecastData = data.forecast.map(f => ({
    month: f.month, actual: f.actual ? Math.round(f.actual) : undefined,
    predicted: Math.round(f.predicted), isForecasted: f.isForecasted,
  }));

  const anomalySet = new Set(data.anomalies.map(a => a.date));
  const anomalyData = data.salesTrend.filter((_, i) => i % 3 === 0).map(d => ({
    date: d.date.slice(5), amount: Math.round(d.amount),
    spike: anomalySet.has(d.date) && data.anomalies.find(a => a.date === d.date)?.type === 'spike' ? Math.round(d.amount) : undefined,
    drop: anomalySet.has(d.date) && data.anomalies.find(a => a.date === d.date)?.type === 'drop' ? Math.round(d.amount) : undefined,
  }));

  const regionColors = ['var(--accent)', 'var(--purple)', 'var(--green)', 'var(--amber)', 'var(--red)'];

  return (
    <div className="detail-page">
      <div className="detail-page__inner">
        {/* Header */}
        <div className="detail-header fade-in">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Overview</button>
          <div className="detail-header__title-group">
            <div className="detail-header__icon" style={{ background: '#3b82f618', color: '#3b82f6' }}>📊</div>
            <div>
              <h1 className="detail-header__title">Sales Analysis</h1>
              <p className="detail-header__sub">Revenue trends, forecasting models, and anomaly detection</p>
            </div>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="detail-kpis fade-in fade-in-1">
          {[
            { label: 'Total Revenue', value: `$${(data.totalRevenue / 1000).toFixed(1)}K`, color: 'var(--accent)' },
            { label: 'Growth Rate', value: `${data.growthRate > 0 ? '+' : ''}${data.growthRate}%`, color: data.growthRate >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'Peak Month', value: data.peakMonth, color: 'var(--purple)' },
            { label: 'Total Orders', value: data.totalOrders.toLocaleString(), color: 'var(--amber)' },
            { label: 'Avg Order Value', value: `$${data.avgOrderValue.toFixed(0)}`, color: 'var(--green)' },
            { label: 'Anomalies', value: String(data.anomalies.length), color: 'var(--red)' },
          ].map((k, i) => (
            <div className="detail-kpi" key={i}>
              <div className="detail-kpi__value" style={{ color: k.color }}>{k.value}</div>
              <div className="detail-kpi__label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Chart Tabs */}
        <div className="card fade-in fade-in-2">
          <div className="card-header">
            <h3 className="card-title">Revenue Charts</h3>
            <div className="tab-group">
              {(['trend', 'forecast', 'anomalies', 'breakdown'] as Tab[]).map(t => (
                <button key={t} className={`tab-btn ${tab === t ? 'tab-btn--active' : ''}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            {tab === 'trend' ? (
              <ComposedChart data={weeklyData}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} interval={Math.floor(weeklyData.length / 7)} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="amount" name="Weekly Revenue" stroke="var(--accent)" strokeWidth={2.5} fill="url(#trendGrad)" dot={false} />
              </ComposedChart>
            ) : tab === 'forecast' ? (
              <ComposedChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
                <Bar dataKey="actual" name="Actual" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Line type="monotone" dataKey="predicted" name="Forecast" stroke="var(--amber)" strokeWidth={2.5} strokeDasharray="6 3" dot={{ fill: 'var(--amber)', r: 4 }} />
              </ComposedChart>
            ) : tab === 'anomalies' ? (
              <ComposedChart data={anomalyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} interval={Math.floor(anomalyData.length / 7)} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={Math.round(data.totalRevenue / data.salesTrend.length)} stroke="var(--text-muted)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="amount" name="Daily Revenue" stroke="var(--accent)" strokeWidth={1.5} fill="var(--accent-glow)" dot={false} />
                <Bar dataKey="spike" name="Spike" fill="var(--amber)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="drop" name="Drop" fill="var(--red)" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            ) : (
              <BarChart data={data.regionBreakdown.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="region" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                  {data.regionBreakdown.slice(0, 6).map((_, i) => <Cell key={i} fill={regionColors[i % regionColors.length]} />)}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Anomaly Table */}
        {data.anomalies.length > 0 && (
          <div className="card fade-in fade-in-3">
            <div className="card-header"><h3 className="card-title">Detected Anomalies</h3><span className="badge badge-red">{data.anomalies.length} events</span></div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Revenue</th><th>Type</th><th>Deviation</th><th>Z-Score</th></tr></thead>
                <tbody>
                  {data.anomalies.slice(0, 10).map((a, i) => (
                    <tr key={i}>
                      <td className="mono">{a.date}</td>
                      <td className="bold">${a.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td><span className={`badge ${a.type === 'spike' ? 'badge-amber' : 'badge-red'}`}>{a.type === 'spike' ? '↑ Spike' : '↓ Drop'}</span></td>
                      <td className={a.deviation > 0 ? 'text-green' : 'text-red'}>{a.deviation > 0 ? '+' : ''}${Math.abs(a.deviation).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="mono">{a.zScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Insights */}
        <div className="card fade-in fade-in-4">
          <div className="card-header">
            <h3 className="card-title">AI Sales Intelligence Report</h3>
            <span className="badge badge-blue">AI Generated</span>
          </div>
          <div className="insight-body">
            {data.salesInsights.split('\n').filter(l => l.trim()).map((line, i) => {
              const isHeading = /^\*\*/.test(line) || /^#{1,3}\s/.test(line) || /^\d+\)/.test(line);
              const clean = line.replace(/\*\*/g, '').replace(/^#{1,3}\s/, '').replace(/^[\d]+\)\s*/, '').trim();
              return isHeading
                ? <h4 key={i} className="insight-heading">{clean}</h4>
                : <p key={i} className="insight-para">{clean}</p>;
            })}
          </div>
        </div>

        {/* Anomaly Explanation */}
        <div className="card fade-in fade-in-4">
          <div className="card-header">
            <h3 className="card-title">Anomaly Intelligence Report</h3>
            <span className="badge badge-amber">Statistical Analysis</span>
          </div>
          <div className="insight-body">
            {data.anomalyExplanation.split('\n').filter(l => l.trim()).map((line, i) => {
              const isHeading = /^\*\*/.test(line) || /^#{1,3}\s/.test(line);
              const clean = line.replace(/\*\*/g, '').replace(/^#{1,3}\s/, '').trim();
              return isHeading
                ? <h4 key={i} className="insight-heading">{clean}</h4>
                : <p key={i} className="insight-para">{clean}</p>;
            })}
          </div>
        </div>

        {/* Channel & Category Breakdown */}
        <div className="detail-grid-2 fade-in fade-in-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Sales by Channel</h3></div>
            <div className="breakdown-list">
              {data.channelBreakdown.map((c, i) => (
                <div key={i} className="breakdown-row">
                  <span className="breakdown-label">{c.channel}</span>
                  <div className="breakdown-bar-track">
                    <div className="breakdown-bar-fill" style={{ width: `${c.percentage}%`, background: regionColors[i % regionColors.length] }} />
                  </div>
                  <span className="breakdown-pct">{c.percentage}%</span>
                  <span className="breakdown-val">${(c.revenue / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Category Revenue</h3></div>
            <div className="breakdown-list">
              {data.categoryBreakdown.slice(0, 7).map((c, i) => {
                const pct = Math.round((c.revenue / data.totalRevenue) * 100);
                return (
                  <div key={i} className="breakdown-row">
                    <span className="breakdown-label">{c.category}</span>
                    <div className="breakdown-bar-track">
                      <div className="breakdown-bar-fill" style={{ width: `${pct}%`, background: regionColors[i % regionColors.length] }} />
                    </div>
                    <span className="breakdown-pct">{pct}%</span>
                    <span className="breakdown-val">${(c.revenue / 1000).toFixed(1)}K</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { DashboardData } from '../../types';
import './DetailPage.css';

interface SegmentationProps { data: DashboardData; onBack: () => void; }

const PIE_LABEL = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.07) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  return <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
};

export const Segmentation: React.FC<SegmentationProps> = ({ data, onBack }) => {
  const segments = data.customerSegments;
  const totalCustomers = segments.reduce((s, c) => s + c.count, 0);

  const radarData = segments.map(s => ({
    segment: s.name.split(' ')[0],
    customers: s.percentage,
    value: Math.min(100, (s.avgValue / Math.max(...segments.map(x => x.avgValue))) * 100),
  }));

  return (
    <div className="detail-page">
      <div className="detail-page__inner">
        <div className="detail-header fade-in">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Overview</button>
          <div className="detail-header__title-group">
            <div className="detail-header__icon" style={{ background: '#8b5cf618', color: '#8b5cf6' }}>👥</div>
            <div>
              <h1 className="detail-header__title">Customer Segmentation</h1>
              <p className="detail-header__sub">RFM-based clustering — Recency, Frequency, Monetary analysis</p>
            </div>
          </div>
        </div>

        <div className="detail-kpis fade-in fade-in-1">
          {[
            { label: 'Total Customers', value: data.totalCustomers.toLocaleString(), color: 'var(--accent)' },
            { label: 'Revenue/Customer', value: `$${data.revenuePerCustomer.toFixed(0)}`, color: 'var(--purple)' },
            { label: 'High Value', value: `${segments.find(s => s.name === 'High Value')?.count || 0}`, color: 'var(--green)' },
            { label: 'Churn Risk', value: `${segments.find(s => s.name === 'Churn Risk')?.count || 0}`, color: 'var(--red)' },
            { label: 'Top Region', value: data.topRegion, color: 'var(--amber)' },
            { label: 'Top Category', value: data.topCategory, color: 'var(--accent)' },
          ].map((k, i) => (
            <div className="detail-kpi" key={i}>
              <div className="detail-kpi__value" style={{ color: k.color }}>{k.value}</div>
              <div className="detail-kpi__label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Segment Cards */}
        <div className="segment-cards fade-in fade-in-2">
          {segments.map((seg, i) => (
            <div key={i} className="segment-card card" style={{ borderColor: `${seg.color}30`, background: `${seg.color}06` }}>
              <div className="segment-card__top">
                <div className="segment-card__name" style={{ color: seg.color }}>{seg.name}</div>
                <span className="badge" style={{ background: `${seg.color}18`, color: seg.color, border: `1px solid ${seg.color}30` }}>
                  {seg.percentage}%
                </span>
              </div>
              <div className="segment-card__count" style={{ color: seg.color }}>{seg.count}</div>
              <div className="segment-card__pct">customers of {totalCustomers.toLocaleString()} total</div>
              <div className="segment-card__bar" style={{ width: `${seg.percentage}%`, background: seg.color }} />
              <div className="segment-card__avg">Avg Lifetime Value: <strong>${seg.avgValue.toLocaleString()}</strong></div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="detail-grid-2 fade-in fade-in-2">
          <div className="card">
            <div className="card-header"><h3 className="card-title">Segment Distribution</h3></div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={segments} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count" labelLine={false} label={PIE_LABEL}>
                  {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-strong)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {segments.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{s.name}</span>
                  <span style={{ fontWeight: 600 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Average Value by Segment</h3></div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={segments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickLine={false} axisLine={false} width={95} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Avg Value']} contentStyle={{ background: 'var(--bg-card-2)', border: '1px solid var(--border-strong)', borderRadius: 8 }} />
                <Bar dataKey="avgValue" radius={[0, 6, 6, 0]}>
                  {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Marketing Strategy */}
        <div className="card fade-in fade-in-3">
          <div className="card-header">
            <h3 className="card-title">AI Marketing Strategy Report</h3>
            <span className="badge badge-blue">AI Generated</span>
          </div>
          <div className="insight-body">
            {data.marketingStrategies.split('\n').filter(l => l.trim()).map((line, i) => {
              const isHeading = /^\*\*/.test(line) || /^#{1,3}\s/.test(line);
              const clean = line.replace(/\*\*/g, '').replace(/^#{1,3}\s/, '').trim();
              return isHeading
                ? <h4 key={i} className="insight-heading">{clean}</h4>
                : <p key={i} className="insight-para">{clean}</p>;
            })}
          </div>
        </div>

        {/* Region Breakdown */}
        <div className="card fade-in fade-in-3">
          <div className="card-header"><h3 className="card-title">Revenue by Region</h3></div>
          <div className="breakdown-list">
            {data.regionBreakdown.map((r, i) => {
              const colors = ['var(--accent)', 'var(--purple)', 'var(--green)', 'var(--amber)', 'var(--red)'];
              const pct = Math.round((r.revenue / data.totalRevenue) * 100);
              return (
                <div key={i} className="breakdown-row">
                  <span className="breakdown-label">{r.region}</span>
                  <div className="breakdown-bar-track">
                    <div className="breakdown-bar-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                  </div>
                  <span className="breakdown-pct">{pct}%</span>
                  <span className="breakdown-val">${(r.revenue / 1000).toFixed(1)}K</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

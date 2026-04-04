import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER, LOGIN } from '../../utils/apollo';
import { User } from '../../types';
import './Auth.css';

interface AuthProps {
  onSuccess: (user: User, token: string) => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');

  const [register, { loading: regLoading }] = useMutation(REGISTER);
  const [login, { loading: logLoading }] = useMutation(LOGIN);
  const loading = regLoading || logLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const vars = mode === 'register'
        ? { email: form.email, password: form.password, name: form.name }
        : { email: form.email, password: form.password };
      const mutation = mode === 'register' ? register : login;
      const result = await mutation({ variables: vars });
      const data = result.data?.register || result.data?.login;
      if (data) {
        localStorage.setItem('insightforge_token', data.token);
        onSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-overlay">
      <div className="auth-panel fade-in">
        <button className="auth-back btn btn-ghost btn-sm" onClick={onBack}>
          ← Back
        </button>

        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--accent)" />
              <path d="M7 21V13M12 21V9M17 21V15M22 21V7" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="auth-brand-name">InsightForge</span>
        </div>

        <h2 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-sub">
          {mode === 'login' ? 'Sign in to access your dashboards' : 'Start analyzing your business data'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group fade-in">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Jane Smith" value={form.name} onChange={update('name')} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={update('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={update('password')} required minLength={6} />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" /> Processing...</> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <span>No account? <button className="auth-link" onClick={() => { setMode('register'); setError(''); }}>Sign up free</button></span>
          ) : (
            <span>Already have an account? <button className="auth-link" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></span>
          )}
        </div>
      </div>
    </div>
  );
};

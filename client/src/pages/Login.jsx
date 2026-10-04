import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { Notice } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../services/api.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await login(form); navigate('/dashboard'); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your ExcelFlow account.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Notice notice={{ type: 'error', text: error }} />}
        <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div><label className="label">Password</label><input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="text-center text-sm text-slate-500">New here? <Link className="font-medium text-brand-700" to="/register">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}

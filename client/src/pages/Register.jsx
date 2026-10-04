import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.jsx';
import { Notice } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../services/api.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setBusy(true); setError('');
    try { await register(form); navigate('/dashboard'); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Create your account" subtitle="Start automating your spreadsheets.">
      <form onSubmit={submit} className="space-y-4">
        {error && <Notice notice={{ type: 'error', text: error }} />}
        <div><label className="label">Name</label><input className="input" required value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={set('email')} /></div>
        <div><label className="label">Password</label><input className="input" type="password" minLength={8} required value={form.password} onChange={set('password')} /></div>
        <div><label className="label">Confirm password</label><input className="input" type="password" required value={form.confirmPassword} onChange={set('confirmPassword')} /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="text-center text-sm text-slate-500">Already registered? <Link className="font-medium text-brand-700" to="/login">Log in</Link></p>
      </form>
    </AuthShell>
  );
}

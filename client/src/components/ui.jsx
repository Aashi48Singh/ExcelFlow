import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export function Notice({ notice, onClose }) {
  if (!notice) return null;
  const styles = { error: 'border-red-200 bg-red-50 text-red-700', success: 'border-brand-200 bg-brand-50 text-brand-800', info: 'border-slate-200 bg-slate-50 text-slate-700' };
  const Icon = notice.type === 'error' ? AlertCircle : notice.type === 'success' ? CheckCircle2 : Info;
  const lines = Array.isArray(notice.text) ? notice.text : [notice.text];
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${styles[notice.type || 'info']}`} role="status">
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div className="flex-1 whitespace-pre-line">{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
      {onClose && <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100">✕</button>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = { Completed: 'bg-brand-100 text-brand-800', Uploaded: 'bg-sky-100 text-sky-700', Processing: 'bg-amber-100 text-amber-700', Failed: 'bg-red-100 text-red-700' };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Empty({ children }) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">{children}</div>;
}

export function FileSelect({ files, value, onChange, placeholder = 'Select a file…' }) {
  return (
    <select className="input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {files.map((f) => <option key={f._id} value={f._id}>{f.fileName} ({f.rowCount} rows)</option>)}
    </select>
  );
}

import { useMemo, useState } from 'react';
import ColumnChecklist from './ColumnChecklist.jsx';
import { isBlank } from '../utils/format.js';

export default function CleanPanel({ columns, data, busy, onApply }) {
  const [sel, setSel] = useState({ removeDuplicates: true, removeEmptyRows: true, removeEmptyColumns: false, trim: true, toNumber: false, normalizeDates: false });
  const [caseMode, setCaseMode] = useState('');
  const [targets, setTargets] = useState([]);
  const [order, setOrder] = useState('DMY');

  const detect = useMemo(() => {
    const emptyRows = data.filter((r) => columns.every((c) => isBlank(r[c]))).length;
    const emptyCols = columns.filter((c) => data.every((r) => isBlank(r[c])));
    const seen = new Set(); let dups = 0;
    data.forEach((r) => { const k = JSON.stringify(columns.map((c) => String(r[c] ?? '').trim().toLowerCase())); seen.has(k) ? dups++ : seen.add(k); });
    return { emptyRows, emptyCols, dups };
  }, [columns, data]);

  const apply = () => {
    const cols = targets;
    const ops = [];
    if (sel.removeEmptyRows) ops.push({ op: 'removeEmptyRows' });
    if (sel.removeEmptyColumns) ops.push({ op: 'removeEmptyColumns' });
    if (sel.trim) ops.push({ op: 'trim', columns: cols });
    if (caseMode) ops.push({ op: 'case', mode: caseMode, columns: cols });
    if (sel.toNumber) ops.push({ op: 'toNumber', columns: cols });
    if (sel.normalizeDates) ops.push({ op: 'normalizeDates', columns: cols, order });
    if (sel.removeDuplicates) ops.push({ op: 'removeDuplicates' });
    onApply(ops);
  };
  const Check = ({ k, label }) => (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-600" checked={sel[k]} onChange={(e) => setSel({ ...sel, [k]: e.target.checked })} /> {label}</label>
  );

  return (
    <div className="card space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[['Duplicate rows', detect.dups], ['Empty rows', detect.emptyRows], ['Empty columns', detect.emptyCols.length]].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-slate-50 p-3"><div className="text-xl font-semibold">{v}</div><div className="text-xs text-slate-500">{k} detected</div></div>
        ))}
      </div>
      {detect.emptyCols.length > 0 && <p className="text-xs text-slate-500">Empty columns: {detect.emptyCols.join(', ')}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <Check k="removeDuplicates" label="Remove duplicate rows" />
        <Check k="removeEmptyRows" label="Remove empty rows" />
        <Check k="removeEmptyColumns" label="Remove empty columns" />
        <Check k="trim" label="Trim extra spaces" />
        <Check k="toNumber" label="Convert text numbers to numbers" />
        <Check k="normalizeDates" label="Normalize dates to YYYY-MM-DD" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Text standardization</label>
          <select className="input" value={caseMode} onChange={(e) => setCaseMode(e.target.value)}>
            <option value="">No change</option><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="title">Title Case</option>
          </select></div>
        {sel.normalizeDates && <div><label className="label">Ambiguous dates like 01/10/2026 mean</label>
          <select className="input" value={order} onChange={(e) => setOrder(e.target.value)}><option value="DMY">Day first (1 Oct 2026)</option><option value="MDY">Month first (10 Jan 2026)</option></select></div>}
      </div>
      <ColumnChecklist columns={columns} value={targets} onChange={setTargets} label="Apply trim / case / number / date to (none selected = all columns)" />
      <button className="btn-primary" disabled={busy} onClick={apply}>{busy ? 'Cleaning…' : 'Run cleaning'}</button>
    </div>
  );
}

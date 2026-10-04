import { useState } from 'react';
import { ColumnSelect } from './ColumnChecklist.jsx';

const CHECKS = [['email', 'Valid email'], ['number', 'Valid number'], ['date', 'Valid date'], ['unique', 'Unique values (e.g. IDs)'], ['required', 'Required (not empty)']];

export default function ValidatePanel({ columns, busy, issues, onRun, onFix }) {
  const [checks, setChecks] = useState([]);
  const [check, setCheck] = useState('email');
  const [column, setColumn] = useState('');
  const [fixes, setFixes] = useState({});

  const suggest = () => {
    const s = [];
    columns.forEach((c) => {
      const n = c.toLowerCase();
      if (n.includes('email')) s.push({ check: 'email', column: c });
      if (/(^|\s|_)id$/.test(n)) s.push({ check: 'unique', column: c });
      if (/date|joined|dob/.test(n)) s.push({ check: 'date', column: c });
      if (/salary|bonus|price|amount|qty|quantity/.test(n)) s.push({ check: 'number', column: c });
    });
    setChecks(s);
  };
  const add = () => column && setChecks([...checks, { check, column }]);

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <p className="text-sm text-slate-500">Missing values are always checked. Add more checks below.</p>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <select className="input" value={check} onChange={(e) => setCheck(e.target.value)}>{CHECKS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <ColumnSelect columns={columns} value={column} onChange={setColumn} />
          <button className="btn-outline" onClick={add}>Add check</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {checks.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs">{c.check}: {c.column}
              <button onClick={() => setChecks(checks.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600">✕</button></span>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn-outline" onClick={suggest}>Auto-suggest checks</button>
          <button className="btn-primary" disabled={busy} onClick={() => onRun([{ check: 'missing' }, ...checks])}>{busy ? 'Validating…' : 'Run validation'}</button>
        </div>
      </div>

      {issues && (
        <div className="card p-0">
          <div className="border-b border-slate-200 p-4 font-semibold">{issues.length ? `${issues.length} issue(s) found${issues.length >= 1000 ? ' (showing first 1000)' : ''}` : 'No issues found 🎉'}</div>
          {issues.length > 0 && (
            <div className="max-h-96 overflow-auto">
              <table className="w-full">
                <thead><tr>{['Row', 'Column', 'Value', 'Problem', 'Fix'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
                <tbody>
                  {issues.map((it, idx) => {
                    const key = `${it.row}:${it.column}:${it.check}`;
                    return (
                      <tr key={idx}>
                        <td className="td">{it.row + 1}</td><td className="td">{it.column}</td>
                        <td className="td max-w-[160px] truncate">{String(it.value) || <em className="text-slate-400">empty</em>}</td>
                        <td className="td text-red-600">{it.message}</td>
                        <td className="td">
                          <div className="flex gap-1">
                            <input className="input w-36 py-1" placeholder="Corrected value" value={fixes[key] ?? ''} onChange={(e) => setFixes({ ...fixes, [key]: e.target.value })} />
                            <button className="btn-outline py-1" disabled={fixes[key] === undefined || fixes[key] === ''} onClick={() => { onFix(it.row, it.column, fixes[key]); setFixes({ ...fixes, [key]: undefined }); }}>Fix</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

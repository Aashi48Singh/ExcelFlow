import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { isBlank } from '../utils/format.js';

const PAGE_SIZE = 25;
const OPS = ['contains', '=', '!=', '>', '<', '>=', '<='];
const num = (v) => (typeof v === 'number' ? v : isBlank(v) || isNaN(Number(String(v).replace(/,/g, ''))) ? NaN : Number(String(v).replace(/,/g, '')));

function matches(cell, op, value) {
  const a = num(cell), b = num(value);
  const numeric = !isNaN(a) && !isNaN(b);
  const x = numeric ? a : String(cell ?? '').toLowerCase(), y = numeric ? b : String(value).toLowerCase();
  switch (op) {
    case 'contains': return String(cell ?? '').toLowerCase().includes(String(value).toLowerCase());
    case '=': return x === y; case '!=': return x !== y;
    case '>': return x > y; case '<': return x < y; case '>=': return x >= y; default: return x <= y;
  }
}

export default function DataGrid({ columns, data, highlights, onEditCell, onAddRow, onDeleteRow, onAddColumn, onDeleteColumn, onRenameColumn, onClear }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(null);
  const [filter, setFilter] = useState({ column: '', op: 'contains', value: '' });
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [newCol, setNewCol] = useState('');

  const view = useMemo(() => {
    let rows = data.map((row, i) => ({ row, i }));
    const q = search.trim().toLowerCase();
    if (q) rows = rows.filter(({ row }) => columns.some((c) => String(row[c] ?? '').toLowerCase().includes(q)));
    if (filter.column && filter.value !== '') rows = rows.filter(({ row }) => matches(row[filter.column], filter.op, filter.value));
    if (sort) {
      const dir = sort.dir === 'asc' ? 1 : -1;
      rows = [...rows].sort((p, q2) => {
        const a = p.row[sort.col], b = q2.row[sort.col];
        const na = num(a), nb = num(b);
        if (!isNaN(na) && !isNaN(nb)) return (na - nb) * dir;
        return String(a ?? '').localeCompare(String(b ?? '')) * dir;
      });
    }
    return rows;
  }, [data, columns, search, filter, sort]);

  const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const slice = view.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const startEdit = (i, c) => { setEditing({ i, c }); setDraft(data[i][c] ?? ''); };
  const commit = () => {
    if (!editing) return;
    const raw = String(draft);
    const value = /^-?\d+(\.\d+)?$/.test(raw.trim()) ? Number(raw) : raw;
    if (value !== data[editing.i][editing.c]) onEditCell(editing.i, editing.c, value);
    setEditing(null);
  };
  const toggleSort = (col) => setSort((s) => (s?.col !== col ? { col, dir: 'asc' } : s.dir === 'asc' ? { col, dir: 'desc' } : null));
  const rename = (c) => { const n = window.prompt('Rename column', c); if (n && n.trim() && n !== c) onRenameColumn(c, n.trim()); };

  return (
    <div className="card p-0">
      <div className="flex flex-wrap items-end gap-2 border-b border-slate-200 p-3">
        <div className="relative min-w-[160px] flex-1">
          <Search size={14} className="absolute left-2.5 top-3 text-slate-400" />
          <input className="input pl-8" placeholder="Search all cells…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <select className="input w-auto" value={filter.column} onChange={(e) => { setFilter({ ...filter, column: e.target.value }); setPage(0); }}>
          <option value="">Filter column…</option>{columns.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input w-auto" value={filter.op} onChange={(e) => setFilter({ ...filter, op: e.target.value })}>{OPS.map((o) => <option key={o}>{o}</option>)}</select>
        <input className="input w-32" placeholder="Value" value={filter.value} onChange={(e) => { setFilter({ ...filter, value: e.target.value }); setPage(0); }} />
        {(filter.value || search || sort) && <button className="btn-ghost" onClick={() => { setFilter({ column: '', op: 'contains', value: '' }); setSearch(''); setSort(null); }}><X size={14} /> Reset</button>}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
        <button className="btn-outline" onClick={onAddRow}><Plus size={14} /> Row</button>
        <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); if (newCol.trim()) { onAddColumn(newCol.trim()); setNewCol(''); } }}>
          <input className="input w-36" placeholder="New column name" value={newCol} onChange={(e) => setNewCol(e.target.value)} />
          <button className="btn-outline" type="submit"><Plus size={14} /> Column</button>
        </form>
        <button className="btn-danger ml-auto" onClick={() => window.confirm('Clear all rows? (You can undo this.)') && onClear()}><Trash2 size={14} /> Clear data</button>
      </div>

      <div className="max-h-[60vh] overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="th w-10 text-center">#</th>
              {columns.map((c) => (
                <th key={c} className="th">
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleSort(c)} className="flex items-center gap-1 hover:text-slate-900">
                      {c} {sort?.col === c && (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </button>
                    <button onClick={() => rename(c)} title="Rename column" className="text-slate-400 hover:text-slate-700"><Pencil size={11} /></button>
                    <button onClick={() => window.confirm(`Delete column "${c}"?`) && onDeleteColumn(c)} title="Delete column" className="text-slate-400 hover:text-red-600"><Trash2 size={11} /></button>
                  </div>
                </th>
              ))}
              <th className="th w-10" />
            </tr>
          </thead>
          <tbody>
            {slice.map(({ row, i }) => (
              <tr key={i} className="hover:bg-brand-50/40">
                <td className="td bg-slate-50 text-center text-xs text-slate-400">{i + 1}</td>
                {columns.map((c) => {
                  const bad = highlights?.has(`${i}:${c}`);
                  const isEditing = editing?.i === i && editing?.c === c;
                  return (
                    <td key={c} className={`td cursor-cell ${bad ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200' : ''}`} onDoubleClick={() => startEdit(i, c)}>
                      {isEditing ? (
                        <input autoFocus className="w-full min-w-[80px] rounded border border-brand-500 px-1 py-0.5 text-sm outline-none" value={draft}
                          onChange={(e) => setDraft(e.target.value)} onBlur={commit}
                          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(null); }} />
                      ) : String(row[c] ?? '')}
                    </td>
                  );
                })}
                <td className="td"><button onClick={() => onDeleteRow(i)} title="Delete row" className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {!slice.length && <tr><td className="td py-10 text-center text-slate-500" colSpan={columns.length + 2}>No rows to show.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 p-3 text-sm text-slate-500">
        <span>{view.length} of {data.length} rows · {columns.length} columns · double-click a cell to edit</span>
        <div className="flex items-center gap-2">
          <button className="btn-outline px-2" disabled={current === 0} onClick={() => setPage(current - 1)}><ChevronLeft size={14} /></button>
          <span>Page {current + 1} / {pages}</span>
          <button className="btn-outline px-2" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

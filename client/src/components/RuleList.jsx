import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Play, Save, Trash2 } from 'lucide-react';
import { describeRule } from '../utils/describeRule.js';
import { templateApi } from '../services/api.js';

export default function RuleList({ rules, setRules, busy, onRun, onSave }) {
  const [templates, setTemplates] = useState([]);
  useEffect(() => { templateApi.list().then(setTemplates).catch(() => {}); }, []);
  const move = (i, d) => { const r = [...rules]; const j = i + d; if (j < 0 || j >= r.length) return; [r[i], r[j]] = [r[j], r[i]]; setRules(r); };

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Automation steps <span className="text-sm font-normal text-slate-500">(run in this order)</span></h3>
        <select className="input w-auto" value="" onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) setRules([...rules, ...t.rules]); }}>
          <option value="">Load template steps…</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      {!rules.length && <p className="text-sm text-slate-500">No steps yet. Use “Add to steps” in the builder, or load a template.</p>}
      <ol className="space-y-1.5">
        {rules.map((r, i) => (
          <li key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs text-white">{i + 1}</span>
            <span className="min-w-0 flex-1 break-words">{describeRule(r)}</span>
            <button onClick={() => move(i, -1)} className="text-slate-400 hover:text-slate-700"><ArrowUp size={14} /></button>
            <button onClick={() => move(i, 1)} className="text-slate-400 hover:text-slate-700"><ArrowDown size={14} /></button>
            <button onClick={() => setRules(rules.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
          </li>
        ))}
      </ol>
      {rules.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" disabled={busy} onClick={onRun}><Play size={14} /> Run all steps</button>
          <button className="btn-outline" onClick={onSave}><Save size={14} /> Save as automation</button>
          <button className="btn-ghost" onClick={() => setRules([])}>Clear steps</button>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const EXAMPLES = ['Calculate total salary using salary and bonus', 'Find average salary', 'Remove duplicate employee IDs', 'Find employees with salary greater than 50000', 'Create annual salary from total salary'];

export default function CommandBox({ busy, onRun }) {
  const [text, setText] = useState('');
  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2 font-semibold"><Sparkles size={16} className="text-brand-600" /> Command box</div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); text.trim() && onRun(text); }}>
        <input className="input" placeholder="Type an instruction, e.g. “Find average salary”" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-primary" disabled={busy}>Run</button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex) => <button key={ex} onClick={() => setText(ex)} className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50">{ex}</button>)}
      </div>
      <p className="text-xs text-slate-500">Commands are matched to a fixed set of safe operations — nothing you type is executed as code.</p>
    </div>
  );
}

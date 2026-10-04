export default function ColumnChecklist({ columns, value, onChange, label = 'Columns' }) {
  const toggle = (c) => onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]);
  return (
    <div>
      <div className="label">{label}</div>
      <div className="flex max-h-28 flex-wrap gap-1.5 overflow-auto">
        {columns.map((c) => (
          <button type="button" key={c} onClick={() => toggle(c)}
            className={`rounded-full border px-2.5 py-1 text-xs ${value.includes(c) ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>{c}</button>
        ))}
      </div>
    </div>
  );
}

export function ColumnSelect({ columns, value, onChange, placeholder = 'Select column…', extra = [] }) {
  return (
    <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {extra.map((x) => <option key={x}>{x}</option>)}
      {columns.map((c) => <option key={c}>{c}</option>)}
    </select>
  );
}

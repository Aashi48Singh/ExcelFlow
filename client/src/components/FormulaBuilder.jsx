import { useState } from 'react';
import ColumnChecklist, { ColumnSelect } from './ColumnChecklist.jsx';

const KINDS = [
  ['arithmetic', 'Arithmetic (+ − × ÷ %)'], ['stat', 'Statistics (SUM, AVERAGE…)'], ['text', 'Text (CONCAT, UPPER…)'],
  ['if', 'IF / ELSE'], ['date', 'Date'], ['round', 'Rounding'], ['dedupe', 'Remove duplicates'], ['filter', 'Filter rows'], ['validate', 'Validate'],
];
const OPS = [['+', '+  Add'], ['-', '−  Subtract'], ['*', '×  Multiply'], ['/', '÷  Divide'], ['%', '%  Percentage of']];
const COMPARE = ['=', '!=', '>', '<', '>=', '<=', 'contains'];

export default function FormulaBuilder({ columns, onApply, onAdd, busy }) {
  const [kind, setKind] = useState('arithmetic');
  const [f, setF] = useState({ op: '+', rightMode: 'column', fn: '', operator: '=', digits: 0, separator: ' ', order: 'DMY', check: 'email', columns: [] });
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v && v.target ? v.target.value : v }));
  const input = (k, props = {}) => <input className="input" value={f[k] ?? ''} onChange={(e) => set(k)(e.target.value)} {...props} />;
  const Field = ({ label, children }) => <div><label className="label">{label}</label>{children}</div>;

  const build = () => {
    const need = (...keys) => keys.every((k) => f[k] !== undefined && f[k] !== '' && !(Array.isArray(f[k]) && !f[k].length));
    const bad = (msg) => ({ error: msg || 'Unable to calculate this rule. Please check the selected columns.' });
    switch (kind) {
      case 'arithmetic':
        if (!need('left', 'output') || (f.rightMode === 'column' ? !need('right') : !need('rightValue'))) return bad();
        return { rule: { type: 'arithmetic', left: f.left, op: f.op, ...(f.rightMode === 'column' ? { right: f.right } : { rightValue: Number(f.rightValue) }), output: f.output } };
      case 'stat': { const fn = f.fn || 'SUM'; return need('column') ? { rule: { type: 'stat', fn, column: f.column, output: f.output || '' } } : bad(); }
      case 'text': {
        const fn = f.fn || 'CONCAT';
        if (fn === 'CONCAT') return need('columns', 'output') ? { rule: { type: 'text', fn, columns: f.columns, separator: f.separator, output: f.output } } : bad();
        return need('column') ? { rule: { type: 'text', fn, column: f.column, output: f.output || '' } } : bad();
      }
      case 'if': return need('column', 'value', 'output') ? { rule: { type: 'if', column: f.column, operator: f.operator, value: f.value, thenValue: f.thenValue ?? '', elseValue: f.elseValue ?? '', output: f.output } } : bad();
      case 'date': {
        const fn = f.fn || 'YEAR';
        if (!need('column') || (fn !== 'DIFF' && !need('output')) || (fn === 'DIFF' && !need('output'))) return bad();
        return { rule: { type: 'date', fn, column: f.column, column2: fn === 'DIFF' ? f.column2 || 'TODAY' : undefined, days: fn === 'ADD_DAYS' ? Number(f.days) : undefined, order: f.order, output: f.output } };
      }
      case 'round': return need('column') ? { rule: { type: 'round', fn: f.fn || 'ROUND', column: f.column, digits: Number(f.digits) || 0, output: f.output || '' } } : bad();
      case 'dedupe': return { rule: { type: 'dedupe', columns: f.columns } };
      case 'filter': return need('column', 'value') ? { rule: { type: 'filter', column: f.column, operator: f.operator, value: f.value } } : bad();
      case 'validate': return { rule: { type: 'validate', check: f.check, column: f.column || undefined } };
      default: return bad();
    }
  };
  const submit = (cb) => { const r = build(); r.error ? cb(null, r.error) : cb(r.rule); };
  const fnSelect = (opts, def) => <select className="input" value={f.fn || def} onChange={set('fn')}>{opts.map((o) => <option key={o}>{o}</option>)}</select>;

  return (
    <div className="card space-y-4">
      <Field label="What do you want to do?">
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </Field>

      {kind === 'arithmetic' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Column"><ColumnSelect columns={columns} value={f.left || ''} onChange={set('left')} /></Field>
          <Field label="Operation"><select className="input" value={f.op} onChange={set('op')}>{OPS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label={<>With <button type="button" className="ml-1 normal-case text-brand-700 underline" onClick={() => set('rightMode')(f.rightMode === 'column' ? 'value' : 'column')}>use {f.rightMode === 'column' ? 'a number' : 'a column'}</button></>}>
            {f.rightMode === 'column' ? <ColumnSelect columns={columns} value={f.right || ''} onChange={set('right')} /> : input('rightValue', { type: 'number', placeholder: 'e.g. 12' })}
          </Field>
          <Field label="Output column">{input('output', { placeholder: 'e.g. Total Salary' })}</Field>
        </div>
      )}
      {kind === 'stat' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Function">{fnSelect(['SUM', 'AVERAGE', 'COUNT', 'MIN', 'MAX'], 'SUM')}</Field>
          <Field label="Column"><ColumnSelect columns={columns} value={f.column || ''} onChange={set('column')} /></Field>
          <Field label="Output column (blank = just show result)">{input('output')}</Field>
        </div>
      )}
      {kind === 'text' && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Function">{fnSelect(['CONCAT', 'TRIM', 'UPPER', 'LOWER', 'PROPER'], 'CONCAT')}</Field>
            {(f.fn || 'CONCAT') === 'CONCAT' ? <Field label="Separator">{input('separator')}</Field> : <Field label="Column"><ColumnSelect columns={columns} value={f.column || ''} onChange={set('column')} /></Field>}
            <Field label={(f.fn || 'CONCAT') === 'CONCAT' ? 'Output column' : 'Output column (blank = overwrite)'}>{input('output')}</Field>
          </div>
          {(f.fn || 'CONCAT') === 'CONCAT' && <ColumnChecklist columns={columns} value={f.columns} onChange={set('columns')} label="Columns to join (in click order)" />}
        </div>
      )}
      {kind === 'if' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="If column"><ColumnSelect columns={columns} value={f.column || ''} onChange={set('column')} /></Field>
          <Field label="Is"><select className="input" value={f.operator} onChange={set('operator')}>{COMPARE.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Value">{input('value')}</Field>
          <Field label="Then">{input('thenValue')}</Field>
          <Field label="Else">{input('elseValue')}</Field>
          <Field label="Output column">{input('output')}</Field>
        </div>
      )}
      {kind === 'date' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Function"><select className="input" value={f.fn || 'YEAR'} onChange={set('fn')}>
            <option value="YEAR">Extract year</option><option value="MONTH">Extract month</option><option value="DAY">Extract day</option><option value="ADD_DAYS">Add days</option><option value="DIFF">Date difference (days)</option></select></Field>
          <Field label={f.fn === 'DIFF' ? 'Start date column' : 'Date column'}><ColumnSelect columns={columns} value={f.column || ''} onChange={set('column')} /></Field>
          {f.fn === 'DIFF' && <Field label="End date column"><ColumnSelect columns={columns} extra={['TODAY']} value={f.column2 || 'TODAY'} onChange={set('column2')} /></Field>}
          {f.fn === 'ADD_DAYS' && <Field label="Days to add">{input('days', { type: 'number' })}</Field>}
          <Field label="Ambiguous dates"><select className="input" value={f.order} onChange={set('order')}><option value="DMY">Day first</option><option value="MDY">Month first</option></select></Field>
          <Field label="Output column">{input('output')}</Field>
        </div>
      )}
      {kind === 'round' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Function">{fnSelect(['ROUND', 'ROUNDUP', 'ROUNDDOWN'], 'ROUND')}</Field>
          <Field label="Column"><ColumnSelect columns={columns} value={f.column || ''} onChange={set('column')} /></Field>
          <Field label="Decimal places">{input('digits', { type: 'number' })}</Field>
          <Field label="Output (blank = overwrite)">{input('output')}</Field>
        </div>
      )}
      {kind === 'dedupe' && <ColumnChecklist columns={columns} value={f.columns} onChange={set('columns')} label="Duplicate if these columns match (none = whole row)" />}
      {kind === 'filter' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Keep rows where"><ColumnSelect columns={columns} value={f.column || ''} onChange={set('column')} /></Field>
          <Field label="Is"><select className="input" value={f.operator} onChange={set('operator')}>{COMPARE.map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Value">{input('value')}</Field>
        </div>
      )}
      {kind === 'validate' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Check"><select className="input" value={f.check} onChange={set('check')}>{['email', 'number', 'date', 'unique', 'required', 'missing'].map((o) => <option key={o}>{o}</option>)}</select></Field>
          <Field label="Column"><ColumnSelect columns={columns} value={f.column || ''} onChange={set('column')} placeholder="All columns" /></Field>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" disabled={busy} onClick={() => submit((r, e) => onApply(r, e))}>{busy ? 'Applying…' : 'Apply Automation'}</button>
        <button className="btn-outline" onClick={() => submit((r, e) => onAdd(r, e))}>Add to steps</button>
      </div>
    </div>
  );
}

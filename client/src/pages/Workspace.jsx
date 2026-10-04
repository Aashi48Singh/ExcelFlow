import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BarChart3, Download, FileSpreadsheet, Save, Undo2 } from 'lucide-react';
import DataGrid from '../components/DataGrid.jsx';
import CleanPanel from '../components/CleanPanel.jsx';
import ValidatePanel from '../components/ValidatePanel.jsx';
import FormulaBuilder from '../components/FormulaBuilder.jsx';
import RuleList from '../components/RuleList.jsx';
import CommandBox from '../components/CommandBox.jsx';
import { Empty, Notice, PageHeader, StatusBadge } from '../components/ui.jsx';
import useUndoState from '../hooks/useUndoState.js';
import { automationApi, excelApi, fileApi, errorMessage } from '../services/api.js';
import { describeRule } from '../utils/describeRule.js';
import { downloadBlob, formatDate } from '../utils/format.js';

const TABS = [['data', 'Data'], ['clean', 'Clean'], ['validate', 'Validate'], ['automate', 'Automate']];

function FilePicker() {
  const [files, setFiles] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { fileApi.list().then(setFiles).catch((e) => setError(errorMessage(e))); }, []);
  return (
    <>
      <PageHeader title="Workspace" subtitle="Choose a file to open.">
        <Link to="/upload" className="btn-primary">Upload new file</Link>
      </PageHeader>
      {error && <Notice notice={{ type: 'error', text: error }} />}
      {files && !files.length && <Empty>No files yet. <Link to="/upload" className="font-medium text-brand-700">Upload a spreadsheet</Link> to begin.</Empty>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {files?.map((f) => (
          <Link key={f._id} to={`/workspace/${f._id}`} className="card flex items-start gap-3 transition hover:border-brand-500">
            <FileSpreadsheet className="mt-1 text-brand-600" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{f.fileName}</div>
              <div className="text-xs text-slate-500">{f.rowCount} rows · {f.columnCount} columns · {formatDate(f.createdAt)}</div>
              <div className="mt-2"><StatusBadge status={f.status} /></div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default function Workspace() {
  const { id } = useParams();
  return id ? <WorkspaceEditor key={id} id={id} /> : <FilePicker />;
}

function WorkspaceEditor({ id }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const ds = useUndoState({ columns: [], data: [] });
  const { columns, data } = ds.state;
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState('data');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [issues, setIssues] = useState(null);
  const [results, setResults] = useState([]);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    fileApi.get(id).then((f) => { setFile(f); ds.reset({ columns: f.columns, data: f.data }); })
      .catch((e) => { setNotice({ type: 'error', text: errorMessage(e) }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = useCallback((next, keepIssues = false) => { ds.set(next); setDirty(true); if (!keepIssues) setIssues(null); }, [ds]);
  const body = () => ({ fileId: id, columns, data });
  const highlights = useMemo(() => new Set((issues || []).map((i) => `${i.row}:${i.column}`)), [issues]);

  const run = async (fn, onOk) => {
    setBusy(true); setNotice(null);
    try { await onOk(await fn()); } catch (e) { setNotice({ type: 'error', text: errorMessage(e) }); } finally { setBusy(false); }
  };
  const applyResult = (res, prefix) => {
    update({ columns: res.columns, data: res.data });
    setResults(res.results || []);
    if (res.issues?.length) setIssues(res.issues);
    const lines = [...(res.messages || []), ...(res.results || []).map((r) => `${r.label} = ${r.value}`)];
    setNotice({ type: 'success', text: [prefix || 'Done. Review the result, then click Save to keep it.', ...lines] });
  };

  // ----- grid edits -----
  const editCell = (i, c, v) => update({ columns, data: data.map((r, idx) => (idx === i ? { ...r, [c]: v } : r)) }, true);
  const addRow = () => update({ columns, data: [...data, Object.fromEntries(columns.map((c) => [c, '']))] });
  const deleteRow = (i) => update({ columns, data: data.filter((_, idx) => idx !== i) });
  const addColumn = (name) => {
    const n = name.replace(/[.$]/g, '_');
    if (columns.includes(n)) return setNotice({ type: 'error', text: 'A column with that name already exists.' });
    update({ columns: [...columns, n], data: data.map((r) => ({ ...r, [n]: '' })) });
  };
  const deleteColumn = (c) => update({ columns: columns.filter((x) => x !== c), data: data.map(({ [c]: _drop, ...rest }) => rest) });
  const renameColumn = (oldName, newName) => {
    const n = newName.replace(/[.$]/g, '_');
    if (columns.includes(n)) return setNotice({ type: 'error', text: 'A column with that name already exists.' });
    update({ columns: columns.map((c) => (c === oldName ? n : c)), data: data.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k === oldName ? n : k, v]))) });
  };
  const fixIssue = (row, col, value) => {
    const v = /^-?\d+(\.\d+)?$/.test(value.trim()) ? Number(value) : value;
    editCell(row, col, v);
    setIssues((list) => list.filter((it) => !(it.row === row && it.column === col)));
  };

  // ----- server operations -----
  const save = () => run(() => fileApi.saveData(id, columns, data), (f) => { setFile(f); setDirty(false); setNotice({ type: 'success', text: 'Changes saved.' }); });
  const exportAs = (format) => run(() => excelApi.exportFile({ ...body(), format }), (res) => { downloadBlob(res, `export.${format}`); setNotice({ type: 'success', text: `Your ${format.toUpperCase()} file is downloading.` }); });
  const clean = (ops) => run(() => excelApi.clean({ ...body(), ops }), (res) => applyResult(res, 'Cleaning complete. Review the result, then click Save to keep it.'));
  const validate = (checks) => run(() => excelApi.validate({ ...body(), checks }), (res) => { setIssues(res.issues); setNotice({ type: res.issues.length ? 'info' : 'success', text: res.messages }); });
  const applyRule = (rule, err) => (err ? setNotice({ type: 'error', text: err }) : run(() => excelApi.calculate({ ...body(), rules: [rule] }), (res) => applyResult(res)));
  const addRule = (rule, err) => (err ? setNotice({ type: 'error', text: err }) : (setRules([...rules, rule]), setNotice({ type: 'info', text: `Added step ${rules.length + 1}: ${describeRule(rule)}` })));
  const runAll = () => run(() => excelApi.calculate({ ...body(), rules }), (res) => applyResult(res, `Ran ${rules.length} step(s).`));
  const command = (text) => run(() => excelApi.command({ ...body(), text }), (res) => applyResult(res, `Understood: ${res.steps.join(' · ')}`));
  const saveAutomation = async () => {
    const name = window.prompt('Automation name');
    if (!name) return;
    run(() => automationApi.create({ name, description: '', rules }), () => setNotice({ type: 'success', text: `Saved “${name}”. Find it under Automations.` }));
  };

  if (!file) return notice ? <Notice notice={notice} /> : <div className="text-slate-500">Loading…</div>;

  return (
    <>
      <PageHeader title={file.fileName} subtitle={`${data.length} rows · ${columns.length} columns${dirty ? ' · unsaved changes' : ''}`}>
        <button className="btn-outline" disabled={!ds.canUndo} onClick={() => { ds.undo(); setDirty(true); setIssues(null); }}><Undo2 size={14} /> Undo</button>
        <button className="btn-primary" disabled={!dirty || busy} onClick={save}><Save size={14} /> Save</button>
        <button className="btn-outline" disabled={busy} onClick={() => exportAs('xlsx')}><Download size={14} /> Excel</button>
        <button className="btn-outline" disabled={busy} onClick={() => exportAs('csv')}><Download size={14} /> CSV</button>
        <button className="btn-outline" onClick={() => navigate(`/reports?file=${id}`)}><BarChart3 size={14} /> Report</button>
      </PageHeader>

      <div className="mb-4 space-y-2"><Notice notice={notice} onClose={() => setNotice(null)} /></div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${tab === k ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
            {l}{k === 'validate' && issues?.length ? ` (${issues.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'data' && (
        <DataGrid columns={columns} data={data} highlights={highlights} onEditCell={editCell} onAddRow={addRow} onDeleteRow={deleteRow}
          onAddColumn={addColumn} onDeleteColumn={deleteColumn} onRenameColumn={renameColumn} onClear={() => update({ columns, data: [] })} />
      )}
      {tab === 'clean' && <CleanPanel columns={columns} data={data} busy={busy} onApply={clean} />}
      {tab === 'validate' && <ValidatePanel columns={columns} busy={busy} issues={issues} onRun={validate} onFix={fixIssue} />}
      {tab === 'automate' && (
        <div className="space-y-4">
          <CommandBox busy={busy} onRun={command} />
          <FormulaBuilder columns={columns} busy={busy} onApply={applyRule} onAdd={addRule} />
          <RuleList rules={rules} setRules={setRules} busy={busy} onRun={runAll} onSave={saveAutomation} />
          {results.length > 0 && (
            <div className="card"><h3 className="mb-2 font-semibold">Calculated results</h3>
              <ul className="text-sm">{results.map((r, i) => <li key={i}>{r.label}: <strong>{String(r.value)}</strong></li>)}</ul></div>
          )}
          <p className="text-sm text-slate-500">Results appear in the <button className="font-medium text-brand-700" onClick={() => setTab('data')}>Data tab</button>.</p>
        </div>
      )}
    </>
  );
}

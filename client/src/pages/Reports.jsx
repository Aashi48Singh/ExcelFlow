import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Empty, FileSelect, Notice, PageHeader } from '../components/ui.jsx';
import { fileApi, reportApi, errorMessage } from '../services/api.js';
import { downloadBlob } from '../utils/format.js';

const TYPES = [['employee', 'Employee Report'], ['sales', 'Sales Report'], ['inventory', 'Inventory Report']];

export default function Reports() {
  const [params] = useSearchParams();
  const [files, setFiles] = useState([]);
  const [fileId, setFileId] = useState(params.get('file') || '');
  const [type, setType] = useState('employee');
  const [report, setReport] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { fileApi.list().then(setFiles).catch((e) => setNotice({ type: 'error', text: errorMessage(e) })); }, []);

  const generate = async () => {
    setBusy(true); setNotice(null); setReport(null);
    try { setReport(await reportApi.generate(fileId, type)); } catch (e) { setNotice({ type: 'error', text: errorMessage(e) }); } finally { setBusy(false); }
  };
  const download = async () => {
    try { downloadBlob(await reportApi.download(fileId, type), 'report.xlsx'); } catch (e) { setNotice({ type: 'error', text: errorMessage(e) }); }
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Summaries are calculated from your file’s saved data." />
      <div className="card mb-4 grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
        <FileSelect files={files} value={fileId} onChange={setFileId} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button className="btn-primary" disabled={!fileId || busy} onClick={generate}>{busy ? 'Generating…' : 'Generate'}</button>
      </div>
      <div className="mb-4"><Notice notice={notice} onClose={() => setNotice(null)} /></div>
      {!report && !notice && <Empty>Pick a file and report type. Save any workspace changes first so they’re included.</Empty>}
      {report && (
        <div className="space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{report.title}</h2><button className="btn-outline" onClick={download}><Download size={14} /> Download report</button></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {report.metrics.map((m) => <div key={m.label} className="card"><div className="text-xs font-semibold uppercase text-slate-500">{m.label}</div><div className="mt-1 break-words text-xl font-semibold">{String(m.value)}</div></div>)}
          </div>
          {report.tables.filter((t) => t.rows.length).map((t) => (
            <div key={t.title} className="card p-0"><div className="border-b border-slate-200 p-4 font-semibold">{t.title}</div>
              <div className="max-h-80 overflow-auto"><table className="w-full"><thead><tr>{Object.keys(t.rows[0]).map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
                <tbody>{t.rows.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j} className="td">{String(v)}</td>)}</tr>)}</tbody></table></div></div>
          ))}
        </div>
      )}
    </>
  );
}

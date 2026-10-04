import { useEffect, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { Empty, Notice, PageHeader, StatusBadge } from '../components/ui.jsx';
import { historyApi, errorMessage } from '../services/api.js';
import { downloadBlob, formatDate } from '../utils/format.js';

export default function History() {
  const [items, setItems] = useState(null);
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState(null);
  useEffect(() => { historyApi.list().then(setItems).catch((e) => setNotice({ type: 'error', text: errorMessage(e) })); }, []);
  const fail = (e) => setNotice({ type: 'error', text: errorMessage(e) });

  return (
    <>
      <PageHeader title="Processing History" subtitle="Uploads, automation runs, reports and exports." />
      <div className="mb-4"><Notice notice={notice} onClose={() => setNotice(null)} /></div>
      {items && !items.length && <Empty>Nothing here yet.</Empty>}
      {items?.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full">
            <thead><tr>{['File Name', 'Automation', 'Status', 'Rows', 'Date', 'Download', 'Details'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {items.map((h) => (
                <tr key={h._id}>
                  <td className="td font-medium">{h.fileName}</td><td className="td">{h.automationName}</td>
                  <td className="td"><StatusBadge status={h.status} /></td><td className="td">{h.rowsProcessed}</td><td className="td">{formatDate(h.createdAt)}</td>
                  <td className="td">{h.hasOutput ? <button className="text-brand-700" onClick={() => historyApi.download(h._id).then((r) => downloadBlob(r, h.outputFile)).catch(fail)}><Download size={16} /></button> : '–'}</td>
                  <td className="td"><button className="text-slate-500 hover:text-slate-900" onClick={() => historyApi.get(h._id).then(setDetail).catch(fail)}><Eye size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detail && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={() => setDetail(null)}>
          <div className="card max-h-[80vh] w-full max-w-lg overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">{detail.automationName}</h3>
            <p className="text-sm text-slate-500">{detail.fileName} · {formatDate(detail.createdAt)}</p>
            <div className="mt-3 space-y-3 text-sm">
              {detail.details?.error && <Notice notice={{ type: 'error', text: detail.details.error }} />}
              {detail.details?.steps && <div><div className="label">Steps</div><ol className="list-inside list-decimal">{detail.details.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>}
              {detail.details?.messages?.length > 0 && <div><div className="label">Log</div><ul className="list-inside list-disc">{detail.details.messages.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
              {detail.details?.metrics && <div><div className="label">Report metrics</div><ul>{detail.details.metrics.map((m) => <li key={m.label}>{m.label}: <strong>{String(m.value)}</strong></li>)}</ul></div>}
              {!detail.details && <p className="text-slate-500">No further details recorded.</p>}
            </div>
            <button className="btn-outline mt-4" onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import { fileApi, errorMessage } from '../services/api.js';
import { Notice, PageHeader } from '../components/ui.jsx';
import { formatDate } from '../utils/format.js';

const ALLOWED = ['xlsx', 'xls', 'csv'];

export default function UploadFile() {
  const inputRef = useRef();
  const navigate = useNavigate();
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState(null);

  const handle = async (file) => {
    setError(''); setUploaded(null);
    if (!file) return;
    if (!ALLOWED.includes(file.name.split('.').pop().toLowerCase())) return setError('Please upload a valid Excel or CSV file.');
    if (file.size > 5 * 1024 * 1024) return setError('File is too large. The maximum size is 5 MB.');
    setProgress(0);
    try { setUploaded(await fileApi.upload(file, setProgress)); } catch (e) { setError(errorMessage(e)); } finally { setProgress(null); }
  };

  return (
    <>
      <PageHeader title="Upload File" subtitle="Supported formats: .xlsx, .xls, .csv (max 5 MB)" />
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current.click()}
        className={`flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed bg-white p-8 text-center transition sm:p-14 ${drag ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-500'}`}>
        <UploadCloud size={40} className="text-brand-600" />
        <p className="mt-3 font-medium">Drag & drop your spreadsheet here</p>
        <p className="text-sm text-slate-500">or click to browse</p>
        <input ref={inputRef} type="file" hidden accept=".xlsx,.xls,.csv" onChange={(e) => { handle(e.target.files[0]); e.target.value = ''; }} />
      </div>
      {progress !== null && <div className="mt-4 h-2 overflow-hidden rounded bg-slate-200"><div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} /></div>}
      <div className="mt-4 space-y-4">
        {error && <Notice notice={{ type: 'error', text: error }} />}
        {uploaded && (
          <div className="card">
            <Notice notice={{ type: 'success', text: 'File uploaded and parsed successfully.' }} />
            <dl className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[['File name', uploaded.fileName], ['Type', uploaded.fileType.toUpperCase()], ['Rows', uploaded.rowCount], ['Columns', uploaded.columnCount], ['Sheets', uploaded.sheets.join(', ')], ['Uploaded', formatDate(uploaded.createdAt)]].map(([k, v]) => (
                <div key={k} className="min-w-0"><dt className="label">{k}</dt><dd className="truncate text-sm font-medium" title={String(v)}>{v}</dd></div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-slate-500">Columns: {uploaded.columns.join(', ')}</p>
            <button className="btn-primary mt-4" onClick={() => navigate(`/workspace/${uploaded._id}`)}>Open in Workspace</button>
          </div>
        )}
      </div>
    </>
  );
}

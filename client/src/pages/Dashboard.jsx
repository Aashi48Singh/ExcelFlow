import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, CheckCircle2, FileSpreadsheet, FolderOpen, PlusCircle, UploadCloud, Workflow } from 'lucide-react';
import { fileApi, errorMessage } from '../services/api.js';
import { Empty, Notice, PageHeader, StatusBadge } from '../components/ui.jsx';
import { formatDate } from '../utils/format.js';

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon size={22} /></div>
      <div><div className="text-2xl font-semibold text-slate-900">{value ?? '–'}</div><div className="text-sm text-slate-500">{label}</div></div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => { fileApi.stats().then(setStats).catch((e) => setError(errorMessage(e))); }, []);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Your spreadsheet automation overview." />
      {error && <Notice notice={{ type: 'error', text: error }} />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Files" value={stats?.totalFiles} icon={FileSpreadsheet} />
        <StatCard label="Processed Files" value={stats?.processedFiles} icon={CheckCircle2} />
        <StatCard label="Saved Automations" value={stats?.savedAutomations} icon={Workflow} />
        <StatCard label="Reports Generated" value={stats?.reportsGenerated} icon={BarChart3} />
      </div>

      <div className="card mt-6">
        <h2 className="mb-3 font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => navigate('/upload')}><UploadCloud size={16} /> Upload Excel</button>
          <button className="btn-outline" onClick={() => navigate('/automations')}><PlusCircle size={16} /> Create Automation</button>
          <button className="btn-outline" onClick={() => navigate('/workspace')}><FolderOpen size={16} /> Open Workspace</button>
          <button className="btn-outline" onClick={() => navigate('/reports')}><BarChart3 size={16} /> Generate Report</button>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="mb-3 font-semibold">Recent Files</h2>
        {stats && !stats.recent.length ? <Empty>No files yet. Upload your first spreadsheet to get started.</Empty> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr>{['File Name', 'Type', 'Rows', 'Status', 'Date', 'Action'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody>
                {stats?.recent.map((f) => (
                  <tr key={f._id}>
                    <td className="td font-medium">{f.fileName}</td>
                    <td className="td uppercase">{f.fileType}</td>
                    <td className="td">{f.rowCount}</td>
                    <td className="td"><StatusBadge status={f.status} /></td>
                    <td className="td">{formatDate(f.createdAt)}</td>
                    <td className="td"><Link className="font-medium text-brand-700" to={`/workspace/${f._id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

import { FileSpreadsheet } from 'lucide-react';
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden bg-brand-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2 text-xl font-bold"><FileSpreadsheet /> ExcelFlow</div>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">Stop repeating the same Excel work.</h2>
          <p className="mt-4 max-w-md text-brand-100">Upload, clean, validate and calculate spreadsheets with a visual builder — no formulas to write.</p>
        </div>
        <p className="text-sm text-brand-200">Clean · Validate · Automate · Report</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export const formatDate = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function downloadBlob(response, fallbackName) {
  const cd = response.headers['content-disposition'] || '';
  const match = cd.match(/filename="?([^";]+)"?/);
  const name = match ? decodeURIComponent(match[1]) : fallbackName;
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export const isBlank = (v) => v === null || v === undefined || String(v).trim() === '';

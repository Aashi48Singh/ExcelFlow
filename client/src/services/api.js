import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('excelflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((r) => r, (err) => {
  const isAuthCall = err.config?.url?.startsWith('/auth/');
  if (err.response?.status === 401 && !isAuthCall) {
    localStorage.removeItem('excelflow_token');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export const errorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data instanceof Blob) return 'Something went wrong. Please try again.';
  if (err.code === 'ERR_NETWORK') return 'Unable to reach the server. Please check your connection.';
  return 'Something went wrong. Please try again.';
};

// Blob responses carry JSON errors as a Blob; unwrap them so users see the real message.
async function blobRequest(promise) {
  try { return await promise; } catch (err) {
    if (err.response?.data instanceof Blob) {
      try { err.response.data = JSON.parse(await err.response.data.text()); } catch { /* keep generic */ }
    }
    throw err;
  }
}

export const authApi = {
  register: (b) => api.post('/auth/register', b).then((r) => r.data),
  login: (b) => api.post('/auth/login', b).then((r) => r.data),
  profile: () => api.get('/auth/profile').then((r) => r.data),
};
export const fileApi = {
  stats: () => api.get('/stats').then((r) => r.data),
  list: () => api.get('/files').then((r) => r.data.files),
  get: (id) => api.get(`/files/${id}`).then((r) => r.data.file),
  upload: (file, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/files/upload', form, { onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)) }).then((r) => r.data.file);
  },
  saveData: (id, columns, data) => api.put(`/files/${id}/data`, { columns, data }).then((r) => r.data.file),
  remove: (id) => api.delete(`/files/${id}`),
};
export const excelApi = {
  clean: (b) => api.post('/excel/clean', b).then((r) => r.data),
  validate: (b) => api.post('/excel/validate', b).then((r) => r.data),
  calculate: (b) => api.post('/excel/calculate', b).then((r) => r.data),
  command: (b) => api.post('/excel/command', b).then((r) => r.data),
  exportFile: (b) => blobRequest(api.post('/excel/export', b, { responseType: 'blob' })),
};
export const automationApi = {
  list: () => api.get('/automation').then((r) => r.data.automations),
  create: (b) => api.post('/automation', b).then((r) => r.data.automation),
  update: (id, b) => api.put(`/automation/${id}`, b).then((r) => r.data.automation),
  remove: (id) => api.delete(`/automation/${id}`),
  duplicate: (id) => api.post(`/automation/${id}/duplicate`).then((r) => r.data.automation),
  run: (id, fileId) => api.post(`/automation/${id}/run`, { fileId }).then((r) => r.data),
};
export const templateApi = { list: () => api.get('/templates').then((r) => r.data.templates) };
export const reportApi = {
  generate: (fileId, type) => api.post(`/reports/${fileId}/generate`, { type }).then((r) => r.data.report),
  download: (fileId, type) => blobRequest(api.get(`/reports/${fileId}/download`, { params: { type }, responseType: 'blob' })),
};
export const historyApi = {
  list: () => api.get('/history').then((r) => r.data.history),
  get: (id) => api.get(`/history/${id}`).then((r) => r.data.item),
  download: (id) => blobRequest(api.get(`/history/${id}/download`, { responseType: 'blob' })),
};
export default api;

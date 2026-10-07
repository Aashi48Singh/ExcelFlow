import axios from 'axios';

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000/api'
    : 'https://excelflow-api.onrender.com/api');

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('excelflow_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    const isAuthCall = err.config?.url?.startsWith('/auth/');

    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('excelflow_token');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export const errorMessage = (err) => {
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  if (err.response?.data instanceof Blob) {
    return 'Something went wrong. Please try again.';
  }

  if (err.code === 'ERR_NETWORK') {
    return 'Unable to reach the server. Please check your connection.';
  }

  return 'Something went wrong. Please try again.';
};

// Blob responses carry JSON errors as a Blob;
// unwrap them so users see the real message.
async function blobRequest(promise) {
  try {
    return await promise;
  } catch (err) {
    if (err.response?.data instanceof Blob) {
      try {
        err.response.data = JSON.parse(
          await err.response.data.text()
        );
      } catch {
        // Keep generic error
      }
    }

    throw err;
  }
}

// =========================
// AUTH API
// =========================

export const authApi = {
  register: (body) =>
    api.post('/auth/register', body).then((response) => response.data),

  login: (body) =>
    api.post('/auth/login', body).then((response) => response.data),

  profile: () =>
    api.get('/auth/profile').then((response) => response.data),
};

// =========================
// FILE API
// =========================

export const fileApi = {
  stats: () =>
    api.get('/stats').then((response) => response.data),

  list: () =>
    api.get('/files').then((response) => response.data.files),

  get: (id) =>
    api.get(`/files/${id}`).then((response) => response.data.file),

  upload: (file, onProgress) => {
    const form = new FormData();

    form.append('file', file);

    return api
      .post('/files/upload', form, {
        onUploadProgress: (event) => {
          if (event.total) {
            const progress = Math.round(
              (event.loaded / event.total) * 100
            );

            onProgress?.(progress);
          }
        },
      })
      .then((response) => response.data.file);
  },

  saveData: (id, columns, data) =>
    api
      .put(`/files/${id}/data`, {
        columns,
        data,
      })
      .then((response) => response.data.file),

  remove: (id) =>
    api.delete(`/files/${id}`),
};

// =========================
// EXCEL API
// =========================

export const excelApi = {
  clean: (body) =>
    api.post('/excel/clean', body).then((response) => response.data),

  validate: (body) =>
    api.post('/excel/validate', body).then((response) => response.data),

  calculate: (body) =>
    api.post('/excel/calculate', body).then((response) => response.data),

  command: (body) =>
    api.post('/excel/command', body).then((response) => response.data),

  exportFile: (body) =>
    blobRequest(
      api.post('/excel/export', body, {
        responseType: 'blob',
      })
    ),
};

// =========================
// AUTOMATION API
// =========================

export const automationApi = {
  list: () =>
    api.get('/automation').then((response) => response.data.automations),

  create: (body) =>
    api
      .post('/automation', body)
      .then((response) => response.data.automation),

  update: (id, body) =>
    api
      .put(`/automation/${id}`, body)
      .then((response) => response.data.automation),

  remove: (id) =>
    api.delete(`/automation/${id}`),

  duplicate: (id) =>
    api
      .post(`/automation/${id}/duplicate`)
      .then((response) => response.data.automation),

  run: (id, fileId) =>
    api
      .post(`/automation/${id}/run`, { fileId })
      .then((response) => response.data),
};

// =========================
// TEMPLATE API
// =========================

export const templateApi = {
  list: () =>
    api.get('/templates').then((response) => response.data.templates),
};

// =========================
// REPORT API
// =========================

export const reportApi = {
  generate: (fileId, type) =>
    api
      .post(`/reports/${fileId}/generate`, { type })
      .then((response) => response.data.report),

  download: (fileId, type) =>
    blobRequest(
      api.get(`/reports/${fileId}/download`, {
        params: { type },
        responseType: 'blob',
      })
    ),
};

// =========================
// HISTORY API
// =========================

export const historyApi = {
  list: () =>
    api.get('/history').then((response) => response.data.history),

  get: (id) =>
    api.get(`/history/${id}`).then((response) => response.data.item),

  download: (id) =>
    blobRequest(
      api.get(`/history/${id}/download`, {
        responseType: 'blob',
      })
    ),
};


export default api;

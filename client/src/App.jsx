import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UploadFile from './pages/UploadFile.jsx';
import Workspace from './pages/Workspace.jsx';
import Automations from './pages/Automations.jsx';
import Templates from './pages/Templates.jsx';
import Reports from './pages/Reports.jsx';
import History from './pages/History.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadFile />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/workspace/:id" element={<Workspace />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

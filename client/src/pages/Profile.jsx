import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader } from '../components/ui.jsx';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Profile" />
      <div className="card max-w-lg space-y-4">
        <div><div className="label">Name</div><div>{user.name}</div></div>
        <div><div className="label">Email</div><div>{user.email}</div></div>
        <div><div className="label">Member since</div><div>{formatDate(user.createdAt)}</div></div>
      </div>
    </>
  );
}

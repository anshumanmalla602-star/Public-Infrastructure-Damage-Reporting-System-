import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { Loading } from '../components/Spinner';
import { formatDate, ROLE_LABELS } from '../utils/constants';

const ROLE_COLORS = {
  citizen: 'bg-slate-100 text-slate-700',
  entrepreneur: 'bg-accent-50 text-accent-700',
  authority: 'bg-blue-50 text-blue-700',
  admin: 'bg-primary-50 text-primary-700',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/stats/users')
      .then(({ data }) => {
        if (active) setUsers(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-800">Users</h1>
      <p className="mt-2 text-slate-600">Every account registered on the platform.</p>

      {error && (
        <div className="mt-6">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {['', 'citizen', 'entrepreneur', 'authority', 'admin'].map((value) => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => setRoleFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              roleFilter === value
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {value ? ROLE_LABELS[value] : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading label="Loading users..." />
      ) : filtered.length === 0 ? (
        <div className="card mt-6">
          <EmptyState icon={Users} title="No users found" description="No accounts match this filter." />
        </div>
      ) : (
        <div className="card mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                      {user.full_name}
                      {user.phone && (
                        <p className="text-xs font-normal text-slate-400">{user.phone}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge color={ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-700'}>
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

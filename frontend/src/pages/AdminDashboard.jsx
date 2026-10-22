import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ClipboardList,
  FolderTree,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import { Loading } from '../components/Spinner';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-slate-800">{value ?? 0}</p>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon size={19} />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .get('/stats/stats')
      .then(({ data }) => {
        if (active) setStats(data);
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

  if (loading) return <Loading label="Loading dashboard..." />;

  const resolutionHours =
    stats?.avgResolutionSeconds > 0 ? (stats.avgResolutionSeconds / 3600).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-800">Admin dashboard</h1>
      <p className="mt-2 text-slate-600">
        Platform health at a glance - reports, businesses and marketplace activity.
      </p>

      {error && (
        <div className="mt-6">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={stats?.totalUsers} color="bg-primary-50 text-primary-600" />
        <StatCard icon={Wrench} label="Reported issues" value={stats?.totalIssues} color="bg-amber-50 text-amber-600" />
        <StatCard icon={UserCheck} label="Approved businesses" value={stats?.approvedBusinesses} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Building2} label="Pending approvals" value={stats?.pendingBusinesses} color="bg-accent-50 text-accent-600" />
        <StatCard icon={ClipboardList} label="Active services" value={stats?.totalServices} color="bg-blue-50 text-blue-600" />
        <StatCard icon={MessageSquare} label="Customer inquiries" value={stats?.totalInquiries} color="bg-purple-50 text-purple-600" />
        <StatCard icon={TrendingUp} label="Issues resolved" value={stats?.resolvedIssues} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={FolderTree} label="Avg resolution (hrs)" value={resolutionHours ?? '-'} color="bg-slate-100 text-slate-600" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800">Issues by status</h2>
          {stats?.issuesByStatus?.length ? (
            <ul className="mt-4 space-y-3">
              {stats.issuesByStatus.map((row) => {
                const total = stats.totalIssues || 1;
                const pct = Math.round((row.count / total) * 100);
                return (
                  <li key={row.status}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-600">
                        {row.status.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-slate-800">{row.count}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No issues reported yet.</p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-800">Issues by category</h2>
          {stats?.issuesByCategory?.length ? (
            <ul className="mt-4 space-y-2">
              {stats.issuesByCategory.map((row) => (
                <li
                  key={row.category}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{row.category}</span>
                  <Badge color="bg-white text-slate-700">{row.count}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No issues reported yet.</p>
          )}
        </div>
      </div>

      {stats?.issuesByMonth?.length > 0 && (
        <div className="card mt-6 p-5">
          <h2 className="font-semibold text-slate-800">Reports over time</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {stats.issuesByMonth.map((row) => (
              <li key={row.month} className="rounded-lg bg-slate-50 px-4 py-2 text-sm">
                <span className="text-slate-500">{row.month}</span>
                <span className="ml-2 font-semibold text-slate-800">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/profiles" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold text-slate-800">Business approvals</h3>
          <p className="mt-1 text-sm text-slate-500">
            Review and approve {stats?.pendingBusinesses || 0} pending profile(s).
          </p>
        </Link>
        <Link to="/admin/content" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold text-slate-800">Guidance content</h3>
          <p className="mt-1 text-sm text-slate-500">Manage articles and repair guidelines.</p>
        </Link>
        <Link to="/admin/users" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold text-slate-800">User management</h3>
          <p className="mt-1 text-sm text-slate-500">
            View all {stats?.totalUsers || 0} registered users.
          </p>
        </Link>
        <Link to="/authority/issues" className="card p-5 transition hover:shadow-md">
          <h3 className="font-semibold text-slate-800">Issue operations</h3>
          <p className="mt-1 text-sm text-slate-500">
            Update status on {stats?.totalIssues || 0} infrastructure reports.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

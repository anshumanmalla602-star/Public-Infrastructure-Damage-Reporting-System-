import { useEffect, useState } from 'react';
import { CheckCircle2, Filter, Wrench } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import StatusModal from '../components/StatusModal';
import EmptyState from '../components/EmptyState';
import { Loading } from '../components/Spinner';
import {
  formatDateTime,
  getStatusMeta,
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  PRIORITIES,
} from '../utils/constants';

const AuthorityIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [active, setActive] = useState(null);
  const [update, setUpdate] = useState({ status: '', priority: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadIssues = async (nextFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (nextFilters.status) params.append('status', nextFilters.status);
      if (nextFilters.category) params.append('category', nextFilters.category);
      const { data } = await api.get(`/issues?${params.toString()}`);
      setIssues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    api
      .get('/issues')
      .then(({ data }) => {
        if (mounted) setIssues(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    loadIssues(next);
  };

  const openUpdate = (issue) => {
    setActive(issue);
    setUpdate({ status: issue.status, priority: issue.priority || 'medium', comment: '' });
    setError('');
  };

  const handleUpdateChange = (patch) => {
    setUpdate((prev) => ({ ...prev, ...patch }));
  };

  const submitUpdate = async (event) => {
    event.preventDefault();
    if (!active) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        status: update.status,
        priority: update.priority,
        comment: update.comment || undefined,
      };
      const { data } = await api.put(`/issues/${active.id}/status`, payload);
      setIssues((prev) => prev.map((issue) => (issue.id === data.id ? { ...issue, ...data } : issue)));
      setActive(null);
      setSuccess(`Issue marked as ${data.status.replace('_', ' ')}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const counts = ISSUE_STATUSES.map(({ value, label }) => ({
    value,
    label,
    count: issues.filter((issue) => issue.status === value).length,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-800">Manage infrastructure issues</h1>
      <p className="mt-2 text-slate-600">
        Review citizen reports, set priority and update repair status.
      </p>

      {error && (
        <div className="mt-6">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mt-6">
          <Alert variant="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {counts.map(({ value, label, count }) => (
          <div key={value} className="card p-3 text-center">
            <p className="text-2xl font-bold text-slate-800">{count}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.status}
            onChange={(event) => handleFilter('status', event.target.value)}
            className="input pl-9"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {ISSUE_STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <select
          value={filters.category}
          onChange={(event) => handleFilter('category', event.target.value)}
          className="input sm:max-w-xs"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {ISSUE_CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading label="Loading issues…" />
      ) : issues.length === 0 ? (
        <div className="card mt-6">
          <EmptyState
            icon={Wrench}
            title="No issues found"
            description="There are no reports matching the selected filters."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="card overflow-hidden">
              <div className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={getStatusMeta(ISSUE_STATUSES, issue.status).color}>
                        {getStatusMeta(ISSUE_STATUSES, issue.status).label}
                      </Badge>
                      <Badge color={getStatusMeta(PRIORITIES, issue.priority).color}>
                        {getStatusMeta(PRIORITIES, issue.priority).label}
                      </Badge>
                      <Badge color="bg-primary-50 text-primary-700">{issue.category}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{issue.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Reported by {issue.reporter_name || 'Unknown'} ·{' '}
                      {formatDateTime(issue.created_at)}
                      {issue.address ? ` · ${issue.address}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openUpdate(issue)}
                    className="btn-primary shrink-0 text-xs"
                  >
                    <CheckCircle2 size={14} /> Update
                  </button>
                </div>
                {issue.image_url && (
                  <img
                    src={issue.image_url}
                    alt={issue.category}
                    className="mt-3 h-40 w-full rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <StatusModal
        open={!!active}
        onClose={() => setActive(null)}
        issue={active}
        update={update}
        onChange={handleUpdateChange}
        onSubmit={submitUpdate}
        submitting={submitting}
      />
    </div>
  );
};

export default AuthorityIssues;

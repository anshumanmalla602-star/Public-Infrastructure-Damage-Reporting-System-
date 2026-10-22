import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus } from 'lucide-react';
import api from '../api/client';
import IssueCard from '../components/IssueCard';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import { Loading } from '../components/Spinner';
import { ISSUE_STATUSES } from '../utils/constants';

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;
    api
      .get('/issues/mine')
      .then(({ data }) => {
        if (active) setIssues(data);
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

  const filtered = useMemo(
    () => (filter === 'all' ? issues : issues.filter((issue) => issue.status === filter)),
    [issues, filter]
  );

  const counts = useMemo(() => {
    const map = { all: issues.length };
    ISSUE_STATUSES.forEach(({ value }) => {
      map[value] = issues.filter((issue) => issue.status === value).length;
    });
    return map;
  }, [issues]);

  if (loading) {
    return <Loading label="Loading your reports…" />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My reports</h1>
          <p className="mt-2 text-slate-600">
            Track every issue you have reported and see its current repair status.
          </p>
        </div>
        <Link to="/report" className="btn-primary">
          <Plus size={16} /> New report
        </Link>
      </div>

      {error && (
        <div className="mt-6">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
          }`}
        >
          All ({counts.all})
        </button>
        {ISSUE_STATUSES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === value
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {label} ({counts[value] || 0})
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={ClipboardList}
              title={issues.length === 0 ? 'No reports yet' : 'Nothing in this status'}
              description={
                issues.length === 0
                  ? 'Spotted a pothole, leak or broken streetlight? Report it and track the repair here.'
                  : 'Try a different status filter to see your other reports.'
              }
              action={
                issues.length === 0 ? (
                  <Link to="/report" className="btn-primary mt-2">
                    <Plus size={16} /> Report an issue
                  </Link>
                ) : null
              }
            />
          </div>
        ) : (
          filtered.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  );
};

export default MyIssues;

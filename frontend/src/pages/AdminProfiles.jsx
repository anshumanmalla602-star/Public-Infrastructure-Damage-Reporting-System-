import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { Loading } from '../components/Spinner';
import { formatDate, getStatusMeta, PROFILE_STATUSES } from '../utils/constants';

const AdminProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = async (status) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/profiles${status ? `?status=${status}` : ''}`);
      setProfiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
  }, [filter]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    setError('');
    try {
      await api.put(`/admin/profiles/${id}/status`, { status });
      setSuccess(`Profile ${status}.`);
      await load(filter);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-800">Business approvals</h1>
      <p className="mt-2 text-slate-600">
        Review entrepreneur profiles before they appear in the public marketplace.
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

      <div className="mt-6 flex gap-2">
        {['pending', 'approved', 'rejected', ''].map((value) => (
          <button
            key={value || 'all'}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition ${
              filter === value
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-50'
            }`}
          >
            {value || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading label="Loading profiles..." />
      ) : profiles.length === 0 ? (
        <div className="card mt-6">
          <EmptyState
            icon={ShieldCheck}
            title="No profiles to review"
            description="There are no business profiles matching this filter right now."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {profiles.map((profile) => {
            const meta = getStatusMeta(PROFILE_STATUSES, profile.status);
            return (
              <div key={profile.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-accent-50 text-2xl">
                      {profile.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        '\uD83C\uDFEA'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-800">{profile.business_name}</h2>
                        <Badge color={meta.color}>{meta.label}</Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {profile.full_name}
                        {profile.email ? ` \u00b7 ${profile.email}` : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {profile.category_name || 'Uncategorised'}
                        {profile.city ? ` \u00b7 ${profile.city}` : ''} \u00b7{' '}
                        {formatDate(profile.created_at)}
                      </p>
                      {profile.description && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {profile.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {profile.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => setStatus(profile.id, 'approved')}
                        disabled={busyId === profile.id}
                        className="btn-primary text-xs"
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    )}
                    {profile.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => setStatus(profile.id, 'rejected')}
                        disabled={busyId === profile.id}
                        className="btn-secondary text-xs text-red-600"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminProfiles;

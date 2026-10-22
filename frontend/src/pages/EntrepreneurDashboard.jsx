import { useEffect, useState } from 'react';
import { Building2, Plus, Trash2 } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ProfileModal from '../components/ProfileModal';
import ServiceModal from '../components/ServiceModal';
import { Loading } from '../components/Spinner';
import { formatCurrency, getStatusMeta, PROFILE_STATUSES } from '../utils/constants';

const EMPTY_PROFILE = {
  business_name: '',
  category_id: '',
  description: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  pricing_info: '',
  availability: '',
  license_info: '',
};

const EMPTY_SERVICE = { title: '', description: '', price: '', category: '', availability: '' };

const EntrepreneurDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/entrepreneurs/profile/me').catch(() => null),
      api.get('/services/mine').catch(() => []),
      api.get('/entrepreneurs/categories'),
    ])
      .then(([profileRes, servicesRes, catRes]) => {
        if (!active) return;
        setProfile(profileRes?.data || null);
        setServices(servicesRes.data || []);
        setCategories(catRes.data);
        if (profileRes?.data) {
          const p = profileRes.data;
          setProfileForm({
            business_name: p.business_name || '',
            category_id: p.category_id || '',
            description: p.description || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            pincode: p.pincode || '',
            phone: p.phone || '',
            pricing_info: p.pricing_info || '',
            availability: p.availability || '',
            license_info: p.license_info || '',
          });
        }
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

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (event) => {
    const { name, value } = event.target;
    setServiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...profileForm };
      if (!payload.category_id) payload.category_id = null;
      const { data } = await api.post('/entrepreneurs/profile', payload);
      setProfile(data);
      setProfileOpen(false);
      setSuccess('Business profile submitted for admin approval.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitService = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/services', {
        ...serviceForm,
        price: serviceForm.price ? Number(serviceForm.price) : null,
      });
      setServices((prev) => [data, ...prev]);
      setServiceForm(EMPTY_SERVICE);
      setServiceOpen(false);
      setSuccess('Service added to your catalogue.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    setError('');
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((service) => service.id !== id));
      setSuccess('Service deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loading label="Loading your business…" />;

  const statusMeta = profile ? getStatusMeta(PROFILE_STATUSES, profile.status) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My business</h1>
          <p className="mt-2 text-slate-600">
            Set up your profile, list services and manage customer inquiries.
          </p>
        </div>
        {profile && (
          <button type="button" onClick={() => setServiceOpen(true)} className="btn-primary">
            <Plus size={16} /> Add service
          </button>
        )}
      </div>

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

      {!profile ? (
        <div className="card mt-6 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-50">
            <Building2 size={26} className="text-accent-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">Create your business profile</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Your profile goes to the admin for approval. Once approved, customers can find and
            contact you in the marketplace.
          </p>
          <button type="button" onClick={() => setProfileOpen(true)} className="btn-primary mt-5">
            <Plus size={16} /> Create profile
          </button>
        </div>
      ) : (
        <>
          <div className="card mt-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-50 text-2xl">
                  {profile.profile_image ? (
                    <img src={profile.profile_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    '🏪'
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{profile.business_name}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {profile.category_name || 'Uncategorised'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {[profile.address, profile.city, profile.state].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {statusMeta && <Badge color={statusMeta.color}>{statusMeta.label}</Badge>}
                <p className="mt-2 text-xs text-slate-400">
                  {profile.status === 'approved'
                    ? 'Visible in the marketplace'
                    : profile.status === 'pending'
                      ? 'Awaiting admin review'
                      : 'Not visible in the marketplace'}
                </p>
              </div>
            </div>

            {profile.description && (
              <p className="mt-4 border-t border-slate-100 pt-4 leading-relaxed text-slate-700">
                {profile.description}
              </p>
            )}

            <button type="button" onClick={() => setProfileOpen(true)} className="btn-secondary mt-4">
              Edit profile
            </button>
          </div>

          <h2 className="mt-8 text-lg font-semibold text-slate-800">
            My services ({services.length})
          </h2>

          {services.length === 0 ? (
            <div className="card mt-3">
              <EmptyState
                icon={Building2}
                title="No services listed yet"
                description="Add the services you offer so customers can discover and contact you."
                action={
                  <button type="button" onClick={() => setServiceOpen(true)} className="btn-primary mt-2">
                    <Plus size={16} /> Add your first service
                  </button>
                }
              />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {services.map((service) => (
                <div key={service.id} className="card flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{service.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-600">{service.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge color="bg-primary-50 text-primary-700">
                        {formatCurrency(service.price)}
                      </Badge>
                      {service.category && (
                        <Badge color="bg-slate-100 text-slate-600">{service.category}</Badge>
                      )}
                      <Badge
                        color={
                          service.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }
                      >
                        {service.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteService(service.id)}
                    className="btn-ghost text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${service.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        form={profileForm}
        categories={categories}
        onChange={handleProfileChange}
        onSubmit={submitProfile}
        submitting={submitting}
        isEdit={!!profile}
      />

      <ServiceModal
        open={serviceOpen}
        onClose={() => setServiceOpen(false)}
        form={serviceForm}
        categories={categories}
        onChange={handleServiceChange}
        onSubmit={submitService}
        submitting={submitting}
      />
    </div>
  );
};

export default EntrepreneurDashboard;

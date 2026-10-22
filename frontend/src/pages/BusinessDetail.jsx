import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone, Store } from 'lucide-react';
import api from '../api/client';
import ServiceCard from '../components/ServiceCard';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { Loading } from '../components/Spinner';

const BusinessDetail = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/businesses/${id}`), api.get(`/businesses/${id}/services`)])
      .then(([bizRes, svcRes]) => {
        if (!active) return;
        setBusiness(bizRes.data);
        setServices(svcRes.data);
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
  }, [id]);

  if (loading) return <Loading label="Loading business…" />;

  if (error || !business) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Alert variant="error" message={error || 'Business not found'} />
        <Link to="/marketplace" className="btn-secondary mt-5">
          <ArrowLeft size={16} /> Back to marketplace
        </Link>
      </div>
    );
  }

  const details = [
    { icon: MapPin, label: [business.address, business.city, business.state].filter(Boolean).join(', ') },
    { icon: Phone, label: business.phone || business.phone },
    { icon: Mail, label: business.email },
  ].filter((item) => item.label);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/marketplace" className="btn-ghost mb-4 -ml-2 text-sm">
        <ArrowLeft size={16} /> Back to marketplace
      </Link>

      <div className="card overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-accent-100 via-primary-100 to-primary-50 sm:h-52">
          {business.profile_image && (
            <img
              src={business.profile_image}
              alt={business.business_name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-800">{business.business_name}</h1>
                {business.category_name && (
                  <Badge color="bg-accent-50 text-accent-700">{business.category_name}</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">Owned by {business.full_name}</p>
            </div>
          </div>

          {business.description && (
            <p className="mt-4 leading-relaxed text-slate-700">{business.description}</p>
          )}

          {details.length > 0 && (
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {details.map(({ icon: Icon, label }, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-slate-600">
                  <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-800">
        Services by this business ({services.length})
      </h2>

      {services.length === 0 ? (
        <div className="card mt-4">
          <EmptyState
            icon={Store}
            title="No active services"
            description="This business has not listed any active services right now."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessDetail;

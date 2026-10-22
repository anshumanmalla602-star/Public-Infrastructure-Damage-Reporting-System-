import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, MessageSquare, Store, User } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import InquiryModal from '../components/InquiryModal';
import { Loading } from '../components/Spinner';
import { formatCurrency, formatDate } from '../utils/constants';

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get(`/services/${id}`)
      .then(({ data }) => {
        if (active) setService(data);
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

  if (loading) return <Loading label="Loading service…" />;

  if (error || !service) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Alert variant="error" message={error || 'Service not found'} />
        <Link to="/marketplace" className="btn-secondary mt-5">
          <ArrowLeft size={16} /> Back to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/marketplace" className="btn-ghost mb-4 -ml-2 text-sm">
        <ArrowLeft size={16} /> Back to marketplace
      </Link>

      <div className="card overflow-hidden">
        <div className="h-56 bg-gradient-to-br from-primary-100 to-accent-100">
          {service.image_url ? (
            <img src={service.image_url} alt={service.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🧵</div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-800">{service.title}</h1>
              <Link
                to={`/businesses/${service.entrepreneur_id}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 hover:underline"
              >
                <Store size={14} /> {service.business_name}
              </Link>
            </div>
            <p className="text-2xl font-bold text-primary-700">{formatCurrency(service.price)}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {service.category && <Badge color="bg-slate-100 text-slate-600">{service.category}</Badge>}
            {service.availability && (
              <Badge color="bg-emerald-50 text-emerald-700">{service.availability}</Badge>
            )}
            {service.city && <Badge color="bg-blue-50 text-blue-700">{service.city}</Badge>}
          </div>

          {service.description && (
            <p className="mt-5 leading-relaxed text-slate-700">{service.description}</p>
          )}

          <div className="mt-6 grid gap-2 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:grid-cols-2">
            {service.owner_name && (
              <p className="inline-flex items-center gap-2">
                <User size={15} className="text-slate-400" /> {service.owner_name}
              </p>
            )}
            {service.city && (
              <p className="inline-flex items-center gap-2">
                <MapPin size={15} className="text-slate-400" />
                {[service.city, service.state].filter(Boolean).join(', ')}
              </p>
            )}
            {service.availability && (
              <p className="inline-flex items-center gap-2">
                <Clock size={15} className="text-slate-400" /> Available: {service.availability}
              </p>
            )}
            {service.created_at && (
              <p className="inline-flex items-center gap-2">
                <Clock size={15} className="text-slate-400" /> Listed {formatDate(service.created_at)}
              </p>
            )}
          </div>

          <button type="button" onClick={() => setModalOpen(true)} className="btn-primary mt-6 w-full sm:w-auto">
            <MessageSquare size={16} /> Send inquiry
          </button>
        </div>
      </div>

      <InquiryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        entrepreneurId={service.entrepreneur_id}
        serviceId={service.id}
        serviceTitle={service.title}
      />
    </div>
  );
};

export default ServiceDetail;

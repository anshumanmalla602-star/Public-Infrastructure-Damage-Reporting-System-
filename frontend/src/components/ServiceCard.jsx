import { Link } from 'react-router-dom';
import Badge from './Badge';
import { formatCurrency } from '../utils/constants';

const ServiceCard = ({ service }) => (
  <Link
    to={`/services/${service.id}`}
    className="card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
  >
    <div className="h-40 bg-gradient-to-br from-primary-100 to-accent-100">
      {service.image_url ? (
        <img
          src={service.image_url}
          alt={service.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-4xl">🧵</div>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800">{service.title}</h3>
        <span className="shrink-0 text-sm font-bold text-primary-700">
          {formatCurrency(service.price)}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-accent-700">{service.business_name}</p>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{service.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {service.category && (
          <Badge color="bg-slate-100 text-slate-600">{service.category}</Badge>
        )}
        {service.availability && (
          <Badge color="bg-emerald-50 text-emerald-700">{service.availability}</Badge>
        )}
        {service.city && <Badge color="bg-blue-50 text-blue-700">{service.city}</Badge>}
      </div>
    </div>
  </Link>
);

export default ServiceCard;

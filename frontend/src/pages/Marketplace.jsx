import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Store, X } from 'lucide-react';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import ServiceCard from '../components/ServiceCard';
import { Loading } from '../components/Spinner';

const Marketplace = () => {
  const [services, setServices] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '', city: '', availability: '' });

  useEffect(() => {
    let active = true;
    Promise.all([api.get('/entrepreneurs/categories'), api.get('/businesses/cities')])
      .then(([catRes, cityRes]) => {
        if (!active) return;
        setCategories(catRes.data);
        setCities(cityRes.data);
      })
      .catch(() => {
        /* filters are optional - fail silently */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    api
      .get(`/services?${params.toString()}`)
      .then(({ data }) => {
        if (active) setServices(data);
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
  }, [filters]);

  useEffect(() => {
    let active = true;
    api
      .get('/businesses')
      .then(({ data }) => {
        if (active) setBusinesses(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ search: '', category: '', city: '', availability: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Women-led Marketplace</h1>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Discover approved local businesses offering home food, tailoring, beauty and
          handcrafted services — and support women entrepreneurs directly.
        </p>
      </div>

      {error && (
        <div className="mt-6">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search services or businesses…"
            className="input pl-10"
            aria-label="Search services"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="btn-secondary sm:hidden"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className={`mt-3 grid gap-3 sm:grid-cols-3 ${showFilters ? '' : 'hidden sm:grid'}`}>
        <select
          name="category"
          value={filters.category}
          onChange={handleChange}
          className="input"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <select
          name="city"
          value={filters.city}
          onChange={handleChange}
          className="input"
          aria-label="Filter by city"
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <input
          name="availability"
          value={filters.availability}
          onChange={handleChange}
          placeholder="Availability (e.g. Morning)"
          className="input"
          aria-label="Filter by availability"
        />
      </div>

      {hasFilters && (
        <button type="button" onClick={clearFilters} className="btn-ghost mt-3 text-xs">
          <X size={13} /> Clear all filters
        </button>
      )}

      <h2 className="mt-10 text-lg font-semibold text-slate-800">Available services</h2>

      {loading ? (
        <Loading label="Loading services…" />
      ) : services.length === 0 ? (
        <div className="card mt-4">
          <EmptyState
            icon={Store}
            title="No services match your search"
            description="Try different keywords or clear the filters to see all available services."
            action={
              hasFilters ? (
                <button type="button" onClick={clearFilters} className="btn-secondary mt-2">
                  Clear filters
                </button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      <h2 className="mt-12 text-lg font-semibold text-slate-800">Featured businesses</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <Link
            key={business.id}
            to={`/businesses/${business.id}`}
            className="card p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-50 text-xl">
                {business.profile_image ? (
                  <img
                    src={business.profile_image}
                    alt={business.business_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  '🏪'
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-800">{business.business_name}</h3>
                <p className="truncate text-xs text-slate-500">{business.full_name}</p>
                {business.category_name && (
                  <Badge color="bg-accent-50 text-accent-700" className="mt-2">
                    {business.category_name}
                  </Badge>
                )}
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-slate-600">{business.description}</p>
            <p className="mt-2 text-xs text-slate-400">
              {business.city}
              {business.state ? `, ${business.state}` : ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;

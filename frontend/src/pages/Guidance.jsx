import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { Loading } from '../components/Spinner';
import { formatDate } from '../utils/constants';

const Guidance = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get('/content')
      .then(({ data }) => {
        if (!active) return;
        setContent(data);
        if (data.length) setOpenId(data[0].id);
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

  if (loading) return <Loading label="Loading guidance..." />;

  const categories = [...new Set(content.map((item) => item.category).filter(Boolean))];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
          <BookOpen size={13} /> Knowledge base
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-800">Guidance & learning</h1>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">
          Practical guides for reporting damage and for growing a women-led home business.
        </p>
      </div>

      {error && (
        <div className="mt-6">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge key={category} color="bg-slate-100 text-slate-600">
              {category}
            </Badge>
          ))}
        </div>
      )}

      {content.length === 0 ? (
        <div className="card mt-6">
          <EmptyState
            icon={BookOpen}
            title="No guidance published yet"
            description="Check back soon - articles and startup guides will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {content.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-800">{item.title}</h2>
                      {item.category && (
                        <Badge color="bg-accent-50 text-accent-700">{item.category}</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{formatDate(item.created_at)}</p>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4">
                    <p className="whitespace-pre-line leading-relaxed text-slate-700">
                      {item.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Guidance;

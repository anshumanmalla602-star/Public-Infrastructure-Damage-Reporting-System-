import { useEffect, useState } from 'react';
import { BookOpen, FileText, Plus, Trash2 } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Loading, Spinner } from '../components/Spinner';
import { formatDate } from '../utils/constants';

const EMPTY_FORM = { title: '', content: '', category: '' };

const AdminContent = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/content/all');
      setContent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/content', form);
      setContent((prev) => [data, ...prev]);
      setForm(EMPTY_FORM);
      setOpen(false);
      setSuccess('Content published.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this content item?')) return;
    setError('');
    try {
      await api.delete(`/content/${id}`);
      setContent((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Content deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Guidance content</h1>
          <p className="mt-2 text-slate-600">
            Publish articles for citizens and entrepreneurs to read.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-primary">
          <Plus size={16} /> New article
        </button>
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

      {loading ? (
        <Loading label="Loading content..." />
      ) : content.length === 0 ? (
        <div className="card mt-6">
          <EmptyState
            icon={BookOpen}
            title="No content yet"
            description="Publish your first guidance article to get started."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {content.map((item) => (
            <div key={item.id} className="card flex flex-wrap items-start gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText size={16} className="text-primary-600" />
                  <h2 className="font-semibold text-slate-800">{item.title}</h2>
                  {item.category && (
                    <Badge color="bg-accent-50 text-accent-700">{item.category}</Badge>
                  )}
                  <Badge
                    color={
                      item.is_published
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }
                  >
                    {item.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                  {item.content}
                </p>
                <p className="mt-2 text-xs text-slate-400">{formatDate(item.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="btn-ghost text-red-600 hover:bg-red-50"
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Publish an article"
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" form="content-form" className="btn-primary" disabled={submitting}>
              {submitting ? <Spinner size={15} /> : null}
              Publish
            </button>
          </>
        }
      >
        <form id="content-form" onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input
              id="title"
              name="title"
              required
              className="input"
              value={form.title}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="category" className="label">Category</label>
            <input
              id="category"
              name="category"
              className="input"
              placeholder="Getting Started, Pricing, Compliance..."
              value={form.category}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="content" className="label">Body</label>
            <textarea
              id="content"
              name="content"
              rows={8}
              required
              className="input resize-y"
              value={form.content}
              onChange={handleChange}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminContent;

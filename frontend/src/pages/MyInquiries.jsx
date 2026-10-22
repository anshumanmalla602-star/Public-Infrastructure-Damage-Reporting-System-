import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Inbox } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import InquiryRow from '../components/InquiryRow';
import { Loading } from '../components/Spinner';

const MyInquiries = () => {
  const { user } = useAuth();
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responding, setResponding] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEntrepreneur = user?.role === 'entrepreneur';

  useEffect(() => {
    let active = true;
    const requests = [api.get('/inquiries/mine')];
    if (isEntrepreneur) requests.push(api.get('/inquiries/received'));

    Promise.all(requests)
      .then((responses) => {
        if (!active) return;
        setSent(responses[0].data);
        if (responses[1]) setReceived(responses[1].data);
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
  }, [isEntrepreneur]);

  const openRespond = (inquiry) => {
    setResponding(inquiry);
    setResponseText(inquiry.response || '');
    setError('');
  };

  const submitResponse = async (event) => {
    event.preventDefault();
    if (!responding) return;
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.put(`/inquiries/${responding.id}/respond`, {
        status: 'responded',
        response: responseText,
      });
      setReceived((prev) => prev.map((item) => (item.id === data.id ? data : item)));
      setResponding(null);
      setResponseText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading label="Loading inquiries…" />;

  const isEmpty = sent.length === 0 && received.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-800">Inquiries</h1>
      <p className="mt-2 text-slate-600">
        {isEntrepreneur
          ? 'Manage customer questions and keep your customers informed.'
          : 'Track questions you have sent to local businesses.'}
      </p>

      {error && (
        <div className="mt-6">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {isEmpty ? (
        <div className="card mt-6">
          <EmptyState
            icon={Inbox}
            title="No inquiries yet"
            description={
              isEntrepreneur
                ? 'Customer inquiries will appear here once someone contacts you.'
                : 'Browse the marketplace and send an inquiry to a business.'
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {received.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-800">Received ({received.length})</h2>
              <div className="mt-3 space-y-3">
                {received.map((inquiry) => (
                  <InquiryRow
                    key={inquiry.id}
                    inquiry={inquiry}
                    type="received"
                    onRespond={openRespond}
                  />
                ))}
              </div>
            </section>
          )}

          {sent.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-800">Sent ({sent.length})</h2>
              <div className="mt-3 space-y-3">
                {sent.map((inquiry) => (
                  <InquiryRow key={inquiry.id} inquiry={inquiry} type="sent" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {responding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <form onSubmit={submitResponse} className="card w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800">Respond to inquiry</h3>
            <p className="mt-1 text-sm text-slate-500">
              Replying to {responding.customer_name || 'the customer'}.
            </p>
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {responding.message}
            </p>
            <div className="mt-4">
              <label htmlFor="response" className="label">Your response</label>
              <textarea
                id="response"
                rows={4}
                className="input resize-y"
                value={responseText}
                onChange={(event) => setResponseText(event.target.value)}
                placeholder="Yes, we deliver daily between 7-9 AM…"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setResponding(null)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send response'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyInquiries;

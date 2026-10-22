import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../api/client';
import Modal from './Modal';
import Alert from './Alert';
import { Spinner } from './Spinner';

const InquiryModal = ({ open, onClose, entrepreneurId, serviceId, serviceTitle }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setMessage('');
    setError('');
    setSuccess('');
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (message.trim().length < 10) {
      setError('Please write at least 10 characters so the business can help.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/inquiries', {
        entrepreneur_id: entrepreneurId,
        service_id: serviceId || null,
        message,
      });
      setSuccess('Inquiry sent! The business will respond soon.');
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Send an inquiry"
      footer={
        <>
          <button type="button" onClick={handleClose} className="btn-secondary">
            Close
          </button>
          <button type="submit" form="inquiry-form" className="btn-primary" disabled={submitting}>
            {submitting ? <Spinner size={15} /> : <Send size={15} />}
            {submitting ? 'Sending…' : 'Send inquiry'}
          </button>
        </>
      }
    >
      {serviceTitle && (
        <p className="mb-4 rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800">
          Regarding: <span className="font-semibold">{serviceTitle}</span>
        </p>
      )}

      {error && (
        <div className="mb-4">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert variant="success" message={success} />
        </div>
      )}

      <form id="inquiry-form" onSubmit={handleSubmit}>
        <label htmlFor="inquiry-message" className="label">Your message</label>
        <textarea
          id="inquiry-message"
          rows={5}
          className="input resize-y"
          placeholder="Hi! I would like to know about availability, delivery areas and pricing…"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </form>
    </Modal>
  );
};

export default InquiryModal;

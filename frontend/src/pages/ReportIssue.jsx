import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Navigation, Send, Trash2 } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import { Spinner } from '../components/Spinner';
import { ISSUE_CATEGORIES } from '../utils/constants';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ReportIssue = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, GIF or WEBP).');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    setError('');
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    setPreview('');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        }));
        setLocating(false);
      },
      () => {
        setError('Could not read your location. Enter coordinates manually instead.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.category) {
      setError('Please choose the type of issue.');
      return;
    }
    if (form.description.trim().length < 10) {
      setError('Please describe the issue in at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('category', form.category);
      payload.append('description', form.description);
      payload.append('address', form.address);
      if (form.latitude) payload.append('latitude', form.latitude);
      if (form.longitude) payload.append('longitude', form.longitude);
      if (image) payload.append('image', image);

      await api.post('/issues', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Report submitted successfully. Track its progress under "My Issues".');
      setTimeout(() => navigate('/my-issues'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Report a damaged asset</h1>
        <p className="mt-2 text-slate-600">
          Provide clear details and a photo so the city authority can act quickly.
        </p>
      </div>

      {error && (
        <div className="mb-5">
          <Alert variant="error" message={error} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-5">
          <Alert variant="success" message={success} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div>
          <label htmlFor="category" className="label">What is damaged?</label>
          <select
            id="category"
            name="category"
            required
            className="input"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select a category…</option>
            {ISSUE_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="label">Describe the issue</label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="input resize-y"
            placeholder="e.g. Large pothole in the middle of the road near the bus stop, about 2 feet wide."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <span className="label">Photo evidence (optional)</span>
          {preview ? (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <img src={preview} alt="Selected issue" className="h-56 w-full object-cover" />
              <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
                <p className="truncate text-xs text-slate-500">{image?.name}</p>
                <button type="button" onClick={clearImage} className="btn-ghost text-xs">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-primary-400 hover:bg-primary-50">
              <Camera size={26} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Click to upload a photo</span>
              <span className="text-xs text-slate-400">JPG, PNG, GIF or WEBP · max 5 MB</span>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          )}
        </div>

        <div>
          <label htmlFor="address" className="label">Location description</label>
          <input
            id="address"
            name="address"
            className="input"
            placeholder="e.g. 42, Gandhi Street, Near Metro Station"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <span className="label">Coordinates (optional)</span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 gap-2">
              <input
                name="latitude"
                className="input"
                placeholder="Latitude"
                value={form.latitude}
                onChange={handleChange}
              />
              <input
                name="longitude"
                className="input"
                placeholder="Longitude"
                value={form.longitude}
                onChange={handleChange}
              />
            </div>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="btn-secondary shrink-0"
              disabled={locating}
            >
              {locating ? <Spinner size={15} /> : <Navigation size={15} />}
              {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPin size={12} /> Pinpointing the spot helps crews reach it faster.
          </p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? <Spinner size={16} /> : <Send size={16} />}
          {submitting ? 'Submitting report…' : 'Submit report'}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;


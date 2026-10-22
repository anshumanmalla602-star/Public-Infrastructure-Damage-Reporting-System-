import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Spinner } from '../components/Spinner';

const ROLE_OPTIONS = [
  {
    value: 'citizen',
    label: 'Citizen',
    description: 'Report damaged public infrastructure and track repairs.',
    icon: Users,
  },
  {
    value: 'entrepreneur',
    label: 'Entrepreneur',
    description: 'List your services and connect with local customers.',
    icon: Building2,
  },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      });
      navigate(user.role === 'entrepreneur' ? '/entrepreneur' : '/my-issues', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
          <UserPlus size={13} /> Join the community
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-800">Create your account</h1>
        <p className="mt-2 text-slate-600">
          Report public issues or showcase your women-led business.
        </p>
      </div>

      <div className="card mt-8 p-6">
        {error && (
          <div className="mb-5">
            <Alert variant="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset>
            <legend className="label">I am joining as</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                    form.role === value
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={form.role === value}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 shrink-0 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                      <Icon size={15} className="text-primary-600" />
                      {label}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className="label">Full name</label>
              <input
                id="full_name"
                name="full_name"
                required
                className="input"
                placeholder="Priya Sharma"
                value={form.full_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone (optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input"
                placeholder="9876543210"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="input"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <Spinner size={16} /> : <UserPlus size={16} />}
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


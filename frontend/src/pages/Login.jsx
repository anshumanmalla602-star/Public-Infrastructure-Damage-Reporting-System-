import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import { Spinner } from '../components/Spinner';

const DEMO_ACCOUNTS = [
  { role: 'Citizen', email: 'citizen@example.com', password: 'Admin@123' },
  { role: 'Entrepreneur', email: 'entrepreneur@example.com', password: 'Admin@123' },
  { role: 'Authority', email: 'authority@city.gov.in', password: 'Admin@123' },
  { role: 'Admin', email: 'admin@platform.com', password: 'Admin@123' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from?.pathname;
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        const home =
          user.role === 'admin'
            ? '/admin'
            : user.role === 'authority'
              ? '/authority/issues'
              : user.role === 'entrepreneur'
                ? '/entrepreneur'
                : '/my-issues';
        navigate(home, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (account) => {
    setForm({ email: account.email, password: account.password });
    setError('');
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:px-8">
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
          <Wrench size={13} /> Welcome back
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-800 sm:text-4xl">Sign in to CivicFix</h1>
        <p className="mt-3 max-w-md text-slate-600">
          Report damaged infrastructure, track repairs, or manage your women-led business —
          all from one account.
        </p>

       
      </div>

      <div className="w-full max-w-md">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-800">Account details</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue.</p>

          {error && (
            <div className="mt-4">
              <Alert variant="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? <Spinner size={16} /> : <LogIn size={16} />}
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

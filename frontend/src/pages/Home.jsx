import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Report with proof',
    description:
      'Pin the exact location and attach a photo so crews arrive at the right spot the first time.',
  },
  {
    icon: ClipboardList,
    title: 'Track every repair',
    description:
      'Follow your report from reported to assigned, in progress and finally resolved.',
  },
  {
    icon: Building2,
    title: 'Support local women-led businesses',
    description:
      'Discover approved home food, tailoring, beauty and handicraft businesses near you.',
  },
];

const STEPS = [
  { step: '01', title: 'Create an account', text: 'Sign up as a citizen, entrepreneur or authority.' },
  { step: '02', title: 'Report or list', text: 'Submit damage with photos, or publish your services.' },
  { step: '03', title: 'Get updates', text: 'Authorities triage reports; businesses reply to inquiries.' },
  { step: '04', title: 'See the impact', text: 'Track resolutions and grow your customer base.' },
];

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const primaryLink = () => {
    if (!isAuthenticated) return { to: '/register', label: 'Get started free' };
    if (user.role === 'admin') return { to: '/admin', label: 'Open dashboard' };
    if (user.role === 'authority') return { to: '/authority/issues', label: 'Manage issues' };
    if (user.role === 'entrepreneur') return { to: '/entrepreneur', label: 'Manage my business' };
    return { to: '/report', label: 'Report an issue' };
  };

  const link = primaryLink();

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <ShieldCheck size={13} /> Public infrastructure, made accountable
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Report damaged roads. Track the fix. Support women entrepreneurs.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              CivicFix connects citizens with city authorities to repair public infrastructure
              faster, and gives women-led local businesses a place to be found and hired.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={link.to}
                className="btn bg-white px-6 py-3 text-primary-700 hover:bg-primary-50 focus:ring-white"
              >
                {link.label}
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/marketplace"
                className="btn border border-white/40 px-6 py-3 text-white hover:bg-white/10 focus:ring-white"
              >
                <Search size={17} />
                Browse marketplace
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-6 backdrop-blur sm:p-8">
            <h2 className="text-lg font-semibold">What you can do here</h2>
            <ul className="mt-5 space-y-4">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-0.5 text-sm text-white/80">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">How it works</h2>
          <p className="mt-2 text-slate-600">Four simple steps to get started.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ step, title, text }) => (
            <div key={step} className="card p-6">
              <span className="text-3xl font-bold text-primary-100">{step}</span>
              <h3 className="mt-2 font-semibold text-slate-800">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">For city authorities</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Triage incoming reports by category and priority, assign ownership and publish
              status changes that citizens can see instantly. Every update is recorded in a
              permanent status history for accountability.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                'Filter and prioritise by status and category',
                'Set priority and record progress comments',
                'Mark repairs resolved with a timestamp',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-800">For women entrepreneurs</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Build a business profile, list your services with pricing and availability, and
              respond to customer inquiries. Profiles are reviewed by our admin team before they
              appear publicly, so every listing is trusted.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                'Reach customers actively searching for your service',
                'Manage your service catalogue and pricing',
                'Use startup guidance on licensing, pricing and marketing',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-slate-800 px-6 py-12 text-center sm:px-12">
          <Wrench size={34} className="mx-auto text-primary-300" />
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Ready to make your street safer?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Join thousands of citizens and local entrepreneurs using CivicFix to keep the city
            moving and support small businesses.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to={link.to} className="btn bg-white px-6 py-3 text-slate-800 hover:bg-slate-100">
              {link.label}
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/guidance"
              className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10"
            >
              Read the guidance
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

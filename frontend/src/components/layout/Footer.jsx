import { Link } from 'react-router-dom';
import { Wrench, Heart, ShoppingBag } from 'lucide-react';

const Footer = () => (
  <footer className="mt-auto border-t border-slate-200 bg-white">
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Wrench size={16} />
            </div>
            <p className="text-base font-bold text-slate-800">CivicFix</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            A unified platform for reporting public infrastructure damage and supporting
            women-led local enterprises.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800">Report Damage</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link to="/report" className="hover:text-primary-600">Submit a report</Link></li>
            <li><Link to="/my-issues" className="hover:text-primary-600">Track my issues</Link></li>
            <li><Link to="/guidance" className="hover:text-primary-600">Repair guidelines</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800">Marketplace</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li>
              <Link to="/marketplace" className="inline-flex items-center gap-1 hover:text-primary-600">
                <ShoppingBag size={13} /> Browse services
              </Link>
            </li>
            <li><Link to="/register" className="hover:text-primary-600">Register a business</Link></li>
            <li><Link to="/guidance" className="hover:text-primary-600">Startup guidance</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800">For Authorities</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link to="/login" className="hover:text-primary-600">Authority sign in</Link></li>
            <li><Link to="/login" className="hover:text-primary-600">Admin console</Link></li>
          </ul>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Heart size={12} className="text-accent-500" /> Built for community impact
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} CivicFix. Public Infrastructure Damage Reporting System.
      </div>
    </div>
  </footer>
);

export default Footer;

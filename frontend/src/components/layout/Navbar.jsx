import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingBag,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';

const CITIZEN_LINKS = [
  { to: '/report', label: 'Report Issue', icon: ClipboardList },
  { to: '/my-issues', label: 'My Issues', icon: Wrench },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

const ENTREPRENEUR_LINKS = [
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { to: '/entrepreneur', label: 'My Business', icon: Building2 },
  { to: '/my-inquiries', label: 'My Inquiries', icon: ClipboardList },
];

const AUTHORITY_LINKS = [
  { to: '/authority/issues', label: 'Manage Issues', icon: Wrench },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/profiles', label: 'Approvals', icon: ShieldCheck },
  { to: '/admin/content', label: 'Content', icon: ClipboardList },
  { to: '/admin/users', label: 'Users', icon: User },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];

const getLinks = (role) => {
  if (role === 'admin') return ADMIN_LINKS;
  if (role === 'authority') return AUTHORITY_LINKS;
  if (role === 'entrepreneur') return ENTREPRENEUR_LINKS;
  return CITIZEN_LINKS;
};

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-primary-50 text-primary-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const links = getLinks(user?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Wrench size={18} />
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-slate-800">CivicFix</p>
            <p className="hidden text-[11px] text-slate-500 sm:block">
              Report &middot; Track &middot; Support
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {isAuthenticated &&
            links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          {!isAuthenticated && (
            <>
              <NavLink to="/marketplace" className={linkClass}>
                <ShoppingBag size={16} />
                Marketplace
              </NavLink>
              <NavLink to="/guidance" className={linkClass}>
                Guidance
              </NavLink>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                <User size={15} className="text-slate-500" />
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-slate-700">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500">{ROLE_LABELS[user.role]}</p>
                </div>
              </div>
              <button type="button" onClick={handleLogout} className="btn-ghost">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {isAuthenticated &&
              links.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            {!isAuthenticated && (
              <>
                <NavLink to="/marketplace" className={linkClass} onClick={() => setOpen(false)}>
                  <ShoppingBag size={16} />
                  Marketplace
                </NavLink>
                <NavLink to="/guidance" className={linkClass} onClick={() => setOpen(false)}>
                  Guidance
                </NavLink>
              </>
            )}
          </nav>
          <div className="mt-3 border-t border-slate-200 pt-3">
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="btn-ghost w-full justify-start">
                <LogOut size={16} />
                Logout ({user.full_name})
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary flex-1" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export { Navbar };
export default Navbar;


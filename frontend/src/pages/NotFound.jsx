import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => (
  <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
    <p className="text-6xl font-bold text-primary-100">404</p>
    <h1 className="mt-4 text-2xl font-bold text-slate-800">Page not found</h1>
    <p className="mt-2 text-slate-600">
      The page you are looking for does not exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      <Home size={16} /> Back to home
    </Link>
  </div>
);

export default NotFound;

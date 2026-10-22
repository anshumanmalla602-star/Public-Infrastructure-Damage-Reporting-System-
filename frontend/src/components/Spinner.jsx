import { Loader2 } from 'lucide-react';

const Spinner = ({ size = 20, className = '' }) => (
  <Loader2 size={size} className={`animate-spin ${className}`} aria-hidden="true" />
);

const Loading = ({ label = 'Loading…', className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-12 text-slate-500 ${className}`}>
    <Spinner size={28} className="text-primary-600" />
    <p className="text-sm">{label}</p>
  </div>
);

export { Spinner, Loading };
export default Spinner;

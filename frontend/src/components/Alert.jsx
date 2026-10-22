import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

const VARIANTS = {
  error: {
    wrap: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
    iconClass: 'text-red-500',
  },
  success: {
    wrap: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    icon: CheckCircle,
    iconClass: 'text-emerald-500',
  },
  info: {
    wrap: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
    iconClass: 'text-blue-500',
  },
  warning: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: AlertCircle,
    iconClass: 'text-amber-500',
  },
};

const Alert = ({ variant = 'info', message, onClose }) => {
  if (!message) return null;
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm animate-fade-in ${config.wrap}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${config.iconClass}`} />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;

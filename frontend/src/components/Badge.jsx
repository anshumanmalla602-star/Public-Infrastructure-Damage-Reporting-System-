const Badge = ({ children, color = 'bg-slate-100 text-slate-700', className = '' }) => (
  <span className={`badge ${color} ${className}`}>{children}</span>
);

export default Badge;

export const ISSUE_CATEGORIES = [
  'Pothole',
  'Water Leak',
  'Streetlight',
  'Garbage Dump',
  'Broken Road',
  'Open Drain',
  'Water Supply',
  'Footpath Damage',
  'Traffic Signal',
  'Other',
];

export const ISSUE_STATUSES = [
  { value: 'reported', label: 'Reported', color: 'bg-slate-100 text-slate-700' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { value: 'resolved', label: 'Resolved', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-600' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
];

export const PROFILE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

export const INQUIRY_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'responded', label: 'Responded', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'closed', label: 'Closed', color: 'bg-slate-100 text-slate-600' },
];

export const COMPLAINT_STATUSES = ['open', 'in_progress', 'closed'];

export const ROLE_LABELS = {
  citizen: 'Citizen',
  entrepreneur: 'Entrepreneur',
  authority: 'City Authority',
  admin: 'Administrator',
};

export const getStatusMeta = (list, value) =>
  list.find((item) => item.value === value) || { label: value, color: 'bg-slate-100 text-slate-700' };

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

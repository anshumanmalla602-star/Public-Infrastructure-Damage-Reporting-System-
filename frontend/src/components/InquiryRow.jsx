import { MessageSquare } from 'lucide-react';
import Badge from './Badge';
import { formatDateTime, getStatusMeta, INQUIRY_STATUSES } from '../utils/constants';

const InquiryRow = ({ inquiry, type, onRespond }) => (
  <div className="card p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-slate-800">
          {type === 'received'
            ? inquiry.customer_name || 'Customer'
            : inquiry.business_name || 'Business'}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {inquiry.service_title && `${inquiry.service_title} · `}
          {formatDateTime(inquiry.created_at)}
        </p>
      </div>
      <Badge color={getStatusMeta(INQUIRY_STATUSES, inquiry.status).color}>
        {getStatusMeta(INQUIRY_STATUSES, inquiry.status).label}
      </Badge>
    </div>

    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
      {inquiry.message}
    </p>

    {inquiry.response && (
      <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <p className="text-xs font-semibold text-emerald-800">Response</p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-900">{inquiry.response}</p>
      </div>
    )}

    {type === 'received' && (
      <button type="button" onClick={() => onRespond(inquiry)} className="btn-secondary mt-3 text-xs">
        <MessageSquare size={13} /> {inquiry.response ? 'Update response' : 'Respond'}
      </button>
    )}
  </div>
);

export default InquiryRow;

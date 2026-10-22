import { Calendar, MapPin, User } from 'lucide-react';
import Badge from './Badge';
import { formatDate, getStatusMeta, ISSUE_STATUSES, PRIORITIES } from '../utils/constants';

const IssueCard = ({ issue, showReporter = false }) => {
  const status = getStatusMeta(ISSUE_STATUSES, issue.status);
  const priority = getStatusMeta(PRIORITIES, issue.priority);

  return (
    <div className="card overflow-hidden transition hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        {issue.image_url && (
          <div className="h-40 shrink-0 bg-slate-100 sm:h-auto sm:w-44">
            <img
              src={issue.image_url}
              alt={issue.category}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={status.color}>{status.label}</Badge>
            <Badge color={priority.color}>{priority.label} priority</Badge>
            <Badge color="bg-primary-50 text-primary-700">{issue.category}</Badge>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-700">
            {issue.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} /> {formatDate(issue.created_at)}
            </span>
            {issue.address && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {issue.address}
              </span>
            )}
            {showReporter && issue.reporter_name && (
              <span className="inline-flex items-center gap-1">
                <User size={12} /> {issue.reporter_name}
              </span>
            )}
            {issue.assigned_name && (
              <span className="inline-flex items-center gap-1">
                <User size={12} /> Assigned to {issue.assigned_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;

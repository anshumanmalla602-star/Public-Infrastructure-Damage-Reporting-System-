import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
      <Icon size={26} className="text-slate-400" />
    </div>
    <h3 className="text-base font-semibold text-slate-700">{title}</h3>
    {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
    {action}
  </div>
);

export default EmptyState;

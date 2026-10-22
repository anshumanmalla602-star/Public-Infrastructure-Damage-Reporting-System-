import Modal from './Modal';
import { Spinner } from './Spinner';
import { ISSUE_STATUSES, PRIORITIES } from '../utils/constants';

const StatusModal = ({ open, onClose, issue, update, onChange, onSubmit, submitting }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Update issue status"
    footer={
      <>
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" form="status-form" className="btn-primary" disabled={submitting}>
          {submitting ? <Spinner size={15} /> : null}
          Save update
        </button>
      </>
    }
  >
    {issue && (
      <form id="status-form" onSubmit={onSubmit} className="space-y-4">
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{issue.description}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new_status" className="label">Status</label>
            <select
              id="new_status"
              className="input"
              value={update.status}
              onChange={(event) => onChange({ status: event.target.value })}
            >
              {ISSUE_STATUSES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new_priority" className="label">Priority</label>
            <select
              id="new_priority"
              className="input"
              value={update.priority}
              onChange={(event) => onChange({ priority: event.target.value })}
            >
              {PRIORITIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="label">Comment (optional)</label>
          <textarea
            id="comment"
            rows={3}
            className="input resize-y"
            placeholder="Crew assigned, work expected within 48 hours."
            value={update.comment}
            onChange={(event) => onChange({ comment: event.target.value })}
          />
        </div>
      </form>
    )}
  </Modal>
);

export default StatusModal;

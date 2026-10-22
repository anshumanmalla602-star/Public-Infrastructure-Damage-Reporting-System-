import Modal from './Modal';
import { Spinner } from './Spinner';

const ServiceModal = ({ open, onClose, form, categories, onChange, onSubmit, submitting }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Add a service"
    footer={
      <>
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" form="service-form" className="btn-primary" disabled={submitting}>
          {submitting ? <Spinner size={15} /> : null}
          Add service
        </button>
      </>
    }
  >
    <form id="service-form" onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="label">Service title</label>
        <input
          id="title"
          name="title"
          required
          className="input"
          placeholder="e.g. Veg Thali (Full Day)"
          value={form.title}
          onChange={onChange}
        />
      </div>
      <div>
        <label htmlFor="service_description" className="label">Description</label>
        <textarea
          id="service_description"
          name="description"
          rows={3}
          className="input resize-y"
          value={form.description}
          onChange={onChange}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price" className="label">Price (₹)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            className="input"
            value={form.price}
            onChange={onChange}
          />
        </div>
        <div>
          <label htmlFor="service_category" className="label">Category</label>
          <select
            id="service_category"
            name="category"
            className="input"
            value={form.category}
            onChange={onChange}
          >
            <option value="">Select…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="service_availability" className="label">Availability</label>
          <input
            id="service_availability"
            name="availability"
            className="input"
            placeholder="Morning"
            value={form.availability}
            onChange={onChange}
          />
        </div>
      </div>
    </form>
  </Modal>
);

export default ServiceModal;

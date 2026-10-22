import Modal from './Modal';
import { Spinner } from './Spinner';

const ProfileModal = ({ open, onClose, form, categories, onChange, onSubmit, submitting, isEdit }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={isEdit ? 'Edit business profile' : 'Create business profile'}
    size="lg"
    footer={
      <>
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" form="profile-form" className="btn-primary" disabled={submitting}>
          {submitting ? <Spinner size={15} /> : null}
          {isEdit ? 'Save changes' : 'Submit for approval'}
        </button>
      </>
    }
  >
    <form id="profile-form" onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="business_name" className="label">Business name</label>
        <input
          id="business_name"
          name="business_name"
          required
          className="input"
          value={form.business_name}
          onChange={onChange}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category_id" className="label">Category</label>
          <select
            id="category_id"
            name="category_id"
            className="input"
            value={form.category_id}
            onChange={onChange}
          >
            <option value="">Select category…</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="phone" className="label">Contact phone</label>
          <input
            id="phone"
            name="phone"
            className="input"
            value={form.phone}
            onChange={onChange}
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="label">About your business</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input resize-y"
          value={form.description}
          onChange={onChange}
        />
      </div>
      <div>
        <label htmlFor="address" className="label">Address</label>
        <input
          id="address"
          name="address"
          className="input"
          value={form.address}
          onChange={onChange}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="label">City</label>
          <input id="city" name="city" className="input" value={form.city} onChange={onChange} />
        </div>
        <div>
          <label htmlFor="state" className="label">State</label>
          <input id="state" name="state" className="input" value={form.state} onChange={onChange} />
        </div>
        <div>
          <label htmlFor="pincode" className="label">Pincode</label>
          <input
            id="pincode"
            name="pincode"
            className="input"
            value={form.pincode}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pricing_info" className="label">Pricing info</label>
          <input
            id="pricing_info"
            name="pricing_info"
            className="input"
            placeholder="₹150 per meal, monthly plans available"
            value={form.pricing_info}
            onChange={onChange}
          />
        </div>
        <div>
          <label htmlFor="availability" className="label">Availability</label>
          <input
            id="availability"
            name="availability"
            className="input"
            placeholder="Mon-Sat, 7 AM to 9 PM"
            value={form.availability}
            onChange={onChange}
          />
        </div>
      </div>
      <div>
        <label htmlFor="license_info" className="label">License information</label>
        <input
          id="license_info"
          name="license_info"
          className="input"
          placeholder="FSSAI licence number"
          value={form.license_info}
          onChange={onChange}
        />
      </div>
    </form>
  </Modal>
);

export default ProfileModal;

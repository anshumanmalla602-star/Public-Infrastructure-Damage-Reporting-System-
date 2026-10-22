const pool = require('../config/database');

exports.createService = async (req, res) => {
  try {
    const profile = await pool.query(
      'SELECT id FROM entrepreneur_profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (profile.rows.length === 0) {
      return res.status(400).json({ message: 'Create a business profile first' });
    }

    const { title, description, price, category, availability } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO services (entrepreneur_id, title, description, price, category, availability, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [profile.rows[0].id, title, description, price, category, availability, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyServices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.* FROM services s
       JOIN entrepreneur_profiles ep ON s.entrepreneur_id = ep.id
       WHERE ep.user_id = $1 ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const { category, city, availability, search, page = 1, limit = 12 } = req.query;
    let query = `SELECT s.*, ep.business_name, ep.city, ep.state, ep.profile_image as business_image,
                        u.full_name as owner_name, ep.status as business_status
                 FROM services s
                 JOIN entrepreneur_profiles ep ON s.entrepreneur_id = ep.id
                 JOIN users u ON ep.user_id = u.id
                 WHERE ep.status = 'approved' AND s.is_active = TRUE`;
    const params = [];
    let count = 0;

    if (category) { count++; query += ` AND s.category = $${count}`; params.push(category); }
    if (city) { count++; query += ` AND LOWER(ep.city) = LOWER($${count})`; params.push(city); }
    if (availability) { count++; query += ` AND s.availability ILIKE $${count}`; params.push(`%${availability}%`); }
    if (search) {
      count++;
      query += ` AND (s.title ILIKE $${count} OR s.description ILIKE $${count} OR ep.business_name ILIKE $${count})`;
      params.push(`%${search}%`);
    }

    const offset = (page - 1) * limit;
    count++; query += ` LIMIT $${count}`; params.push(limit);
    count++; query += ` OFFSET $${count}`; params.push(offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, ep.business_name, ep.city, ep.state, ep.description as business_description,
              ep.profile_image as business_image, u.full_name as owner_name, u.phone as owner_phone
       FROM services s
       JOIN entrepreneur_profiles ep ON s.entrepreneur_id = ep.id
       JOIN users u ON ep.user_id = u.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const profile = await pool.query('SELECT id FROM entrepreneur_profiles WHERE user_id = $1', [req.user.id]);
    if (profile.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const { title, description, price, category, availability, is_active } = req.body;
    const result = await pool.query(
      `UPDATE services SET title = COALESCE($1,title), description = COALESCE($2,description),
        price = COALESCE($3,price), category = COALESCE($4,category),
        availability = COALESCE($5,availability), is_active = COALESCE($6,is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND entrepreneur_id = $8 RETURNING *`,
      [title, description, price, category, availability, is_active, req.params.id, profile.rows[0].id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const profile = await pool.query('SELECT id FROM entrepreneur_profiles WHERE user_id = $1', [req.user.id]);
    if (profile.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 AND entrepreneur_id = $2 RETURNING *',
      [req.params.id, profile.rows[0].id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const pool = require('../config/database');

// --- Categories (admin managed) ---
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM business_categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO business_categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Category already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;
    const result = await pool.query(
      `UPDATE business_categories SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        is_active = COALESCE($3, is_active)
       WHERE id = $4 RETURNING *`,
      [name, description, is_active, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM business_categories WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Entrepreneur profile approval ---
exports.getPendingProfiles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ep.*, bc.name as category_name, u.full_name, u.email, u.phone as user_phone
       FROM entrepreneur_profiles ep
       LEFT JOIN business_categories bc ON ep.category_id = bc.id
       LEFT JOIN users u ON ep.user_id = u.id
       WHERE ep.status = 'pending' ORDER BY ep.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT ep.*, bc.name as category_name, u.full_name, u.email
       FROM entrepreneur_profiles ep
       LEFT JOIN business_categories bc ON ep.category_id = bc.id
       LEFT JOIN users u ON ep.user_id = u.id`;
    const params = [];
    if (status) {
      params.push(status);
      query += ' WHERE ep.status = $1';
    }
    query += ' ORDER BY ep.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfileStatus = async (req, res) => {
  try {
    const { status, rejection_reason } = req.body;
    const valid = ['pending', 'approved', 'rejected'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const result = await pool.query(
      'UPDATE entrepreneur_profiles SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
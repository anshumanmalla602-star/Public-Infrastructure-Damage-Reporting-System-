const pool = require('../config/database');

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM business_categories WHERE is_active = TRUE ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const {
      business_name, category_id, description, address, city, state, pincode,
      phone, pricing_info, availability, license_info, cost_estimation,
      profit_planning, marketing_tips
    } = req.body;

    const existing = await pool.query(
      'SELECT id FROM entrepreneur_profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO entrepreneur_profiles
       (user_id, business_name, category_id, description, address, city, state, pincode,
        phone, pricing_info, availability, license_info, cost_estimation, profit_planning,
        marketing_tips, profile_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [req.user.id, business_name, category_id, description, address, city, state, pincode,
       phone, pricing_info, availability, license_info, cost_estimation, profit_planning,
       marketing_tips, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ep.*, bc.name as category_name FROM entrepreneur_profiles ep
       LEFT JOIN business_categories bc ON ep.category_id = bc.id
       WHERE ep.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No business profile found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fields = ['business_name', 'category_id', 'description', 'address', 'city', 'state',
      'pincode', 'phone', 'pricing_info', 'availability', 'license_info', 'cost_estimation',
      'profit_planning', 'marketing_tips'];
    const updates = [];
    const values = [];
    let count = 0;

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        count++;
        updates.push(`${f} = $${count}`);
        values.push(req.body[f]);
      }
    });

    if (req.file) {
      count++;
      updates.push(`profile_image = $${count}`);
      values.push(`/uploads/${req.file.filename}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    count++;
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    await pool.query(
      `UPDATE entrepreneur_profiles SET ${updates.join(', ')} WHERE user_id = $${count}`,
      values
    );

    const result = await pool.query(
      `SELECT ep.*, bc.name as category_name FROM entrepreneur_profiles ep
       LEFT JOIN business_categories bc ON ep.category_id = bc.id WHERE ep.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
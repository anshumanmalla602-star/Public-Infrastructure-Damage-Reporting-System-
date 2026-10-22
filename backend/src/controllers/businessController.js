const pool = require('../config/database');

exports.getApprovedBusinesses = async (req, res) => {
  try {
    const { city, category, search, page = 1, limit = 12 } = req.query;
    let query = `SELECT ep.*, bc.name as category_name, u.full_name, u.email, u.phone
                 FROM entrepreneur_profiles ep
                 LEFT JOIN business_categories bc ON ep.category_id = bc.id
                 JOIN users u ON ep.user_id = u.id
                 WHERE ep.status = 'approved'`;
    const params = [];
    let count = 0;

    if (city) { count++; query += ` AND LOWER(ep.city) = LOWER($${count})`; params.push(city); }
    if (category) {
      count++;
      query += ` AND bc.name = $${count}`;
      params.push(category);
    }
    if (search) {
      count++;
      query += ` AND (ep.business_name ILIKE $${count} OR ep.description ILIKE $${count})`;
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

exports.getBusinessById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ep.*, bc.name as category_name, u.full_name, u.email, u.phone, u.id as user_id
       FROM entrepreneur_profiles ep
       LEFT JOIN business_categories bc ON ep.category_id = bc.id
       JOIN users u ON ep.user_id = u.id
       WHERE ep.id = $1 AND ep.status = 'approved'`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBusinessServices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.* FROM services s
       JOIN entrepreneur_profiles ep ON s.entrepreneur_id = ep.id
       WHERE ep.id = $1 AND ep.status = 'approved' AND s.is_active = TRUE
       ORDER BY s.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCities = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT city FROM entrepreneur_profiles WHERE status = 'approved' AND city IS NOT NULL ORDER BY city`
    );
    res.json(result.rows.map((r) => r.city));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
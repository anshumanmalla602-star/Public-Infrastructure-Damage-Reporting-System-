const pool = require('../config/database');

exports.createInquiry = async (req, res) => {
  try {
    const { entrepreneur_id, service_id, message } = req.body;
    const result = await pool.query(
      `INSERT INTO inquiries (customer_id, entrepreneur_id, service_id, message)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, entrepreneur_id, service_id, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, ep.business_name, u.full_name as customer_name
       FROM inquiries i
       JOIN entrepreneur_profiles ep ON i.entrepreneur_id = ep.id
       JOIN users u ON i.customer_id = u.id
       WHERE i.customer_id = $1 ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReceivedInquiries = async (req, res) => {
  try {
    const profile = await pool.query('SELECT id FROM entrepreneur_profiles WHERE user_id = $1', [req.user.id]);
    if (profile.rows.length === 0) {
      return res.json([]);
    }
    const result = await pool.query(
      `SELECT i.*, u.full_name as customer_name, s.title as service_title
       FROM inquiries i
       JOIN users u ON i.customer_id = u.id
       LEFT JOIN services s ON i.service_id = s.id
       WHERE i.entrepreneur_id = $1 ORDER BY i.created_at DESC`,
      [profile.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondToInquiry = async (req, res) => {
  try {
    const { status, response } = req.body;
    const profile = await pool.query('SELECT id FROM entrepreneur_profiles WHERE user_id = $1', [req.user.id]);
    if (profile.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const result = await pool.query(
      `UPDATE inquiries SET status = COALESCE($1, status),
        response = COALESCE($2, response), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND entrepreneur_id = $4 RETURNING *`,
      [status, response, req.params.id, profile.rows[0].id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
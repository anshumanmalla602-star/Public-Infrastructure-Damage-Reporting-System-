const pool = require('../config/database');

// --- Learning / guidance content ---
exports.getContent = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `SELECT c.*, u.full_name as author FROM admin_content c
                 LEFT JOIN users u ON c.created_by = u.id WHERE c.is_published = TRUE`;
    const params = [];
    if (category) {
      params.push(category);
      query += ' AND c.category = $1';
    }
    query += ' ORDER BY c.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllContent = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.full_name as author FROM admin_content c
       LEFT JOIN users u ON c.created_by = u.id ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createContent = async (req, res) => {
  try {
    const { title, content, category, is_published } = req.body;
    const result = await pool.query(
      `INSERT INTO admin_content (title, content, category, is_published, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [title, content, category, is_published !== false, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { title, content, category, is_published } = req.body;
    const result = await pool.query(
      `UPDATE admin_content SET title = COALESCE($1,title), content = COALESCE($2,content),
        category = COALESCE($3,category), is_published = COALESCE($4,is_published),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [title, content, category, is_published, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM admin_content WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({ message: 'Content deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- Complaints ---
exports.getComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT c.*, u.full_name, u.email FROM complaints c
                 JOIN users u ON c.user_id = u.id`;
    const params = [];
    if (status) {
      params.push(status);
      query += ' WHERE c.status = $1';
    }
    query += ' ORDER BY c.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await pool.query(
      'INSERT INTO complaints (user_id, title, description) VALUES ($1,$2,$3) RETURNING *',
      [req.user.id, title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
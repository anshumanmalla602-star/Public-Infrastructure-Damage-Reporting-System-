const pool = require('../config/database');

exports.createIssue = async (req, res) => {
  try {
    const { category, description, latitude, longitude, address } = req.body;
    const reporter_id = req.user.id;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO issues (reporter_id, category, description, latitude, longitude, address, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [reporter_id, category, description, latitude, longitude, address, image_url]
    );

    await pool.query(
      `INSERT INTO issue_status_history (issue_id, status, changed_by) VALUES ($1, $2, $3)`,
      [result.rows[0].id, 'reported', reporter_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    let query = `SELECT i.*, u.full_name as reporter_name FROM issues i LEFT JOIN users u ON i.reporter_id = u.id WHERE 1=1`;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getIssueById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.full_name as reporter_name, a.full_name as assigned_name 
       FROM issues i 
       LEFT JOIN users u ON i.reporter_id = u.id 
       LEFT JOIN users a ON i.assigned_to = a.id 
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const { status, priority, assigned_to, comment } = req.body;
    const issueId = req.params.id;
    const userId = req.user.id;

    const VALID_STATUSES = ['reported', 'in_progress', 'assigned', 'resolved', 'rejected'];
    const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }

    const issue = await pool.query('SELECT * FROM issues WHERE id = $1', [issueId]);
    if (issue.rows.length === 0) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
    }
    if (priority) {
      paramCount++;
      updateFields.push(`priority = $${paramCount}`);
      updateValues.push(priority);
    }
    if (assigned_to) {
      paramCount++;
      updateFields.push(`assigned_to = $${paramCount}`);
      updateValues.push(assigned_to);
    }
    // Set resolved_at when moving to resolved; clear it if reopened
    if (status === 'resolved') {
      updateFields.push('resolved_at = CURRENT_TIMESTAMP');
    } else if (status && issue.rows[0].status === 'resolved') {
      updateFields.push('resolved_at = NULL');
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    paramCount++;
    updateValues.push(issueId);

    await pool.query(
      `UPDATE issues SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
      updateValues
    );

    if (status) {
      await pool.query(
        `INSERT INTO issue_status_history (issue_id, status, changed_by, comment) VALUES ($1, $2, $3, $4)`,
        [issueId, status, userId, comment || null]
      );
    }

    const result = await pool.query(
      `SELECT i.*, u.full_name as reporter_name, a.full_name as assigned_name FROM issues i
       LEFT JOIN users u ON i.reporter_id = u.id
       LEFT JOIN users a ON i.assigned_to = a.id WHERE i.id = $1`,
      [issueId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyIssues = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM issues WHERE reporter_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
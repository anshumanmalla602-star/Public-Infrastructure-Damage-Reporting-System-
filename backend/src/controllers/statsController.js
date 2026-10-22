const pool = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    const [users, issues, resolved, businesses, services, inquiries, pending] = await Promise.all([
      pool.query('SELECT COUNT(*)::int as c FROM users'),
      pool.query('SELECT COUNT(*)::int as c FROM issues'),
      pool.query(`SELECT COUNT(*)::int as c FROM issues WHERE status = 'resolved'`),
      pool.query(`SELECT COUNT(*)::int as c FROM entrepreneur_profiles WHERE status = 'approved'`),
      pool.query('SELECT COUNT(*)::int as c FROM services'),
      pool.query('SELECT COUNT(*)::int as c FROM inquiries'),
      pool.query(`SELECT COUNT(*)::int as c FROM entrepreneur_profiles WHERE status = 'pending'`),
    ]);

    const avgResolution = await pool.query(
      `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))), 0)::int as avg_seconds
       FROM issues WHERE status = 'resolved'`
    );

    const byStatus = await pool.query(
      'SELECT status, COUNT(*)::int as count FROM issues GROUP BY status'
    );

    const byCategory = await pool.query(
      'SELECT category, COUNT(*)::int as count FROM issues GROUP BY category ORDER BY count DESC'
    );

    const monthly = await pool.query(
      `SELECT TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') as month, COUNT(*)::int as count
       FROM issues WHERE created_at > NOW() - INTERVAL '6 months'
       GROUP BY 1 ORDER BY 1`
    );

    res.json({
      totalUsers: users.rows[0].c,
      totalIssues: issues.rows[0].c,
      resolvedIssues: resolved.rows[0].c,
      approvedBusinesses: businesses.rows[0].c,
      pendingBusinesses: pending.rows[0].c,
      totalServices: services.rows[0].c,
      totalInquiries: inquiries.rows[0].c,
      avgResolutionSeconds: avgResolution.rows[0].avg_seconds,
      issuesByStatus: byStatus.rows,
      issuesByCategory: byCategory.rows,
      issuesByMonth: monthly.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, phone, role, is_verified, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
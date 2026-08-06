const { query } = require('../config/db');

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, user_id = '', action = '', table_name = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;
    if (user_id) { conditions.push(`al.user_id = $${p++}`); params.push(user_id); }
    if (action) { conditions.push(`al.action ILIKE $${p++}`); params.push(`%${action}%`); }
    if (table_name) { conditions.push(`al.table_name = $${p++}`); params.push(table_name); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params);
    const result = await query(
      `SELECT al.*, CONCAT(u.first_name,' ',u.last_name) as user_name, u.email as user_email
       FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id
       ${where} ORDER BY al.created_at DESC LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, logs: result.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)) } });
  } catch (err) { next(err); }
};

module.exports = { getAuditLogs };

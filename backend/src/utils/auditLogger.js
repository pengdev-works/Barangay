const { query } = require('../config/db');

const logAudit = async ({ userId, action, tableName, recordId, oldValues, newValues, req }) => {
  try {
    let ip = req ? (req.ip || req.connection?.remoteAddress || null) : null;
    if (ip) {
      if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
      if (ip === 'localhost' || ip === '::1') ip = '127.0.0.1';
    }

    await query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId || null,
        action,
        tableName || null,
        recordId || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ip,
        req ? req.get('User-Agent') : null,
      ]
    );
  } catch (err) {
    console.error('Audit log warning:', err.message);
    // Non-blocking
  }
};

module.exports = { logAudit };

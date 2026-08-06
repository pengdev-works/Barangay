const { query } = require('../config/db');

const logAudit = async ({ userId, action, tableName, recordId, oldValues, newValues, req }) => {
  try {
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
        req ? (req.ip || req.connection.remoteAddress) : null,
        req ? req.get('User-Agent') : null,
      ]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
    // Non-blocking — don't throw
  }
};

module.exports = { logAudit };

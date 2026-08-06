const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const getAssistance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '', type = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;
    if (status) { conditions.push(`ar.status = $${p++}`); params.push(status); }
    if (type) { conditions.push(`ar.assistance_type = $${p++}`); params.push(type); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await query(`SELECT COUNT(*) FROM assistance_requests ar ${where}`, params);
    const result = await query(
      `SELECT ar.*, CONCAT(r.first_name,' ',r.last_name) as resident_name, r.address as resident_address,
              CONCAT(u.first_name,' ',u.last_name) as reviewed_by_name
       FROM assistance_requests ar
       LEFT JOIN residents r ON ar.resident_id = r.id
       LEFT JOIN users u ON ar.reviewed_by = u.id
       ${where} ORDER BY ar.created_at DESC LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, requests: result.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const createAssistance = async (req, res, next) => {
  try {
    const { resident_id, assistance_type, description, amount_requested } = req.body;
    const docs = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const result = await query(
      `INSERT INTO assistance_requests (resident_id, assistance_type, description, amount_requested, supporting_documents) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [resident_id, assistance_type, description, amount_requested || null, JSON.stringify(docs)]
    );
    await logAudit({ userId: req.user.id, action: 'CREATE_ASSISTANCE_REQUEST', tableName: 'assistance_requests', recordId: result.rows[0].id, newValues: result.rows[0], req });
    res.status(201).json({ success: true, message: 'Assistance request submitted', request: result.rows[0] });
  } catch (err) { next(err); }
};

const updateAssistanceStatus = async (req, res, next) => {
  try {
    const { status, remarks, amount_approved } = req.body;
    const old = await query('SELECT * FROM assistance_requests WHERE id = $1', [req.params.id]);
    if (!old.rows[0]) return res.status(404).json({ success: false, message: 'Request not found' });

    const result = await query(
      `UPDATE assistance_requests SET status=$1, remarks=$2, amount_approved=$3, reviewed_by=$4, reviewed_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *`,
      [status, remarks || null, amount_approved || null, req.user.id, req.params.id]
    );
    await logAudit({ userId: req.user.id, action: 'UPDATE_ASSISTANCE_STATUS', tableName: 'assistance_requests', recordId: req.params.id, oldValues: old.rows[0], newValues: result.rows[0], req });
    res.json({ success: true, message: 'Assistance request updated', request: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAssistance, createAssistance, updateAssistanceStatus };

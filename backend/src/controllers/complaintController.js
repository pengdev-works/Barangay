const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const getComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', category = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;

    if (search) { conditions.push(`(c.title ILIKE $${p} OR c.description ILIKE $${p})`); params.push(`%${search}%`); p++; }
    if (status) { conditions.push(`c.status = $${p++}`); params.push(status); }
    if (category) { conditions.push(`c.category = $${p++}`); params.push(category); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await query(`SELECT COUNT(*) FROM complaints c ${where}`, params);
    const result = await query(
      `SELECT c.*,
              CONCAT(r.first_name,' ',r.last_name) as complainant_name,
              CONCAT(a.first_name,' ',a.last_name) as assigned_to_name
       FROM complaints c
       LEFT JOIN residents r ON c.complainant_id = r.id
       LEFT JOIN users a ON c.assigned_to = a.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, complaints: result.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const createComplaint = async (req, res, next) => {
  try {
    const { complainant_id, title, description, category, location, incident_date } = req.body;
    const evidence_urls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const result = await query(
      `INSERT INTO complaints (complainant_id, reported_by, title, description, category, location, incident_date, evidence_urls)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [complainant_id || null, req.user.id, title, description, category || 'Other', location || null, incident_date || null, JSON.stringify(evidence_urls)]
    );

    await logAudit({ userId: req.user.id, action: 'CREATE_COMPLAINT', tableName: 'complaints', recordId: result.rows[0].id, newValues: result.rows[0], req });
    res.status(201).json({ success: true, message: 'Complaint filed successfully', complaint: result.rows[0] });
  } catch (err) { next(err); }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes, assigned_to } = req.body;

    const old = await query('SELECT * FROM complaints WHERE id = $1', [id]);
    if (!old.rows[0]) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const resolvedAt = (status === 'Resolved' || status === 'Closed') ? 'CURRENT_TIMESTAMP' : 'NULL';
    const result = await query(
      `UPDATE complaints SET status=$1, resolution_notes=$2, assigned_to=$3, resolved_at=${resolvedAt}, updated_at=CURRENT_TIMESTAMP WHERE id=$4 RETURNING *`,
      [status, resolution_notes || null, assigned_to || null, id]
    );

    await logAudit({ userId: req.user.id, action: 'UPDATE_COMPLAINT_STATUS', tableName: 'complaints', recordId: id, oldValues: old.rows[0], newValues: result.rows[0], req });
    res.json({ success: true, message: 'Complaint updated', complaint: result.rows[0] });
  } catch (err) { next(err); }
};

const deleteComplaint = async (req, res, next) => {
  try {
    await query('DELETE FROM complaints WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) { next(err); }
};

module.exports = { getComplaints, createComplaint, updateComplaintStatus, deleteComplaint };

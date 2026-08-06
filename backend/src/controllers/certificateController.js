const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const getCertificates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', type = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;

    if (search) {
      conditions.push(`(r.first_name ILIKE $${p} OR r.last_name ILIKE $${p})`);
      params.push(`%${search}%`); p++;
    }
    if (status) { conditions.push(`cr.status = $${p++}`); params.push(status); }
    if (type) { conditions.push(`cr.certificate_type = $${p++}`); params.push(type); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await query(`SELECT COUNT(*) FROM certificate_requests cr LEFT JOIN residents r ON cr.resident_id = r.id ${where}`, params);

    const result = await query(
      `SELECT cr.*,
              CONCAT(r.first_name,' ',r.last_name) as resident_name, r.address as resident_address,
              CONCAT(u.first_name,' ',u.last_name) as requested_by_name,
              CONCAT(a.first_name,' ',a.last_name) as approved_by_name
       FROM certificate_requests cr
       LEFT JOIN residents r ON cr.resident_id = r.id
       LEFT JOIN users u ON cr.requested_by = u.id
       LEFT JOIN users a ON cr.approved_by = a.id
       ${where}
       ORDER BY cr.created_at DESC
       LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      certificates: result.rows,
      pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};

const createCertificate = async (req, res, next) => {
  try {
    const { resident_id, certificate_type, purpose, amount } = req.body;
    const result = await query(
      `INSERT INTO certificate_requests (resident_id, requested_by, certificate_type, purpose, amount)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [resident_id, req.user.id, certificate_type, purpose || null, amount || 50]
    );

    // Notify staff
    await query(
      `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
       SELECT u.id, 'New Certificate Request', $1, 'info', 'certificate_request', $2
       FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name IN ('Barangay Staff','Barangay Captain','Super Admin')`,
      [`A new ${certificate_type} request has been submitted.`, result.rows[0].id]
    );

    await logAudit({ userId: req.user.id, action: 'CREATE_CERTIFICATE_REQUEST', tableName: 'certificate_requests', recordId: result.rows[0].id, newValues: result.rows[0], req });
    res.status(201).json({ success: true, message: 'Certificate request submitted', certificate: result.rows[0] });
  } catch (err) { next(err); }
};

const updateCertificateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks, or_number, amount } = req.body;

    const old = await query('SELECT * FROM certificate_requests WHERE id = $1', [id]);
    if (!old.rows[0]) return res.status(404).json({ success: false, message: 'Request not found' });

    let queryText = `UPDATE certificate_requests SET status=$1, remarks=$2, updated_at=CURRENT_TIMESTAMP`;
    const params = [status, remarks || null];
    let p = 3;

    if (status === 'Approved') {
      queryText += `, approved_by=$${p++}, approved_at=CURRENT_TIMESTAMP`;
      params.push(req.user.id);
    }
    if (status === 'Released') {
      queryText += `, released_at=CURRENT_TIMESTAMP`;
      if (or_number) { queryText += `, or_number=$${p++}`; params.push(or_number); }
      if (amount) { queryText += `, amount=$${p++}`; params.push(amount); }
    }

    queryText += ` WHERE id=$${p} RETURNING *`;
    params.push(id);

    const result = await query(queryText, params);

    // Notify resident if they have a user account
    const residentUser = await query(
      `SELECT u.id FROM users u JOIN residents r ON u.email = r.email WHERE r.id = $1`,
      [old.rows[0].resident_id]
    );
    if (residentUser.rows[0]) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id) VALUES ($1,$2,$3,$4,$5,$6)`,
        [residentUser.rows[0].id, 'Certificate Request Update', `Your ${old.rows[0].certificate_type} request is now ${status}.`, status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'info', 'certificate_request', id]
      );
    }

    await logAudit({ userId: req.user.id, action: `UPDATE_CERTIFICATE_STATUS_${status.toUpperCase()}`, tableName: 'certificate_requests', recordId: id, oldValues: old.rows[0], newValues: result.rows[0], req });
    res.json({ success: true, message: `Request ${status.toLowerCase()} successfully`, certificate: result.rows[0] });
  } catch (err) { next(err); }
};

const deleteCertificate = async (req, res, next) => {
  try {
    await query('DELETE FROM certificate_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Certificate request deleted' });
  } catch (err) { next(err); }
};

module.exports = { getCertificates, createCertificate, updateCertificateStatus, deleteCertificate };

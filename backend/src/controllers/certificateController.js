const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { sendSMS } = require('../utils/smsService');

const getCertificates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', type = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;

    if (req.user.role_name === 'Resident') {
      conditions.push(`(cr.requested_by = $${p} OR cr.resident_id IN (SELECT id FROM residents WHERE email = $${p + 1}))`);
      params.push(req.user.id, req.user.email);
      p += 2;
    }

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
              COALESCE(CONCAT(r.first_name,' ',r.last_name), CONCAT(u.first_name,' ',u.last_name)) as resident_name,
              r.address as resident_address,
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
    let { resident_id, certificate_type, purpose, amount } = req.body;

    if (!resident_id || req.user.role_name === 'Resident') {
      const resMatch = await query('SELECT id FROM residents WHERE email = $1', [req.user.email]);
      if (resMatch.rows[0]) {
        resident_id = resMatch.rows[0].id;
      } else {
        resident_id = null;
      }
    }

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

    // Notify resident if they have a user account or contact number
    const residentInfo = await query(
      `SELECT r.contact_number, r.first_name, u.id as user_id 
       FROM residents r 
       LEFT JOIN users u ON r.email = u.email 
       WHERE r.id = $1`,
      [old.rows[0].resident_id]
    );

    if (residentInfo.rows[0]) {
      const { user_id, contact_number, first_name } = residentInfo.rows[0];
      
      if (user_id) {
        await query(
          `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id) VALUES ($1,$2,$3,$4,$5,$6)`,
          [user_id, 'Certificate Request Update', `Your ${old.rows[0].certificate_type} request is now ${status}.`, status === 'Approved' ? 'success' : status === 'Rejected' ? 'error' : 'info', 'certificate_request', id]
        );
      }

      if (contact_number && (status === 'Approved' || status === 'Released')) {
        const smsMsg = `Hello ${first_name}, your ${old.rows[0].certificate_type} request has been ${status}. Please visit Barangay Hall for pickup. - BrgyConnect`;
        sendSMS(contact_number, smsMsg);
      }
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

const getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT cr.*, 
              COALESCE(CONCAT(r.first_name,' ',r.last_name), CONCAT(u.first_name,' ',u.last_name)) as resident_name,
              r.address as resident_address,
              r.purok as resident_purok,
              CONCAT(a.first_name,' ',a.last_name) as approved_by_name
       FROM certificate_requests cr
       LEFT JOIN residents r ON cr.resident_id = r.id
       LEFT JOIN users u ON cr.requested_by = u.id
       LEFT JOIN users a ON cr.approved_by = a.id
       WHERE cr.id = $1`,
      [id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Certificate record not found or invalid QR code' });
    }

    res.json({ success: true, certificate: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getCertificates, createCertificate, updateCertificateStatus, deleteCertificate, getCertificateById };


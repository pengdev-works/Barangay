const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const getBlotter = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;

    if (search) { conditions.push(`(b.blotter_number ILIKE $${p} OR b.complainant_name ILIKE $${p} OR b.respondent_name ILIKE $${p})`); params.push(`%${search}%`); p++; }
    if (status) { conditions.push(`b.status = $${p++}`); params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await query(`SELECT COUNT(*) FROM blotter_records b ${where}`, params);
    const result = await query(
      `SELECT b.*, CONCAT(u.first_name,' ',u.last_name) as recorded_by_name
       FROM blotter_records b LEFT JOIN users u ON b.recorded_by = u.id
       ${where} ORDER BY b.created_at DESC LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, blotterRecords: result.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getBlotterById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT b.*, CONCAT(u.first_name,' ',u.last_name) as recorded_by_name FROM blotter_records b LEFT JOIN users u ON b.recorded_by = u.id WHERE b.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Blotter record not found' });
    res.json({ success: true, blotter: result.rows[0] });
  } catch (err) { next(err); }
};

const createBlotter = async (req, res, next) => {
  try {
    const { blotter_number, complainant_name, complainant_address, respondent_name, respondent_address, incident_type, incident_date, incident_location, narrative, hearing_date, hearing_time } = req.body;
    const result = await query(
      `INSERT INTO blotter_records (blotter_number, complainant_name, complainant_address, respondent_name, respondent_address, incident_type, incident_date, incident_location, narrative, hearing_date, hearing_time, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [blotter_number, complainant_name, complainant_address || null, respondent_name, respondent_address || null, incident_type || null, incident_date, incident_location, narrative, hearing_date || null, hearing_time || null, req.user.id]
    );
    await logAudit({ userId: req.user.id, action: 'CREATE_BLOTTER', tableName: 'blotter_records', recordId: result.rows[0].id, newValues: result.rows[0], req });
    res.status(201).json({ success: true, message: 'Blotter record created', blotter: result.rows[0] });
  } catch (err) { next(err); }
};

const updateBlotter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, settlement_details, hearing_date, hearing_time, incident_type, narrative } = req.body;
    const result = await query(
      `UPDATE blotter_records SET status=$1, settlement_details=$2, hearing_date=$3, hearing_time=$4, incident_type=$5, narrative=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *`,
      [status, settlement_details || null, hearing_date || null, hearing_time || null, incident_type || null, narrative, id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Blotter updated', blotter: result.rows[0] });
  } catch (err) { next(err); }
};

const deleteBlotter = async (req, res, next) => {
  try {
    await query('DELETE FROM blotter_records WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Blotter record deleted' });
  } catch (err) { next(err); }
};

module.exports = { getBlotter, getBlotterById, createBlotter, updateBlotter, deleteBlotter };

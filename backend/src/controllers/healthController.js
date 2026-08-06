const { query } = require('../config/db');

const getHealthRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', record_type = '', filter = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;

    if (search) { conditions.push(`(r.first_name ILIKE $${p} OR r.last_name ILIKE $${p})`); params.push(`%${search}%`); p++; }
    if (record_type) { conditions.push(`hr.record_type = $${p++}`); params.push(record_type); }
    if (filter === 'senior') { conditions.push(`r.is_senior_citizen = TRUE`); }
    if (filter === 'pwd') { conditions.push(`r.is_pwd = TRUE`); }
    if (filter === 'pregnant') { conditions.push(`r.is_pregnant = TRUE`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await query(`SELECT COUNT(*) FROM health_records hr JOIN residents r ON hr.resident_id = r.id ${where}`, params);
    const result = await query(
      `SELECT hr.*, CONCAT(r.first_name,' ',r.last_name) as resident_name, r.is_senior_citizen, r.is_pwd, r.is_pregnant
       FROM health_records hr JOIN residents r ON hr.resident_id = r.id
       ${where} ORDER BY hr.date_of_service DESC LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, records: result.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getHealthSummary = async (req, res, next) => {
  try {
    const [seniors, pwds, pregnant] = await Promise.all([
      query(`SELECT COUNT(*) FROM residents WHERE is_senior_citizen = TRUE AND status = 'Active'`),
      query(`SELECT COUNT(*) FROM residents WHERE is_pwd = TRUE AND status = 'Active'`),
      query(`SELECT COUNT(*) FROM residents WHERE is_pregnant = TRUE AND status = 'Active'`),
    ]);
    res.json({ success: true, summary: { seniors: parseInt(seniors.rows[0].count), pwds: parseInt(pwds.rows[0].count), pregnant: parseInt(pregnant.rows[0].count) } });
  } catch (err) { next(err); }
};

const createHealthRecord = async (req, res, next) => {
  try {
    const { resident_id, record_type, date_of_service, health_facility, attending_health_worker, diagnosis, medications, notes, follow_up_date } = req.body;
    const result = await query(
      `INSERT INTO health_records (resident_id, record_type, date_of_service, health_facility, attending_health_worker, diagnosis, medications, notes, follow_up_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [resident_id, record_type, date_of_service, health_facility || null, attending_health_worker || null, diagnosis || null, medications || null, notes || null, follow_up_date || null, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Health record created', record: result.rows[0] });
  } catch (err) { next(err); }
};

const updateHealthRecord = async (req, res, next) => {
  try {
    const { diagnosis, medications, notes, follow_up_date } = req.body;
    const result = await query(
      `UPDATE health_records SET diagnosis=$1, medications=$2, notes=$3, follow_up_date=$4, updated_at=CURRENT_TIMESTAMP WHERE id=$5 RETURNING *`,
      [diagnosis || null, medications || null, notes || null, follow_up_date || null, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Health record updated', record: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getHealthRecords, getHealthSummary, createHealthRecord, updateHealthRecord };

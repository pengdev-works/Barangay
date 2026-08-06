const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

// GET /api/residents
const getResidents = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, search = '', status = '', gender = '',
      is_senior, is_pwd, purok = '', sort = 'created_at', order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(r.first_name ILIKE $${paramCount} OR r.last_name ILIKE $${paramCount} OR r.middle_name ILIKE $${paramCount} OR r.contact_number ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }
    if (status) { conditions.push(`r.status = $${paramCount++}`); params.push(status); }
    if (gender) { conditions.push(`r.gender = $${paramCount++}`); params.push(gender); }
    if (is_senior === 'true') { conditions.push(`r.is_senior_citizen = TRUE`); }
    if (is_pwd === 'true') { conditions.push(`r.is_pwd = TRUE`); }
    if (purok) { conditions.push(`r.purok = $${paramCount++}`); params.push(purok); }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSorts = ['first_name', 'last_name', 'created_at', 'birth_date'];
    const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const countResult = await query(
      `SELECT COUNT(*) FROM residents r ${whereClause}`,
      params
    );

    const result = await query(
      `SELECT r.*, h.household_number,
              EXTRACT(YEAR FROM age(r.birth_date))::INTEGER as computed_age
       FROM residents r
       LEFT JOIN households h ON r.household_id = h.id
       ${whereClause}
       ORDER BY r.${sortField} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      residents: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/residents/:id
const getResidentById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*,
              h.household_number, h.address as household_address,
              EXTRACT(YEAR FROM age(r.birth_date))::INTEGER as computed_age
       FROM residents r
       LEFT JOIN households h ON r.household_id = h.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    // Get certificate history
    const certs = await query(
      `SELECT id, certificate_type, status, purpose, created_at
       FROM certificate_requests WHERE resident_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [req.params.id]
    );

    res.json({
      success: true,
      resident: result.rows[0],
      certificateHistory: certs.rows,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/residents
const createResident = async (req, res, next) => {
  try {
    const {
      household_id, first_name, middle_name, last_name, suffix, gender,
      birth_date, civil_status, address, purok, contact_number, email,
      occupation, employer, monthly_income, educational_attainment,
      religion, nationality, voter_status, is_senior_citizen, is_pwd,
      pwd_type, is_pregnant, is_4ps, status, notes
    } = req.body;

    const profile_picture_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await query(
      `INSERT INTO residents (
        household_id, first_name, middle_name, last_name, suffix, gender,
        birth_date, civil_status, address, purok, contact_number, email,
        occupation, employer, monthly_income, educational_attainment,
        religion, nationality, voter_status, is_senior_citizen, is_pwd,
        pwd_type, is_pregnant, is_4ps, profile_picture_url, status, notes, created_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
       RETURNING *`,
      [
        household_id || null, first_name, middle_name || null, last_name, suffix || null, gender,
        birth_date || null, civil_status, address, purok || null, contact_number || null, email || null,
        occupation || null, employer || null, monthly_income || null, educational_attainment || null,
        religion || null, nationality || 'Filipino', voter_status || false, is_senior_citizen || false,
        is_pwd || false, pwd_type || null, is_pregnant || false, is_4ps || false,
        profile_picture_url, status || 'Active', notes || null, req.user.id
      ]
    );

    await logAudit({ userId: req.user.id, action: 'CREATE_RESIDENT', tableName: 'residents', recordId: result.rows[0].id, newValues: result.rows[0], req });

    res.status(201).json({ success: true, message: 'Resident registered successfully', resident: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/residents/:id
const updateResident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const old = await query('SELECT * FROM residents WHERE id = $1', [id]);
    if (old.rows.length === 0) return res.status(404).json({ success: false, message: 'Resident not found' });

    const {
      household_id, first_name, middle_name, last_name, suffix, gender,
      birth_date, civil_status, address, purok, contact_number, email,
      occupation, employer, monthly_income, educational_attainment,
      religion, nationality, voter_status, is_senior_citizen, is_pwd,
      pwd_type, is_pregnant, is_4ps, status, notes
    } = req.body;

    const profile_picture_url = req.file ? `/uploads/${req.file.filename}` : old.rows[0].profile_picture_url;

    const result = await query(
      `UPDATE residents SET
        household_id=$1, first_name=$2, middle_name=$3, last_name=$4, suffix=$5, gender=$6,
        birth_date=$7, civil_status=$8, address=$9, purok=$10, contact_number=$11, email=$12,
        occupation=$13, employer=$14, monthly_income=$15, educational_attainment=$16,
        religion=$17, nationality=$18, voter_status=$19, is_senior_citizen=$20, is_pwd=$21,
        pwd_type=$22, is_pregnant=$23, is_4ps=$24, profile_picture_url=$25, status=$26, notes=$27,
        updated_at=CURRENT_TIMESTAMP
       WHERE id=$28 RETURNING *`,
      [
        household_id || null, first_name, middle_name || null, last_name, suffix || null, gender,
        birth_date || null, civil_status, address, purok || null, contact_number || null, email || null,
        occupation || null, employer || null, monthly_income || null, educational_attainment || null,
        religion || null, nationality || 'Filipino', voter_status || false, is_senior_citizen || false,
        is_pwd || false, pwd_type || null, is_pregnant || false, is_4ps || false,
        profile_picture_url, status || 'Active', notes || null, id
      ]
    );

    await logAudit({ userId: req.user.id, action: 'UPDATE_RESIDENT', tableName: 'residents', recordId: id, oldValues: old.rows[0], newValues: result.rows[0], req });

    res.json({ success: true, message: 'Resident updated successfully', resident: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/residents/:id
const deleteResident = async (req, res, next) => {
  try {
    const old = await query('SELECT * FROM residents WHERE id = $1', [req.params.id]);
    if (old.rows.length === 0) return res.status(404).json({ success: false, message: 'Resident not found' });

    await query('DELETE FROM residents WHERE id = $1', [req.params.id]);
    await logAudit({ userId: req.user.id, action: 'DELETE_RESIDENT', tableName: 'residents', recordId: req.params.id, oldValues: old.rows[0], req });

    res.json({ success: true, message: 'Resident deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResidents, getResidentById, createResident, updateResident, deleteResident };

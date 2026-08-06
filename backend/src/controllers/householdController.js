const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const getHouseholds = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', purok = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let p = 1;

    if (search) { conditions.push(`(h.household_number ILIKE $${p} OR h.address ILIKE $${p})`); params.push(`%${search}%`); p++; }
    if (purok) { conditions.push(`h.purok = $${p++}`); params.push(purok); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const count = await query(`SELECT COUNT(*) FROM households h ${where}`, params);
    const result = await query(
      `SELECT h.*,
              CONCAT(r.first_name, ' ', r.last_name) as head_name,
              (SELECT COUNT(*) FROM household_members hm WHERE hm.household_id = h.id) as member_count
       FROM households h
       LEFT JOIN residents r ON h.household_head_id = r.id
       ${where}
       ORDER BY h.household_number ASC
       LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      households: result.rows,
      pagination: {
        total: parseInt(count.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

const getHouseholdById = async (req, res, next) => {
  try {
    const h = await query(`SELECT h.*, CONCAT(r.first_name,' ',r.last_name) as head_name FROM households h LEFT JOIN residents r ON h.household_head_id = r.id WHERE h.id = $1`, [req.params.id]);
    if (!h.rows[0]) return res.status(404).json({ success: false, message: 'Household not found' });

    const members = await query(
      `SELECT hm.*, r.first_name, r.last_name, r.gender, r.birth_date, r.occupation, r.contact_number, hm.relationship, hm.is_head,
              EXTRACT(YEAR FROM age(r.birth_date))::INTEGER as age
       FROM household_members hm
       JOIN residents r ON hm.resident_id = r.id
       WHERE hm.household_id = $1
       ORDER BY hm.is_head DESC, r.first_name`,
      [req.params.id]
    );

    res.json({ success: true, household: h.rows[0], members: members.rows });
  } catch (err) { next(err); }
};

const createHousehold = async (req, res, next) => {
  try {
    const { household_number, address, purok, household_head_id, monthly_income, house_ownership, notes } = req.body;
    const result = await query(
      `INSERT INTO households (household_number, address, purok, household_head_id, monthly_income, house_ownership, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [household_number, address, purok || null, household_head_id || null, monthly_income || null, house_ownership || null, notes || null, req.user.id]
    );
    await logAudit({ userId: req.user.id, action: 'CREATE_HOUSEHOLD', tableName: 'households', recordId: result.rows[0].id, newValues: result.rows[0], req });
    res.status(201).json({ success: true, message: 'Household created successfully', household: result.rows[0] });
  } catch (err) { next(err); }
};

const updateHousehold = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { address, purok, household_head_id, monthly_income, house_ownership, notes } = req.body;
    const result = await query(
      `UPDATE households SET address=$1, purok=$2, household_head_id=$3, monthly_income=$4, house_ownership=$5, notes=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *`,
      [address, purok || null, household_head_id || null, monthly_income || null, house_ownership || null, notes || null, id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Household not found' });
    res.json({ success: true, message: 'Household updated', household: result.rows[0] });
  } catch (err) { next(err); }
};

const addMember = async (req, res, next) => {
  try {
    const { resident_id, relationship, is_head } = req.body;
    const { id: household_id } = req.params;
    const result = await query(
      `INSERT INTO household_members (household_id, resident_id, relationship, is_head) VALUES ($1,$2,$3,$4) ON CONFLICT (household_id, resident_id) DO NOTHING RETURNING *`,
      [household_id, resident_id, relationship || null, is_head || false]
    );
    if (is_head) {
      await query(`UPDATE households SET household_head_id = $1 WHERE id = $2`, [resident_id, household_id]);
    }
    res.status(201).json({ success: true, message: 'Member added', member: result.rows[0] });
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    await query(`DELETE FROM household_members WHERE household_id = $1 AND resident_id = $2`, [req.params.id, req.params.residentId]);
    res.json({ success: true, message: 'Member removed' });
  } catch (err) { next(err); }
};

module.exports = { getHouseholds, getHouseholdById, createHousehold, updateHousehold, addMember, removeMember };

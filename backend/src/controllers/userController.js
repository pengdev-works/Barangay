const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const { logAudit } = require('../utils/auditLogger');

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    let queryText = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.is_active, u.created_at,
             r.name as role_name, r.id as role_id
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
    `;
    const params = [];

    if (search) {
      queryText += ` WHERE (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY u.created_at DESC`;

    const result = await query(queryText, params);
    res.json({ success: true, users: result.rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/users
const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, role_id, phone } = req.body;

    if (!first_name || !last_name || !email || !password || !role_id) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, password, and role are required' });
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING id, first_name, last_name, email, role_id, created_at`,
      [parseInt(role_id), first_name, last_name, email.toLowerCase(), hash, phone || null]
    );

    await logAudit({
      userId: req.user.id,
      action: 'CREATE_USER',
      tableName: 'users',
      recordId: result.rows[0].id,
      newValues: { email, role_id },
      req,
    });

    res.status(201).json({ success: true, message: 'User account created successfully', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id/status
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await query(
      `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, is_active`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAudit({
      userId: req.user.id,
      action: is_active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      tableName: 'users',
      recordId: id,
      req,
    });

    res.json({ success: true, message: `User status updated`, user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser, toggleUserStatus };

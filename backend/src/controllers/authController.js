const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { generateToken } = require('../config/jwt');
const { logAudit } = require('../utils/auditLogger');

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const result = await query(
      `SELECT u.*, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = generateToken({ id: user.id, email: user.email, role: user.role_name });

    await logAudit({ userId: user.id, action: 'LOGIN', tableName: 'users', recordId: user.id, req });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role_name,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.avatar_url, u.is_active, u.last_login,
              r.name as role_name, r.id as role_id
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        role: user.role_name,
        roleId: user.role_id,
        lastLogin: user.last_login,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hash, req.user.id]);

    await logAudit({ userId: req.user.id, action: 'CHANGE_PASSWORD', tableName: 'users', recordId: req.user.id, req });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    let queryText = `UPDATE users SET first_name = $1, last_name = $2, phone = $3`;
    const params = [firstName, lastName, phone];

    if (avatarUrl) {
      queryText += `, avatar_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`;
      params.push(avatarUrl, req.user.id);
    } else {
      queryText += `, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`;
      params.push(req.user.id);
    }

    const result = await query(queryText, params);
    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, changePassword, updateProfile };

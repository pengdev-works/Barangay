const ROLE_HIERARCHY = {
  'Super Admin': 4,
  'Barangay Captain': 3,
  'Barangay Staff': 2,
  'Resident': 1,
};

/**
 * Middleware to restrict access by role name(s)
 * @param {...string} roles - Allowed role names
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware to restrict access by minimum role level
 * @param {string} minRole - Minimum role required
 */
const authorizeMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userLevel = ROLE_HIERARCHY[req.user.role_name] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel < minLevel) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Minimum role required: ${minRole}`,
      });
    }

    next();
  };
};

module.exports = { authorize, authorizeMinRole };

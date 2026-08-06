const { query } = require('../config/db');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [`n.user_id = $1`];
    if (unread_only === 'true') conditions.push(`n.is_read = FALSE`);

    const result = await query(
      `SELECT * FROM notifications n WHERE ${conditions.join(' AND ')} ORDER BY n.created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), offset]
    );
    const unreadCount = await query(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`, [req.user.id]);

    res.json({ success: true, notifications: result.rows, unreadCount: parseInt(unreadCount.rows[0].count) });
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    await query(`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };

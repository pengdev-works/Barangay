const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const getAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category = '', pinned_only = false } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [`a.is_published = TRUE`];
    const params = [];
    let p = 1;

    if (category) { conditions.push(`a.category = $${p++}`); params.push(category); }
    if (pinned_only === 'true') { conditions.push(`a.is_pinned = TRUE`); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const count = await query(`SELECT COUNT(*) FROM announcements a ${where}`, params);
    const result = await query(
      `SELECT a.*,
              CONCAT(u.first_name,' ',u.last_name) as author_name,
              (SELECT COUNT(*) FROM announcement_likes al WHERE al.announcement_id = a.id) as likes_count,
              (SELECT COUNT(*) FROM announcement_comments ac WHERE ac.announcement_id = a.id) as comments_count
       FROM announcements a
       LEFT JOIN users u ON a.author_id = u.id
       ${where}
       ORDER BY a.is_pinned DESC, a.published_at DESC
       LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, announcements: result.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getAnnouncementById = async (req, res, next) => {
  try {
    const a = await query(
      `SELECT a.*, CONCAT(u.first_name,' ',u.last_name) as author_name,
              (SELECT COUNT(*) FROM announcement_likes al WHERE al.announcement_id = a.id) as likes_count
       FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = $1`,
      [req.params.id]
    );
    if (!a.rows[0]) return res.status(404).json({ success: false, message: 'Announcement not found' });

    const comments = await query(
      `SELECT ac.*, CONCAT(u.first_name,' ',u.last_name) as author_name, u.avatar_url FROM announcement_comments ac JOIN users u ON ac.user_id = u.id WHERE ac.announcement_id = $1 ORDER BY ac.created_at ASC`,
      [req.params.id]
    );

    res.json({ success: true, announcement: a.rows[0], comments: comments.rows });
  } catch (err) { next(err); }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, is_pinned, scheduled_at, expires_at } = req.body;
    const image_urls = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const result = await query(
      `INSERT INTO announcements (title, content, category, is_pinned, image_urls, scheduled_at, expires_at, author_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, content, category || 'General', is_pinned === 'true' || is_pinned === true, JSON.stringify(image_urls), scheduled_at || null, expires_at || null, req.user.id]
    );

    await logAudit({ userId: req.user.id, action: 'CREATE_ANNOUNCEMENT', tableName: 'announcements', recordId: result.rows[0].id, newValues: result.rows[0], req });
    res.status(201).json({ success: true, message: 'Announcement created', announcement: result.rows[0] });
  } catch (err) { next(err); }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, is_pinned, is_published } = req.body;
    const result = await query(
      `UPDATE announcements SET title=$1, content=$2, category=$3, is_pinned=$4, is_published=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *`,
      [title, content, category, is_pinned, is_published, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement updated', announcement: result.rows[0] });
  } catch (err) { next(err); }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) { next(err); }
};

const likeAnnouncement = async (req, res, next) => {
  try {
    const existing = await query(`SELECT id FROM announcement_likes WHERE announcement_id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
    if (existing.rows[0]) {
      await query(`DELETE FROM announcement_likes WHERE announcement_id=$1 AND user_id=$2`, [req.params.id, req.user.id]);
      return res.json({ success: true, liked: false, message: 'Like removed' });
    }
    await query(`INSERT INTO announcement_likes (announcement_id, user_id) VALUES ($1,$2)`, [req.params.id, req.user.id]);
    res.json({ success: true, liked: true, message: 'Announcement liked' });
  } catch (err) { next(err); }
};

const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const result = await query(
      `INSERT INTO announcement_comments (announcement_id, user_id, comment) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, req.user.id, comment]
    );
    res.status(201).json({ success: true, comment: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement, likeAnnouncement, addComment };

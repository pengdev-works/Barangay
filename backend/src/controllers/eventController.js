const { query } = require('../config/db');

const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category = '', upcoming = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [`e.is_active = TRUE`];
    const params = [];
    let p = 1;
    if (category) { conditions.push(`e.category = $${p++}`); params.push(category); }
    if (upcoming === 'true') { conditions.push(`e.event_date >= CURRENT_DATE`); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const count = await query(`SELECT COUNT(*) FROM events e ${where}`, params);
    const result = await query(
      `SELECT e.*,
              CONCAT(u.first_name,' ',u.last_name) as organizer_name,
              (SELECT COUNT(*) FROM event_attendees ea WHERE ea.event_id = e.id AND ea.rsvp_status = 'Going') as going_count
       FROM events e LEFT JOIN users u ON e.organizer_id = u.id
       ${where} ORDER BY e.event_date ASC LIMIT $${p} OFFSET $${p + 1}`,
      [...params, parseInt(limit), offset]
    );
    res.json({ success: true, events: result.rows, pagination: { total: parseInt(count.rows[0].count), page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(parseInt(count.rows[0].count) / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, event_date, start_time, end_time, location, max_attendees } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await query(
      `INSERT INTO events (title, description, category, event_date, start_time, end_time, location, max_attendees, image_url, organizer_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, description || null, category || 'Community', event_date, start_time || null, end_time || null, location || null, max_attendees || null, image_url, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Event created', event: result.rows[0] });
  } catch (err) { next(err); }
};

const updateEvent = async (req, res, next) => {
  try {
    const { title, description, category, event_date, start_time, end_time, location, max_attendees, is_active } = req.body;
    const result = await query(
      `UPDATE events SET title=$1, description=$2, category=$3, event_date=$4, start_time=$5, end_time=$6, location=$7, max_attendees=$8, is_active=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10 RETURNING *`,
      [title, description || null, category, event_date, start_time || null, end_time || null, location || null, max_attendees || null, is_active !== false, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event updated', event: result.rows[0] });
  } catch (err) { next(err); }
};

const deleteEvent = async (req, res, next) => {
  try {
    await query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { next(err); }
};

const rsvpEvent = async (req, res, next) => {
  try {
    const { resident_id, rsvp_status } = req.body;
    const result = await query(
      `INSERT INTO event_attendees (event_id, resident_id, rsvp_status)
       VALUES ($1,$2,$3)
       ON CONFLICT (event_id, resident_id) DO UPDATE SET rsvp_status = $3, rsvp_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.params.id, resident_id, rsvp_status || 'Going']
    );
    res.json({ success: true, message: 'RSVP recorded', attendee: result.rows[0] });
  } catch (err) { next(err); }
};

const getEventAttendees = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ea.*, CONCAT(r.first_name,' ',r.last_name) as resident_name, r.contact_number FROM event_attendees ea JOIN residents r ON ea.resident_id = r.id WHERE ea.event_id = $1 ORDER BY ea.rsvp_at`,
      [req.params.id]
    );
    res.json({ success: true, attendees: result.rows });
  } catch (err) { next(err); }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent, rsvpEvent, getEventAttendees };

const { query } = require('../config/db');

// GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const [
      residents,
      households,
      certificates,
      complaints,
      seniors,
      pwds,
      announcements,
      events,
    ] = await Promise.all([
      query(`SELECT COUNT(*) FROM residents WHERE status = 'Active'`),
      query(`SELECT COUNT(*) FROM households`),
      query(`SELECT COUNT(*) FROM certificate_requests WHERE status = 'Pending'`),
      query(`SELECT COUNT(*) FROM complaints WHERE status NOT IN ('Resolved','Closed')`),
      query(`SELECT COUNT(*) FROM residents WHERE is_senior_citizen = TRUE AND status = 'Active'`),
      query(`SELECT COUNT(*) FROM residents WHERE is_pwd = TRUE AND status = 'Active'`),
      query(`SELECT COUNT(*) FROM announcements WHERE is_published = TRUE`),
      query(`SELECT COUNT(*) FROM events WHERE event_date >= CURRENT_DATE`),
    ]);

    res.json({
      success: true,
      stats: {
        totalResidents: parseInt(residents.rows[0].count),
        totalHouseholds: parseInt(households.rows[0].count),
        activeRequests: parseInt(certificates.rows[0].count),
        activeComplaints: parseInt(complaints.rows[0].count),
        seniorCitizens: parseInt(seniors.rows[0].count),
        pwdCount: parseInt(pwds.rows[0].count),
        totalAnnouncements: parseInt(announcements.rows[0].count),
        upcomingEvents: parseInt(events.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/charts
const getCharts = async (req, res, next) => {
  try {
    // Gender distribution
    const genderDist = await query(
      `SELECT gender, COUNT(*) as count FROM residents WHERE status = 'Active' GROUP BY gender`
    );

    // Age groups
    const ageGroups = await query(
      `SELECT
        CASE
          WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 0 AND 12 THEN 'Children (0-12)'
          WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 13 AND 17 THEN 'Teens (13-17)'
          WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 18 AND 35 THEN 'Young Adults (18-35)'
          WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 36 AND 59 THEN 'Adults (36-59)'
          ELSE 'Senior (60+)'
        END as group_name,
        COUNT(*) as count
       FROM residents WHERE status = 'Active' AND birth_date IS NOT NULL
       GROUP BY group_name
       ORDER BY group_name`
    );

    // Monthly certificate requests (last 6 months)
    const monthlyRequests = await query(
      `SELECT TO_CHAR(created_at, 'Mon YYYY') as month,
              COUNT(*) as count,
              DATE_TRUNC('month', created_at) as month_date
       FROM certificate_requests
       WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY month, month_date
       ORDER BY month_date`
    );

    // Certificate types distribution
    const certTypes = await query(
      `SELECT certificate_type, COUNT(*) as count
       FROM certificate_requests
       GROUP BY certificate_type
       ORDER BY count DESC`
    );

    // Complaint status distribution
    const complaintStatus = await query(
      `SELECT status, COUNT(*) as count FROM complaints GROUP BY status`
    );

    // Recent activities
    const recentActivity = await query(
      `(SELECT 'certificate' as type, certificate_type as title, status, created_at FROM certificate_requests ORDER BY created_at DESC LIMIT 5)
       UNION ALL
       (SELECT 'complaint' as type, title, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 5)
       UNION ALL
       (SELECT 'resident' as type, CONCAT(first_name, ' ', last_name) as title, status, created_at FROM residents ORDER BY created_at DESC LIMIT 5)
       ORDER BY created_at DESC LIMIT 10`
    );

    // Purok population
    const purokPop = await query(
      `SELECT COALESCE(purok, 'Unassigned') as purok, COUNT(*) as count
       FROM residents WHERE status = 'Active'
       GROUP BY purok ORDER BY count DESC`
    );

    res.json({
      success: true,
      charts: {
        genderDistribution: genderDist.rows,
        ageGroups: ageGroups.rows,
        monthlyRequests: monthlyRequests.rows,
        certificateTypes: certTypes.rows,
        complaintStatus: complaintStatus.rows,
        recentActivity: recentActivity.rows,
        purokPopulation: purokPop.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getCharts };

const { query } = require('../config/db');

const getReports = async (req, res, next) => {
  try {
    const { type = 'population' } = req.query;

    if (type === 'population') {
      const [byGender, byAge, byPurok, byCivilStatus, specialGroups] = await Promise.all([
        query(`SELECT gender, COUNT(*) as count FROM residents WHERE status = 'Active' GROUP BY gender`),
        query(`SELECT CASE WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 0 AND 12 THEN '0-12' WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 13 AND 17 THEN '13-17' WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 18 AND 35 THEN '18-35' WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 36 AND 59 THEN '36-59' ELSE '60+' END as age_group, COUNT(*) as count FROM residents WHERE status='Active' AND birth_date IS NOT NULL GROUP BY age_group ORDER BY age_group`),
        query(`SELECT COALESCE(purok,'Unassigned') as purok, COUNT(*) as count FROM residents WHERE status='Active' GROUP BY purok ORDER BY count DESC`),
        query(`SELECT civil_status, COUNT(*) as count FROM residents WHERE status='Active' GROUP BY civil_status`),
        query(`SELECT SUM(CASE WHEN is_senior_citizen THEN 1 ELSE 0 END) as seniors, SUM(CASE WHEN is_pwd THEN 1 ELSE 0 END) as pwds, SUM(CASE WHEN is_pregnant THEN 1 ELSE 0 END) as pregnant, SUM(CASE WHEN is_4ps THEN 1 ELSE 0 END) as fourps, SUM(CASE WHEN voter_status THEN 1 ELSE 0 END) as voters FROM residents WHERE status='Active'`),
      ]);
      return res.json({ success: true, type, data: { byGender: byGender.rows, byAge: byAge.rows, byPurok: byPurok.rows, byCivilStatus: byCivilStatus.rows, specialGroups: specialGroups.rows[0] } });
    }

    if (type === 'certificates') {
      const [byStatus, byType, monthly] = await Promise.all([
        query(`SELECT status, COUNT(*) as count FROM certificate_requests GROUP BY status`),
        query(`SELECT certificate_type, COUNT(*) as count FROM certificate_requests GROUP BY certificate_type ORDER BY count DESC`),
        query(`SELECT TO_CHAR(created_at,'Mon YYYY') as month, COUNT(*) as count, DATE_TRUNC('month',created_at) as month_date FROM certificate_requests WHERE created_at >= CURRENT_DATE - INTERVAL '12 months' GROUP BY month, month_date ORDER BY month_date`),
      ]);
      return res.json({ success: true, type, data: { byStatus: byStatus.rows, byType: byType.rows, monthly: monthly.rows } });
    }

    if (type === 'complaints') {
      const [byStatus, byCategory, monthly] = await Promise.all([
        query(`SELECT status, COUNT(*) as count FROM complaints GROUP BY status`),
        query(`SELECT category, COUNT(*) as count FROM complaints GROUP BY category ORDER BY count DESC`),
        query(`SELECT TO_CHAR(created_at,'Mon YYYY') as month, COUNT(*) as count, DATE_TRUNC('month',created_at) as month_date FROM complaints WHERE created_at >= CURRENT_DATE - INTERVAL '12 months' GROUP BY month, month_date ORDER BY month_date`),
      ]);
      return res.json({ success: true, type, data: { byStatus: byStatus.rows, byCategory: byCategory.rows, monthly: monthly.rows } });
    }

    if (type === 'households') {
      const [byPurok, byOwnership, byIncome] = await Promise.all([
        query(`SELECT COALESCE(purok,'Unassigned') as purok, COUNT(*) as count FROM households GROUP BY purok ORDER BY count DESC`),
        query(`SELECT COALESCE(house_ownership,'Unknown') as ownership, COUNT(*) as count FROM households GROUP BY ownership`),
        query(`SELECT CASE WHEN monthly_income < 5000 THEN 'Below 5K' WHEN monthly_income BETWEEN 5000 AND 15000 THEN '5K-15K' WHEN monthly_income BETWEEN 15001 AND 30000 THEN '15K-30K' ELSE 'Above 30K' END as range, COUNT(*) as count FROM households WHERE monthly_income IS NOT NULL GROUP BY range ORDER BY range`),
      ]);
      return res.json({ success: true, type, data: { byPurok: byPurok.rows, byOwnership: byOwnership.rows, byIncome: byIncome.rows } });
    }

    res.status(400).json({ success: false, message: 'Invalid report type. Use: population, certificates, complaints, households' });
  } catch (err) { next(err); }
};

module.exports = { getReports };

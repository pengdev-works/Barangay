-- ================================================================
-- BarangayConnect Minimal Seed Data (Super Admin Only)
-- Run AFTER schema.sql in Neon SQL Editor
-- ================================================================

-- ================================================================
-- ROLES
-- ================================================================
INSERT INTO roles (id, name, description) VALUES
  (1, 'Super Admin', 'Full system access and management'),
  (2, 'Barangay Captain', 'Approve requests, view analytics, manage announcements'),
  (3, 'Barangay Staff', 'Register residents, process certificates, manage complaints'),
  (4, 'Resident', 'Request documents, submit complaints, view announcements')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- SUPER ADMIN USER ONLY
-- Password: Admin@123
-- ================================================================
INSERT INTO users (
  id,
  role_id,
  first_name,
  last_name,
  email,
  password_hash,
  phone,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  1,
  'System',
  'Administrator',
  'admin@barangayconnect.com',
  '$2a$10$yBKup/JB5JH.DMIMusXtK.PSMSjJEgMaa1u09mO8BahfQ1I2EKg/e',
  '09000000000',
  TRUE
) ON CONFLICT (email) DO NOTHING;

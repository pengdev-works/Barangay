-- ================================================================
-- BarangayConnect Seed Data
-- Run AFTER schema.sql
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
-- USERS (passwords are bcrypt hash of "Admin@123")
-- ================================================================
INSERT INTO users (id, role_id, first_name, last_name, email, password_hash, phone, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 'System', 'Administrator', 'admin@barangayconnect.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhuW', '09000000000', TRUE),
  ('00000000-0000-0000-0000-000000000002', 2, 'Maria', 'Santos', 'captain@barangayconnect.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhuW', '09111111111', TRUE),
  ('00000000-0000-0000-0000-000000000003', 3, 'Juan', 'Dela Cruz', 'staff1@barangayconnect.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhuW', '09222222222', TRUE),
  ('00000000-0000-0000-0000-000000000004', 3, 'Ana', 'Reyes', 'staff2@barangayconnect.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhuW', '09333333333', TRUE),
  ('00000000-0000-0000-0000-000000000005', 4, 'Pedro', 'Garcia', 'resident1@barangayconnect.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhuW', '09444444444', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ================================================================
-- HOUSEHOLDS
-- ================================================================
INSERT INTO households (id, household_number, address, purok, monthly_income, house_ownership, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001', 'HH-2024-001', '123 Sampaguita Street, Brgy. San Jose', 'Purok 1', 15000, 'Owned', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000002', 'HH-2024-002', '456 Rosal Street, Brgy. San Jose', 'Purok 2', 22000, 'Rented', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000003', 'HH-2024-003', '789 Ilang-Ilang Street, Brgy. San Jose', 'Purok 1', 8000, 'Shared', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000004', 'HH-2024-004', '321 Dama de Noche Street, Brgy. San Jose', 'Purok 3', 35000, 'Owned', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000005', 'HH-2024-005', '654 Adelfa Street, Brgy. San Jose', 'Purok 2', 12000, 'Rented', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (household_number) DO NOTHING;

-- ================================================================
-- RESIDENTS
-- ================================================================
INSERT INTO residents (id, household_id, first_name, middle_name, last_name, gender, birth_date, civil_status, address, purok, contact_number, email, occupation, voter_status, is_senior_citizen, is_pwd, status, created_by) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Pedro', 'Reyes', 'Garcia', 'Male', '1965-03-15', 'Married', '123 Sampaguita Street, Brgy. San Jose', 'Purok 1', '09444444444', 'pedro@email.com', 'Farmer', TRUE, TRUE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Rosa', 'Cruz', 'Garcia', 'Female', '1968-07-22', 'Married', '123 Sampaguita Street, Brgy. San Jose', 'Purok 1', '09555555555', NULL, 'Housewife', TRUE, FALSE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Jose', 'Santos', 'Dela Cruz', 'Male', '1990-11-08', 'Single', '456 Rosal Street, Brgy. San Jose', 'Purok 2', '09666666666', 'jose@email.com', 'Security Guard', TRUE, FALSE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Elena', 'Bautista', 'Dela Cruz', 'Female', '1993-05-30', 'Married', '456 Rosal Street, Brgy. San Jose', 'Purok 2', '09777777777', NULL, 'Teacher', TRUE, FALSE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Carlos', 'Mendoza', 'Ramos', 'Male', '1945-01-20', 'Widowed', '789 Ilang-Ilang Street, Brgy. San Jose', 'Purok 1', '09888888888', NULL, 'Retired', TRUE, TRUE, TRUE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'Liza', 'Villanueva', 'Torres', 'Female', '2000-09-14', 'Single', '321 Dama de Noche Street, Brgy. San Jose', 'Purok 3', '09999999999', 'liza@email.com', 'Student', FALSE, FALSE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'Mario', 'Lopez', 'Torres', 'Male', '1975-12-03', 'Married', '321 Dama de Noche Street, Brgy. San Jose', 'Purok 3', '09111222333', 'mario@email.com', 'Engineer', TRUE, FALSE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 'Gloria', 'Navarro', 'Fernandez', 'Female', '1985-06-18', 'Married', '654 Adelfa Street, Brgy. San Jose', 'Purok 2', '09444555666', NULL, 'Nurse', TRUE, FALSE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'Miguel', 'Garcia', 'Santos', 'Male', '2015-04-25', 'Single', '123 Sampaguita Street, Brgy. San Jose', 'Purok 1', NULL, NULL, 'Student', FALSE, FALSE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', 'Nena', 'Aguilar', 'Soriano', 'Female', '1942-08-11', 'Widowed', '789 Ilang-Ilang Street, Brgy. San Jose', 'Purok 1', '09222333444', NULL, 'Retired', TRUE, TRUE, FALSE, 'Active', '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Update household heads
UPDATE households SET household_head_id = '20000000-0000-0000-0000-000000000001' WHERE id = '10000000-0000-0000-0000-000000000001';
UPDATE households SET household_head_id = '20000000-0000-0000-0000-000000000003' WHERE id = '10000000-0000-0000-0000-000000000002';
UPDATE households SET household_head_id = '20000000-0000-0000-0000-000000000005' WHERE id = '10000000-0000-0000-0000-000000000003';
UPDATE households SET household_head_id = '20000000-0000-0000-0000-000000000007' WHERE id = '10000000-0000-0000-0000-000000000004';
UPDATE households SET household_head_id = '20000000-0000-0000-0000-000000000008' WHERE id = '10000000-0000-0000-0000-000000000005';

-- ================================================================
-- CERTIFICATE REQUESTS
-- ================================================================
INSERT INTO certificate_requests (resident_id, requested_by, certificate_type, purpose, status, amount) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Barangay Clearance', 'Employment', 'Approved', 50),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Certificate of Residency', 'Bank Account', 'Pending', 50),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'Certificate of Indigency', 'Scholarship', 'Processing', 0),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'Business Clearance', 'Small Business', 'Pending', 200),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 'Barangay Clearance', 'Loan Application', 'Released', 50),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Certificate of Residency', 'Government ID', 'Rejected', 50)
ON CONFLICT DO NOTHING;

-- ================================================================
-- COMPLAINTS
-- ================================================================
INSERT INTO complaints (complainant_id, reported_by, title, description, category, location, incident_date, status) VALUES
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Noise Disturbance at Night', 'Neighbor plays loud music past midnight every weekend', 'Noise Disturbance', '125 Sampaguita Street, Brgy. San Jose', '2024-11-15', 'Resolved'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'Illegal Dumping of Garbage', 'Unknown individuals dumping garbage on vacant lot', 'Garbage Disposal', 'Vacant Lot near Purok 2', '2024-12-01', 'Under Investigation'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'Stray Dogs in the Area', 'Multiple stray dogs causing danger to children', 'Other', 'Purok 3 playground area', '2024-12-10', 'Pending')
ON CONFLICT DO NOTHING;

-- ================================================================
-- BLOTTER RECORDS
-- ================================================================
INSERT INTO blotter_records (blotter_number, complainant_name, complainant_address, respondent_name, respondent_address, incident_type, incident_date, incident_location, narrative, status, recorded_by) VALUES
  ('BLT-2024-001', 'Rosa Garcia', '123 Sampaguita St.', 'Marco Villanueva', '130 Sampaguita St.', 'Physical Injury', '2024-10-20', '128 Sampaguita Street', 'Complainant reports that respondent pushed and struck her during an altercation over a parking dispute.', 'Settled', '00000000-0000-0000-0000-000000000003'),
  ('BLT-2024-002', 'Jose Dela Cruz', '456 Rosal St.', 'Armando Pascual', '460 Rosal St.', 'Theft', '2024-11-05', '456 Rosal Street', 'Complainant reports missing motorcycle parts. CCTV shows respondent taking the items.', 'Under Mediation', '00000000-0000-0000-0000-000000000003'),
  ('BLT-2024-003', 'Maria Torres', '789 Ilang-Ilang St.', 'Roberto Cruz', '795 Ilang-Ilang St.', 'Grave Threats', '2024-12-03', 'Ilang-Ilang Street', 'Complainant reports that respondent made verbal threats against her life during a dispute over property boundaries.', 'Open', '00000000-0000-0000-0000-000000000003')
ON CONFLICT (blotter_number) DO NOTHING;

-- ================================================================
-- ANNOUNCEMENTS
-- ================================================================
INSERT INTO announcements (title, content, category, is_pinned, is_published, author_id) VALUES
  ('Barangay Fiesta 2025 Celebration', 'We are excited to announce our Annual Barangay Fiesta on January 15, 2025! Join us for a day of fun, food, and community bonding. There will be games, cultural shows, and a grand parade. All residents are welcome!', 'Events', TRUE, TRUE, '00000000-0000-0000-0000-000000000002'),
  ('Free Medical Mission - January 20, 2025', 'The Barangay Health Center in partnership with the City Health Office will conduct a FREE Medical Mission. Services include: General Check-up, Blood Pressure Monitoring, Blood Sugar Testing, Free Medicines, and Dental Services. Bring your Barangay ID.', 'Health', TRUE, TRUE, '00000000-0000-0000-0000-000000000002'),
  ('Year-End Community Clean-up Drive', 'Let us start the new year with a clean community! Join our Clean-up Drive on December 28. Bring gloves and garbage bags. Free snacks for all volunteers!', 'Community', FALSE, TRUE, '00000000-0000-0000-0000-000000000002'),
  ('Water Service Interruption Advisory', 'Please be advised that there will be water service interruption on December 20, 2024 from 8:00 AM to 5:00 PM due to maintenance works. Please store enough water. We apologize for the inconvenience.', 'Safety', FALSE, TRUE, '00000000-0000-0000-0000-000000000002'),
  ('Senior Citizens Benefits Distribution', 'Senior Citizens may claim their Social Pension at the Barangay Hall every 3rd week of the month. Please bring your Senior Citizens ID and a valid government ID.', 'Services', FALSE, TRUE, '00000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- ================================================================
-- EVENTS
-- ================================================================
INSERT INTO events (title, description, category, event_date, start_time, end_time, location, max_attendees, organizer_id) VALUES
  ('Barangay Fiesta 2025', 'Annual celebration of our Barangay Patron Saint. Games, cultural shows, and community activities.', 'Community', '2025-01-15', '08:00', '22:00', 'Barangay Plaza', 500, '00000000-0000-0000-0000-000000000002'),
  ('Free Medical Mission', 'Free medical services for all barangay residents. No appointment needed.', 'Health', '2025-01-20', '08:00', '17:00', 'Barangay Health Center', 200, '00000000-0000-0000-0000-000000000002'),
  ('COVID-19 Booster Vaccination', 'Free booster doses for all eligible residents. Bring your vaccination card.', 'Vaccination', '2025-01-25', '08:00', '15:00', 'Barangay Hall Gym', 150, '00000000-0000-0000-0000-000000000002'),
  ('Barangay Assembly Meeting', 'Quarterly barangay assembly. Discussion of community projects and concerns. All residents encouraged to attend.', 'Meeting', '2025-02-05', '09:00', '12:00', 'Barangay Hall', 300, '00000000-0000-0000-0000-000000000002'),
  ('Community Clean-up Drive', 'Monthly environmental clean-up. Let us keep our barangay clean and green!', 'Clean-up', '2025-01-28', '06:00', '10:00', 'All Puroks', 100, '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- ================================================================
-- ASSISTANCE REQUESTS
-- ================================================================
INSERT INTO assistance_requests (resident_id, assistance_type, description, amount_requested, status) VALUES
  ('20000000-0000-0000-0000-000000000005', 'Medical', 'Requesting assistance for hospitalization due to pneumonia. Currently admitted at the City Hospital.', 5000, 'Approved'),
  ('20000000-0000-0000-0000-000000000010', 'Financial', 'Requesting financial assistance. Lost livelihood due to recent flooding.', 3000, 'Pending'),
  ('20000000-0000-0000-0000-000000000002', 'Food', 'Requesting food assistance after house fire incident.', NULL, 'Under Review')
ON CONFLICT DO NOTHING;

-- ================================================================
-- NOTIFICATIONS
-- ================================================================
INSERT INTO notifications (user_id, title, message, type, reference_type) VALUES
  ('00000000-0000-0000-0000-000000000003', 'New Certificate Request', 'A new Barangay Clearance request has been submitted by Pedro Garcia.', 'info', 'certificate_request'),
  ('00000000-0000-0000-0000-000000000002', 'Complaint Filed', 'A new complaint about Noise Disturbance has been filed.', 'warning', 'complaint'),
  ('00000000-0000-0000-0000-000000000003', 'Assistance Request', 'Carlos Ramos has submitted a medical assistance request.', 'info', 'assistance_request'),
  ('00000000-0000-0000-0000-000000000005', 'Request Approved', 'Your Barangay Clearance request has been approved. Please visit the Barangay Hall to claim.', 'success', 'certificate_request')
ON CONFLICT DO NOTHING;

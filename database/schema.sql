-- ================================================================
-- BarangayConnect Database Schema
-- Database: PostgreSQL (Neon)
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- ROLES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- USERS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- HOUSEHOLDS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_number VARCHAR(50) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  purok VARCHAR(100),
  household_head_id UUID,
  monthly_income NUMERIC(10,2),
  house_ownership VARCHAR(50) CHECK (house_ownership IN ('Owned','Rented','Shared','Informal Settler')),
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- RESIDENTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS residents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  suffix VARCHAR(20),
  gender VARCHAR(20) CHECK (gender IN ('Male','Female','Other')),
  birth_date DATE,
  age INTEGER,
  civil_status VARCHAR(30) CHECK (civil_status IN ('Single','Married','Widowed','Separated','Annulled')),
  address TEXT NOT NULL,
  purok VARCHAR(100),
  contact_number VARCHAR(20),
  email VARCHAR(255),
  occupation VARCHAR(100),
  employer VARCHAR(150),
  monthly_income NUMERIC(10,2),
  educational_attainment VARCHAR(100),
  religion VARCHAR(100),
  nationality VARCHAR(100) DEFAULT 'Filipino',
  voter_status BOOLEAN DEFAULT FALSE,
  is_senior_citizen BOOLEAN DEFAULT FALSE,
  is_pwd BOOLEAN DEFAULT FALSE,
  pwd_type VARCHAR(100),
  is_pregnant BOOLEAN DEFAULT FALSE,
  is_4ps BOOLEAN DEFAULT FALSE,
  profile_picture_url TEXT,
  status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Active','Transferred','Deceased','Inactive')),
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update households household_head_id FK
ALTER TABLE households
  ADD CONSTRAINT fk_household_head
  FOREIGN KEY (household_head_id)
  REFERENCES residents(id) ON DELETE SET NULL;

-- ================================================================
-- HOUSEHOLD MEMBERS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  relationship VARCHAR(100),
  is_head BOOLEAN DEFAULT FALSE,
  joined_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(household_id, resident_id)
);

-- ================================================================
-- CERTIFICATE REQUESTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS certificate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  certificate_type VARCHAR(100) NOT NULL CHECK (
    certificate_type IN (
      'Barangay Clearance',
      'Certificate of Residency',
      'Certificate of Indigency',
      'Business Clearance',
      'Barangay Permit'
    )
  ),
  purpose TEXT,
  status VARCHAR(30) DEFAULT 'Pending' CHECK (
    status IN ('Pending','Processing','Approved','Rejected','Released')
  ),
  remarks TEXT,
  or_number VARCHAR(100),
  amount NUMERIC(10,2) DEFAULT 0,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- COMPLAINTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complainant_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) CHECK (
    category IN (
      'Noise Disturbance','Illegal Structures','Garbage Disposal',
      'Domestic Violence','Theft','Physical Injury','Other'
    )
  ),
  location TEXT,
  incident_date DATE,
  evidence_urls JSONB DEFAULT '[]',
  status VARCHAR(30) DEFAULT 'Pending' CHECK (
    status IN ('Pending','Under Investigation','Resolved','Closed')
  ),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- BLOTTER RECORDS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS blotter_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blotter_number VARCHAR(50) UNIQUE NOT NULL,
  complainant_name VARCHAR(255) NOT NULL,
  complainant_address TEXT,
  respondent_name VARCHAR(255) NOT NULL,
  respondent_address TEXT,
  incident_type VARCHAR(100),
  incident_date DATE NOT NULL,
  incident_location TEXT NOT NULL,
  narrative TEXT NOT NULL,
  settlement_details TEXT,
  hearing_date DATE,
  hearing_time TIME,
  status VARCHAR(50) DEFAULT 'Open' CHECK (
    status IN ('Open','Under Mediation','Settled','Referred to Court','Closed')
  ),
  recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- ANNOUNCEMENTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General' CHECK (
    category IN ('General','Health','Safety','Events','Services','Emergency')
  ),
  image_urls JSONB DEFAULT '[]',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- ANNOUNCEMENT LIKES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS announcement_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(announcement_id, user_id)
);

-- ================================================================
-- ANNOUNCEMENT COMMENTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS announcement_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- EVENTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'Community' CHECK (
    category IN ('Community','Health','Meeting','Clean-up','Vaccination','Sports','Other')
  ),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  max_attendees INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- EVENT ATTENDEES TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  rsvp_status VARCHAR(30) DEFAULT 'Going' CHECK (
    rsvp_status IN ('Going','Not Going','Maybe')
  ),
  attended BOOLEAN DEFAULT FALSE,
  rsvp_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, resident_id)
);

-- ================================================================
-- HEALTH RECORDS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  record_type VARCHAR(100) CHECK (
    record_type IN ('Vaccination','Check-up','Prenatal','Senior Check-up','PWD Assessment','Other')
  ),
  date_of_service DATE NOT NULL,
  health_facility VARCHAR(255),
  attending_health_worker VARCHAR(255),
  diagnosis TEXT,
  medications TEXT,
  notes TEXT,
  follow_up_date DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- ASSISTANCE REQUESTS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS assistance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  assistance_type VARCHAR(100) CHECK (
    assistance_type IN ('Medical','Financial','Disaster Relief','Food','Other')
  ),
  description TEXT NOT NULL,
  amount_requested NUMERIC(10,2),
  amount_approved NUMERIC(10,2),
  supporting_documents JSONB DEFAULT '[]',
  status VARCHAR(30) DEFAULT 'Pending' CHECK (
    status IN ('Pending','Under Review','Approved','Rejected','Released')
  ),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- NOTIFICATIONS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (
    type IN ('info','success','warning','error')
  ),
  reference_type VARCHAR(100),
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- AUDIT LOGS TABLE
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_residents_household ON residents(household_id);
CREATE INDEX IF NOT EXISTS idx_residents_status ON residents(status);
CREATE INDEX IF NOT EXISTS idx_residents_senior ON residents(is_senior_citizen);
CREATE INDEX IF NOT EXISTS idx_residents_pwd ON residents(is_pwd);
CREATE INDEX IF NOT EXISTS idx_cert_requests_resident ON certificate_requests(resident_id);
CREATE INDEX IF NOT EXISTS idx_cert_requests_status ON certificate_requests(status);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cert_requests_updated_at BEFORE UPDATE ON certificate_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blotter_updated_at BEFORE UPDATE ON blotter_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assistance_updated_at BEFORE UPDATE ON assistance_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

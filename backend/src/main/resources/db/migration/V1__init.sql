-- Full schema for Job Application Tracker

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company text NOT NULL,
  role text NOT NULL,
  location text,
  status VARCHAR(50) NOT NULL DEFAULT 'SAVED',
  date_applied timestamptz,
  job_url text,
  priority VARCHAR(50) DEFAULT 'MEDIUM',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_application_id ON notes(application_id);

-- Contacts table
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  linkedin_url text,
  phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_application_id ON contacts(application_id);

-- Reminders table
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  remind_at timestamptz NOT NULL,
  message text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_application_id ON reminders(application_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at);

-- Attachments table (metadata only, files stored in R2)
CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  object_key text NOT NULL,
  file_name text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_application_id ON attachments(application_id);

-- Activity log table
CREATE TABLE activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_application_id ON activity(application_id);
CREATE INDEX idx_activity_created_at ON activity(created_at);

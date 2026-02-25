-- SubManager Database Schema
-- Run this in Supabase SQL Editor

-- Users table (extends NextAuth user data)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions detected from email
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly')) DEFAULT 'monthly',
  next_payment_date DATE,
  status TEXT CHECK (status IN ('active', 'cancelled', 'paused')) DEFAULT 'active',
  category TEXT CHECK (category IN ('ai', 'api', 'saas', 'entertainment', 'cloud', 'other')) DEFAULT 'other',
  detected_from_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification settings per user
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  days_before INTEGER[] DEFAULT '{3,1}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification history
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT CHECK (type IN ('email', 'push', 'slack')) DEFAULT 'email',
  status TEXT CHECK (status IN ('sent', 'failed')) DEFAULT 'sent'
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_payment ON subscriptions(next_payment_date);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_notification_history_user ON notification_history(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

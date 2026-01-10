-- ============================================
-- Admin WhatsApp System Migration
-- Migration: 003_admin_whatsapp_system
-- Date: 2026-01-10
-- Purpose: Replace per-customer WhatsApp with single admin-controlled system
-- ============================================

-- Add WhatsApp fields to existing teable_customers table
ALTER TABLE teable_customers 
ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS whatsapp_session_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS whatsapp_last_connected TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS encrypted_password TEXT;

-- Create admin_whatsapp_config table for admin WhatsApp session management
CREATE TABLE IF NOT EXISTS admin_whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20),
    connected BOOLEAN DEFAULT false,
    last_connected TIMESTAMPTZ,
    last_error TEXT,
    connection_attempts INTEGER DEFAULT 0,
    session_data JSONB, -- Store any additional session metadata
    qr_code_generated_at TIMESTAMPTZ,
    admin_user_id UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one admin WhatsApp config should exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_whatsapp_singleton ON admin_whatsapp_config ((1));

-- Create admin_messages table for tracking admin-to-customer messages
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES teable_customers(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    message_text TEXT NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    admin_user_id UUID REFERENCES admin_users(id),
    admin_phone VARCHAR(20) -- Admin phone number at time of sending
);

-- Indexes for admin_messages
CREATE INDEX IF NOT EXISTS idx_admin_messages_customer ON admin_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_sent_at ON admin_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_admin_messages_status ON admin_messages(status);
CREATE INDEX IF NOT EXISTS idx_admin_messages_customer_phone ON admin_messages(customer_phone);

-- Create admin_reminder_queue table for queued customer reminders
CREATE TABLE IF NOT EXISTS admin_reminder_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES teable_customers(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255),
    reminder_text TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);

-- Indexes for admin_reminder_queue
CREATE INDEX IF NOT EXISTS idx_admin_reminder_queue_customer ON admin_reminder_queue(customer_id);
CREATE INDEX IF NOT EXISTS idx_admin_reminder_queue_scheduled ON admin_reminder_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_admin_reminder_queue_status ON admin_reminder_queue(status);
CREATE INDEX IF NOT EXISTS idx_admin_reminder_queue_phone ON admin_reminder_queue(customer_phone);

-- Update function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for admin_whatsapp_config updated_at
CREATE TRIGGER update_admin_whatsapp_config_updated_at 
    BEFORE UPDATE ON admin_whatsapp_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for customer WhatsApp fields
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp_phone ON teable_customers(whatsapp_phone);
CREATE INDEX IF NOT EXISTS idx_customers_reminder_enabled ON teable_customers(reminder_enabled);
CREATE INDEX IF NOT EXISTS idx_customers_whatsapp_connected ON teable_customers(whatsapp_connected);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE admin_whatsapp_config IS 'Single admin WhatsApp session configuration';
COMMENT ON COLUMN admin_whatsapp_config.session_data IS 'JSON metadata for session management';

COMMENT ON TABLE admin_messages IS 'Log of messages sent from admin to customers';
COMMENT ON COLUMN admin_messages.customer_phone IS 'Customer WhatsApp phone number';
COMMENT ON COLUMN admin_messages.admin_phone IS 'Admin phone number at time of message';

COMMENT ON TABLE admin_reminder_queue IS 'Queue of reminders to be sent to customers via admin WhatsApp';
COMMENT ON COLUMN admin_reminder_queue.scheduled_for IS 'When the reminder should be sent';
COMMENT ON COLUMN admin_reminder_queue.attempts IS 'Number of send attempts made';

COMMENT ON COLUMN teable_customers.whatsapp_phone IS 'Customer WhatsApp phone number for receiving messages';
COMMENT ON COLUMN teable_customers.reminder_enabled IS 'Whether customer has enabled WhatsApp reminders';
COMMENT ON COLUMN teable_customers.encrypted_password IS 'AES-256 encrypted password for Teable account';

-- ============================================
-- DATA MIGRATION (if needed)
-- ============================================

-- Note: If there's existing per-customer WhatsApp data, it should be migrated here
-- For now, we'll start fresh with the admin system

-- Insert default admin WhatsApp config if none exists
INSERT INTO admin_whatsapp_config (id, connected)
SELECT gen_random_uuid(), false
WHERE NOT EXISTS (SELECT 1 FROM admin_whatsapp_config);

-- ============================================
-- GRANTS (adjust based on your user setup)
-- ============================================

-- Grant permissions to application user (adjust 'app_user' as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON admin_whatsapp_config TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON admin_messages TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON admin_reminder_queue TO app_user;
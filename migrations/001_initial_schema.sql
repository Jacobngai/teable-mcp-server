-- ============================================
-- Result Marketing AI Connector Database Schema
-- Migration: 001_initial_schema
-- Date: 2026-01-04
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TEABLE CUSTOMERS TABLE
-- Main table for storing customer information
-- ============================================
CREATE TABLE IF NOT EXISTS teable_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    encrypted_token TEXT,
    mcp_key VARCHAR(64) DEFAULT encode(gen_random_bytes(16), 'hex'),
    teable_base_url VARCHAR(500) DEFAULT 'https://table.resultmarketing.asia/api',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
    tier VARCHAR(50) DEFAULT 'free',
    record_limit INTEGER DEFAULT 250000,
    onboarding_complete BOOLEAN DEFAULT false,
    stripe_customer_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    password_hash TEXT
);

-- Indexes for teable_customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON teable_customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_mcp_key ON teable_customers(mcp_key);
CREATE INDEX IF NOT EXISTS idx_customers_status ON teable_customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_session ON teable_customers(stripe_session_id);

-- ============================================
-- ADMIN USERS TABLE
-- Admin access for dashboard management
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('owner', 'salesperson', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- ============================================
-- USAGE LOGS TABLE
-- Track API usage for analytics and billing
-- ============================================
CREATE TABLE IF NOT EXISTS teable_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES teable_customers(id) ON DELETE CASCADE,
    tool_name VARCHAR(100) NOT NULL,
    table_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for usage_logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_customer ON teable_usage_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON teable_usage_logs(created_at);

-- ============================================
-- PLANS TABLE
-- Subscription plans configuration
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price_myr DECIMAL(10,2),
    price_usd DECIMAL(10,2),
    interval VARCHAR(20) CHECK (interval IN ('month', 'year')),
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    stripe_price_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SESSIONS TABLE (Optional for session management)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES teable_customers(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_customer ON sessions(customer_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE teable_customers IS 'Customer accounts for Result Marketing AI Connector';
COMMENT ON COLUMN teable_customers.mcp_key IS 'Unique key for MCP connection URL';
COMMENT ON COLUMN teable_customers.encrypted_token IS 'AES-256 encrypted Teable API token';
COMMENT ON COLUMN teable_customers.password_hash IS 'Argon2/bcrypt hash for dashboard login';

COMMENT ON TABLE admin_users IS 'Admin users for the management dashboard';
COMMENT ON TABLE teable_usage_logs IS 'API usage tracking for analytics';
COMMENT ON TABLE plans IS 'Subscription plan definitions';

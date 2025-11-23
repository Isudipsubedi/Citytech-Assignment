-- ============================================================================
-- MERCHANTS TABLE SCHEMA
-- ============================================================================
-- This schema creates the merchants table for the payment platform
-- Compatible with both backend API and frontend requirements

-- Create merchants table in operators schema
DROP TABLE IF EXISTS operators.merchants CASCADE;

CREATE TABLE operators.merchants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    business_name VARCHAR(255),
    registration_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_merchants_status ON operators.merchants(status);
CREATE INDEX idx_merchants_email ON operators.merchants(email);
CREATE INDEX idx_merchants_created_at ON operators.merchants(created_at);

-- Add comments
COMMENT ON TABLE operators.merchants IS 'Merchant information and registration details';
COMMENT ON COLUMN operators.merchants.id IS 'Unique merchant identifier (e.g., MCH-00001)';
COMMENT ON COLUMN operators.merchants.status IS 'Merchant status: active or inactive';


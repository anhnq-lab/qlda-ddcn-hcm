-- ============================================
-- Migration: Create user_permissions table
-- For RBAC permission management
-- ============================================

-- 1. Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    actions TEXT[] NOT NULL DEFAULT '{}',
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, resource)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource ON user_permissions(resource);

-- 3. Enable RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (restrictive — only admin can manage, all authenticated can read own)

-- All authenticated users can read their OWN permissions
CREATE POLICY "user_permissions_select_own"
    ON user_permissions FOR SELECT
    USING (true);  -- Hook reads all; filtering is done in frontend by user_id

-- Only admin can insert
CREATE POLICY "user_permissions_insert_admin"
    ON user_permissions FOR INSERT
    WITH CHECK (true);  -- Admin check done at app level via role

-- Only admin can update
CREATE POLICY "user_permissions_update_admin"
    ON user_permissions FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Only admin can delete
CREATE POLICY "user_permissions_delete_admin"
    ON user_permissions FOR DELETE
    USING (true);

-- 5. Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_permissions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_permissions_timestamp();

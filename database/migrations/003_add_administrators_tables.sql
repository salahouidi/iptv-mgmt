-- Migration: Add administrators and admin_activity tables
-- Date: 2025-09-07
-- Description: Create administrator management system with role-based access control

-- 1. Create administrators table
CREATE TABLE IF NOT EXISTS administrators (
    id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN ('Super Admin', 'Admin', 'Operator', 'Custom')),
    status TEXT NOT NULL DEFAULT 'Actif' CHECK (status IN ('Actif', 'Inactif', 'Suspendu')),
    permissions TEXT, -- JSON string for custom permissions
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    created_by INTEGER,
    notes TEXT,
    FOREIGN KEY (created_by) REFERENCES administrators(id_admin)
);

-- 2. Create admin_activity table for audit trail
CREATE TABLE IF NOT EXISTS admin_activity (
    id_activity INTEGER PRIMARY KEY AUTOINCREMENT,
    id_admin INTEGER NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    resource_type TEXT, -- e.g., 'client', 'produit', 'vente'
    resource_id INTEGER,
    old_values TEXT, -- JSON string of old values for updates
    new_values TEXT, -- JSON string of new values for updates
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES administrators(id_admin) ON DELETE CASCADE
);

-- 3. Insert default Super Admin user (password: admin123)
INSERT OR IGNORE INTO administrators (
    id_admin,
    username, 
    email, 
    password_hash, 
    role, 
    status,
    created_at,
    updated_at
) VALUES (
    1,
    'ADMIN',
    'admin@blacknashop.local',
    'admin123', -- In production, this should be properly hashed
    'Super Admin',
    'Actif',
    datetime('now'),
    datetime('now')
);

-- 4. Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_administrators_modified 
    AFTER UPDATE ON administrators
    BEGIN
        UPDATE administrators SET updated_at = CURRENT_TIMESTAMP WHERE id_admin = NEW.id_admin;
    END;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_administrators_username ON administrators(username);
CREATE INDEX IF NOT EXISTS idx_administrators_email ON administrators(email);
CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators(role);
CREATE INDEX IF NOT EXISTS idx_administrators_status ON administrators(status);
CREATE INDEX IF NOT EXISTS idx_administrators_last_login ON administrators(last_login);

CREATE INDEX IF NOT EXISTS idx_admin_activity_admin ON admin_activity(id_admin);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_resource ON admin_activity(resource_type, resource_id);

-- 6. Create view for administrator statistics
CREATE VIEW IF NOT EXISTS administrator_stats AS
SELECT 
    a.id_admin,
    a.username,
    a.role,
    a.status,
    a.last_login,
    COUNT(aa.id_activity) as total_activities,
    MAX(aa.created_at) as last_activity,
    COUNT(CASE WHEN aa.created_at >= datetime('now', '-7 days') THEN 1 END) as activities_last_7_days,
    COUNT(CASE WHEN aa.created_at >= datetime('now', '-30 days') THEN 1 END) as activities_last_30_days
FROM administrators a
LEFT JOIN admin_activity aa ON a.id_admin = aa.id_admin
GROUP BY a.id_admin, a.username, a.role, a.status, a.last_login;

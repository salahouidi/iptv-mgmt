-- Migration: Update plateformes table schema
-- Remove devise column and add solde_initial column

-- Step 1: Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Step 2: Create new table with updated schema
CREATE TABLE IF NOT EXISTS plateformes_new (
    id_plateforme INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE,
    description TEXT,
    url TEXT,
    solde_initial REAL NOT NULL DEFAULT 0 CHECK (solde_initial >= 0),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Copy data from old table to new table
-- Set default solde_initial to 0 for existing records
INSERT INTO plateformes_new (id_plateforme, nom, description, url, solde_initial, date_creation, date_modification)
SELECT id_plateforme, nom, description, url, 0, date_creation, date_modification
FROM plateformes;

-- Step 4: Drop old table
DROP TABLE plateformes;

-- Step 5: Rename new table
ALTER TABLE plateformes_new RENAME TO plateformes;

-- Step 6: Recreate trigger for automatic date_modification updates
CREATE TRIGGER IF NOT EXISTS update_plateformes_modified
    AFTER UPDATE ON plateformes
    BEGIN
        UPDATE plateformes SET date_modification = CURRENT_TIMESTAMP WHERE id_plateforme = NEW.id_plateforme;
    END;

-- Step 7: Re-enable foreign key constraints
PRAGMA foreign_keys = ON;

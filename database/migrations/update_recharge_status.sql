-- Migration to update recharge status values to French
-- This updates the CHECK constraint to allow French status values

-- First, we need to create a new table with the updated constraint
CREATE TABLE IF NOT EXISTS recharges_new (
    id_recharge INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plateforme INTEGER NOT NULL,
    montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
    devise TEXT NOT NULL DEFAULT 'DZD' CHECK (devise IN ('USD', 'EUR', 'DZD')),
    statut TEXT NOT NULL DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Payé', 'Annulé')),
    date_recharge DATETIME NOT NULL,
    preuve_paiement TEXT, -- URL du fichier de preuve
    notes TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_plateforme) REFERENCES plateformes(id_plateforme) ON DELETE RESTRICT
);

-- Copy existing data, converting old status values to new ones
INSERT INTO recharges_new (
    id_recharge, id_plateforme, montant, devise, statut, 
    date_recharge, preuve_paiement, notes, date_creation, date_modification
)
SELECT 
    id_recharge, 
    id_plateforme, 
    montant, 
    devise,
    CASE 
        WHEN statut = 'en_attente' THEN 'En attente'
        WHEN statut = 'confirme' THEN 'Payé'
        WHEN statut = 'annule' THEN 'Annulé'
        ELSE statut
    END as statut,
    date_recharge, 
    preuve_paiement, 
    notes, 
    date_creation, 
    date_modification
FROM recharges;

-- Drop the old table
DROP TABLE recharges;

-- Rename the new table
ALTER TABLE recharges_new RENAME TO recharges;

-- Recreate the trigger for automatic date modification
CREATE TRIGGER IF NOT EXISTS update_recharges_modified 
    AFTER UPDATE ON recharges
    BEGIN
        UPDATE recharges SET date_modification = CURRENT_TIMESTAMP WHERE id_recharge = NEW.id_recharge;
    END;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_recharges_plateforme ON recharges(id_plateforme);
CREATE INDEX IF NOT EXISTS idx_recharges_date ON recharges(date_recharge);

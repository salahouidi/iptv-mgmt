-- Fix ventes table constraints to match frontend values
-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

-- Create new ventes table with correct constraints
CREATE TABLE IF NOT EXISTS ventes_new (
    id_vente INTEGER PRIMARY KEY AUTOINCREMENT,
    id_client INTEGER NOT NULL,
    id_produit INTEGER NOT NULL,
    id_plateforme INTEGER NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire > 0),
    montant_total DECIMAL(10,2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
    date_vente DATETIME NOT NULL,
    methode_paiement TEXT NOT NULL DEFAULT 'Espèce' CHECK (methode_paiement IN ('Espèce', 'CCP', 'BaridiMob', 'Autre')),
    statut_paiement TEXT NOT NULL DEFAULT 'Payé' CHECK (statut_paiement IN ('Payé', 'En attente')),
    notes TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    purchase_cost REAL DEFAULT 0,
    cost_type_vente TEXT DEFAULT 'currency' CHECK (cost_type_vente IN ('currency', 'points')),
    panel_balance_before REAL DEFAULT NULL,
    panel_balance_after REAL DEFAULT NULL,
    FOREIGN KEY (id_client) REFERENCES clients(id_client) ON DELETE RESTRICT,
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE RESTRICT,
    FOREIGN KEY (id_plateforme) REFERENCES plateformes(id_plateforme) ON DELETE RESTRICT
);

-- Copy existing data, converting old values to new ones
INSERT INTO ventes_new (
    id_vente, id_client, id_produit, id_plateforme, quantite, prix_unitaire, 
    date_vente, methode_paiement, statut_paiement, notes, date_creation, date_modification,
    purchase_cost, cost_type_vente, panel_balance_before, panel_balance_after
)
SELECT 
    id_vente, id_client, id_produit, id_plateforme, quantite, prix_unitaire,
    date_vente,
    CASE 
        WHEN methode_paiement = 'espece' THEN 'Espèce'
        WHEN methode_paiement = 'ccp' THEN 'CCP'
        WHEN methode_paiement = 'baridimob' THEN 'BaridiMob'
        WHEN methode_paiement = 'autre' THEN 'Autre'
        ELSE methode_paiement
    END as methode_paiement,
    CASE 
        WHEN statut_paiement = 'paye' THEN 'Payé'
        WHEN statut_paiement = 'en_attente' THEN 'En attente'
        WHEN statut_paiement = 'annule' THEN 'En attente'
        ELSE statut_paiement
    END as statut_paiement,
    notes, date_creation, date_modification,
    COALESCE(purchase_cost, prix_unitaire) as purchase_cost,
    COALESCE(cost_type_vente, 'currency') as cost_type_vente,
    panel_balance_before,
    panel_balance_after
FROM ventes;

-- Drop the old table
DROP TABLE ventes;

-- Rename the new table
ALTER TABLE ventes_new RENAME TO ventes;

-- Recreate the trigger for automatic date modification
CREATE TRIGGER IF NOT EXISTS update_ventes_modified 
    AFTER UPDATE ON ventes
    BEGIN
        UPDATE ventes SET date_modification = CURRENT_TIMESTAMP WHERE id_vente = NEW.id_vente;
    END;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_ventes_client ON ventes(id_client);
CREATE INDEX IF NOT EXISTS idx_ventes_produit ON ventes(id_produit);
CREATE INDEX IF NOT EXISTS idx_ventes_plateforme ON ventes(id_plateforme);
CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes(date_vente);
CREATE INDEX IF NOT EXISTS idx_ventes_cost_type ON ventes(cost_type_vente);

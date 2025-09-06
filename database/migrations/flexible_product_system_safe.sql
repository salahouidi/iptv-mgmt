-- Safe Migration for Flexible Product Management System
-- Step-by-step approach to avoid constraint issues

-- 1. Add new columns to plateformes table
ALTER TABLE plateformes ADD COLUMN balance_type TEXT DEFAULT 'currency';
ALTER TABLE plateformes ADD COLUMN balance_unit TEXT DEFAULT 'DZD';
ALTER TABLE plateformes ADD COLUMN point_conversion_rate REAL DEFAULT NULL;

-- 2. Add new columns to produits table
ALTER TABLE produits ADD COLUMN cost_type TEXT DEFAULT 'currency';
ALTER TABLE produits ADD COLUMN default_cost REAL DEFAULT 0;
ALTER TABLE produits ADD COLUMN duration_weeks INTEGER DEFAULT NULL;
ALTER TABLE produits ADD COLUMN is_multi_panel BOOLEAN DEFAULT FALSE;

-- 3. Add new columns to ventes table
ALTER TABLE ventes ADD COLUMN purchase_cost REAL DEFAULT 0;
ALTER TABLE ventes ADD COLUMN cost_type_vente TEXT DEFAULT 'currency';
ALTER TABLE ventes ADD COLUMN panel_balance_before REAL DEFAULT NULL;
ALTER TABLE ventes ADD COLUMN panel_balance_after REAL DEFAULT NULL;

-- 4. Create product-panel associations table
CREATE TABLE IF NOT EXISTS produit_panels (
    id_association INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produit INTEGER NOT NULL,
    id_plateforme INTEGER NOT NULL,
    cost_override REAL DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE CASCADE,
    FOREIGN KEY (id_plateforme) REFERENCES plateformes(id_plateforme) ON DELETE CASCADE,
    UNIQUE(id_produit, id_plateforme)
);

-- 5. Create point pricing rules table
CREATE TABLE IF NOT EXISTS point_pricing_rules (
    id_rule INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plateforme INTEGER NOT NULL,
    duration_weeks INTEGER NOT NULL,
    points_cost REAL NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_plateforme) REFERENCES plateformes(id_plateforme) ON DELETE CASCADE,
    UNIQUE(id_plateforme, duration_weeks)
);

-- 6. Update existing data with safe defaults
UPDATE plateformes SET 
    balance_type = 'currency', 
    balance_unit = 'DZD' 
WHERE balance_type = 'currency';

UPDATE produits SET 
    cost_type = 'currency', 
    default_cost = prix_achat_moyen,
    duration_weeks = duree_mois * 4  -- Convert months to weeks
WHERE cost_type = 'currency';

UPDATE ventes SET 
    purchase_cost = prix_unitaire, 
    cost_type_vente = 'currency' 
WHERE purchase_cost = 0;

-- 7. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_produit_panels_produit ON produit_panels(id_produit);
CREATE INDEX IF NOT EXISTS idx_produit_panels_plateforme ON produit_panels(id_plateforme);
CREATE INDEX IF NOT EXISTS idx_point_pricing_plateforme ON point_pricing_rules(id_plateforme);
CREATE INDEX IF NOT EXISTS idx_point_pricing_duration ON point_pricing_rules(duration_weeks);
CREATE INDEX IF NOT EXISTS idx_ventes_cost_type ON ventes(cost_type_vente);
CREATE INDEX IF NOT EXISTS idx_plateformes_balance_type ON plateformes(balance_type);

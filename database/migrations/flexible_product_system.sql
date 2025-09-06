-- Migration for Flexible Product Management System
-- Supports both point-based and currency-based panels

-- 1. Enhance platforms table to support different balance types
ALTER TABLE plateformes ADD COLUMN balance_type TEXT NOT NULL DEFAULT 'currency' CHECK (balance_type IN ('currency', 'points'));
ALTER TABLE plateformes ADD COLUMN balance_unit TEXT NOT NULL DEFAULT 'DZD';
ALTER TABLE plateformes ADD COLUMN point_conversion_rate REAL DEFAULT NULL; -- For point-based panels: DZD per point

-- 2. Enhance products table for flexible pricing
ALTER TABLE produits ADD COLUMN cost_type TEXT NOT NULL DEFAULT 'currency' CHECK (cost_type IN ('currency', 'points'));
ALTER TABLE produits ADD COLUMN default_cost REAL NOT NULL DEFAULT 0;
ALTER TABLE produits ADD COLUMN duration_weeks INTEGER DEFAULT NULL; -- For point-based calculations
ALTER TABLE produits ADD COLUMN is_multi_panel BOOLEAN DEFAULT FALSE; -- Can work with multiple panels

-- 3. Create product-panel associations for multi-panel products
CREATE TABLE IF NOT EXISTS produit_panels (
    id_association INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produit INTEGER NOT NULL,
    id_plateforme INTEGER NOT NULL,
    cost_override REAL DEFAULT NULL, -- Override default cost for this panel
    is_active BOOLEAN DEFAULT TRUE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE CASCADE,
    FOREIGN KEY (id_plateforme) REFERENCES plateformes(id_plateforme) ON DELETE CASCADE,
    UNIQUE(id_produit, id_plateforme)
);

-- 4. Enhance sales table to track purchase costs and panel deductions
ALTER TABLE ventes ADD COLUMN purchase_cost REAL NOT NULL DEFAULT 0;
ALTER TABLE ventes ADD COLUMN cost_type TEXT NOT NULL DEFAULT 'currency' CHECK (cost_type IN ('currency', 'points'));
ALTER TABLE ventes ADD COLUMN panel_balance_before REAL DEFAULT NULL;
ALTER TABLE ventes ADD COLUMN panel_balance_after REAL DEFAULT NULL;

-- 5. Create point pricing rules table for point-based panels
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

-- 6. Default point pricing rules will be added via API when creating point-based panels

-- 7. Create triggers for automatic balance deduction on sales
CREATE TRIGGER IF NOT EXISTS deduct_balance_on_sale
    AFTER INSERT ON ventes
    BEGIN
        -- Update platform balance based on purchase cost
        UPDATE plateformes 
        SET solde_initial = solde_initial - NEW.purchase_cost
        WHERE id_plateforme = NEW.id_plateforme;
    END;

-- 8. Create trigger to validate sufficient balance before sale
CREATE TRIGGER IF NOT EXISTS validate_balance_before_sale
    BEFORE INSERT ON ventes
    BEGIN
        -- Check if platform has sufficient balance
        SELECT CASE 
            WHEN (SELECT solde_initial FROM plateformes WHERE id_plateforme = NEW.id_plateforme) < NEW.purchase_cost
            THEN RAISE(ABORT, 'Insufficient balance on platform for this sale')
        END;
    END;

-- 9. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_produit_panels_produit ON produit_panels(id_produit);
CREATE INDEX IF NOT EXISTS idx_produit_panels_plateforme ON produit_panels(id_plateforme);
CREATE INDEX IF NOT EXISTS idx_point_pricing_plateforme ON point_pricing_rules(id_plateforme);
CREATE INDEX IF NOT EXISTS idx_point_pricing_duration ON point_pricing_rules(duration_weeks);
CREATE INDEX IF NOT EXISTS idx_ventes_cost_type ON ventes(cost_type);

-- 10. Update existing data to set default values
UPDATE plateformes SET balance_type = 'currency', balance_unit = 'DZD' WHERE balance_type IS NULL;
UPDATE produits SET cost_type = 'currency', default_cost = prix_unitaire WHERE cost_type IS NULL;
UPDATE ventes SET purchase_cost = prix_unitaire, cost_type = 'currency' WHERE purchase_cost = 0;

-- IPTV Management Platform Database Schema
-- Cloudflare D1 Database

-- 1. Table des plateformes
CREATE TABLE IF NOT EXISTS plateformes (
    id_plateforme INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE,
    description TEXT,
    url TEXT,
    solde_initial REAL NOT NULL DEFAULT 0 CHECK (solde_initial >= 0),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table des recharges
CREATE TABLE IF NOT EXISTS recharges (
    id_recharge INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plateforme INTEGER NOT NULL,
    montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
    devise TEXT NOT NULL DEFAULT 'USD' CHECK (devise IN ('USD', 'EUR', 'DZD')),
    statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirme', 'annule')),
    date_recharge DATETIME NOT NULL,
    preuve_paiement TEXT, -- URL du fichier de preuve
    notes TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_plateforme) REFERENCES plateformes(id_plateforme) ON DELETE CASCADE
);

-- 3. Table des produits
CREATE TABLE IF NOT EXISTS produits (
    id_produit INTEGER PRIMARY KEY AUTOINCREMENT,
    id_plateforme INTEGER NOT NULL,
    nom TEXT NOT NULL,
    description TEXT,
    categorie TEXT NOT NULL DEFAULT 'IPTV' CHECK (categorie IN ('IPTV', 'Netflix', 'Autre')),
    duree_mois INTEGER NOT NULL CHECK (duree_mois > 0),
    prix_achat_moyen DECIMAL(10,2) NOT NULL CHECK (prix_achat_moyen >= 0),
    marge DECIMAL(5,2) NOT NULL DEFAULT 50.00 CHECK (marge >= 0),
    prix_vente DECIMAL(10,2) GENERATED ALWAYS AS (prix_achat_moyen * (1 + marge / 100)) STORED,
    stock_actuel INTEGER NOT NULL DEFAULT 0 CHECK (stock_actuel >= 0),
    seuil_alerte INTEGER NOT NULL DEFAULT 5 CHECK (seuil_alerte >= 0),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_plateforme) REFERENCES plateformes(id_plateforme) ON DELETE CASCADE,
    UNIQUE(nom, id_plateforme)
);

-- 4. Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id_client INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    email TEXT,
    wilaya TEXT NOT NULL,
    adresse TEXT,
    facebook TEXT,
    instagram TEXT,
    notes TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(telephone)
);

-- 5. Table des ventes
CREATE TABLE IF NOT EXISTS ventes (
    id_vente INTEGER PRIMARY KEY AUTOINCREMENT,
    id_client INTEGER NOT NULL,
    id_produit INTEGER NOT NULL,
    id_plateforme INTEGER NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    prix_unitaire DECIMAL(10,2) NOT NULL CHECK (prix_unitaire > 0),
    montant_total DECIMAL(10,2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED,
    date_vente DATETIME NOT NULL,
    methode_paiement TEXT NOT NULL DEFAULT 'espece' CHECK (methode_paiement IN ('espece', 'ccp', 'baridimob', 'autre')),
    statut_paiement TEXT NOT NULL DEFAULT 'paye' CHECK (statut_paiement IN ('paye', 'en_attente', 'annule')),
    notes TEXT,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_client) REFERENCES clients(id_client) ON DELETE RESTRICT,
    FOREIGN KEY (id_produit) REFERENCES produits(id_produit) ON DELETE RESTRICT,
    FOREIGN KEY (id_plateforme) REFERENCES plateformes(id_plateforme) ON DELETE RESTRICT
);

-- 6. Table des paramètres
CREATE TABLE IF NOT EXISTS parametres (
    id_parametre INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Business settings (JSON)
    business_settings TEXT NOT NULL DEFAULT '{}',
    -- Financial settings (JSON)
    financial_settings TEXT NOT NULL DEFAULT '{}',
    -- Notification settings (JSON)
    notification_settings TEXT NOT NULL DEFAULT '{}',
    -- System settings (JSON)
    system_settings TEXT NOT NULL DEFAULT '{}',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Triggers pour mettre à jour date_modification automatiquement
CREATE TRIGGER IF NOT EXISTS update_plateformes_modified 
    AFTER UPDATE ON plateformes
    BEGIN
        UPDATE plateformes SET date_modification = CURRENT_TIMESTAMP WHERE id_plateforme = NEW.id_plateforme;
    END;

CREATE TRIGGER IF NOT EXISTS update_recharges_modified 
    AFTER UPDATE ON recharges
    BEGIN
        UPDATE recharges SET date_modification = CURRENT_TIMESTAMP WHERE id_recharge = NEW.id_recharge;
    END;

CREATE TRIGGER IF NOT EXISTS update_produits_modified 
    AFTER UPDATE ON produits
    BEGIN
        UPDATE produits SET date_modification = CURRENT_TIMESTAMP WHERE id_produit = NEW.id_produit;
    END;

CREATE TRIGGER IF NOT EXISTS update_clients_modified 
    AFTER UPDATE ON clients
    BEGIN
        UPDATE clients SET date_modification = CURRENT_TIMESTAMP WHERE id_client = NEW.id_client;
    END;

CREATE TRIGGER IF NOT EXISTS update_ventes_modified 
    AFTER UPDATE ON ventes
    BEGIN
        UPDATE ventes SET date_modification = CURRENT_TIMESTAMP WHERE id_vente = NEW.id_vente;
    END;

CREATE TRIGGER IF NOT EXISTS update_parametres_modified 
    AFTER UPDATE ON parametres
    BEGIN
        UPDATE parametres SET date_modification = CURRENT_TIMESTAMP WHERE id_parametre = NEW.id_parametre;
    END;

-- Trigger pour mettre à jour le stock après une vente
CREATE TRIGGER IF NOT EXISTS update_stock_after_sale
    AFTER INSERT ON ventes
    BEGIN
        UPDATE produits 
        SET stock_actuel = stock_actuel - NEW.quantite 
        WHERE id_produit = NEW.id_produit;
    END;

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_recharges_plateforme ON recharges(id_plateforme);
CREATE INDEX IF NOT EXISTS idx_recharges_date ON recharges(date_recharge);
CREATE INDEX IF NOT EXISTS idx_produits_plateforme ON produits(id_plateforme);
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie);
CREATE INDEX IF NOT EXISTS idx_produits_stock ON produits(stock_actuel);
CREATE INDEX IF NOT EXISTS idx_ventes_client ON ventes(id_client);
CREATE INDEX IF NOT EXISTS idx_ventes_produit ON ventes(id_produit);
CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes(date_vente);
CREATE INDEX IF NOT EXISTS idx_clients_telephone ON clients(telephone);
CREATE INDEX IF NOT EXISTS idx_clients_wilaya ON clients(wilaya);

-- 9. Table des administrateurs
CREATE TABLE IF NOT EXISTS administrators (
    id_admin INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Admin' CHECK (role IN ('Admin', 'Super Admin')),
    status TEXT NOT NULL DEFAULT 'Actif' CHECK (status IN ('Actif', 'Inactif')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- 10. Table des activités administrateurs
CREATE TABLE IF NOT EXISTS admin_activity (
    id_activity INTEGER PRIMARY KEY AUTOINCREMENT,
    id_admin INTEGER NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_admin) REFERENCES administrators(id_admin) ON DELETE CASCADE
);

-- Triggers pour les administrateurs
CREATE TRIGGER IF NOT EXISTS update_administrators_modified
    AFTER UPDATE ON administrators
    BEGIN
        UPDATE administrators SET updated_at = CURRENT_TIMESTAMP WHERE id_admin = NEW.id_admin;
    END;

-- Index pour les administrateurs
CREATE INDEX IF NOT EXISTS idx_administrators_username ON administrators(username);
CREATE INDEX IF NOT EXISTS idx_administrators_email ON administrators(email);
CREATE INDEX IF NOT EXISTS idx_administrators_role ON administrators(role);
CREATE INDEX IF NOT EXISTS idx_administrators_status ON administrators(status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin ON admin_activity(id_admin);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_date ON admin_activity(created_at);

-- Données initiales pour la plateforme IPTV Management
-- À exécuter après la création du schéma

-- Insertion des plateformes par défaut
INSERT OR IGNORE INTO plateformes (nom, description, url, devise) VALUES
('DAR IPTV', 'Plateforme IPTV principale avec contenu arabe et international', 'https://dariptv.com', 'USD'),
('Netflix Premium', 'Service de streaming Netflix avec comptes premium', 'https://netflix.com', 'USD'),
('IPTV Pro', 'Service IPTV professionnel avec support 24/7', 'https://iptvpro.net', 'EUR');

-- Insertion des produits par défaut
INSERT OR IGNORE INTO produits (id_plateforme, nom, description, categorie, duree_mois, prix_achat_moyen, marge, stock_actuel, seuil_alerte) VALUES
-- Produits DAR IPTV (id_plateforme = 1)
(1, 'IPTV Premium 12 mois', 'Abonnement IPTV premium 12 mois avec tous les canaux', 'IPTV', 12, 120.00, 25.00, 50, 10),
(1, 'IPTV Standard 6 mois', 'Abonnement IPTV standard 6 mois', 'IPTV', 6, 60.00, 33.33, 30, 8),
(1, 'IPTV Basic 3 mois', 'Abonnement IPTV basic 3 mois', 'IPTV', 3, 30.00, 50.00, 25, 5),

-- Produits Netflix (id_plateforme = 2)
(2, 'Netflix Premium 1 mois', 'Compte Netflix Premium 1 mois', 'Netflix', 1, 15.00, 66.67, 20, 5),
(2, 'Netflix Premium 3 mois', 'Compte Netflix Premium 3 mois', 'Netflix', 3, 40.00, 62.50, 15, 3),
(2, 'Netflix Premium 6 mois', 'Compte Netflix Premium 6 mois', 'Netflix', 6, 75.00, 66.67, 10, 2),

-- Produits IPTV Pro (id_plateforme = 3)
(3, 'IPTV Pro 12 mois', 'Service IPTV professionnel 12 mois', 'IPTV', 12, 150.00, 20.00, 40, 8),
(3, 'IPTV Pro 6 mois', 'Service IPTV professionnel 6 mois', 'IPTV', 6, 80.00, 25.00, 25, 5);

-- Insertion des clients de test
INSERT OR IGNORE INTO clients (nom, prenom, telephone, email, wilaya, adresse, facebook, notes) VALUES
('Benali', 'Ahmed', '+213555123456', 'ahmed.benali@email.com', 'Alger', '123 Rue Didouche Mourad, Alger', 'ahmed.benali.fb', 'Client fidèle depuis 2 ans'),
('Mansouri', 'Fatima', '+213666789012', 'fatima.mansouri@email.com', 'Oran', '456 Boulevard de la République, Oran', 'fatima.mansouri', 'Préfère les paiements CCP'),
('Benaissa', 'Karim', '+213777345678', 'karim.benaissa@email.com', 'Constantine', '789 Rue Larbi Ben Mhidi, Constantine', NULL, 'Nouveau client'),
('Zerrouki', 'Amina', '+213888901234', 'amina.zerrouki@email.com', 'Sétif', '321 Avenue 1er Novembre, Sétif', 'amina.zerrouki', 'Cliente VIP'),
('Hamidi', 'Mohamed', '+213999567890', 'mohamed.hamidi@email.com', 'Annaba', '654 Rue de la Révolution, Annaba', NULL, 'Paiements toujours en espèces');

-- Insertion des recharges de test
INSERT OR IGNORE INTO recharges (id_plateforme, montant, devise, statut, date_recharge, notes) VALUES
(1, 500.00, 'USD', 'confirme', '2024-02-10 10:30:00', 'Recharge mensuelle DAR IPTV'),
(2, 200.00, 'USD', 'confirme', '2024-02-08 14:15:00', 'Recharge Netflix comptes premium'),
(3, 300.00, 'EUR', 'confirme', '2024-02-05 09:45:00', 'Recharge IPTV Pro'),
(1, 250.00, 'USD', 'en_attente', '2024-02-12 16:20:00', 'Recharge en attente de confirmation');

-- Insertion des ventes de test
INSERT OR IGNORE INTO ventes (id_client, id_produit, id_plateforme, quantite, prix_unitaire, date_vente, methode_paiement, statut_paiement, notes) VALUES
-- Ventes pour Ahmed Benali
(1, 1, 1, 1, 150.00, '2024-02-01 10:30:00', 'espece', 'paye', 'Vente IPTV Premium 12 mois'),
(1, 4, 2, 2, 25.00, '2024-02-05 14:20:00', 'ccp', 'paye', 'Deux comptes Netflix'),

-- Ventes pour Fatima Mansouri
(2, 2, 1, 1, 80.00, '2024-02-03 11:15:00', 'ccp', 'paye', 'IPTV Standard 6 mois'),
(2, 5, 2, 1, 65.00, '2024-02-08 16:45:00', 'ccp', 'paye', 'Netflix 3 mois'),

-- Ventes pour Karim Benaissa
(3, 3, 1, 1, 45.00, '2024-02-06 09:30:00', 'espece', 'paye', 'IPTV Basic 3 mois'),

-- Ventes pour Amina Zerrouki
(4, 7, 3, 1, 180.00, '2024-02-09 13:20:00', 'baridimob', 'paye', 'IPTV Pro 12 mois'),

-- Ventes pour Mohamed Hamidi
(5, 8, 3, 1, 100.00, '2024-02-11 15:10:00', 'espece', 'en_attente', 'IPTV Pro 6 mois - paiement en attente');

-- Insertion des paramètres par défaut
INSERT OR IGNORE INTO parametres (
    business_settings, 
    financial_settings, 
    notification_settings, 
    system_settings
) VALUES (
    '{"nom_entreprise":"IPTV Solutions DZ","adresse":"123 Rue Didouche Mourad, Alger","telephone":"+213 555 123 456","email":"contact@iptvsolutions.dz","site_web":"https://iptvsolutions.dz","logo":"/logo.png"}',
    '{"devise_principale":"DZD","taux_change_usd":270,"taux_change_eur":290,"tva_applicable":false,"taux_tva":19}',
    '{"email_notifications":true,"sms_notifications":false,"stock_alerts":true,"seuil_alerte_global":10,"rappel_paiements":true}',
    '{"theme":"auto","langue":"fr","timezone":"Africa/Algiers","format_date":"DD/MM/YYYY","sauvegarde_auto":true,"frequence_sauvegarde":"daily"}'
);

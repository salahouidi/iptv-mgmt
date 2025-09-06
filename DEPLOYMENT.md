# 🚀 Guide de Déploiement - IPTV Management Platform

Ce guide vous accompagne dans la migration de l'implémentation mock vers un vrai backend Cloudflare D1.

## 📋 Prérequis

### 1. Compte Cloudflare
- Compte Cloudflare actif
- Accès aux Workers et D1 (plan gratuit suffisant pour commencer)

### 2. Outils requis
```bash
# Installer Wrangler CLI
npm install -g wrangler

# Vérifier l'installation
wrangler --version
```

### 3. Authentification
```bash
# Se connecter à Cloudflare
wrangler login

# Vérifier la connexion
wrangler whoami
```

## 🏗️ Étapes de Déploiement

### Étape 1: Migration Automatique
```bash
# Rendre le script exécutable
chmod +x scripts/migrate-to-d1.sh

# Exécuter la migration
./scripts/migrate-to-d1.sh
```

Le script automatique va :
- ✅ Créer la base de données D1
- ✅ Exécuter le schéma SQL
- ✅ Insérer les données initiales
- ✅ Déployer les Workers
- ✅ Configurer les variables d'environnement

### Étape 2: Configuration Manuelle (si nécessaire)

#### 2.1 Créer la base de données D1
```bash
# Créer la base de données
wrangler d1 create iptv-management-db

# Noter l'ID de la base de données retourné
# Exemple: database_id = "xxxx-xxxx-xxxx-xxxx"
```

#### 2.2 Configurer wrangler.toml
```toml
# Remplacer YOUR_DATABASE_ID_HERE par l'ID obtenu
[[d1_databases]]
binding = "DB"
database_name = "iptv-management-db"
database_id = "votre-database-id-ici"
```

#### 2.3 Créer le schéma
```bash
# Exécuter le schéma
wrangler d1 execute iptv-management-db --file=./database/schema.sql

# Insérer les données initiales
wrangler d1 execute iptv-management-db --file=./database/seed.sql
```

#### 2.4 Déployer les Workers
```bash
cd workers

# Installer les dépendances
npm install

# Déployer en développement
npm run deploy:staging

# Déployer en production
npm run deploy:production
```

### Étape 3: Configuration Frontend

#### 3.1 Variables d'environnement
```bash
# Copier le fichier d'environnement
cp .env.development .env.local

# Éditer .env.local
VITE_API_BASE_URL=https://votre-worker.votre-subdomain.workers.dev/api
VITE_USE_MOCK_DATA=false
```

#### 3.2 Redémarrer le serveur
```bash
# Arrêter le serveur actuel (Ctrl+C)
# Redémarrer
npm run dev
```

## 🧪 Tests et Validation

### Test automatique de l'API
```bash
# Rendre le script exécutable
chmod +x scripts/test-api.sh

# Tester l'API
./scripts/test-api.sh https://votre-worker.votre-subdomain.workers.dev/api
```

### Tests manuels
1. **Dashboard** - Vérifier que les statistiques se chargent
2. **Plateformes** - Créer, modifier, supprimer une plateforme
3. **Clients** - Ajouter un nouveau client
4. **Produits** - Créer un produit et vérifier le calcul de prix
5. **Ventes** - Enregistrer une vente et vérifier la mise à jour du stock
6. **Paramètres** - Modifier et sauvegarder les paramètres

## 🔧 Dépannage

### Problème: Base de données non trouvée
```bash
# Vérifier que la base existe
wrangler d1 list

# Vérifier la configuration dans wrangler.toml
cat wrangler.toml | grep -A 3 "d1_databases"
```

### Problème: Erreurs CORS
```bash
# Vérifier les variables CORS dans wrangler.toml
[vars]
CORS_ORIGIN = "http://localhost:5174"
```

### Problème: Worker ne répond pas
```bash
# Vérifier les logs
wrangler tail

# Redéployer
wrangler deploy
```

### Problème: Frontend ne se connecte pas
```bash
# Vérifier les variables d'environnement
cat .env.local

# Vérifier que VITE_USE_MOCK_DATA=false
# Vérifier que VITE_API_BASE_URL pointe vers votre Worker
```

## 📊 Monitoring et Logs

### Voir les logs en temps réel
```bash
cd workers
wrangler tail
```

### Exécuter des requêtes SQL
```bash
# Exemple: compter les clients
wrangler d1 execute iptv-management-db --command="SELECT COUNT(*) FROM clients"

# Voir les dernières ventes
wrangler d1 execute iptv-management-db --command="SELECT * FROM ventes ORDER BY date_creation DESC LIMIT 5"
```

## 🚀 Déploiement en Production

### 1. Configurer l'environnement de production
```bash
# Déployer en production
cd workers
npm run deploy:production
```

### 2. Mettre à jour les variables d'environnement
```bash
# Copier le fichier de production
cp .env.production .env.local

# Mettre à jour avec l'URL de production
VITE_API_BASE_URL=https://votre-worker-prod.votre-subdomain.workers.dev/api
```

### 3. Build et déploiement frontend
```bash
# Build pour la production
npm run build

# Déployer sur Cloudflare Pages ou votre hébergeur
```

## 📈 Optimisations

### Performance
- Les requêtes sont optimisées avec des index
- Pagination automatique pour les grandes listes
- Cache des réponses fréquentes

### Sécurité
- Validation des données côté serveur
- Sanitisation des entrées utilisateur
- Gestion des erreurs sécurisée

### Monitoring
- Logs détaillés dans Cloudflare
- Métriques de performance
- Alertes en cas d'erreur

## 🆘 Support

En cas de problème :
1. Vérifier les logs avec `wrangler tail`
2. Tester l'API avec le script de test
3. Vérifier la configuration des variables d'environnement
4. Consulter la documentation Cloudflare D1 et Workers

## 🎉 Félicitations !

Une fois la migration terminée, vous aurez :
- ✅ Une base de données D1 complètement fonctionnelle
- ✅ Des API Workers performantes et scalables
- ✅ Un frontend connecté au vrai backend
- ✅ Toutes les fonctionnalités CRUD opérationnelles
- ✅ Un système prêt pour la production

Votre plateforme IPTV Management est maintenant prête pour une utilisation réelle !

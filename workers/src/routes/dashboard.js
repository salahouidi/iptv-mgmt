// Dashboard API routes

import { successResponse, errorResponse } from '../utils/responses';
import { fetchOne, fetchAll } from '../utils/database';

export async function handleDashboard(request) {
  const db = request.env.DB;

  try {
    // Get current date for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Get total statistics
    const totalStats = await getTotalStats(db);
    
    // Get monthly statistics
    const monthlyStats = await getMonthlyStats(db, startOfMonth);
    
    // Get weekly statistics
    const weeklyStats = await getWeeklyStats(db, startOfWeek);
    
    // Get daily statistics
    const dailyStats = await getDailyStats(db, startOfDay);
    
    // Get recent activities
    const recentActivities = await getRecentActivities(db);
    
    // Get low stock alerts
    const lowStockAlerts = await getLowStockAlerts(db);
    
    // Get sales by category
    const salesByCategory = await getSalesByCategory(db, startOfMonth);
    
    // Get top clients
    const topClients = await getTopClients(db, startOfMonth);

    const dashboardData = {
      totals: totalStats,
      monthly: monthlyStats,
      weekly: weeklyStats,
      daily: dailyStats,
      recent_activities: recentActivities,
      low_stock_alerts: lowStockAlerts,
      sales_by_category: salesByCategory,
      top_clients: topClients
    };

    return successResponse(dashboardData);
  } catch (error) {
    console.error('Dashboard handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getTotalStats(db) {
  const queries = {
    total_clients: 'SELECT COUNT(*) as count FROM clients',
    total_produits: 'SELECT COUNT(*) as count FROM produits',
    total_plateformes: 'SELECT COUNT(*) as count FROM plateformes',
    total_ventes: 'SELECT COUNT(*) as count FROM ventes',
    total_revenue: 'SELECT COALESCE(SUM(montant_total), 0) as total FROM ventes WHERE statut_paiement = "paye"',
    total_pending: 'SELECT COALESCE(SUM(montant_total), 0) as total FROM ventes WHERE statut_paiement = "en_attente"'
  };

  const results = {};
  for (const [key, query] of Object.entries(queries)) {
    const result = await fetchOne(db, query);
    results[key] = result.count || result.total || 0;
  }

  return results;
}

async function getMonthlyStats(db, startOfMonth) {
  const queries = {
    ventes_count: 'SELECT COUNT(*) as count FROM ventes WHERE date_vente >= ?',
    revenue: 'SELECT COALESCE(SUM(montant_total), 0) as total FROM ventes WHERE date_vente >= ? AND statut_paiement = "paye"',
    new_clients: 'SELECT COUNT(*) as count FROM clients WHERE date_creation >= ?',
    recharges: 'SELECT COALESCE(SUM(montant), 0) as total FROM recharges WHERE date_recharge >= ? AND statut = "confirme"'
  };

  const results = {};
  for (const [key, query] of Object.entries(queries)) {
    const result = await fetchOne(db, query, [startOfMonth]);
    results[key] = result.count || result.total || 0;
  }

  return results;
}

async function getWeeklyStats(db, startOfWeek) {
  const queries = {
    ventes_count: 'SELECT COUNT(*) as count FROM ventes WHERE date_vente >= ?',
    revenue: 'SELECT COALESCE(SUM(montant_total), 0) as total FROM ventes WHERE date_vente >= ? AND statut_paiement = "paye"'
  };

  const results = {};
  for (const [key, query] of Object.entries(queries)) {
    const result = await fetchOne(db, query, [startOfWeek]);
    results[key] = result.count || result.total || 0;
  }

  return results;
}

async function getDailyStats(db, startOfDay) {
  const queries = {
    ventes_count: 'SELECT COUNT(*) as count FROM ventes WHERE date_vente >= ?',
    revenue: 'SELECT COALESCE(SUM(montant_total), 0) as total FROM ventes WHERE date_vente >= ? AND statut_paiement = "paye"'
  };

  const results = {};
  for (const [key, query] of Object.entries(queries)) {
    const result = await fetchOne(db, query, [startOfDay]);
    results[key] = result.count || result.total || 0;
  }

  return results;
}

async function getRecentActivities(db) {
  const query = `
    SELECT 
      'vente' as type,
      v.id_vente as id,
      'Vente de ' || p.nom || ' à ' || c.prenom || ' ' || c.nom as description,
      v.montant_total as montant,
      v.date_vente as date_activite
    FROM ventes v
    JOIN produits p ON v.id_produit = p.id_produit
    JOIN clients c ON v.id_client = c.id_client
    
    UNION ALL
    
    SELECT 
      'recharge' as type,
      r.id_recharge as id,
      'Recharge ' || pl.nom || ' - ' || r.montant || ' ' || r.devise as description,
      r.montant as montant,
      r.date_recharge as date_activite
    FROM recharges r
    JOIN plateformes pl ON r.id_plateforme = pl.id_plateforme
    WHERE r.statut = 'confirme'
    
    ORDER BY date_activite DESC
    LIMIT 10
  `;

  return await fetchAll(db, query);
}

async function getLowStockAlerts(db) {
  const query = `
    SELECT 
      p.*,
      pl.nom as plateforme_nom,
      (p.stock_actuel <= p.seuil_alerte) as is_critical
    FROM produits p
    JOIN plateformes pl ON p.id_plateforme = pl.id_plateforme
    WHERE p.stock_actuel <= p.seuil_alerte
    ORDER BY p.stock_actuel ASC
    LIMIT 10
  `;

  return await fetchAll(db, query);
}

async function getSalesByCategory(db, startOfMonth) {
  const query = `
    SELECT 
      p.categorie,
      COUNT(v.id_vente) as ventes_count,
      COALESCE(SUM(v.montant_total), 0) as revenue
    FROM ventes v
    JOIN produits p ON v.id_produit = p.id_produit
    WHERE v.date_vente >= ? AND v.statut_paiement = 'paye'
    GROUP BY p.categorie
    ORDER BY revenue DESC
  `;

  return await fetchAll(db, query, [startOfMonth]);
}

async function getTopClients(db, startOfMonth) {
  const query = `
    SELECT 
      c.id_client,
      c.prenom || ' ' || c.nom as nom_complet,
      c.telephone,
      c.wilaya,
      COUNT(v.id_vente) as total_achats,
      COALESCE(SUM(v.montant_total), 0) as montant_total
    FROM clients c
    JOIN ventes v ON c.id_client = v.id_client
    WHERE v.date_vente >= ? AND v.statut_paiement = 'paye'
    GROUP BY c.id_client
    ORDER BY montant_total DESC
    LIMIT 5
  `;

  return await fetchAll(db, query, [startOfMonth]);
}

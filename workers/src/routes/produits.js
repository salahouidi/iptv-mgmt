// Produits API routes

import { successResponse, errorResponse, paginatedResponse, parseRequestBody } from '../utils/responses';
import { executeQuery, fetchOne, fetchAll, buildWhereClause, validateRequired, sanitizeData } from '../utils/database';

export async function handleProduits(request, env, context) {
  const { method, url } = request;
  const db = request.env?.DB || env?.DB;

  // Safe URL parsing with error handling
  let id = null;
  try {
    if (url && typeof url === 'string') {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== 'produits' && (isNaN(Number(lastPart)) === false || lastPart.length > 0)) {
        id = lastPart;
      }
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
    id = context?.params?.id || request.params?.id || null;
  }

  try {
    switch (method) {
      case 'GET':
        if (id) {
          return await getProduitById(db, id);
        } else {
          return await getProduits(db, request);
        }
      
      case 'POST':
        return await createProduit(db, request);
      
      case 'PUT':
        return await updateProduit(db, id, request);
      
      case 'DELETE':
        return await deleteProduit(db, id);
      
      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Produits handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getProduits(db, request) {
  const url = new URL(request.url);
  const filters = {
    id_plateforme: url.searchParams.get('id_plateforme'),
    categorie: url.searchParams.get('categorie'),
    search: url.searchParams.get('search')
  };
  
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = '';
  let params = [];
  
  if (filters.id_plateforme) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'p.id_plateforme = ?';
    params.push(filters.id_plateforme);
  }
  
  if (filters.categorie) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'p.categorie = ?';
    params.push(filters.categorie);
  }
  
  if (filters.search) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += '(p.nom LIKE ? OR p.description LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM produits p ${whereClause}`;
  const countResult = await fetchOne(db, countQuery, params);
  const total = countResult.total;

  // Get produits with platform info
  const query = `
    SELECT
      p.*,
      pl.nom as plateforme_nom,
      'DZD' as plateforme_devise,
      (p.stock_actuel <= p.seuil_alerte) as stock_faible,
      COUNT(v.id_vente) as total_ventes
    FROM produits p
    JOIN plateformes pl ON p.id_plateforme = pl.id_plateforme
    LEFT JOIN ventes v ON p.id_produit = v.id_produit
    ${whereClause}
    GROUP BY p.id_produit
    ORDER BY p.date_creation DESC
    LIMIT ? OFFSET ?
  `;

  const produits = await fetchAll(db, query, [...params, limit, offset]);

  return paginatedResponse(produits, total, page, limit);
}

async function getProduitById(db, id) {
  const query = `
    SELECT
      p.*,
      pl.nom as plateforme_nom,
      'DZD' as plateforme_devise,
      (p.stock_actuel <= p.seuil_alerte) as stock_faible,
      COUNT(v.id_vente) as total_ventes,
      COALESCE(SUM(v.quantite), 0) as quantite_vendue
    FROM produits p
    JOIN plateformes pl ON p.id_plateforme = pl.id_plateforme
    LEFT JOIN ventes v ON p.id_produit = v.id_produit
    WHERE p.id_produit = ?
    GROUP BY p.id_produit
  `;

  const produit = await fetchOne(db, query, [id]);
  
  if (!produit) {
    return errorResponse('Produit not found', 404);
  }

  return successResponse(produit);
}

async function createProduit(db, request) {
  const data = await parseRequestBody(request);
  
  // Validate required fields
  validateRequired(data, ['id_plateforme', 'nom', 'categorie', 'duree_mois', 'prix_achat_moyen', 'marge']);

  // Sanitize data
  const allowedFields = ['id_plateforme', 'nom', 'description', 'categorie', 'duree_mois', 'prix_achat_moyen', 'marge', 'stock_actuel', 'seuil_alerte', 'cost_type', 'default_cost', 'duration_weeks', 'is_multi_panel'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Set defaults for new fields
  sanitizedData.cost_type = sanitizedData.cost_type || 'currency';
  sanitizedData.default_cost = sanitizedData.default_cost || sanitizedData.prix_achat_moyen;
  sanitizedData.duration_weeks = sanitizedData.duration_weeks || (sanitizedData.duree_mois * 4);
  sanitizedData.is_multi_panel = sanitizedData.is_multi_panel || false;
  
  // Validate categorie
  if (!['IPTV', 'Netflix', 'Autre'].includes(sanitizedData.categorie)) {
    return errorResponse('Invalid categorie. Must be IPTV, Netflix, or Autre', 400);
  }
  
  // Validate cost_type
  if (!['currency', 'points'].includes(sanitizedData.cost_type)) {
    return errorResponse('Invalid cost_type. Must be "currency" or "points"', 400);
  }

  // Validate numeric fields
  if (sanitizedData.duree_mois <= 0) {
    return errorResponse('duree_mois must be greater than 0', 400);
  }

  if (sanitizedData.prix_achat_moyen < 0) {
    return errorResponse('prix_achat_moyen must be >= 0', 400);
  }

  if (sanitizedData.marge < 0) {
    return errorResponse('marge must be >= 0', 400);
  }

  if (sanitizedData.default_cost < 0) {
    return errorResponse('default_cost must be >= 0', 400);
  }

  if (sanitizedData.duration_weeks <= 0) {
    return errorResponse('duration_weeks must be greater than 0', 400);
  }
  
  // Check if plateforme exists
  const plateforme = await fetchOne(db, 'SELECT id_plateforme FROM plateformes WHERE id_plateforme = ?', [sanitizedData.id_plateforme]);
  if (!plateforme) {
    return errorResponse('Plateforme not found', 404);
  }

  const query = `
    INSERT INTO produits (id_plateforme, nom, description, categorie, duree_mois, prix_achat_moyen, marge, stock_actuel, seuil_alerte, cost_type, default_cost, duration_weeks, is_multi_panel)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await executeQuery(db, query, [
    sanitizedData.id_plateforme,
    sanitizedData.nom,
    sanitizedData.description || null,
    sanitizedData.categorie,
    sanitizedData.duree_mois,
    sanitizedData.prix_achat_moyen,
    sanitizedData.marge,
    sanitizedData.stock_actuel || 0,
    sanitizedData.seuil_alerte || 5,
    sanitizedData.cost_type,
    sanitizedData.default_cost,
    sanitizedData.duration_weeks,
    sanitizedData.is_multi_panel
  ]);

  if (!result.success) {
    return errorResponse('Failed to create produit', 500);
  }

  // Get the created produit
  const createdProduit = await fetchOne(db, 
    'SELECT * FROM produits WHERE id_produit = ?', 
    [result.meta.last_row_id]
  );

  return successResponse(createdProduit, 'Produit created successfully', 201);
}

async function updateProduit(db, id, request) {
  const data = await parseRequestBody(request);
  
  // Check if produit exists
  const existing = await fetchOne(db, 'SELECT * FROM produits WHERE id_produit = ?', [id]);
  if (!existing) {
    return errorResponse('Produit not found', 404);
  }
  
  // Sanitize data
  const allowedFields = ['nom', 'description', 'categorie', 'duree_mois', 'prix_achat_moyen', 'marge', 'stock_actuel', 'seuil_alerte', 'cost_type', 'default_cost', 'duration_weeks', 'is_multi_panel'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Validate categorie if provided
  if (sanitizedData.categorie && !['IPTV', 'Netflix', 'Autre'].includes(sanitizedData.categorie)) {
    return errorResponse('Invalid categorie. Must be IPTV, Netflix, or Autre', 400);
  }

  // Validate cost_type if provided
  if (sanitizedData.cost_type && !['currency', 'points'].includes(sanitizedData.cost_type)) {
    return errorResponse('Invalid cost_type. Must be "currency" or "points"', 400);
  }

  // Validate numeric fields if provided
  if (sanitizedData.duree_mois !== undefined && sanitizedData.duree_mois <= 0) {
    return errorResponse('duree_mois must be greater than 0', 400);
  }

  if (sanitizedData.prix_achat_moyen !== undefined && sanitizedData.prix_achat_moyen < 0) {
    return errorResponse('prix_achat_moyen must be >= 0', 400);
  }

  if (sanitizedData.marge !== undefined && sanitizedData.marge < 0) {
    return errorResponse('marge must be >= 0', 400);
  }

  if (sanitizedData.default_cost !== undefined && sanitizedData.default_cost < 0) {
    return errorResponse('default_cost must be >= 0', 400);
  }

  if (sanitizedData.duration_weeks !== undefined && sanitizedData.duration_weeks <= 0) {
    return errorResponse('duration_weeks must be greater than 0', 400);
  }

  // Build update query
  const updateFields = [];
  const params = [];
  
  Object.entries(sanitizedData).forEach(([key, value]) => {
    updateFields.push(`${key} = ?`);
    params.push(value);
  });
  
  if (updateFields.length === 0) {
    return errorResponse('No valid fields to update', 400);
  }
  
  params.push(id);
  
  const query = `UPDATE produits SET ${updateFields.join(', ')} WHERE id_produit = ?`;
  
  const result = await executeQuery(db, query, params);
  
  if (!result.success) {
    return errorResponse('Failed to update produit', 500);
  }

  // Get the updated produit
  const updatedProduit = await fetchOne(db, 
    'SELECT * FROM produits WHERE id_produit = ?', 
    [id]
  );

  return successResponse(updatedProduit, 'Produit updated successfully');
}

async function deleteProduit(db, id) {
  // Check if produit exists
  const existing = await fetchOne(db, 'SELECT * FROM produits WHERE id_produit = ?', [id]);
  if (!existing) {
    return errorResponse('Produit not found', 404);
  }
  
  // Check for dependencies (ventes)
  const ventesCount = await fetchOne(db, 
    'SELECT COUNT(*) as count FROM ventes WHERE id_produit = ?', 
    [id]
  );
  
  if (ventesCount.count > 0) {
    return errorResponse('Cannot delete produit with existing sales', 400);
  }

  const result = await executeQuery(db, 'DELETE FROM produits WHERE id_produit = ?', [id]);
  
  if (!result.success) {
    return errorResponse('Failed to delete produit', 500);
  }

  return successResponse(null, 'Produit deleted successfully');
}

// Plateformes API routes

import { successResponse, errorResponse, paginatedResponse, parseRequestBody } from '../utils/responses';
import { executeQuery, fetchOne, fetchAll, buildWhereClause, validateRequired, sanitizeData } from '../utils/database';

export async function handlePlateformes(request, env, context) {
  const { method, url } = request;
  const db = request.env?.DB || env?.DB;

  // Safe URL parsing with error handling
  let id = null;
  try {
    if (url && typeof url === 'string') {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      // Only consider it an ID if it's not the resource name and looks like an ID
      if (lastPart && lastPart !== 'plateformes' && (isNaN(Number(lastPart)) === false || lastPart.length > 0)) {
        id = lastPart;
      }
    }
  } catch (error) {
    console.error('Error parsing URL:', error);
    // Try alternative parameter extraction methods
    id = context?.params?.id || request.params?.id || null;
  }

  console.log('🔍 Plateformes handler debug:', {
    method,
    id,
    url,
    hasDB: !!db
  });

  try {
    switch (method) {
      case 'GET':
        if (id) {
          return await getPlateformeById(db, id);
        } else {
          return await getPlateformes(db, request);
        }
      
      case 'POST':
        return await createPlateforme(db, request);
      
      case 'PUT':
        return await updatePlateforme(db, id, request);
      
      case 'DELETE':
        return await deletePlateforme(db, id);
      
      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Plateformes handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getPlateformes(db, request) {
  const url = new URL(request.url);
  const filters = {
    search: url.searchParams.get('search')
  };
  
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  const { whereClause, params } = buildWhereClause(filters);
  
  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM plateformes ${whereClause}`;
  const countResult = await fetchOne(db, countQuery, params);
  const total = countResult.total;

  // Get plateformes with stats
  const query = `
    SELECT 
      p.*,
      COUNT(DISTINCT r.id_recharge) as total_recharges,
      COALESCE(SUM(CASE WHEN r.statut = 'confirme' THEN r.montant ELSE 0 END), 0) as total_recharge_confirme,
      COALESCE(SUM(CASE WHEN r.statut = 'en_attente' THEN r.montant ELSE 0 END), 0) as total_recharge_attente,
      COUNT(DISTINCT pr.id_produit) as nb_produits
    FROM plateformes p
    LEFT JOIN recharges r ON p.id_plateforme = r.id_plateforme
    LEFT JOIN produits pr ON p.id_plateforme = pr.id_plateforme
    ${whereClause}
    GROUP BY p.id_plateforme
    ORDER BY p.date_creation DESC
    LIMIT ? OFFSET ?
  `;

  const plateformes = await fetchAll(db, query, [...params, limit, offset]);

  return paginatedResponse(plateformes, total, page, limit);
}

async function getPlateformeById(db, id) {
  const query = `
    SELECT 
      p.*,
      COUNT(DISTINCT r.id_recharge) as total_recharges,
      COALESCE(SUM(CASE WHEN r.statut = 'confirme' THEN r.montant ELSE 0 END), 0) as total_recharge_confirme,
      COALESCE(SUM(CASE WHEN r.statut = 'en_attente' THEN r.montant ELSE 0 END), 0) as total_recharge_attente,
      COUNT(DISTINCT pr.id_produit) as nb_produits
    FROM plateformes p
    LEFT JOIN recharges r ON p.id_plateforme = r.id_plateforme
    LEFT JOIN produits pr ON p.id_plateforme = pr.id_plateforme
    WHERE p.id_plateforme = ?
    GROUP BY p.id_plateforme
  `;

  const plateforme = await fetchOne(db, query, [id]);
  
  if (!plateforme) {
    return errorResponse('Plateforme not found', 404);
  }

  return successResponse(plateforme);
}

async function createPlateforme(db, request) {
  const data = await parseRequestBody(request);

  // Validate required fields
  validateRequired(data, ['nom', 'solde_initial']);

  // Sanitize data
  const allowedFields = ['nom', 'description', 'url', 'solde_initial', 'balance_type', 'balance_unit', 'point_conversion_rate'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Set defaults for new fields
  sanitizedData.balance_type = sanitizedData.balance_type || 'currency';
  sanitizedData.balance_unit = sanitizedData.balance_unit || 'DZD';

  // Validate balance_type
  if (!['currency', 'points'].includes(sanitizedData.balance_type)) {
    return errorResponse('Invalid balance_type. Must be "currency" or "points"', 400);
  }

  // Validate solde_initial
  const soldeInitial = parseFloat(sanitizedData.solde_initial);
  if (isNaN(soldeInitial) || soldeInitial < 0) {
    return errorResponse('Invalid solde_initial. Must be a positive number', 400);
  }

  // Validate point_conversion_rate for point-based panels
  if (sanitizedData.balance_type === 'points' && sanitizedData.point_conversion_rate) {
    const conversionRate = parseFloat(sanitizedData.point_conversion_rate);
    if (isNaN(conversionRate) || conversionRate <= 0) {
      return errorResponse('Invalid point_conversion_rate. Must be a positive number', 400);
    }
  }

  const query = `
    INSERT INTO plateformes (nom, description, url, solde_initial, balance_type, balance_unit, point_conversion_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await executeQuery(db, query, [
    sanitizedData.nom,
    sanitizedData.description || null,
    sanitizedData.url || null,
    soldeInitial,
    sanitizedData.balance_type,
    sanitizedData.balance_unit,
    sanitizedData.point_conversion_rate || null
  ]);

  if (!result.success) {
    return errorResponse('Failed to create plateforme', 500);
  }

  // Get the created plateforme
  const createdPlateforme = await fetchOne(db, 
    'SELECT * FROM plateformes WHERE id_plateforme = ?', 
    [result.meta.last_row_id]
  );

  return successResponse(createdPlateforme, 'Plateforme created successfully', 201);
}

async function updatePlateforme(db, id, request) {
  const data = await parseRequestBody(request);
  
  // Check if plateforme exists
  const existing = await fetchOne(db, 'SELECT * FROM plateformes WHERE id_plateforme = ?', [id]);
  if (!existing) {
    return errorResponse('Plateforme not found', 404);
  }
  
  // Sanitize data
  const allowedFields = ['nom', 'description', 'url', 'solde_initial', 'balance_type', 'balance_unit', 'point_conversion_rate'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Validate balance_type if provided
  if (sanitizedData.balance_type && !['currency', 'points'].includes(sanitizedData.balance_type)) {
    return errorResponse('Invalid balance_type. Must be "currency" or "points"', 400);
  }

  // Validate solde_initial if provided
  if (sanitizedData.solde_initial !== undefined) {
    const soldeInitial = parseFloat(sanitizedData.solde_initial);
    if (isNaN(soldeInitial) || soldeInitial < 0) {
      return errorResponse('Invalid solde_initial. Must be a positive number', 400);
    }
    sanitizedData.solde_initial = soldeInitial;
  }

  // Validate point_conversion_rate if provided
  if (sanitizedData.point_conversion_rate !== undefined) {
    const conversionRate = parseFloat(sanitizedData.point_conversion_rate);
    if (isNaN(conversionRate) || conversionRate <= 0) {
      return errorResponse('Invalid point_conversion_rate. Must be a positive number', 400);
    }
    sanitizedData.point_conversion_rate = conversionRate;
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
  
  const query = `UPDATE plateformes SET ${updateFields.join(', ')} WHERE id_plateforme = ?`;
  
  const result = await executeQuery(db, query, params);
  
  if (!result.success) {
    return errorResponse('Failed to update plateforme', 500);
  }

  // Get the updated plateforme
  const updatedPlateforme = await fetchOne(db, 
    'SELECT * FROM plateformes WHERE id_plateforme = ?', 
    [id]
  );

  return successResponse(updatedPlateforme, 'Plateforme updated successfully');
}

async function deletePlateforme(db, id) {
  // Check if plateforme exists
  const existing = await fetchOne(db, 'SELECT * FROM plateformes WHERE id_plateforme = ?', [id]);
  if (!existing) {
    return errorResponse('Plateforme not found', 404);
  }
  
  // Check for dependencies
  const rechargesCount = await fetchOne(db, 
    'SELECT COUNT(*) as count FROM recharges WHERE id_plateforme = ?', 
    [id]
  );
  
  const produitsCount = await fetchOne(db, 
    'SELECT COUNT(*) as count FROM produits WHERE id_plateforme = ?', 
    [id]
  );
  
  if (rechargesCount.count > 0 || produitsCount.count > 0) {
    return errorResponse('Cannot delete plateforme with existing recharges or produits', 400);
  }

  const result = await executeQuery(db, 'DELETE FROM plateformes WHERE id_plateforme = ?', [id]);
  
  if (!result.success) {
    return errorResponse('Failed to delete plateforme', 500);
  }

  return successResponse(null, 'Plateforme deleted successfully');
}

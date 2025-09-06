import { successResponse, errorResponse, paginatedResponse, parseRequestBody } from '../utils/responses.js';
import { executeQuery, fetchOne, fetchAll, validateRequired, sanitizeData } from '../utils/database.js';

export async function handleProductPanels(request, env, context) {
  const { method, url } = request;
  const db = request.env?.DB || env?.DB;

  // Safe URL parsing with error handling
  let id = null;
  try {
    if (url && typeof url === 'string') {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.length > 3) {
        id = pathParts[3]; // /api/product-panels/{id}
      }
    }
  } catch (error) {
    console.error('URL parsing error:', error);
  }

  // Override with context params if available
  if (context?.params?.id) {
    id = context.params.id;
  }

  try {
    switch (method) {
      case 'GET':
        if (id) {
          return await getProductPanelById(db, id);
        } else {
          return await getProductPanels(db, request);
        }

      case 'POST':
        return await createProductPanel(db, request);

      case 'PUT':
        return await updateProductPanel(db, id, request);

      case 'DELETE':
        return await deleteProductPanel(db, id);

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Product panels handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getProductPanels(db, request) {
  const url = new URL(request.url);
  const filters = {
    id_produit: url.searchParams.get('id_produit'),
    id_plateforme: url.searchParams.get('id_plateforme'),
    is_active: url.searchParams.get('is_active')
  };
  
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = '';
  const params = [];

  if (filters.id_produit) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'pp.id_produit = ?';
    params.push(filters.id_produit);
  }

  if (filters.id_plateforme) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'pp.id_plateforme = ?';
    params.push(filters.id_plateforme);
  }

  if (filters.is_active !== null) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'pp.is_active = ?';
    params.push(filters.is_active === 'true' ? 1 : 0);
  }

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM produit_panels pp
    ${whereClause}
  `;
  
  const { total } = await fetchOne(db, countQuery, params);

  // Get paginated results with related data
  const query = `
    SELECT 
      pp.*,
      p.nom as produit_nom,
      p.categorie as produit_categorie,
      pl.nom as plateforme_nom,
      pl.balance_type as plateforme_balance_type,
      pl.balance_unit as plateforme_balance_unit
    FROM produit_panels pp
    JOIN produits p ON pp.id_produit = p.id_produit
    JOIN plateformes pl ON pp.id_plateforme = pl.id_plateforme
    ${whereClause}
    ORDER BY pp.date_creation DESC
    LIMIT ? OFFSET ?
  `;

  const productPanels = await fetchAll(db, query, [...params, limit, offset]);

  return paginatedResponse(productPanels, total, page, limit);
}

async function getProductPanelById(db, id) {
  const query = `
    SELECT 
      pp.*,
      p.nom as produit_nom,
      p.categorie as produit_categorie,
      p.default_cost as produit_default_cost,
      pl.nom as plateforme_nom,
      pl.balance_type as plateforme_balance_type,
      pl.balance_unit as plateforme_balance_unit
    FROM produit_panels pp
    JOIN produits p ON pp.id_produit = p.id_produit
    JOIN plateformes pl ON pp.id_plateforme = pl.id_plateforme
    WHERE pp.id_association = ?
  `;

  const productPanel = await fetchOne(db, query, [id]);
  
  if (!productPanel) {
    return errorResponse('Product panel association not found', 404);
  }

  return successResponse(productPanel);
}

async function createProductPanel(db, request) {
  const data = await parseRequestBody(request);

  // Validate required fields
  validateRequired(data, ['id_produit', 'id_plateforme']);

  // Sanitize data
  const allowedFields = ['id_produit', 'id_plateforme', 'cost_override', 'is_active'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Set defaults
  sanitizedData.is_active = sanitizedData.is_active !== undefined ? sanitizedData.is_active : true;

  // Validate that product and platform exist
  const product = await fetchOne(db, 'SELECT id_produit FROM produits WHERE id_produit = ?', [sanitizedData.id_produit]);
  if (!product) {
    return errorResponse('Product not found', 404);
  }

  const platform = await fetchOne(db, 'SELECT id_plateforme FROM plateformes WHERE id_plateforme = ?', [sanitizedData.id_plateforme]);
  if (!platform) {
    return errorResponse('Platform not found', 404);
  }

  // Check if association already exists
  const existing = await fetchOne(db, 
    'SELECT id_association FROM produit_panels WHERE id_produit = ? AND id_plateforme = ?', 
    [sanitizedData.id_produit, sanitizedData.id_plateforme]
  );
  
  if (existing) {
    return errorResponse('Product-platform association already exists', 409);
  }

  const query = `
    INSERT INTO produit_panels (id_produit, id_plateforme, cost_override, is_active)
    VALUES (?, ?, ?, ?)
  `;

  const result = await executeQuery(db, query, [
    sanitizedData.id_produit,
    sanitizedData.id_plateforme,
    sanitizedData.cost_override || null,
    sanitizedData.is_active
  ]);

  if (!result.success) {
    return errorResponse('Failed to create product panel association', 500);
  }

  // Get the created association
  const createdAssociation = await fetchOne(db, 
    'SELECT * FROM produit_panels WHERE id_association = ?', 
    [result.meta.last_row_id]
  );

  return successResponse(createdAssociation, 'Product panel association created successfully', 201);
}

async function updateProductPanel(db, id, request) {
  const data = await parseRequestBody(request);
  
  // Check if association exists
  const existing = await fetchOne(db, 'SELECT * FROM produit_panels WHERE id_association = ?', [id]);
  if (!existing) {
    return errorResponse('Product panel association not found', 404);
  }
  
  // Sanitize data
  const allowedFields = ['cost_override', 'is_active'];
  const sanitizedData = sanitizeData(data, allowedFields);

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
  
  const query = `UPDATE produit_panels SET ${updateFields.join(', ')} WHERE id_association = ?`;
  
  const result = await executeQuery(db, query, params);
  
  if (!result.success) {
    return errorResponse('Failed to update product panel association', 500);
  }

  // Get the updated association
  const updatedAssociation = await fetchOne(db, 
    'SELECT * FROM produit_panels WHERE id_association = ?', 
    [id]
  );

  return successResponse(updatedAssociation, 'Product panel association updated successfully');
}

async function deleteProductPanel(db, id) {
  // Check if association exists
  const existing = await fetchOne(db, 'SELECT * FROM produit_panels WHERE id_association = ?', [id]);
  if (!existing) {
    return errorResponse('Product panel association not found', 404);
  }

  const result = await executeQuery(db, 'DELETE FROM produit_panels WHERE id_association = ?', [id]);
  
  if (!result.success) {
    return errorResponse('Failed to delete product panel association', 500);
  }

  return successResponse(null, 'Product panel association deleted successfully');
}

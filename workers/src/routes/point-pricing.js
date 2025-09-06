import { successResponse, errorResponse, paginatedResponse, parseRequestBody } from '../utils/responses.js';
import { executeQuery, fetchOne, fetchAll, validateRequired, sanitizeData } from '../utils/database.js';

export async function handlePointPricing(request, env, context) {
  const { method, url } = request;
  const db = request.env?.DB || env?.DB;

  // Safe URL parsing with error handling
  let id = null;
  try {
    if (url && typeof url === 'string') {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.length > 3) {
        id = pathParts[3]; // /api/point-pricing/{id}
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
          return await getPointPricingRuleById(db, id);
        } else {
          return await getPointPricingRules(db, request);
        }

      case 'POST':
        return await createPointPricingRule(db, request);

      case 'PUT':
        return await updatePointPricingRule(db, id, request);

      case 'DELETE':
        return await deletePointPricingRule(db, id);

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Point pricing handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getPointPricingRules(db, request) {
  const url = new URL(request.url);
  const filters = {
    id_plateforme: url.searchParams.get('id_plateforme'),
    is_active: url.searchParams.get('is_active')
  };
  
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = '';
  const params = [];

  if (filters.id_plateforme) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'ppr.id_plateforme = ?';
    params.push(filters.id_plateforme);
  }

  if (filters.is_active !== null) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'ppr.is_active = ?';
    params.push(filters.is_active === 'true' ? 1 : 0);
  }

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM point_pricing_rules ppr
    ${whereClause}
  `;
  
  const { total } = await fetchOne(db, countQuery, params);

  // Get paginated results with related data
  const query = `
    SELECT 
      ppr.*,
      pl.nom as plateforme_nom,
      pl.balance_type as plateforme_balance_type,
      pl.balance_unit as plateforme_balance_unit
    FROM point_pricing_rules ppr
    JOIN plateformes pl ON ppr.id_plateforme = pl.id_plateforme
    ${whereClause}
    ORDER BY ppr.id_plateforme, ppr.duration_weeks
    LIMIT ? OFFSET ?
  `;

  const rules = await fetchAll(db, query, [...params, limit, offset]);

  return paginatedResponse(rules, total, page, limit);
}

async function getPointPricingRuleById(db, id) {
  const query = `
    SELECT 
      ppr.*,
      pl.nom as plateforme_nom,
      pl.balance_type as plateforme_balance_type,
      pl.balance_unit as plateforme_balance_unit
    FROM point_pricing_rules ppr
    JOIN plateformes pl ON ppr.id_plateforme = pl.id_plateforme
    WHERE ppr.id_rule = ?
  `;

  const rule = await fetchOne(db, query, [id]);
  
  if (!rule) {
    return errorResponse('Point pricing rule not found', 404);
  }

  return successResponse(rule);
}

async function createPointPricingRule(db, request) {
  const data = await parseRequestBody(request);

  // Validate required fields
  validateRequired(data, ['id_plateforme', 'duration_weeks', 'points_cost']);

  // Sanitize data
  const allowedFields = ['id_plateforme', 'duration_weeks', 'points_cost', 'is_active'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Set defaults
  sanitizedData.is_active = sanitizedData.is_active !== undefined ? sanitizedData.is_active : true;

  // Validate numeric fields
  if (sanitizedData.duration_weeks <= 0) {
    return errorResponse('duration_weeks must be greater than 0', 400);
  }

  if (sanitizedData.points_cost <= 0) {
    return errorResponse('points_cost must be greater than 0', 400);
  }

  // Validate that platform exists and is point-based
  const platform = await fetchOne(db, 'SELECT * FROM plateformes WHERE id_plateforme = ?', [sanitizedData.id_plateforme]);
  if (!platform) {
    return errorResponse('Platform not found', 404);
  }

  if (platform.balance_type !== 'points') {
    return errorResponse('Point pricing rules can only be created for point-based platforms', 400);
  }

  // Check if rule already exists for this platform and duration
  const existing = await fetchOne(db, 
    'SELECT id_rule FROM point_pricing_rules WHERE id_plateforme = ? AND duration_weeks = ?', 
    [sanitizedData.id_plateforme, sanitizedData.duration_weeks]
  );
  
  if (existing) {
    return errorResponse('Point pricing rule already exists for this platform and duration', 409);
  }

  const query = `
    INSERT INTO point_pricing_rules (id_plateforme, duration_weeks, points_cost, is_active)
    VALUES (?, ?, ?, ?)
  `;

  const result = await executeQuery(db, query, [
    sanitizedData.id_plateforme,
    sanitizedData.duration_weeks,
    sanitizedData.points_cost,
    sanitizedData.is_active
  ]);

  if (!result.success) {
    return errorResponse('Failed to create point pricing rule', 500);
  }

  // Get the created rule
  const createdRule = await fetchOne(db, 
    'SELECT * FROM point_pricing_rules WHERE id_rule = ?', 
    [result.meta.last_row_id]
  );

  return successResponse(createdRule, 'Point pricing rule created successfully', 201);
}

async function updatePointPricingRule(db, id, request) {
  const data = await parseRequestBody(request);
  
  // Check if rule exists
  const existing = await fetchOne(db, 'SELECT * FROM point_pricing_rules WHERE id_rule = ?', [id]);
  if (!existing) {
    return errorResponse('Point pricing rule not found', 404);
  }
  
  // Sanitize data
  const allowedFields = ['duration_weeks', 'points_cost', 'is_active'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Validate numeric fields if provided
  if (sanitizedData.duration_weeks !== undefined && sanitizedData.duration_weeks <= 0) {
    return errorResponse('duration_weeks must be greater than 0', 400);
  }

  if (sanitizedData.points_cost !== undefined && sanitizedData.points_cost <= 0) {
    return errorResponse('points_cost must be greater than 0', 400);
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
  
  const query = `UPDATE point_pricing_rules SET ${updateFields.join(', ')} WHERE id_rule = ?`;
  
  const result = await executeQuery(db, query, params);
  
  if (!result.success) {
    return errorResponse('Failed to update point pricing rule', 500);
  }

  // Get the updated rule
  const updatedRule = await fetchOne(db, 
    'SELECT * FROM point_pricing_rules WHERE id_rule = ?', 
    [id]
  );

  return successResponse(updatedRule, 'Point pricing rule updated successfully');
}

async function deletePointPricingRule(db, id) {
  // Check if rule exists
  const existing = await fetchOne(db, 'SELECT * FROM point_pricing_rules WHERE id_rule = ?', [id]);
  if (!existing) {
    return errorResponse('Point pricing rule not found', 404);
  }

  const result = await executeQuery(db, 'DELETE FROM point_pricing_rules WHERE id_rule = ?', [id]);
  
  if (!result.success) {
    return errorResponse('Failed to delete point pricing rule', 500);
  }

  return successResponse(null, 'Point pricing rule deleted successfully');
}

// Helper function to calculate points cost for a given duration and platform
export async function calculatePointsCost(db, platformId, durationWeeks) {
  const rule = await fetchOne(db, 
    'SELECT points_cost FROM point_pricing_rules WHERE id_plateforme = ? AND duration_weeks = ? AND is_active = 1', 
    [platformId, durationWeeks]
  );
  
  return rule ? rule.points_cost : null;
}

// Database utilities for D1 operations

export async function executeQuery(db, query, params = []) {
  try {
    const result = await db.prepare(query).bind(...params).run();
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function fetchOne(db, query, params = []) {
  try {
    const result = await db.prepare(query).bind(...params).first();
    return result;
  } catch (error) {
    console.error('Database fetch error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function fetchAll(db, query, params = []) {
  try {
    const result = await db.prepare(query).bind(...params).all();
    return result.results || [];
  } catch (error) {
    console.error('Database fetch error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
}

export function buildWhereClause(filters) {
  const conditions = [];
  const params = [];
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search') {
        // Generic search - adapt based on table
        conditions.push(`(nom LIKE ? OR description LIKE ?)`);
        params.push(`%${value}%`, `%${value}%`);
      } else {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }
  });
  
  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params: params
  };
}

export function validateRequired(data, requiredFields) {
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

export function sanitizeData(data, allowedFields) {
  const sanitized = {};
  
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  });
  
  return sanitized;
}

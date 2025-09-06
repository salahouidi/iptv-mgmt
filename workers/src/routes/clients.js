// Clients API routes

import { successResponse, errorResponse, paginatedResponse, parseRequestBody } from '../utils/responses';
import { executeQuery, fetchOne, fetchAll, buildWhereClause, validateRequired, sanitizeData } from '../utils/database';

export async function handleClients(request, env, context) {
  const { method, url } = request;
  const db = request.env?.DB || env?.DB;

  // Safe URL parsing with error handling
  let id = null;
  try {
    if (url && typeof url === 'string') {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== 'clients' && (isNaN(Number(lastPart)) === false || lastPart.length > 0)) {
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
          return await getClientById(db, id);
        } else {
          return await getClients(db, request);
        }
      
      case 'POST':
        return await createClient(db, request);
      
      case 'PUT':
        return await updateClient(db, id, request);
      
      case 'DELETE':
        return await deleteClient(db, id);
      
      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Clients handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getClients(db, request) {
  const url = new URL(request.url);
  const filters = {
    wilaya: url.searchParams.get('wilaya'),
    search: url.searchParams.get('search')
  };
  
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = (page - 1) * limit;

  // Build WHERE clause for clients
  let whereClause = '';
  let params = [];
  
  if (filters.wilaya) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'wilaya = ?';
    params.push(filters.wilaya);
  }
  
  if (filters.search) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += '(nom LIKE ? OR prenom LIKE ? OR telephone LIKE ? OR email LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM clients ${whereClause}`;
  const countResult = await fetchOne(db, countQuery, params);
  const total = countResult.total;

  // Get clients with purchase stats
  const query = `
    SELECT
      c.*,
      (c.nom || ' ' || c.prenom) as nom_complet,
      COUNT(v.id_vente) as total_achats,
      COALESCE(SUM(v.montant_total), 0) as montant_total_achats,
      MAX(v.date_vente) as dernier_achat
    FROM clients c
    LEFT JOIN ventes v ON c.id_client = v.id_client
    ${whereClause}
    GROUP BY c.id_client
    ORDER BY c.date_creation DESC
    LIMIT ? OFFSET ?
  `;

  const clients = await fetchAll(db, query, [...params, limit, offset]);

  return paginatedResponse(clients, total, page, limit);
}

async function getClientById(db, id) {
  const query = `
    SELECT
      c.*,
      (c.nom || ' ' || c.prenom) as nom_complet,
      COUNT(v.id_vente) as total_achats,
      COALESCE(SUM(v.montant_total), 0) as montant_total_achats,
      MAX(v.date_vente) as dernier_achat
    FROM clients c
    LEFT JOIN ventes v ON c.id_client = v.id_client
    WHERE c.id_client = ?
    GROUP BY c.id_client
  `;

  const client = await fetchOne(db, query, [id]);
  
  if (!client) {
    return errorResponse('Client not found', 404);
  }

  // Get client's purchase history
  const historyQuery = `
    SELECT 
      v.*,
      p.nom as produit_nom,
      pl.nom as plateforme_nom
    FROM ventes v
    JOIN produits p ON v.id_produit = p.id_produit
    JOIN plateformes pl ON v.id_plateforme = pl.id_plateforme
    WHERE v.id_client = ?
    ORDER BY v.date_vente DESC
    LIMIT 10
  `;

  const history = await fetchAll(db, historyQuery, [id]);
  client.historique_achats = history;

  return successResponse(client);
}

async function createClient(db, request) {
  const data = await parseRequestBody(request);

  // Handle both old format (nom, prenom) and new format (nom_complet)
  if (data.nom_complet && !data.nom && !data.prenom) {
    // Split nom_complet into nom and prenom for database compatibility
    const nameParts = data.nom_complet.trim().split(' ');
    data.nom = nameParts[0] || '';
    data.prenom = nameParts.slice(1).join(' ') || '';
  }

  // Validate required fields - nom, telephone, and wilaya are required
  validateRequired(data, ['nom', 'telephone', 'wilaya']);

  // Sanitize data
  const allowedFields = ['nom', 'prenom', 'telephone', 'email', 'wilaya', 'adresse', 'facebook', 'instagram', 'notes'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Set defaults for optional fields
  sanitizedData.prenom = sanitizedData.prenom || '';
  sanitizedData.email = sanitizedData.email || null;
  // wilaya is now required, so no default needed
  
  // Validate email format if provided
  if (sanitizedData.email && !isValidEmail(sanitizedData.email)) {
    return errorResponse('Invalid email format', 400);
  }

  // Check if telephone already exists
  const existingClient = await fetchOne(db, 'SELECT id_client FROM clients WHERE telephone = ?', [sanitizedData.telephone]);
  if (existingClient) {
    return errorResponse('A client with this telephone number already exists', 400);
  }

  const query = `
    INSERT INTO clients (nom, prenom, telephone, email, wilaya, adresse, facebook, instagram, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await executeQuery(db, query, [
    sanitizedData.nom,
    sanitizedData.prenom,
    sanitizedData.telephone,
    sanitizedData.email,
    sanitizedData.wilaya,
    sanitizedData.adresse || null,
    sanitizedData.facebook || null,
    sanitizedData.instagram || null,
    sanitizedData.notes || null
  ]);

  if (!result.success) {
    return errorResponse('Failed to create client', 500);
  }

  // Get the created client
  const createdClient = await fetchOne(db, 
    'SELECT * FROM clients WHERE id_client = ?', 
    [result.meta.last_row_id]
  );

  return successResponse(createdClient, 'Client created successfully', 201);
}

async function updateClient(db, id, request) {
  const data = await parseRequestBody(request);
  
  // Check if client exists
  const existing = await fetchOne(db, 'SELECT * FROM clients WHERE id_client = ?', [id]);
  if (!existing) {
    return errorResponse('Client not found', 404);
  }
  
  // Sanitize data
  const allowedFields = ['nom', 'prenom', 'telephone', 'email', 'wilaya', 'adresse', 'facebook', 'instagram', 'notes'];
  const sanitizedData = sanitizeData(data, allowedFields);
  
  // Validate email format if provided
  if (sanitizedData.email && !isValidEmail(sanitizedData.email)) {
    return errorResponse('Invalid email format', 400);
  }
  
  // Check if telephone already exists for another client
  if (sanitizedData.telephone) {
    const existingClient = await fetchOne(db, 
      'SELECT id_client FROM clients WHERE telephone = ? AND id_client != ?', 
      [sanitizedData.telephone, id]
    );
    if (existingClient) {
      return errorResponse('A client with this telephone number already exists', 400);
    }
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
  
  const query = `UPDATE clients SET ${updateFields.join(', ')} WHERE id_client = ?`;
  
  const result = await executeQuery(db, query, params);
  
  if (!result.success) {
    return errorResponse('Failed to update client', 500);
  }

  // Get the updated client
  const updatedClient = await fetchOne(db, 
    'SELECT * FROM clients WHERE id_client = ?', 
    [id]
  );

  return successResponse(updatedClient, 'Client updated successfully');
}

async function deleteClient(db, id) {
  // Check if client exists
  const existing = await fetchOne(db, 'SELECT * FROM clients WHERE id_client = ?', [id]);
  if (!existing) {
    return errorResponse('Client not found', 404);
  }
  
  // Check for dependencies (ventes)
  const ventesCount = await fetchOne(db, 
    'SELECT COUNT(*) as count FROM ventes WHERE id_client = ?', 
    [id]
  );
  
  if (ventesCount.count > 0) {
    return errorResponse('Cannot delete client with existing sales', 400);
  }

  const result = await executeQuery(db, 'DELETE FROM clients WHERE id_client = ?', [id]);
  
  if (!result.success) {
    return errorResponse('Failed to delete client', 500);
  }

  return successResponse(null, 'Client deleted successfully');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

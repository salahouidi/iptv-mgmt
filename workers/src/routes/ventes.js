// Ventes API routes

import { successResponse, errorResponse, paginatedResponse, parseRequestBody } from '../utils/responses';
import { executeQuery, fetchOne, fetchAll, buildWhereClause, validateRequired, sanitizeData } from '../utils/database';

export async function handleVentes(request, env, context) {
  const { method, url } = request;
  const db = request.env?.DB || env?.DB;

  // Safe URL parsing with error handling
  let id = null;
  let isBulkDelete = false;
  try {
    if (url && typeof url === 'string') {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];

      // Check for bulk-delete route
      if (lastPart === 'bulk-delete') {
        isBulkDelete = true;
      } else if (lastPart && lastPart !== 'ventes' && (isNaN(Number(lastPart)) === false || lastPart.length > 0)) {
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
          return await getVenteById(db, id);
        } else {
          return await getVentes(db, request);
        }
      
      case 'POST':
        return await createVente(db, request);
      
      case 'PUT':
        return await updateVente(db, id, request);
      
      case 'DELETE':
        if (isBulkDelete) {
          return await bulkDeleteVentes(db);
        } else {
          return await deleteVente(db, id);
        }
      
      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Ventes handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getVentes(db, request) {
  const url = new URL(request.url);
  const filters = {
    id_client: url.searchParams.get('id_client'),
    id_produit: url.searchParams.get('id_produit'),
    id_plateforme: url.searchParams.get('id_plateforme'),
    statut_paiement: url.searchParams.get('statut_paiement'),
    methode_paiement: url.searchParams.get('methode_paiement')
  };
  
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = '';
  let params = [];
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += `v.${key} = ?`;
      params.push(value);
    }
  });
  
  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM ventes v ${whereClause}`;
  const countResult = await fetchOne(db, countQuery, params);
  const total = countResult.total;

  // Get ventes with related info
  const query = `
    SELECT 
      v.*,
      c.prenom || ' ' || c.nom as client_nom,
      c.telephone as client_telephone,
      p.nom as produit_nom,
      pl.nom as plateforme_nom
    FROM ventes v
    JOIN clients c ON v.id_client = c.id_client
    JOIN produits p ON v.id_produit = p.id_produit
    JOIN plateformes pl ON v.id_plateforme = pl.id_plateforme
    ${whereClause}
    ORDER BY v.date_vente DESC
    LIMIT ? OFFSET ?
  `;

  const ventes = await fetchAll(db, query, [...params, limit, offset]);

  return paginatedResponse(ventes, total, page, limit);
}

async function getVenteById(db, id) {
  const query = `
    SELECT 
      v.*,
      c.prenom || ' ' || c.nom as client_nom,
      c.telephone as client_telephone,
      c.email as client_email,
      p.nom as produit_nom,
      p.description as produit_description,
      pl.nom as plateforme_nom
    FROM ventes v
    JOIN clients c ON v.id_client = c.id_client
    JOIN produits p ON v.id_produit = p.id_produit
    JOIN plateformes pl ON v.id_plateforme = pl.id_plateforme
    WHERE v.id_vente = ?
  `;

  const vente = await fetchOne(db, query, [id]);
  
  if (!vente) {
    return errorResponse('Vente not found', 404);
  }

  return successResponse(vente);
}

async function createVente(db, request) {
  const data = await parseRequestBody(request);

  // Validate required fields
  validateRequired(data, ['id_client', 'id_produit', 'id_plateforme', 'quantite', 'prix_unitaire', 'date_vente', 'methode_paiement', 'statut_paiement', 'purchase_cost']);

  // Sanitize data
  const allowedFields = ['id_client', 'id_produit', 'id_plateforme', 'quantite', 'prix_unitaire', 'date_vente', 'methode_paiement', 'statut_paiement', 'notes', 'purchase_cost', 'cost_type_vente'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Set defaults for new fields
  sanitizedData.cost_type_vente = sanitizedData.cost_type_vente || 'currency';
  
  // Validate numeric fields
  if (sanitizedData.quantite <= 0) {
    return errorResponse('quantite must be greater than 0', 400);
  }

  if (sanitizedData.prix_unitaire <= 0) {
    return errorResponse('prix_unitaire must be greater than 0', 400);
  }

  if (sanitizedData.purchase_cost <= 0) {
    return errorResponse('purchase_cost must be greater than 0', 400);
  }
  
  // Validate methode_paiement
  if (!['Espèce', 'CCP', 'BaridiMob', 'Autre'].includes(sanitizedData.methode_paiement)) {
    return errorResponse('Invalid methode_paiement. Must be "Espèce", "CCP", "BaridiMob", or "Autre"', 400);
  }
  
  // Validate statut_paiement
  if (!['Payé', 'En attente'].includes(sanitizedData.statut_paiement)) {
    return errorResponse('Invalid statut_paiement. Must be "Payé" or "En attente"', 400);
  }
  
  // Check if client exists
  const client = await fetchOne(db, 'SELECT id_client FROM clients WHERE id_client = ?', [sanitizedData.id_client]);
  if (!client) {
    return errorResponse('Client not found', 404);
  }
  
  // Check if produit exists and has enough stock
  const produit = await fetchOne(db, 'SELECT * FROM produits WHERE id_produit = ?', [sanitizedData.id_produit]);
  if (!produit) {
    return errorResponse('Produit not found', 404);
  }
  
  if (produit.stock_actuel < sanitizedData.quantite) {
    return errorResponse(`Insufficient stock. Available: ${produit.stock_actuel}, Requested: ${sanitizedData.quantite}`, 400);
  }
  
  // Check if plateforme exists and has sufficient balance
  const plateforme = await fetchOne(db, 'SELECT * FROM plateformes WHERE id_plateforme = ?', [sanitizedData.id_plateforme]);
  if (!plateforme) {
    return errorResponse('Plateforme not found', 404);
  }

  // Validate sufficient balance for purchase cost
  if (plateforme.solde_initial < sanitizedData.purchase_cost) {
    return errorResponse(`Insufficient platform balance. Available: ${plateforme.solde_initial} ${plateforme.balance_unit || 'DZD'}, Required: ${sanitizedData.purchase_cost}`, 400);
  }

  // Store balance before transaction for audit trail
  const balanceBefore = plateforme.solde_initial;
  const balanceAfter = balanceBefore - sanitizedData.purchase_cost;

  try {
    // Create the sale with balance tracking
    const query = `
      INSERT INTO ventes (id_client, id_produit, id_plateforme, quantite, prix_unitaire, date_vente, methode_paiement, statut_paiement, notes, purchase_cost, cost_type_vente, panel_balance_before, panel_balance_after)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(db, query, [
      sanitizedData.id_client,
      sanitizedData.id_produit,
      sanitizedData.id_plateforme,
      sanitizedData.quantite,
      sanitizedData.prix_unitaire,
      sanitizedData.date_vente,
      sanitizedData.methode_paiement,
      sanitizedData.statut_paiement,
      sanitizedData.notes || null,
      sanitizedData.purchase_cost,
      sanitizedData.cost_type_vente,
      balanceBefore,
      balanceAfter
    ]);

    if (!result.success) {
      return errorResponse('Failed to create vente', 500);
    }

    // Deduct purchase cost from platform balance
    const balanceUpdateQuery = `
      UPDATE plateformes
      SET solde_initial = solde_initial - ?
      WHERE id_plateforme = ?
    `;

    const balanceResult = await executeQuery(db, balanceUpdateQuery, [
      sanitizedData.purchase_cost,
      sanitizedData.id_plateforme
    ]);

    if (!balanceResult.success) {
      console.error('❌ Failed to update platform balance:', balanceResult.error);
      // Note: In a real transaction system, we would rollback the sale here
    } else {
      console.log(`✅ Platform balance updated: ${balanceBefore} - ${sanitizedData.purchase_cost} = ${balanceAfter} for platform ${sanitizedData.id_plateforme}`);
    }

    // Get the created vente with related data
    const createdVente = await fetchOne(db,
      `SELECT v.*, c.prenom || ' ' || c.nom as client_nom, p.nom as produit_nom, pl.nom as plateforme_nom
       FROM ventes v
       JOIN clients c ON v.id_client = c.id_client
       JOIN produits p ON v.id_produit = p.id_produit
       JOIN plateformes pl ON v.id_plateforme = pl.id_plateforme
       WHERE v.id_vente = ?`,
      [result.meta.last_row_id]
    );

    return successResponse(createdVente, 'Vente created successfully and platform balance updated', 201);

  } catch (error) {
    console.error('Error in createVente transaction:', error);
    return errorResponse('Failed to create vente and update balance', 500);
  }
}

async function updateVente(db, id, request) {
  const data = await parseRequestBody(request);
  
  // Check if vente exists
  const existing = await fetchOne(db, 'SELECT * FROM ventes WHERE id_vente = ?', [id]);
  if (!existing) {
    return errorResponse('Vente not found', 404);
  }
  
  // Sanitize data
  const allowedFields = ['quantite', 'prix_unitaire', 'date_vente', 'methode_paiement', 'statut_paiement', 'notes'];
  const sanitizedData = sanitizeData(data, allowedFields);
  
  // Validate numeric fields if provided
  if (sanitizedData.quantite !== undefined && sanitizedData.quantite <= 0) {
    return errorResponse('quantite must be greater than 0', 400);
  }
  
  if (sanitizedData.prix_unitaire !== undefined && sanitizedData.prix_unitaire <= 0) {
    return errorResponse('prix_unitaire must be greater than 0', 400);
  }
  
  // Validate methode_paiement if provided
  if (sanitizedData.methode_paiement && !['Espèce', 'CCP', 'BaridiMob', 'Autre'].includes(sanitizedData.methode_paiement)) {
    return errorResponse('Invalid methode_paiement. Must be "Espèce", "CCP", "BaridiMob", or "Autre"', 400);
  }
  
  // Validate statut_paiement if provided
  if (sanitizedData.statut_paiement && !['Payé', 'En attente'].includes(sanitizedData.statut_paiement)) {
    return errorResponse('Invalid statut_paiement. Must be "Payé" or "En attente"', 400);
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
  
  const query = `UPDATE ventes SET ${updateFields.join(', ')} WHERE id_vente = ?`;
  
  const result = await executeQuery(db, query, params);
  
  if (!result.success) {
    return errorResponse('Failed to update vente', 500);
  }

  // Get the updated vente
  const updatedVente = await fetchOne(db, 
    'SELECT * FROM ventes WHERE id_vente = ?', 
    [id]
  );

  return successResponse(updatedVente, 'Vente updated successfully');
}

async function deleteVente(db, id) {
  // Check if vente exists
  const existing = await fetchOne(db, 'SELECT * FROM ventes WHERE id_vente = ?', [id]);
  if (!existing) {
    return errorResponse('Vente not found', 404);
  }

  const result = await executeQuery(db, 'DELETE FROM ventes WHERE id_vente = ?', [id]);
  
  if (!result.success) {
    return errorResponse('Failed to delete vente', 500);
  }

  return successResponse(null, 'Vente deleted successfully');
}

async function bulkDeleteVentes(db) {
  try {
    // Get count of ventes before deletion
    const countResult = await fetchOne(db, 'SELECT COUNT(*) as count FROM ventes', []);
    const totalCount = countResult?.count || 0;

    if (totalCount === 0) {
      return successResponse({ deleted: 0 }, 'No sales to delete');
    }

    // Delete all ventes
    const result = await executeQuery(db, 'DELETE FROM ventes', []);

    if (!result.success) {
      return errorResponse('Failed to delete sales', 500);
    }

    return successResponse({ deleted: totalCount }, `Successfully deleted ${totalCount} sales records`);
  } catch (error) {
    console.error('Error in bulkDeleteVentes:', error);
    return errorResponse('Internal server error', 500);
  }
}

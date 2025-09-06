// Recharges API routes

import { successResponse, errorResponse, paginatedResponse, parseRequestBody } from '../utils/responses';
import { executeQuery, fetchOne, fetchAll, buildWhereClause, validateRequired, sanitizeData } from '../utils/database';

export async function handleRecharges(request, env, context) {
  const { method, url } = request;
  const db = request.env?.DB || env?.DB;

  // Safe URL parsing with error handling
  let id = null;
  try {
    if (url && typeof url === 'string') {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== 'recharges' && (isNaN(Number(lastPart)) === false || lastPart.length > 0)) {
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
          return await getRechargeById(db, id);
        } else {
          return await getRecharges(db, request);
        }
      
      case 'POST':
        return await createRecharge(db, request);
      
      case 'PUT':
        return await updateRecharge(db, id, request);
      
      case 'DELETE':
        return await deleteRecharge(db, id);
      
      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Recharges handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getRecharges(db, request) {
  const url = new URL(request.url);
  const filters = {
    id_plateforme: url.searchParams.get('id_plateforme'),
    statut: url.searchParams.get('statut')
  };
  
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = (page - 1) * limit;

  // Build WHERE clause
  let whereClause = '';
  let params = [];
  
  if (filters.id_plateforme) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'r.id_plateforme = ?';
    params.push(filters.id_plateforme);
  }
  
  if (filters.statut) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'r.statut = ?';
    params.push(filters.statut);
  }
  

  
  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM recharges r ${whereClause}`;
  const countResult = await fetchOne(db, countQuery, params);
  const total = countResult.total;

  // Get recharges with platform info
  const query = `
    SELECT 
      r.*,
      p.nom as plateforme_nom
    FROM recharges r
    JOIN plateformes p ON r.id_plateforme = p.id_plateforme
    ${whereClause}
    ORDER BY r.date_recharge DESC
    LIMIT ? OFFSET ?
  `;

  const recharges = await fetchAll(db, query, [...params, limit, offset]);

  return paginatedResponse(recharges, total, page, limit);
}

async function getRechargeById(db, id) {
  const query = `
    SELECT 
      r.*,
      p.nom as plateforme_nom
    FROM recharges r
    JOIN plateformes p ON r.id_plateforme = p.id_plateforme
    WHERE r.id_recharge = ?
  `;

  const recharge = await fetchOne(db, query, [id]);
  
  if (!recharge) {
    return errorResponse('Recharge not found', 404);
  }

  return successResponse(recharge);
}

async function createRecharge(db, request) {
  const data = await parseRequestBody(request);
  
  // Validate required fields
  validateRequired(data, ['id_plateforme', 'montant', 'statut', 'date_recharge']);

  // Sanitize data
  const allowedFields = ['id_plateforme', 'montant', 'statut', 'date_recharge', 'preuve_paiement', 'notes'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Default to DZD currency since we removed currency from platforms
  sanitizedData.devise = 'DZD';
  
  // Validate statut
  if (!['En attente', 'Payé', 'Annulé'].includes(sanitizedData.statut)) {
    return errorResponse('Invalid statut. Must be "En attente", "Payé", or "Annulé"', 400);
  }
  
  // Validate montant
  if (sanitizedData.montant <= 0) {
    return errorResponse('montant must be greater than 0', 400);
  }
  
  // Check if plateforme exists and get current balance
  const plateforme = await fetchOne(db, 'SELECT id_plateforme, solde_initial FROM plateformes WHERE id_plateforme = ?', [sanitizedData.id_plateforme]);
  if (!plateforme) {
    return errorResponse('Plateforme not found', 404);
  }

  try {
    // Start transaction by creating the recharge first
    const rechargeQuery = `
      INSERT INTO recharges (id_plateforme, montant, devise, statut, date_recharge, preuve_paiement, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const rechargeResult = await executeQuery(db, rechargeQuery, [
      sanitizedData.id_plateforme,
      sanitizedData.montant,
      sanitizedData.devise,
      sanitizedData.statut,
      sanitizedData.date_recharge,
      sanitizedData.preuve_paiement || null,
      sanitizedData.notes || null
    ]);

    if (!rechargeResult.success) {
      return errorResponse('Failed to create recharge', 500);
    }

    // If recharge status is "Payé", update platform balance
    if (sanitizedData.statut === 'Payé') {
      console.log(`💰 Updating platform balance: ${plateforme.solde_initial} + ${sanitizedData.montant} = ${plateforme.solde_initial + sanitizedData.montant}`);

      const balanceUpdateQuery = `
        UPDATE plateformes
        SET solde_initial = solde_initial + ?
        WHERE id_plateforme = ?
      `;

      const balanceResult = await executeQuery(db, balanceUpdateQuery, [
        sanitizedData.montant,
        sanitizedData.id_plateforme
      ]);

      if (!balanceResult.success) {
        // If balance update fails, we should ideally rollback the recharge
        // For now, we'll log the error but still return the recharge
        console.error('❌ Failed to update platform balance:', balanceResult.error);
        // Note: In a real transaction system, we would rollback here
      } else {
        console.log(`✅ Platform balance updated successfully for platform ${sanitizedData.id_plateforme}`);
      }
    }

    // Get the created recharge with platform info
    const createdRecharge = await fetchOne(db,
      `SELECT r.*, p.nom as plateforme_nom
       FROM recharges r
       JOIN plateformes p ON r.id_plateforme = p.id_plateforme
       WHERE r.id_recharge = ?`,
      [rechargeResult.meta.last_row_id]
    );

    return successResponse(createdRecharge, 'Recharge created successfully', 201);

  } catch (error) {
    console.error('Error in createRecharge transaction:', error);
    return errorResponse('Failed to create recharge and update balance', 500);
  }
}

async function updateRecharge(db, id, request) {
  const data = await parseRequestBody(request);
  
  // Check if recharge exists
  const existing = await fetchOne(db, 'SELECT * FROM recharges WHERE id_recharge = ?', [id]);
  if (!existing) {
    return errorResponse('Recharge not found', 404);
  }
  
  // Sanitize data
  const allowedFields = ['montant', 'statut', 'date_recharge', 'preuve_paiement', 'notes'];
  const sanitizedData = sanitizeData(data, allowedFields);

  // Always use DZD currency since we removed currency from platforms
  if (sanitizedData.montant) {
    sanitizedData.devise = 'DZD';
  }
  
  // Validate statut if provided
  if (sanitizedData.statut && !['En attente', 'Payé', 'Annulé'].includes(sanitizedData.statut)) {
    return errorResponse('Invalid statut. Must be "En attente", "Payé", or "Annulé"', 400);
  }
  
  // Validate montant if provided
  if (sanitizedData.montant !== undefined && sanitizedData.montant <= 0) {
    return errorResponse('montant must be greater than 0', 400);
  }

  try {
    // Handle balance updates if status or amount changes
    const oldStatus = existing.statut;
    const oldAmount = existing.montant;
    const newStatus = sanitizedData.statut || oldStatus;
    const newAmount = sanitizedData.montant || oldAmount;

    // Calculate balance adjustment needed
    let balanceAdjustment = 0;

    // If status changes from "Payé" to something else, subtract the amount
    if (oldStatus === 'Payé' && newStatus !== 'Payé') {
      balanceAdjustment -= oldAmount;
      console.log(`💰 Status changed from Payé to ${newStatus}: subtracting ${oldAmount} from platform balance`);
    }
    // If status changes to "Payé" from something else, add the amount
    else if (oldStatus !== 'Payé' && newStatus === 'Payé') {
      balanceAdjustment += newAmount;
      console.log(`💰 Status changed from ${oldStatus} to Payé: adding ${newAmount} to platform balance`);
    }
    // If status stays "Payé" but amount changes, adjust the difference
    else if (oldStatus === 'Payé' && newStatus === 'Payé' && oldAmount !== newAmount) {
      balanceAdjustment = newAmount - oldAmount;
      console.log(`💰 Amount changed while Payé: adjusting balance by ${balanceAdjustment} (${newAmount} - ${oldAmount})`);
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

    const query = `UPDATE recharges SET ${updateFields.join(', ')} WHERE id_recharge = ?`;

    const result = await executeQuery(db, query, params);

    if (!result.success) {
      return errorResponse('Failed to update recharge', 500);
    }

    // Update platform balance if needed
    if (balanceAdjustment !== 0) {
      const balanceUpdateQuery = `
        UPDATE plateformes
        SET solde_initial = solde_initial + ?
        WHERE id_plateforme = ?
      `;

      const balanceResult = await executeQuery(db, balanceUpdateQuery, [
        balanceAdjustment,
        existing.id_plateforme
      ]);

      if (!balanceResult.success) {
        console.error('❌ Failed to update platform balance during recharge update:', balanceResult.error);
        // Note: In a real transaction system, we would rollback here
      } else {
        console.log(`✅ Platform balance adjusted by ${balanceAdjustment} for platform ${existing.id_plateforme}`);
      }
    }

    // Get the updated recharge with platform info
    const updatedRecharge = await fetchOne(db,
      `SELECT r.*, p.nom as plateforme_nom
       FROM recharges r
       JOIN plateformes p ON r.id_plateforme = p.id_plateforme
       WHERE r.id_recharge = ?`,
      [id]
    );

    return successResponse(updatedRecharge, 'Recharge updated successfully');

  } catch (error) {
    console.error('Error in updateRecharge transaction:', error);
    return errorResponse('Failed to update recharge and balance', 500);
  }
}

async function deleteRecharge(db, id) {
  // Check if recharge exists
  const existing = await fetchOne(db, 'SELECT * FROM recharges WHERE id_recharge = ?', [id]);
  if (!existing) {
    return errorResponse('Recharge not found', 404);
  }

  try {
    // Delete the recharge first
    const result = await executeQuery(db, 'DELETE FROM recharges WHERE id_recharge = ?', [id]);

    if (!result.success) {
      return errorResponse('Failed to delete recharge', 500);
    }

    // If the deleted recharge was "Payé", subtract its amount from platform balance
    if (existing.statut === 'Payé') {
      console.log(`💰 Deleting paid recharge: subtracting ${existing.montant} from platform ${existing.id_plateforme} balance`);

      const balanceUpdateQuery = `
        UPDATE plateformes
        SET solde_initial = solde_initial - ?
        WHERE id_plateforme = ?
      `;

      const balanceResult = await executeQuery(db, balanceUpdateQuery, [
        existing.montant,
        existing.id_plateforme
      ]);

      if (!balanceResult.success) {
        console.error('❌ Failed to update platform balance during recharge deletion:', balanceResult.error);
        // Note: In a real transaction system, we would rollback here
      } else {
        console.log(`✅ Platform balance reduced by ${existing.montant} for platform ${existing.id_plateforme}`);
      }
    }

    return successResponse(null, 'Recharge deleted successfully');

  } catch (error) {
    console.error('Error in deleteRecharge transaction:', error);
    return errorResponse('Failed to delete recharge and update balance', 500);
  }
}

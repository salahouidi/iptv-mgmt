// Parametres API routes

import { successResponse, errorResponse, parseRequestBody } from '../utils/responses';
import { executeQuery, fetchOne } from '../utils/database';

export async function handleParametres(request) {
  const { method } = request;
  const db = request.env.DB;

  try {
    switch (method) {
      case 'GET':
        return await getParametres(db);
      
      case 'PUT':
        return await updateParametres(db, request);
      
      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Parametres handler error:', error);
    return errorResponse(error.message, 500);
  }
}

async function getParametres(db) {
  // Get the first (and should be only) parametres record
  const parametres = await fetchOne(db, 'SELECT * FROM parametres ORDER BY id_parametre LIMIT 1');
  
  if (!parametres) {
    // If no parametres exist, create default ones
    const defaultParametres = {
      business: {
        nom_entreprise: 'IPTV Solutions DZ',
        adresse: '123 Rue Didouche Mourad, Alger',
        telephone: '+213 555 123 456',
        email: 'contact@iptvsolutions.dz',
        site_web: 'https://iptvsolutions.dz',
        logo: '/logo.png'
      },
      financial: {
        devise_principale: 'DZD',
        taux_change_usd: 270,
        taux_change_eur: 290,
        tva_applicable: false,
        taux_tva: 19
      },
      notifications: {
        email_notifications: true,
        sms_notifications: false,
        stock_alerts: true,
        seuil_alerte_global: 10,
        rappel_paiements: true
      },
      system: {
        theme: 'auto',
        langue: 'fr',
        timezone: 'Africa/Algiers',
        format_date: 'DD/MM/YYYY',
        sauvegarde_auto: true,
        frequence_sauvegarde: 'daily'
      }
    };

    // Create default parametres
    const query = `
      INSERT INTO parametres (business_settings, financial_settings, notification_settings, system_settings)
      VALUES (?, ?, ?, ?)
    `;

    const result = await executeQuery(db, query, [
      JSON.stringify(defaultParametres.business),
      JSON.stringify(defaultParametres.financial),
      JSON.stringify(defaultParametres.notifications),
      JSON.stringify(defaultParametres.system)
    ]);

    if (result.success) {
      return successResponse(defaultParametres);
    } else {
      return errorResponse('Failed to create default parametres', 500);
    }
  }

  // Parse JSON settings
  const parsedParametres = {
    business: JSON.parse(parametres.business_settings || '{}'),
    financial: JSON.parse(parametres.financial_settings || '{}'),
    notifications: JSON.parse(parametres.notification_settings || '{}'),
    system: JSON.parse(parametres.system_settings || '{}')
  };

  return successResponse(parsedParametres);
}

async function updateParametres(db, request) {
  const data = await parseRequestBody(request);
  
  // Get existing parametres or create if none exist
  let existing = await fetchOne(db, 'SELECT * FROM parametres ORDER BY id_parametre LIMIT 1');
  
  let currentSettings = {
    business: {},
    financial: {},
    notifications: {},
    system: {}
  };

  if (existing) {
    // Parse existing settings
    currentSettings = {
      business: JSON.parse(existing.business_settings || '{}'),
      financial: JSON.parse(existing.financial_settings || '{}'),
      notifications: JSON.parse(existing.notification_settings || '{}'),
      system: JSON.parse(existing.system_settings || '{}')
    };
  }

  // Merge new data with existing settings
  const updatedSettings = {
    business: { ...currentSettings.business, ...(data.business || {}) },
    financial: { ...currentSettings.financial, ...(data.financial || {}) },
    notifications: { ...currentSettings.notifications, ...(data.notifications || {}) },
    system: { ...currentSettings.system, ...(data.system || {}) }
  };

  // Validate financial settings
  if (updatedSettings.financial.devise_principale && 
      !['DZD', 'USD', 'EUR'].includes(updatedSettings.financial.devise_principale)) {
    return errorResponse('Invalid devise_principale. Must be DZD, USD, or EUR', 400);
  }

  if (updatedSettings.financial.taux_change_usd !== undefined && 
      (isNaN(updatedSettings.financial.taux_change_usd) || updatedSettings.financial.taux_change_usd <= 0)) {
    return errorResponse('taux_change_usd must be a positive number', 400);
  }

  if (updatedSettings.financial.taux_change_eur !== undefined && 
      (isNaN(updatedSettings.financial.taux_change_eur) || updatedSettings.financial.taux_change_eur <= 0)) {
    return errorResponse('taux_change_eur must be a positive number', 400);
  }

  // Validate system settings
  if (updatedSettings.system.theme && 
      !['auto', 'light', 'dark'].includes(updatedSettings.system.theme)) {
    return errorResponse('Invalid theme. Must be auto, light, or dark', 400);
  }

  if (updatedSettings.system.langue && 
      !['fr', 'ar', 'en'].includes(updatedSettings.system.langue)) {
    return errorResponse('Invalid langue. Must be fr, ar, or en', 400);
  }

  if (updatedSettings.system.frequence_sauvegarde && 
      !['daily', 'weekly', 'monthly'].includes(updatedSettings.system.frequence_sauvegarde)) {
    return errorResponse('Invalid frequence_sauvegarde. Must be daily, weekly, or monthly', 400);
  }

  let query, params;

  if (existing) {
    // Update existing parametres
    query = `
      UPDATE parametres 
      SET business_settings = ?, financial_settings = ?, notification_settings = ?, system_settings = ?
      WHERE id_parametre = ?
    `;
    params = [
      JSON.stringify(updatedSettings.business),
      JSON.stringify(updatedSettings.financial),
      JSON.stringify(updatedSettings.notifications),
      JSON.stringify(updatedSettings.system),
      existing.id_parametre
    ];
  } else {
    // Create new parametres
    query = `
      INSERT INTO parametres (business_settings, financial_settings, notification_settings, system_settings)
      VALUES (?, ?, ?, ?)
    `;
    params = [
      JSON.stringify(updatedSettings.business),
      JSON.stringify(updatedSettings.financial),
      JSON.stringify(updatedSettings.notifications),
      JSON.stringify(updatedSettings.system)
    ];
  }

  const result = await executeQuery(db, query, params);
  
  if (!result.success) {
    return errorResponse('Failed to update parametres', 500);
  }

  return successResponse(updatedSettings, 'Parametres updated successfully');
}

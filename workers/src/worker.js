// IPTV Management API - Cloudflare Worker
// Main entry point for all API endpoints

import { Router } from 'itty-router';
import { corsHeaders, handleCORS } from './utils/cors';
import { errorResponse, successResponse } from './utils/responses';

// Import route handlers
import { handlePlateformes } from './routes/plateformes';
import { handleRecharges } from './routes/recharges';
import { handleProduits } from './routes/produits';
import { handleClients } from './routes/clients';
import { handleVentes } from './routes/ventes';
import { handleParametres } from './routes/parametres';
import { handleDashboard } from './routes/dashboard';
import { handleProductPanels } from './routes/product-panels';
import { handlePointPricing } from './routes/point-pricing';

// Create router
const router = Router();

// CORS preflight handler
router.options('*', handleCORS);

// Health check endpoint
router.get('/api/health', () => {
  return successResponse({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Dashboard routes
router.get('/api/dashboard/stats', handleDashboard);

// Plateformes routes
router.get('/api/plateformes', handlePlateformes);
router.get('/api/plateformes/:id', (request, env, context) => handlePlateformes(request, env, context));
router.post('/api/plateformes', handlePlateformes);
router.put('/api/plateformes/:id', (request, env, context) => handlePlateformes(request, env, context));
router.delete('/api/plateformes/:id', (request, env, context) => handlePlateformes(request, env, context));

// Recharges routes
router.get('/api/recharges', handleRecharges);
router.get('/api/recharges/:id', (request, env, context) => handleRecharges(request, env, context));
router.post('/api/recharges', handleRecharges);
router.put('/api/recharges/:id', (request, env, context) => handleRecharges(request, env, context));
router.delete('/api/recharges/:id', (request, env, context) => handleRecharges(request, env, context));

// Produits routes
router.get('/api/produits', handleProduits);
router.get('/api/produits/:id', (request, env, context) => handleProduits(request, env, context));
router.post('/api/produits', handleProduits);
router.put('/api/produits/:id', (request, env, context) => handleProduits(request, env, context));
router.delete('/api/produits/:id', (request, env, context) => handleProduits(request, env, context));

// Clients routes
router.get('/api/clients', handleClients);
router.get('/api/clients/:id', (request, env, context) => handleClients(request, env, context));
router.post('/api/clients', handleClients);
router.put('/api/clients/:id', (request, env, context) => handleClients(request, env, context));
router.delete('/api/clients/:id', (request, env, context) => handleClients(request, env, context));

// Ventes routes
router.get('/api/ventes', handleVentes);
router.get('/api/ventes/:id', (request, env, context) => handleVentes(request, env, context));
router.post('/api/ventes', handleVentes);
router.put('/api/ventes/:id', (request, env, context) => handleVentes(request, env, context));
router.delete('/api/ventes/:id', (request, env, context) => handleVentes(request, env, context));

// Parametres routes
router.get('/api/parametres', handleParametres);
router.put('/api/parametres', handleParametres);

// Product-Panel association routes
router.get('/api/product-panels', handleProductPanels);
router.get('/api/product-panels/:id', (request, env, context) => handleProductPanels(request, env, context.params.id));
router.post('/api/product-panels', handleProductPanels);
router.put('/api/product-panels/:id', (request, env, context) => handleProductPanels(request, env, context.params.id));
router.delete('/api/product-panels/:id', (request, env, context) => handleProductPanels(request, env, context.params.id));

// Point pricing rules routes
router.get('/api/point-pricing', handlePointPricing);
router.get('/api/point-pricing/:id', (request, env, context) => handlePointPricing(request, env, context.params.id));
router.post('/api/point-pricing', handlePointPricing);
router.put('/api/point-pricing/:id', (request, env, context) => handlePointPricing(request, env, context.params.id));
router.delete('/api/point-pricing/:id', (request, env, context) => handlePointPricing(request, env, context.params.id));

// 404 handler
router.all('*', () => {
  return errorResponse('Endpoint not found', 404);
});

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    try {
      // Add database binding to request for route handlers
      request.env = env;
      
      // Handle the request
      const response = await router.handle(request);
      
      // Add CORS headers to all responses
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse('Internal server error', 500);
    }
  }
};

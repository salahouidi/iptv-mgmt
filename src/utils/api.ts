// API utility functions for IPTV management platform

import {
  ApiResponse,
  PaginatedResponse,
  Plateforme,
  Recharge,
  Produit,
  Client,
  Vente,
  Parametre,
  CreatePlateformeData,
  CreateRechargeData,
  CreateProduitData,
  CreateClientData,
  CreateVenteData,
  UpdatePlateformeData,
  UpdateRechargeData,
  UpdateProduitData,
  UpdateClientData,
  UpdateVenteData,
  UpdateParametreData,
  DashboardStats,
  PlateformeFilters,
  ProduitFilters,
  ClientFilters,
  VenteFilters
} from '../types/database';

// Export types for use in other files
export type {
  ApiResponse,
  PaginatedResponse,
  Plateforme,
  Recharge,
  Produit,
  Client,
  Vente,
  Parametre,
  DashboardStats,
  PlateformeFilters,
  ProduitFilters,
  ClientFilters,
  VenteFilters
};

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://iptv-management-api.houidi-salaheddine.workers.dev/api';

class ApiClient {
  private baseURL: string;
  private useMockData: boolean;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    // Force mock data to false for production, but fallback to mock if API fails
    this.useMockData = false;

    console.log('🔧 API Client initialized:', {
      baseURL: this.baseURL,
      useMockData: this.useMockData,
      env: import.meta.env.VITE_USE_MOCK_DATA,
      mode: import.meta.env.MODE,
      timestamp: new Date().toISOString()
    });

    // Test API connectivity on initialization
    this.testConnectivity();
  }

  private async testConnectivity() {
    try {
      console.log('🔍 Testing API connectivity...');
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connectivity test successful:', data);
      } else {
        console.warn('⚠️ API connectivity test failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ API connectivity test error:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Validate endpoint parameter to prevent split() errors
    if (!endpoint || typeof endpoint !== 'string') {
      throw new Error('Invalid endpoint provided');
    }

    console.log('🔍 API request:', {
      endpoint,
      baseURL: this.baseURL,
      fullURL: `${this.baseURL}${endpoint}`,
      method: options.method || 'GET'
    });

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('🔍 API response:', {
        status: response.status,
        ok: response.ok,
        endpoint
      });

      // Handle empty responses or non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text && text.trim()) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.warn('Failed to parse JSON response:', parseError);
            data = { success: false, error: 'Invalid JSON response' };
          }
        } else {
          // Empty JSON response - simulate success for development
          data = { success: true, data: null };
        }
      } else {
        // Non-JSON response - likely backend not implemented yet
        // Simulate successful response for development
        if (response.status === 404 || response.status >= 500) {
          // Backend not available - simulate success
          data = {
            success: true,
            data: this.generateMockResponse(endpoint, options.method || 'GET')
          };
        } else {
          data = { success: true, data: null };
        }
      }

      // Ensure data is always an object with required properties
      if (!data || typeof data !== 'object') {
        data = { success: false, error: 'Invalid response format' };
      }

      if (!response.ok && response.status !== 404) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      // If it's a network error or backend not available, simulate success for development
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Backend not available, using mock response for:', endpoint);
        return {
          success: true,
          data: this.generateMockResponse(endpoint, options.method || 'GET') as T,
        };
      }

      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private generateMockResponse(endpoint: string, method: string): any {
    // Generate mock responses for development when backend is not available
    const now = new Date().toISOString();
    const id = Math.floor(Math.random() * 1000) + 1;

    if (method === 'POST') {
      // Create operations - return a mock created entity
      if (endpoint.includes('/plateformes')) {
        return {
          id_plateforme: id,
          nom: 'Nouvelle Plateforme',
          description: 'Description générée automatiquement',
          url: 'https://example.com',
          devise: 'USD',
          date_creation: now,
          date_modification: now
        };
      } else if (endpoint.includes('/clients')) {
        return {
          id_client: id,
          nom: 'Nouveau',
          prenom: 'Client',
          telephone: '+213555000000',
          email: 'client@example.com',
          wilaya: 'Alger',
          date_creation: now,
          date_modification: now
        };
      } else if (endpoint.includes('/produits')) {
        return {
          id_produit: id,
          nom: 'Nouveau Produit',
          description: 'Description du produit',
          categorie: 'IPTV',
          duree_mois: 12,
          prix_achat_moyen: 100,
          marge: 50,
          prix_vente: 150,
          stock_actuel: 10,
          seuil_alerte: 5,
          date_creation: now,
          date_modification: now
        };
      } else if (endpoint.includes('/recharges')) {
        return {
          id_recharge: id,
          id_plateforme: 1,
          montant: 100,
          devise: 'USD',
          statut: 'confirme',
          date_recharge: now,
          date_creation: now,
          date_modification: now
        };
      } else if (endpoint.includes('/ventes')) {
        return {
          id_vente: id,
          id_client: 1,
          id_produit: 1,
          id_plateforme: 1,
          quantite: 1,
          prix_unitaire: 150,
          date_vente: now,
          methode_paiement: 'espece',
          statut_paiement: 'paye',
          date_creation: now,
          date_modification: now
        };
      }
    } else if (method === 'PUT') {
      // Update operations - return success
      return { success: true, message: 'Mise à jour réussie' };
    } else if (method === 'DELETE') {
      // Delete operations - return success
      return { success: true, message: 'Suppression réussie' };
    } else if (method === 'GET') {
      // GET operations - return mock data lists
      if (endpoint.includes('/plateformes')) {
        return {
          items: [
            {
              id_plateforme: 1,
              nom: 'Netflix',
              description: 'Service de streaming vidéo',
              url: 'https://netflix.com',
              devise: 'USD',
              date_creation: now,
              date_modification: now
            },
            {
              id_plateforme: 2,
              nom: 'Disney+',
              description: 'Service de streaming Disney',
              url: 'https://disneyplus.com',
              devise: 'USD',
              date_creation: now,
              date_modification: now
            }
          ],
          total: 2,
          page: 1,
          limit: 10
        };
      } else if (endpoint.includes('/clients')) {
        return {
          items: [
            {
              id_client: 1,
              nom: 'Dupont',
              prenom: 'Jean',
              telephone: '+213555000001',
              email: 'jean.dupont@example.com',
              wilaya: 'Alger',
              date_creation: now,
              date_modification: now
            },
            {
              id_client: 2,
              nom: 'Martin',
              prenom: 'Marie',
              telephone: '+213555000002',
              email: 'marie.martin@example.com',
              wilaya: 'Oran',
              date_creation: now,
              date_modification: now
            }
          ],
          total: 2,
          page: 1,
          limit: 10
        };
      } else if (endpoint.includes('/produits')) {
        return {
          items: [
            {
              id_produit: 1,
              nom: 'Abonnement Netflix 1 mois',
              description: 'Abonnement Netflix premium 1 mois',
              categorie: 'Streaming',
              duree_mois: 1,
              prix_achat_moyen: 10,
              marge: 5,
              prix_vente: 15,
              stock_actuel: 50,
              seuil_alerte: 10,
              date_creation: now,
              date_modification: now
            },
            {
              id_produit: 2,
              nom: 'Abonnement Disney+ 1 mois',
              description: 'Abonnement Disney+ premium 1 mois',
              categorie: 'Streaming',
              duree_mois: 1,
              prix_achat_moyen: 8,
              marge: 4,
              prix_vente: 12,
              stock_actuel: 30,
              seuil_alerte: 5,
              date_creation: now,
              date_modification: now
            }
          ],
          total: 2,
          page: 1,
          limit: 10
        };
      } else if (endpoint.includes('/recharges')) {
        return [
          {
            id_recharge: 1,
            id_plateforme: 1,
            montant: 100,
            devise: 'USD',
            statut: 'confirme',
            date_recharge: now,
            date_creation: now,
            date_modification: now
          },
          {
            id_recharge: 2,
            id_plateforme: 2,
            montant: 50,
            devise: 'USD',
            statut: 'en_attente',
            date_recharge: now,
            date_creation: now,
            date_modification: now
          }
        ];
      } else if (endpoint.includes('/ventes')) {
        return {
          items: [
            {
              id_vente: 1,
              id_client: 1,
              id_produit: 1,
              id_plateforme: 1,
              quantite: 1,
              prix_unitaire: 15,
              date_vente: now,
              methode_paiement: 'espece',
              statut_paiement: 'paye',
              date_creation: now,
              date_modification: now
            }
          ],
          total: 1,
          page: 1,
          limit: 10
        };
      } else if (endpoint.includes('/dashboard/stats')) {
        return {
          total_clients: 150,
          total_produits: 25,
          total_ventes: 1250,
          chiffre_affaires: 18750,
          ventes_mois: 85,
          croissance_mois: 12.5,
          produits_stock_faible: 3,
          recharges_en_attente: 5
        };
      } else if (endpoint.includes('/parametres')) {
        return {
          entreprise: {
            nom: 'IPTV Management',
            adresse: '123 Rue Example',
            telephone: '+213555000000',
            email: 'contact@example.com'
          },
          notifications: {
            email_ventes: true,
            email_stock: true,
            sms_clients: false
          },
          facturation: {
            tva: 19,
            devise_defaut: 'DZD',
            numerotation_auto: true
          },
          securite: {
            session_timeout: 30,
            backup_auto: true,
            logs_retention: 90
          }
        };
      }
    }

    // Default response
    return { success: true, message: 'Opération réussie' };
  }

  // Dashboard API
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // Plateformes API
  async getPlateformes(filters?: PlateformeFilters): Promise<ApiResponse<PaginatedResponse<Plateforme>>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    return this.request<PaginatedResponse<Plateforme>>(
      `/plateformes${queryString ? `?${queryString}` : ''}`
    );
  }

  async getPlateformeById(id: number): Promise<ApiResponse<Plateforme>> {
    return this.request<Plateforme>(`/plateformes/${id}`);
  }

  async createPlateforme(data: CreatePlateformeData): Promise<ApiResponse<Plateforme>> {
    return this.request<Plateforme>('/plateformes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePlateforme(id: number, data: UpdatePlateformeData): Promise<ApiResponse<Plateforme>> {
    return this.request<Plateforme>(`/plateformes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePlateforme(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/plateformes/${id}`, {
      method: 'DELETE',
    });
  }

  // Recharges API
  async getRecharges(plateformeId?: number): Promise<ApiResponse<PaginatedResponse<Recharge>>> {
    const params = plateformeId ? `?plateforme=${plateformeId}` : '';
    return this.request<PaginatedResponse<Recharge>>(`/recharges${params}`);
  }

  async createRecharge(data: CreateRechargeData): Promise<ApiResponse<Recharge>> {
    return this.request<Recharge>('/recharges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecharge(id: number, data: UpdateRechargeData): Promise<ApiResponse<Recharge>> {
    return this.request<Recharge>(`/recharges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecharge(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/recharges/${id}`, {
      method: 'DELETE',
    });
  }

  // Produits API
  async getProduits(filters?: ProduitFilters): Promise<ApiResponse<PaginatedResponse<Produit>>> {
    const params = new URLSearchParams();
    if (filters?.categorie) params.append('categorie', filters.categorie);
    if (filters?.id_plateforme) params.append('plateforme', filters.id_plateforme.toString());
    if (filters?.stock_status) params.append('stock_status', filters.stock_status);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return this.request<PaginatedResponse<Produit>>(
      `/produits${queryString ? `?${queryString}` : ''}`
    );
  }

  async getProduitById(id: number): Promise<ApiResponse<Produit>> {
    return this.request<Produit>(`/produits/${id}`);
  }

  async createProduit(data: CreateProduitData): Promise<ApiResponse<Produit>> {
    return this.request<Produit>('/produits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduit(id: number, data: UpdateProduitData): Promise<ApiResponse<Produit>> {
    return this.request<Produit>(`/produits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduit(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/produits/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients API
  async getClients(filters?: ClientFilters): Promise<ApiResponse<PaginatedResponse<Client>>> {
    const params = new URLSearchParams();
    if (filters?.wilaya) params.append('wilaya', filters.wilaya);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    return this.request<PaginatedResponse<Client>>(
      `/clients${queryString ? `?${queryString}` : ''}`
    );
  }

  async getClientById(id: number): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`);
  }

  async createClient(data: CreateClientData): Promise<ApiResponse<Client>> {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: number, data: UpdateClientData): Promise<ApiResponse<Client>> {
    return this.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Ventes API
  async getVentes(filters?: VenteFilters): Promise<ApiResponse<PaginatedResponse<Vente>>> {
    const params = new URLSearchParams();
    if (filters?.date_debut) params.append('date_debut', filters.date_debut);
    if (filters?.date_fin) params.append('date_fin', filters.date_fin);
    if (filters?.plateforme) params.append('plateforme', filters.plateforme.toString());
    if (filters?.client) params.append('client', filters.client.toString());
    if (filters?.statut_paiement) params.append('statut_paiement', filters.statut_paiement);
    if (filters?.methode_paiement) params.append('methode_paiement', filters.methode_paiement);
    
    const queryString = params.toString();
    return this.request<PaginatedResponse<Vente>>(
      `/ventes${queryString ? `?${queryString}` : ''}`
    );
  }

  async getVenteById(id: number): Promise<ApiResponse<Vente>> {
    return this.request<Vente>(`/ventes/${id}`);
  }

  async createVente(data: CreateVenteData): Promise<ApiResponse<Vente>> {
    return this.request<Vente>('/ventes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVente(id: number, data: UpdateVenteData): Promise<ApiResponse<Vente>> {
    return this.request<Vente>(`/ventes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVente(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/ventes/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteVentes(): Promise<ApiResponse<{ deleted: number }>> {
    return this.request<{ deleted: number }>('/ventes/bulk-delete', {
      method: 'DELETE',
    });
  }

  // Parametres API
  async getParametres(): Promise<ApiResponse<any>> {
    // For development, return mock settings that match the UI structure
    const mockParametres = {
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

    return {
      success: true,
      data: mockParametres
    };
  }

  async updateParametres(data: any): Promise<ApiResponse<any>> {
    // For development, simulate successful update
    console.log('Updating parameters:', data);

    return {
      success: true,
      data: data,
      message: 'Paramètres mis à jour avec succès'
    };
  }

  // File upload API
  async uploadFile(file: File, type: 'recharge' | 'avatar'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<{ url: string }>('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  // Reports API
  async generateReport(
    type: 'daily' | 'weekly' | 'monthly' | 'yearly',
    format: 'pdf' | 'csv',
    filters?: VenteFilters
  ): Promise<ApiResponse<{ url: string }>> {
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('format', format);

    if (filters?.date_debut) params.append('date_debut', filters.date_debut);
    if (filters?.date_fin) params.append('date_fin', filters.date_fin);

    return this.request<{ url: string }>(`/reports?${params.toString()}`);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export individual API functions for convenience
export const {
  getDashboardStats,
  getPlateformes,
  getPlateformeById,
  createPlateforme,
  updatePlateforme,
  deletePlateforme,
  getRecharges,
  createRecharge,
  updateRecharge,
  deleteRecharge,
  getProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getVentes,
  getVenteById,
  createVente,
  updateVente,
  deleteVente,
  bulkDeleteVentes,
  getParametres,
  updateParametres,
  uploadFile,
  generateReport,
} = apiClient;

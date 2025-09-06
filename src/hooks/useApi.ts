// Custom React hooks for API data management

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  apiClient,
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
} from '../utils/api';

// Generic hook for API calls with loading and error states
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the API call to prevent unnecessary re-renders
  const memoizedApiCall = useCallback(apiCall, dependencies);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await memoizedApiCall();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [memoizedApiCall]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Dashboard hook
export function useDashboardStats() {
  return useApiCall(() => apiClient.getDashboardStats());
}

// Plateformes hooks
export function usePlateformes(filters?: PlateformeFilters) {
  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.devise,
    filters?.search
  ]);

  return useApiCall(
    () => apiClient.getPlateformes(memoizedFilters),
    [memoizedFilters?.devise, memoizedFilters?.search]
  );
}

export function usePlateforme(id: number) {
  return useApiCall(
    () => apiClient.getPlateformeById(id),
    [id]
  );
}

export function usePlateformeActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPlateforme = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createPlateforme(data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePlateforme = async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updatePlateforme(id, data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePlateforme = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.deletePlateforme(id);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPlateforme,
    updatePlateforme,
    deletePlateforme,
    loading,
    error
  };
}

// Recharges hooks
export function useRecharges(plateformeId?: number) {
  // Memoize plateformeId to prevent unnecessary re-renders
  const memoizedPlateformeId = useMemo(() => plateformeId, [plateformeId]);

  return useApiCall(
    () => apiClient.getRecharges(memoizedPlateformeId),
    [memoizedPlateformeId]
  );
}

export function useRechargeActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRecharge = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createRecharge(data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateRecharge = async (id: number, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.updateRecharge(id, data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteRecharge = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.deleteRecharge(id);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRecharge,
    updateRecharge,
    deleteRecharge,
    loading,
    error
  };
}

// Produits hooks
export function useProduits(filters?: ProduitFilters) {
  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.plateforme_id,
    filters?.categorie,
    filters?.search,
    filters?.stock_faible
  ]);

  return useApiCall(
    () => apiClient.getProduits(memoizedFilters),
    [memoizedFilters?.plateforme_id, memoizedFilters?.categorie, memoizedFilters?.search, memoizedFilters?.stock_faible]
  );
}

export function useProduit(id: number) {
  return useApiCall(
    () => apiClient.getProduitById(id),
    [id]
  );
}

export function useProduitActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduit = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createProduit(data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduit = async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updateProduit(id, data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduit = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.deleteProduit(id);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduit,
    updateProduit,
    deleteProduit,
    loading,
    error
  };
}

// Clients hooks
export function useClients(filters?: ClientFilters) {
  console.log('🔍 useClients hook: Called with filters', filters);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.wilaya,
    filters?.search
  ]);

  return useApiCall(
    () => apiClient.getClients(memoizedFilters),
    [memoizedFilters?.wilaya, memoizedFilters?.search]
  );
}

export function useClient(id: number) {
  return useApiCall(
    () => apiClient.getClientById(id),
    [id]
  );
}

export function useClientActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClient = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.createClient(data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id: number, data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.updateClient(id, data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.deleteClient(id);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createClient,
    updateClient,
    deleteClient,
    loading,
    error
  };
}

// Ventes hooks
export function useVentes(filters?: VenteFilters) {
  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters?.client_id,
    filters?.produit_id,
    filters?.statut_paiement,
    filters?.date_debut,
    filters?.date_fin,
    filters?.search
  ]);

  return useApiCall(
    () => apiClient.getVentes(memoizedFilters),
    [memoizedFilters?.client_id, memoizedFilters?.produit_id, memoizedFilters?.statut_paiement, memoizedFilters?.date_debut, memoizedFilters?.date_fin, memoizedFilters?.search]
  );
}

export function useVente(id: number) {
  return useApiCall(
    () => apiClient.getVenteById(id),
    [id]
  );
}

export function useVenteActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVente = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createVente(data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la création');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateVente = async (id: number, data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.updateVente(id, data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteVente = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.deleteVente(id);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkDeleteVentes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.bulkDeleteVentes();
      if (!response.success) {
        setError(response.error || 'Erreur lors de la suppression en masse');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createVente,
    updateVente,
    deleteVente,
    bulkDeleteVentes,
    loading,
    error
  };
}

// Parametres hooks
export function useParametres() {
  return useApiCall(() => apiClient.getParametres());
}

export function useParametresActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateParametres = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.updateParametres(data);
      if (!response.success) {
        setError(response.error || 'Erreur lors de la mise à jour');
        return null;
      }
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateParametres,
    loading,
    error
  };
}

// File upload hook
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, type: 'recharge' | 'avatar') => {
    setUploading(true);
    setError(null);
    
    try {
      const response = await apiClient.uploadFile(file, type);
      if (!response.success) {
        setError(response.error || 'Erreur lors du téléchargement');
        return null;
      }
      return response.data?.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    error
  };
}

// Minimal administrator hooks for compatibility
export function useAdministrators() {
  return { data: [], loading: false, error: null };
}

export function useAdministratorActions() {
  return {
    createAdministrator: async () => false,
    updateAdministrator: async () => false,
    deleteAdministrator: async () => false,
    loading: false,
    error: null
  };
}

export function useAdminActivity() {
  return { data: [], loading: false, error: null };
}

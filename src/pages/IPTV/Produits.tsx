import { useState, useCallback, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { useProduits, useProduitActions } from '../../hooks/useApi';
import {
  formatCurrency,
  formatDuration,
  getCategoryColor,
  getStockStatus,
  getStockStatusColor,
  getStockStatusText,
  calculateSalePrice
} from '../../utils/helpers';
import { Produit, ProduitFilters } from '../../types/database';
import ProduitForm from '../../components/iptv/ProduitForm';
import Badge from '../../components/ui/badge/Badge';
import { logError } from '../../utils/errorHandler';

// Mock data for development
const mockProduits: Produit[] = [
  {
    id_produit: 1,
    nom: 'IPTV Premium 12 mois',
    categorie: 'IPTV',
    duree: '12m',
    description: 'Abonnement IPTV premium avec plus de 8000 chaînes',
    id_plateforme: 1,
    stock: 25,
    seuil_alerte: 10,
    prix_achat_moyen: 45.00,
    marge: 25,
    prix_vente_calcule: 15000,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id_produit: 2,
    nom: 'Netflix Premium 1 mois',
    categorie: 'Netflix',
    duree: '1m',
    description: 'Compte Netflix premium partagé',
    id_plateforme: 2,
    stock: 5,
    seuil_alerte: 8,
    prix_achat_moyen: 12.00,
    marge: 30,
    prix_vente_calcule: 2500,
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id_produit: 3,
    nom: 'IPTV Standard 6 mois',
    categorie: 'IPTV',
    duree: '6m',
    description: 'Abonnement IPTV standard avec 5000 chaînes',
    id_plateforme: 1,
    stock: 0,
    seuil_alerte: 5,
    prix_achat_moyen: 25.00,
    marge: 20,
    prix_vente_calcule: 8000,
    created_at: '2024-02-01T09:15:00Z'
  },
  {
    id_produit: 4,
    nom: 'IPTV Pro 3 mois',
    categorie: 'IPTV',
    duree: '3m',
    description: 'Abonnement IPTV professionnel haute qualité',
    id_plateforme: 3,
    stock: 15,
    seuil_alerte: 10,
    prix_achat_moyen: 18.00,
    marge: 35,
    prix_vente_calcule: 5500,
    created_at: '2024-02-05T16:45:00Z'
  }
];

const mockPlateformes = [
  { id: 1, nom: 'DAR IPTV', devise: 'USD' },
  { id: 2, nom: 'Netflix Premium', devise: 'EUR' },
  { id: 3, nom: 'IPTV Pro', devise: 'DZD' }
];

interface ProduitCardProps {
  produit: Produit;
  plateformeName: string;
  onEdit: (produit: Produit) => void;
  onDelete: (id: number) => void;
  onUpdateStock: (id: number, newStock: number) => void;
}

const ProduitCard: React.FC<ProduitCardProps> = memo(({
  produit,
  plateformeName,
  onEdit,
  onDelete,
  onUpdateStock
}) => {
  try {
    // Safe data extraction with fallbacks - handle different API field names
    const safeStock = produit?.stock_actuel ?? produit?.stock ?? 0;
    const safeSeuil = produit?.seuil_alerte ?? 0;
    const stockStatus = getStockStatus(safeStock, safeSeuil);
    const [stockInput, setStockInput] = useState(safeStock.toString());

    const handleStockUpdate = () => {
      try {
        const newStock = parseInt(stockInput);
        if (!isNaN(newStock) && newStock >= 0) {
          onUpdateStock(produit.id_produit, newStock);
        }
      } catch (error) {
        console.error('Error updating stock:', error);
        logError(error instanceof Error ? error : new Error(String(error)), {
          component: 'ProduitCard',
          action: 'handleStockUpdate',
          produitId: produit?.id_produit
        });
      }
    };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] min-h-[320px] flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {produit?.nom || 'Produit sans nom'}
            </h3>
            <Badge
              size="sm"
              className={getCategoryColor(produit?.categorie)}
            >
              {produit?.categorie || 'Non catégorisé'}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {produit?.description || 'Aucune description disponible'}
          </p>

          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Durée: <span className="font-medium">{formatDuration(produit?.duree || `${produit?.duree_mois}m`)}</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Plateforme: <span className="font-medium">{plateformeName || 'Inconnue'}</span>
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Prix de vente: </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(produit?.prix_vente || produit?.prix_vente_calcule)}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Marge: </span>
              <span className="font-medium">{produit?.marge || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(produit)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(produit.id_produit)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Stock Management Section */}
      <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Stock:</span>
            <Badge
              size="sm"
              className={getStockStatusColor(stockStatus)}
            >
              {safeStock} unités
            </Badge>
            <span className="text-xs text-gray-400">
              {getStockStatusText(stockStatus)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              className="w-20 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              min="0"
            />
            <button
              onClick={handleStockUpdate}
              className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
            >
              Maj
            </button>
          </div>
        </div>
        
        {stockStatus === 'low' || stockStatus === 'out' ? (
          <div className="mt-2 rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {stockStatus === 'out'
                ? '⚠️ Rupture de stock - Réapprovisionnement nécessaire'
                : `⚠️ Stock faible - Seuil d'alerte: ${safeSeuil} unités`
              }
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );

  } catch (error) {
    console.error('🚨 Error in ProduitCard:', error);
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: 'ProduitCard',
      produitId: produit?.id_produit,
      produitData: produit
    });

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-medium">Erreur d'affichage du produit</p>
          <p className="text-sm">ID: {produit?.id_produit || 'Inconnu'}</p>
          <p className="text-xs mt-1">{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    );
  }
});

export default function Produits() {
  console.log('🔍 Produits component: Starting render');

  const [filters, setFilters] = useState<ProduitFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);

  console.log('🔍 Produits component: State initialized');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearchTerm || undefined
    }));
  }, [debouncedSearchTerm]);

  // Use real API data
  const { data: apiData, loading, error, refetch } = useProduits(filters);
  const produits = apiData?.items || [];

  const { deleteProduit, updateProduit, loading: actionLoading, error: actionError } = useProduitActions();

  const handleEdit = useCallback((produit: Produit) => {
    setEditingProduit(produit);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    const produit = produits.find(p => p.id_produit === id);
    const productName = produit?.nom || 'ce produit';

    if (window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${productName}" ?\n\n` +
      `Cette action est irréversible et supprimera définitivement le produit.\n` +
      `Note: La suppression échouera s'il existe des ventes associées.`
    )) {
      console.log(`🗑️ Attempting to delete product: ${productName} (ID: ${id})`);

      try {
        const success = await deleteProduit(id);
        console.log(`📊 Delete operation result:`, { success, error: actionError });

        if (success) {
          console.log(`✅ Product deleted successfully: ${productName}`);
          // Show success message
          alert(`Produit "${productName}" supprimé avec succès!`);
          // Refresh data
          refetch();
        } else {
          console.log(`❌ Failed to delete product: ${productName}`);
          // Show error message
          alert(`Erreur lors de la suppression: ${actionError || 'Impossible de supprimer le produit'}`);
        }
      } catch (err) {
        console.error(`💥 Exception during delete:`, err);
        alert(`Erreur lors de la suppression: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      }
    }
  }, [deleteProduit, refetch, produits, actionError]);

  const handleUpdateStock = useCallback(async (id: number, newStock: number) => {
    const success = await updateProduit(id, { stock_actuel: newStock });
    if (success) {
      refetch(); // Refresh data instead of page reload
    }
  }, [updateProduit, refetch]);

  const getPlatformeName = (id: number) => {
    const platform = mockPlateformes.find(p => p.id === id);
    return platform?.nom || 'Plateforme inconnue';
  };

  // Calculate statistics
  const totalProduits = produits.length;
  const totalStock = produits.reduce((sum, p) => sum + (p.stock_actuel || 0), 0);
  const alertesStock = produits.filter(p => (p.stock_actuel || 0) <= (p.seuil_alerte || 0)).length;
  const ruptureStock = produits.filter(p => (p.stock_actuel || 0) === 0).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Gestion des produits" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-2 h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-4 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Gestion des produits" />
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Erreur lors du chargement des produits: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <PageMeta
        title="Gestion des Produits | IPTV Management"
        description="Gérez votre catalogue de produits numériques avec suivi de stock automatique"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Gestion des produits" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Catalogue produits
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gérez vos produits numériques avec calcul automatique des prix
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/stock"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Alertes stock
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Nouveau produit
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total produits
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {totalProduits}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Stock total
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalStock}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Alertes stock
                </p>
                <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {alertesStock}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Rupture stock
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                  {ruptureStock}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ComponentCard title="Filtres">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom du produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Catégorie
              </label>
              <select
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value || undefined })}
              >
                <option value="">Toutes les catégories</option>
                <option value="IPTV">IPTV</option>
                <option value="Netflix">Netflix</option>
                <option value="Autres">Autres</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plateforme
              </label>
              <select
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => setFilters({ ...filters, plateforme: e.target.value ? Number(e.target.value) : undefined })}
              >
                <option value="">Toutes les plateformes</option>
                {mockPlateformes.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock
              </label>
              <select
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => setFilters({ ...filters, stock_bas: e.target.value === 'low' })}
              >
                <option value="">Tous les stocks</option>
                <option value="low">Stock faible uniquement</option>
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Products Grid */}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              Erreur lors du chargement: {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {produits.map((produit) => (
              <ProduitCard
                key={produit.id_produit}
                produit={produit}
                plateformeName={getPlatformeName(produit.id_plateforme)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateStock={handleUpdateStock}
              />
            ))}
          </div>
        )}

        {produits.length === 0 && !loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Aucun produit
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Commencez par ajouter votre premier produit au catalogue.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Ajouter un produit
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <ProduitForm
            produit={editingProduit}
            onSuccess={() => {
              console.log('🎉 Product form success - closing modal and refreshing data');
              setShowCreateModal(false);
              setEditingProduit(null);
              console.log('🔄 Calling refetch to refresh product list');
              refetch(); // Refresh data instead of page reload
            }}
            onCancel={() => {
              setShowCreateModal(false);
              setEditingProduit(null);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

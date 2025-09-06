import { useState, useCallback, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { useProduits, useProduitActions, usePlateformes } from '../../hooks/useApi';
import {
  formatCurrency,
  formatDuration,
  getCategoryColor,
  getCategoryBadgeVariant,
  getStockStatus,
  getStockStatusColor,
  getStockStatusBadgeVariant,
  getStockStatusText,
  calculateSalePrice
} from '../../utils/helpers';
import { Produit, ProduitFilters } from '../../types/database';
import ProduitForm from '../../components/iptv/ProduitForm';
import Badge from '../../components/ui/badge/Badge';
import { logError } from '../../utils/errorHandler';

interface ArticleCardProps {
  produit: Produit;
  onEdit: (produit: Produit) => void;
  onDelete: (id: number) => void;
  platformName?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = memo(({
  produit,
  onEdit,
  onDelete,
  platformName
}) => {
  const stockStatus = getStockStatus(produit.stock || 0, produit.seuil_alerte || 0);
  const stockColor = getStockStatusColor(stockStatus);
  const stockText = getStockStatusText(stockStatus);
  const salePrice = calculateSalePrice(produit.prix_achat_moyen || 0, produit.marge || 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {produit.nom ? produit.nom.substring(0, 2).toUpperCase() : '??'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {produit.nom}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {platformName || 'Plateforme inconnue'}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <Badge color={getCategoryBadgeVariant(produit.categorie || '')} size="sm">
                {produit.categorie}
              </Badge>
              <Badge color="light" size="sm">
                {formatDuration(produit.duree)}
              </Badge>
              <Badge color={getStockStatusBadgeVariant(getStockStatus(produit.stock || 0, produit.seuil_alerte || 0))} size="sm">
                {stockText}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {produit.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Stock:</span>
              <span className={`ml-1 font-medium ${stockColor === 'red' ? 'text-red-600' : stockColor === 'orange' ? 'text-orange-600' : 'text-green-600'}`}>
                {produit.stock || 0} unités
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Prix achat:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                {formatCurrency(produit.prix_achat_moyen || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Marge:</span>
              <span className="ml-1 font-medium text-green-600">
                {produit.marge || 0}%
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Prix vente:</span>
              <span className="ml-1 font-medium text-blue-600">
                {formatCurrency(salePrice)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={() => onEdit(produit)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(produit.id_produit)}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
});

ArticleCard.displayName = 'ArticleCard';

export default function Articles() {
  const [filters, setFilters] = useState<ProduitFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);

  // Use real API data
  const { data: apiData, loading, error, refetch } = useProduits(filters);
  const { data: plateformesData } = usePlateformes({});
  const produits = apiData?.items || [];
  const plateformes = plateformesData?.items || [];

  const { deleteProduit, loading: actionLoading } = useProduitActions();

  // Calculate statistics
  const totalProduits = produits.length;
  const totalStock = produits.reduce((sum, p) => sum + (p.stock || 0), 0);
  const alertesStock = produits.filter(p => (p.stock || 0) <= (p.seuil_alerte || 0) && (p.stock || 0) > 0).length;
  const ruptureStock = produits.filter(p => (p.stock || 0) === 0).length;
  const produitsActifs = produits.filter(p => (p.stock || 0) > (p.seuil_alerte || 0)).length;

  // Get platform name for a product
  const getPlatformName = useCallback((platformId: number) => {
    const platform = plateformes.find(p => p.id_plateforme === platformId);
    return platform?.nom || 'Plateforme inconnue';
  }, [plateformes]);

  const handleEdit = useCallback((produit: Produit) => {
    setEditingProduit(produit);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    // Find the product to get its name for the confirmation
    const produit = produits.find(p => p.id_produit === id);
    const productName = produit?.nom || 'ce produit';

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${productName}" ?\n\n` +
      'Cette action est irréversible et supprimera définitivement le produit.'
    );

    if (confirmed) {
      try {
        const success = await deleteProduit(id);
        if (success) {
          // Show success message
          alert(`Le produit "${productName}" a été supprimé avec succès.`);
          refetch();
        } else {
          alert('Erreur lors de la suppression du produit. Veuillez réessayer.');
        }
      } catch (err) {
        logError('Error deleting product', err);
        alert('Erreur lors de la suppression du produit. Veuillez réessayer.');
      }
    }
  }, [deleteProduit, refetch, produits]);

  // Update filters when search term changes
  useEffect(() => {
    const newFilters: ProduitFilters = {};
    
    if (searchTerm) {
      newFilters.search = searchTerm;
    }
    if (selectedCategory) {
      newFilters.categorie = selectedCategory;
    }
    if (selectedPlatform) {
      newFilters.id_plateforme = parseInt(selectedPlatform);
    }
    if (stockFilter) {
      newFilters.stock_status = stockFilter as any;
    }

    setFilters(newFilters);
  }, [searchTerm, selectedCategory, selectedPlatform, stockFilter]);

  // Get unique categories
  const categories = [...new Set(produits.map(p => p.categorie).filter(Boolean))];

  return (
    <>
      <PageMeta 
        title="Articles (Produits)" 
        description="Gérez votre catalogue de produits digitaux"
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Articles (Produits)
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gérez votre catalogue de produits digitaux
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Ajouter un article
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="rounded-xl bg-gray-800 p-6 text-white dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-300">
                  Total Products
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {totalProduits}
                </p>
              </div>
              <div className="rounded-lg bg-blue-600 p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gray-800 p-6 text-white dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-300">
                  Actifs
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {produitsActifs}
                </p>
              </div>
              <div className="rounded-lg bg-green-600 p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gray-800 p-6 text-white dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-300">
                  Stock Bas
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {alertesStock}
                </p>
              </div>
              <div className="rounded-lg bg-orange-600 p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gray-800 p-6 text-white dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-300">
                  Avec Plateforme
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {plateformes.length}
                </p>
              </div>
              <div className="rounded-lg bg-purple-600 p-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Filtres et Recherche
          </h3>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un article par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plateforme
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Toutes les plateformes</option>
                  {plateformes.map(platform => (
                    <option key={platform.id_plateforme} value={platform.id_plateforme}>
                      {platform.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut Stock
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="in_stock">En stock</option>
                  <option value="low_stock">Stock bas</option>
                  <option value="out_of_stock">Rupture</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedPlatform('');
                    setStockFilter('');
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {produits.length} produit{produits.length !== 1 ? 's' : ''} trouvé{produits.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Products Grid/Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des articles...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              Erreur lors du chargement: {error}
            </p>
          </div>
        ) : produits.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun article</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Commencez par ajouter votre premier article.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Ajouter un article
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
            {/* Table Header */}
            <div className="grid grid-cols-8 gap-4 p-4 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <div>ARTICLE</div>
              <div>PLATEFORME</div>
              <div>STOCK</div>
              <div>PRIX ACHAT</div>
              <div>PRIX VENTE</div>
              <div>MARGE</div>
              <div>STATUT</div>
              <div>ACTIONS</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {produits.map((produit) => {
                const stockStatus = getStockStatus(produit.stock || 0, produit.seuil_alerte || 0);
                const stockColor = getStockStatusColor(stockStatus);
                const stockText = getStockStatusText(stockStatus);
                const salePrice = calculateSalePrice(produit.prix_achat_moyen || 0, produit.marge || 0);
                const platformName = getPlatformName(produit.id_plateforme);

                return (
                  <div key={produit.id_produit} className="grid grid-cols-8 gap-4 p-4 items-center hover:bg-gray-100 dark:hover:bg-gray-800/50">
                    {/* Article Info */}
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {produit.nom ? produit.nom.substring(0, 2).toUpperCase() : '??'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {produit.nom}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDuration(produit.duree)} • {produit.categorie}
                        </div>
                      </div>
                    </div>

                    {/* Platform */}
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                          {platformName ? platformName.substring(0, 2).toUpperCase() : '??'}
                        </span>
                      </div>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">
                        {platformName}
                      </span>
                    </div>

                    {/* Stock */}
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {produit.stock || 0} unités
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Seuil: {produit.seuil_alerte || 0}
                      </div>
                    </div>

                    {/* Purchase Price */}
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(produit.prix_achat_moyen || 0)}
                    </div>

                    {/* Sale Price */}
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {formatCurrency(salePrice)}
                    </div>

                    {/* Margin */}
                    <div className="text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        +{produit.marge || 0}%
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatCurrency((produit.marge || 0) * (produit.prix_achat_moyen || 0) / 100)} DZD
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <Badge color={getStockStatusBadgeVariant(stockStatus)} size="sm">
                        {stockText}
                      </Badge>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stockStatus === 'high' ? 'En stock' :
                         stockStatus === 'low' ? 'Stock bas' :
                         stockStatus === 'out' ? 'Rupture' : 'Actif'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(produit)}
                        className="inline-flex items-center justify-center w-8 h-8 border border-transparent rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                        title="Modifier le produit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(produit.id_produit)}
                        className="inline-flex items-center justify-center w-8 h-8 border border-transparent rounded text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                        title="Supprimer le produit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <ProduitForm
            produit={editingProduit}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingProduit(null);
              refetch();
            }}
            onCancel={() => {
              setShowCreateModal(false);
              setEditingProduit(null);
            }}
          />
        )}
      </div>
    </>
  );
}

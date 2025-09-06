import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { 
  formatCurrency, 
  formatDuration, 
  getCategoryColor, 
  getStockStatus, 
  getStockStatusColor, 
  getStockStatusText 
} from '../../utils/helpers';
import { Produit } from '../../types/database';
import Badge from '../../components/ui/badge/Badge';

// Mock data for development - products with low stock or out of stock
const mockProduitsAlerte: Produit[] = [
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
    id_produit: 5,
    nom: 'Netflix Standard 3 mois',
    categorie: 'Netflix',
    duree: '3m',
    description: 'Compte Netflix standard',
    id_plateforme: 2,
    stock: 2,
    seuil_alerte: 5,
    prix_achat_moyen: 8.00,
    marge: 25,
    prix_vente_calcule: 1800,
    created_at: '2024-02-10T11:20:00Z'
  }
];

const mockPlateformes = [
  { id: 1, nom: 'DAR IPTV', devise: 'USD' },
  { id: 2, nom: 'Netflix Premium', devise: 'EUR' },
  { id: 3, nom: 'IPTV Pro', devise: 'DZD' }
];

interface StockAlertRowProps {
  produit: Produit;
  plateformeName: string;
  onQuickRestock: (id: number, quantity: number) => void;
}

const StockAlertRow: React.FC<StockAlertRowProps> = ({ 
  produit, 
  plateformeName, 
  onQuickRestock 
}) => {
  const [restockQuantity, setRestockQuantity] = useState(10);
  const stockStatus = getStockStatus(produit.stock, produit.seuil_alerte);
  
  const urgencyLevel = stockStatus === 'out' ? 'critical' : 'warning';
  const urgencyColor = urgencyLevel === 'critical' 
    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
    : 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';

  return (
    <tr className={`border-b border-gray-100 dark:border-gray-800 ${urgencyColor}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${
            urgencyLevel === 'critical' ? 'bg-red-500' : 'bg-orange-500'
          }`}></div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {produit.nom}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {plateformeName} • {formatDuration(produit.duree)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge
          size="sm"
          className={getCategoryColor(produit.categorie)}
        >
          {produit.categorie}
        </Badge>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Badge
            size="sm"
            className={getStockStatusColor(stockStatus)}
          >
            {produit.stock}
          </Badge>
          <span className="text-xs text-gray-500">
            / {produit.seuil_alerte} min
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`text-sm font-medium ${
          urgencyLevel === 'critical' 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-orange-600 dark:text-orange-400'
        }`}>
          {urgencyLevel === 'critical' ? 'CRITIQUE' : 'ATTENTION'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">
          {formatCurrency(produit.prix_vente_calcule)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={restockQuantity}
            onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
            className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            min="1"
          />
          <button
            onClick={() => onQuickRestock(produit.id_produit, restockQuantity)}
            className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
          >
            +Stock
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function Stock() {
  const [sortBy, setSortBy] = useState<'urgency' | 'stock' | 'name'>('urgency');
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Filter and sort products
  let filteredProducts = mockProduitsAlerte;
  
  if (filterCategory) {
    filteredProducts = filteredProducts.filter(p => p.categorie === filterCategory);
  }

  // Sort products
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'urgency':
        const aStatus = getStockStatus(a.stock, a.seuil_alerte);
        const bStatus = getStockStatus(b.stock, b.seuil_alerte);
        const urgencyOrder = { 'out': 0, 'low': 1, 'medium': 2, 'high': 3 };
        return urgencyOrder[aStatus] - urgencyOrder[bStatus];
      case 'stock':
        return a.stock - b.stock;
      case 'name':
        return a.nom.localeCompare(b.nom);
      default:
        return 0;
    }
  });

  const handleQuickRestock = (id: number, quantity: number) => {
    console.log(`Restocking product ${id} with ${quantity} units`);
    // Here you would call the API to update stock
    alert(`Stock mis à jour: +${quantity} unités`);
  };

  const getPlatformeName = (id: number) => {
    const platform = mockPlateformes.find(p => p.id === id);
    return platform?.nom || 'Plateforme inconnue';
  };

  // Calculate statistics
  const criticalAlerts = filteredProducts.filter(p => p.stock === 0).length;
  const warningAlerts = filteredProducts.filter(p => p.stock > 0 && p.stock <= p.seuil_alerte).length;
  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.prix_vente_calcule * p.stock), 0);

  return (
    <>
      <PageMeta
        title="Alertes Stock | IPTV Management"
        description="Surveillez et gérez les alertes de stock de vos produits"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Alertes stock" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Alertes de stock
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Surveillez les produits nécessitant un réapprovisionnement
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/produits"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Retour aux produits
            </Link>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Réapprovisionner tout
            </button>
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Alertes critiques
                </p>
                <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
                  {criticalAlerts}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400">
                  Rupture de stock
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/20">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Alertes attention
                </p>
                <p className="mt-2 text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {warningAlerts}
                </p>
                <p className="text-xs text-orange-500 dark:text-orange-400">
                  Stock faible
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
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
                  Valeur stock restant
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalValue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Stock en alerte
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <ComponentCard title="Filtres et tri">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="urgency">Urgence</option>
                <option value="stock">Stock croissant</option>
                <option value="name">Nom alphabétique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Catégorie
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Toutes les catégories</option>
                <option value="IPTV">IPTV</option>
                <option value="Netflix">Netflix</option>
                <option value="Autres">Autres</option>
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Stock Alerts Table */}
        <ComponentCard title="Produits en alerte">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Urgence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-white/[0.03]">
                  {filteredProducts.map((produit) => (
                    <StockAlertRow
                      key={produit.id_produit}
                      produit={produit}
                      plateformeName={getPlatformeName(produit.id_plateforme)}
                      onQuickRestock={handleQuickRestock}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Aucune alerte de stock
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Tous vos produits ont un stock suffisant.
              </p>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}

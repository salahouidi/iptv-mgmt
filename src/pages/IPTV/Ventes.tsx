import { useState, useCallback, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { formatCurrency, formatDate, getCategoryColor, getPaymentStatusColor } from '../../utils/helpers';
import { VenteWithDetails, VenteFilters } from '../../types/database';
import { useVentes, useVenteActions } from '../../hooks/useApi';
import VenteForm from '../../components/iptv/VenteForm';
import Badge from '../../components/ui/badge/Badge';

// Mock data for development
const mockVentes: VenteWithDetails[] = [
  {
    id_vente: 1,
    id_plateforme: 1,
    id_produit: 1,
    id_client: 1,
    quantite: 1,
    prix_unitaire: 15000,
    total: 15000,
    date_vente: '2024-02-10T10:00:00Z',
    methode_paiement: 'Espèce',
    statut_paiement: 'Payé',
    notes: 'Livraison immédiate',
    client_nom: 'Ahmed Benali',
    client_telephone: '+213 555 123 456',
    produit_nom: 'IPTV Premium 12 mois',
    produit_categorie: 'IPTV',
    plateforme_nom: 'DAR IPTV'
  },
  {
    id_vente: 2,
    id_plateforme: 1,
    id_produit: 4,
    id_client: 1,
    quantite: 2,
    prix_unitaire: 5500,
    total: 11000,
    date_vente: '2024-02-08T14:30:00Z',
    methode_paiement: 'CCP',
    statut_paiement: 'Payé',
    notes: '',
    client_nom: 'Ahmed Benali',
    client_telephone: '+213 555 123 456',
    produit_nom: 'IPTV Pro 3 mois',
    produit_categorie: 'IPTV',
    plateforme_nom: 'IPTV Pro'
  },
  {
    id_vente: 3,
    id_plateforme: 2,
    id_produit: 2,
    id_client: 2,
    quantite: 1,
    prix_unitaire: 2500,
    total: 2500,
    date_vente: '2024-02-05T15:30:00Z',
    methode_paiement: 'BaridiMob',
    statut_paiement: 'En attente',
    notes: 'Paiement en cours de vérification',
    client_nom: 'Fatima Zohra Mansouri',
    client_telephone: '+213 666 789 012',
    produit_nom: 'Netflix Premium 1 mois',
    produit_categorie: 'Netflix',
    plateforme_nom: 'Netflix Premium'
  },
  {
    id_vente: 4,
    id_plateforme: 1,
    id_produit: 3,
    id_client: 3,
    quantite: 1,
    prix_unitaire: 8000,
    total: 8000,
    date_vente: '2024-02-03T09:15:00Z',
    methode_paiement: 'Espèce',
    statut_paiement: 'Payé',
    notes: '',
    client_nom: 'Karim Boudjelal',
    client_telephone: '+213 777 345 678',
    produit_nom: 'IPTV Standard 6 mois',
    produit_categorie: 'IPTV',
    plateforme_nom: 'DAR IPTV'
  }
];

interface VenteTableRowProps {
  vente: VenteWithDetails;
  onEdit: (vente: VenteWithDetails) => void;
  onDelete: (id: number) => void;
  onGenerateInvoice: (id: number) => void;
}

const VenteTableRow: React.FC<VenteTableRowProps> = memo(({
  vente,
  onEdit,
  onDelete,
  onGenerateInvoice
}) => {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          #{vente.id_vente}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(vente.date_vente, 'datetime')}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {vente.client_nom}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {vente.client_telephone}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {vente.produit_nom}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            size="sm"
            className={getCategoryColor(vente.produit_categorie as any)}
          >
            {vente.produit_categorie}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {vente.plateforme_nom}
          </span>
        </div>
      </td>
      
      <td className="px-6 py-4 text-center">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {vente.quantite}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(vente.prix_unitaire)}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(vente.total)}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {vente.methode_paiement}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <Badge
          size="sm"
          color={vente.statut_paiement === 'Payé' ? 'success' : 'warning'}
        >
          {vente.statut_paiement}
        </Badge>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGenerateInvoice(vente.id_vente)}
            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
            title="Générer facture"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(vente)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Modifier"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(vente.id_vente)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
            title="Supprimer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function Ventes() {
  const [filters, setFilters] = useState<VenteFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVente, setEditingVente] = useState<VenteWithDetails | null>(null);

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

  // Using API hooks with context integration
  const { data: ventesData, loading, error, refetch } = useVentes(filters);
  const ventes = ventesData?.items || [];
  console.log('📊 Ventes data:', { ventesData, ventes, loading, error });
  const { updateVente, deleteVente, bulkDeleteVentes, loading: actionLoading } = useVenteActions();

  const handleEdit = useCallback((vente: VenteWithDetails) => {
    setEditingVente(vente);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    // Find the sale to get its details for confirmation
    const sale = ventes.find(v => v.id_vente === id);
    const saleInfo = sale ? `${sale.produit_nom} - ${sale.client_nom}` : 'cette vente';

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la vente "${saleInfo}" ?\n\n` +
      'Cette action est irréversible et supprimera définitivement la vente.'
    );

    if (confirmed) {
      console.log('🗑️ Deleting sale:', id);
      const success = await deleteVente(id);
      if (success) {
        console.log('✅ Sale deleted successfully');
        // Update context and trigger refresh
        await refetch();
        console.log('🔄 Sales synchronization complete');
        alert(`La vente "${saleInfo}" a été supprimée avec succès.`);
      } else {
        alert('Erreur lors de la suppression de la vente. Veuillez réessayer.');
      }
    }
  }, [deleteVente, ventes, refetch]);

  const handleGenerateInvoice = useCallback((id: number) => {
    console.log('Generate invoice for vente:', id);
    // Navigate to invoice generation or open PDF
    window.open(`/factures/${id}`, '_blank');
  }, []);

  // Calculate statistics with safety checks
  const safeVentes = Array.isArray(ventes) ? ventes : [];
  const totalVentes = safeVentes.length;
  const totalCA = safeVentes.reduce((sum, v) => sum + (v?.total || 0), 0);
  const totalPaye = safeVentes.filter(v => v?.statut_paiement === 'Payé').reduce((sum, v) => sum + (v?.total || 0), 0);
  const totalEnAttente = safeVentes.filter(v => v?.statut_paiement === 'En attente').reduce((sum, v) => sum + (v?.total || 0), 0);
  const ventesAujourdhui = safeVentes.filter(v => {
    if (!v?.date_vente) return false;
    const today = new Date().toDateString();
    const venteDate = new Date(v.date_vente).toDateString();
    return today === venteDate;
  }).length;

  const handleBulkDeleteSales = useCallback(async () => {
    if (window.confirm(
      `⚠️ ATTENTION: Suppression de toutes les ventes\n\n` +
      `Cette action supprimera DÉFINITIVEMENT toutes les ventes (${totalVentes} ventes).\n` +
      `Cette action est IRRÉVERSIBLE.\n\n` +
      `Êtes-vous absolument sûr de vouloir continuer ?`
    )) {
      console.log('🗑️ Attempting to delete all sales...');

      try {
        const result = await bulkDeleteVentes();
        if (result) {
          console.log(`✅ Successfully deleted ${result.deleted} sales`);
          alert(`Toutes les ventes ont été supprimées avec succès! (${result.deleted} ventes supprimées)`);
          // Refresh data
          window.location.reload();
        } else {
          console.log('❌ Failed to delete sales');
          alert('Erreur lors de la suppression des ventes');
        }
      } catch (err) {
        console.error('💥 Exception during bulk delete:', err);
        alert(`Erreur lors de la suppression: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      }
    }
  }, [bulkDeleteVentes, totalVentes]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Historique des ventes" />
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            ))}
          </div>
          <div className="h-96 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Historique des Ventes | IPTV Management"
        description="Consultez et gérez l'historique de toutes vos ventes"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Historique des ventes" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Historique des ventes
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Suivez toutes vos ventes et générez des factures
            </p>
          </div>
          <div className="flex gap-3">
            {safeVentes.length > 0 && (
              <button
                onClick={handleBulkDeleteSales}
                disabled={actionLoading}
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                🗑️ Vider l'historique
              </button>
            )}
            <Link
              to="/factures"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Voir factures
            </Link>
            <Link
              to="/ventes/nouvelle"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Nouvelle vente
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ventes aujourd'hui
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {ventesAujourdhui}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total ventes
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {totalVentes}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  CA payé
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalPaye)}
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
                  En attente
                </p>
                <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(totalEnAttente)}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ComponentCard title="Filtres">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Rechercher par client, produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date début
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date fin
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut paiement
              </label>
              <select
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => setFilters({ ...filters, statut_paiement: e.target.value || undefined })}
              >
                <option value="">Tous les statuts</option>
                <option value="Payé">Payé</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Méthode paiement
              </label>
              <select
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => setFilters({ ...filters, methode_paiement: e.target.value || undefined })}
              >
                <option value="">Toutes les méthodes</option>
                <option value="Espèce">Espèce</option>
                <option value="CCP">CCP</option>
                <option value="BaridiMob">BaridiMob</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Sales Table */}
        <ComponentCard title="Liste des ventes">
          {safeVentes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Vente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Qté
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Paiement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-white/[0.03]">
                  {safeVentes.map((vente) => (
                    <VenteTableRow
                      key={vente.id_vente}
                      vente={vente}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onGenerateInvoice={handleGenerateInvoice}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Aucune vente
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Commencez par enregistrer votre première vente.
              </p>
              <Link
                to="/ventes/nouvelle"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Nouvelle vente
              </Link>
            </div>
          )}
        </ComponentCard>

        {/* Edit Modal */}
        {showEditModal && (
          <VenteForm
            vente={editingVente}
            onSuccess={() => {
              setShowEditModal(false);
              setEditingVente(null);
              window.location.reload();
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditingVente(null);
            }}
          />
        )}
      </div>
    </>
  );
}

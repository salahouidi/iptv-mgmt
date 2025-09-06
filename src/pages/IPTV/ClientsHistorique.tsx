import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/helpers';
import { VenteWithDetails } from '../../types/database';
import Badge from '../../components/ui/badge/Badge';
import { useSalesWithContext } from '../../hooks/useSalesWithContext';
import { useClientsWithContext } from '../../hooks/useClientsWithContext';

// Real-time client purchase history with API integration


interface VenteRowProps {
  vente: VenteWithDetails;
  showClientInfo?: boolean;
}

const VenteRow: React.FC<VenteRowProps> = ({ vente, showClientInfo = true }) => {
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
      
      {showClientInfo && (
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {vente.client_nom}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {vente.client_telephone}
          </div>
        </td>
      )}
      
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
    </tr>
  );
};

export default function ClientsHistorique() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');
  const [selectedClient, setSelectedClient] = useState<string>(clientId || '');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Get real sales and clients data
  const { data: salesData, loading: salesLoading, error: salesError } = useSalesWithContext();
  const { data: clientsData, loading: clientsLoading, error: clientsError } = useClientsWithContext();

  const allSales = salesData?.items || [];
  const allClients = clientsData?.items || [];

  // Filter sales based on selected client
  let filteredVentes = allSales;
  if (selectedClient) {
    filteredVentes = filteredVentes.filter(v => v.id_client === parseInt(selectedClient));
  }

  // Filter by date range if specified
  if (dateRange.start) {
    filteredVentes = filteredVentes.filter(v => new Date(v.date_vente) >= new Date(dateRange.start));
  }
  if (dateRange.end) {
    filteredVentes = filteredVentes.filter(v => new Date(v.date_vente) <= new Date(dateRange.end));
  }

  // Calculate statistics
  const totalVentes = filteredVentes.length;
  const totalCA = filteredVentes.reduce((sum, v) => sum + v.total, 0);
  const totalPaye = filteredVentes.filter(v => v.statut_paiement === 'Payé').reduce((sum, v) => sum + v.total, 0);
  const totalEnAttente = filteredVentes.filter(v => v.statut_paiement === 'En attente').reduce((sum, v) => sum + v.total, 0);

  const selectedClientInfo = selectedClient ? allClients.find(c => c.id_client === parseInt(selectedClient)) : null;

  // Loading state
  if (salesLoading || clientsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (salesError || clientsError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium">
            Erreur lors du chargement des données
          </div>
          <div className="text-gray-500 mt-2">
            {salesError || clientsError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Historique des Achats | IPTV Management"
        description="Consultez l'historique détaillé des achats de vos clients"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Historique des achats" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Historique des achats
              {selectedClientInfo && (
                <span className="ml-2 text-lg font-normal text-gray-500">
                  - {selectedClientInfo.nom_complet}
                </span>
              )}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {selectedClient 
                ? 'Historique détaillé des achats du client sélectionné'
                : 'Historique global de tous les achats clients'
              }
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/clients"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Retour aux clients
            </Link>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Exporter CSV
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
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
                  CA total
                </p>
                <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalCA)}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Montant payé
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Tous les clients</option>
                {allClients.map((client) => (
                  <option key={client.id_client} value={client.id_client}>
                    {client.nom_complet}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date début
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date fin
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </ComponentCard>

        {/* Sales History Table */}
        <ComponentCard title="Historique des ventes">
          {filteredVentes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Vente
                    </th>
                    {!selectedClient && (
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Client
                      </th>
                    )}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-white/[0.03]">
                  {filteredVentes.map((vente) => (
                    <VenteRow
                      key={vente.id_vente}
                      vente={vente}
                      showClientInfo={!selectedClient}
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
                Aucun achat trouvé
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {selectedClient 
                  ? 'Ce client n\'a pas encore effectué d\'achat.'
                  : 'Aucun achat ne correspond aux critères sélectionnés.'
                }
              </p>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}

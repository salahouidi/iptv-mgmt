import { useState, useCallback, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { useClientActions } from '../../hooks/useApi';
import { useClientsWithContext } from '../../hooks/useClientsWithContext';
import { formatCurrency, formatDate, timeAgo, WILAYAS } from '../../utils/helpers';
import { Client, ClientFilters } from '../../types/database';
import ClientForm from '../../components/iptv/ClientForm';
import Badge from '../../components/ui/badge/Badge';
import DebugInfo from '../../components/common/DebugInfo';

// Mock data for development
const mockClients: Client[] = [
  {
    id_client: 1,
    nom_complet: 'Ahmed Benali',
    telephone: '+213 555 123 456',
    wilaya: 'Alger',
    email: 'ahmed.benali@email.com',
    adresse: '123 Rue Didouche Mourad, Alger Centre',
    facebook: 'https://facebook.com/ahmed.benali',
    instagram: '@ahmed_benali',
    notes: 'Client fidèle, préfère les abonnements IPTV longue durée',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id_client: 2,
    nom_complet: 'Fatima Zohra Mansouri',
    telephone: '+213 666 789 012',
    wilaya: 'Oran',
    email: 'fatima.mansouri@email.com',
    adresse: '45 Boulevard de la République, Oran',
    facebook: '',
    instagram: '@fatima_zohra',
    notes: 'Intéressée par les comptes Netflix premium',
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id_client: 3,
    nom_complet: 'Karim Boudjelal',
    telephone: '+213 777 345 678',
    wilaya: 'Constantine',
    email: 'karim.boudjelal@email.com',
    adresse: '78 Rue Larbi Ben M\'hidi, Constantine',
    facebook: 'https://facebook.com/karim.boudjelal',
    instagram: '',
    notes: 'Paiement toujours en espèces, très ponctuel',
    created_at: '2024-02-01T09:15:00Z'
  },
  {
    id_client: 4,
    nom_complet: 'Amina Khelifi',
    telephone: '+213 555 987 654',
    wilaya: 'Sétif',
    email: 'amina.khelifi@email.com',
    adresse: '12 Cité des Frères, Sétif',
    facebook: '',
    instagram: '@amina_khelifi',
    notes: 'Recommande souvent nos services à ses amis',
    created_at: '2024-02-05T16:45:00Z'
  }
];

// Mock purchase history data
const mockPurchaseHistory = [
  { id_client: 1, total_achats: 45000, nb_commandes: 3, derniere_commande: '2024-02-10T10:00:00Z' },
  { id_client: 2, total_achats: 12500, nb_commandes: 2, derniere_commande: '2024-02-08T15:30:00Z' },
  { id_client: 3, total_achats: 28000, nb_commandes: 4, derniere_commande: '2024-02-12T09:15:00Z' },
  { id_client: 4, total_achats: 8000, nb_commandes: 1, derniere_commande: '2024-02-05T14:20:00Z' }
];

interface ClientCardProps {
  client: Client;
  purchaseData?: any;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
  onViewHistory: (id: number) => void;
}

const ClientCard: React.FC<ClientCardProps> = memo(({
  client,
  purchaseData,
  onEdit,
  onDelete,
  onViewHistory
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] min-h-[280px] flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {client.nom_complet ? client.nom_complet.split(' ').map(n => n[0]).join('').slice(0, 2) : '??'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {client.nom_complet}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {client.wilaya} • Inscrit {timeAgo(client.created_at)}
              </p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.5 10.5a11.5 11.5 0 005 5l1.013-3.724a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">{client.telephone}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">{client.email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">{client.adresse}</span>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mt-3 flex items-center gap-3">
            {client.facebook && (
              <a
                href={client.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            {client.instagram && (
              <a
                href={`https://instagram.com/${client.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 dark:text-pink-400"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.876.876 1.366 2.027 1.366 3.324s-.49 2.448-1.366 3.323c-.875.876-2.026 1.366-3.323 1.366zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.876-.875-1.366-2.026-1.366-3.323s.49-2.448 1.366-3.323c.875-.876 2.026-1.366 3.323-1.366s2.448.49 3.323 1.366c.876.875 1.366 2.026 1.366 3.323s-.49 2.448-1.366 3.323c-.875.876-2.026 1.366-3.323 1.366z"/>
                </svg>
              </a>
            )}
          </div>

          {client.notes && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Notes: </span>
                {client.notes}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(client)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(client.id_client)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Purchase Summary */}
      {purchaseData && (
        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total achats</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(purchaseData.total_achats)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Commandes</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {purchaseData.nb_commandes}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dernière commande</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {timeAgo(purchaseData.derniere_commande)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onViewHistory(client.id_client)}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Voir historique
            </button>
            <Link
              to={`/ventes/nouvelle?client=${client.id_client}`}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Nouvelle vente
            </Link>
          </div>
        </div>
      )}
    </div>
  );
});

export default function Clients() {
  console.log('🔍 Clients component: Starting render');

  const [filters, setFilters] = useState<ClientFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  console.log('🔍 Clients component: State initialized');

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

  // Use real API data with context integration
  const { data: apiData, loading, error, refetch } = useClientsWithContext(filters);
  const clients = apiData?.items || [];

  console.log('🔍 Clients component: API data received', {
    apiData,
    clientsLength: clients.length,
    loading,
    error
  });

  const { deleteClient, loading: actionLoading } = useClientActions();

  console.log('🔍 Clients component: Actions initialized', { actionLoading });

  const handleEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setShowCreateModal(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      const success = await deleteClient(id);
      if (success) {
        refetch();
      }
    }
  }, [deleteClient, refetch]);

  const handleViewHistory = useCallback((id: number) => {
    // Navigate to client history page
    window.open(`/clients/historique?client=${id}`, '_blank');
  }, []);

  const getPurchaseData = (clientId: number) => {
    return mockPurchaseHistory.find(p => p.id_client === clientId);
  };

  // Calculate statistics
  const totalClients = clients.length;
  const nouveauxCeMois = clients.filter(c => {
    const createdDate = new Date(c.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  }).length;
  const totalAchats = mockPurchaseHistory.reduce((sum, p) => sum + p.total_achats, 0);

  if (loading) {
    console.log('🔍 Clients component: Rendering loading state');
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Base clients" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div>
                  <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="mt-1 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.log('🔍 Clients component: Rendering error state', error);
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Base clients" />
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Erreur lors du chargement des clients: {error}
          </p>
        </div>
      </div>
    );
  }

  console.log('🔍 Clients component: Rendering main content', {
    clientsLength: clients.length,
    showCreateModal,
    editingClient
  });

  return (
    <>
      <DebugInfo
        componentName="Clients"
        data={clients}
        loading={loading}
        error={error}
        additionalInfo={{
          filtersApplied: filters,
          searchTerm,
          debouncedSearchTerm,
          showCreateModal,
          editingClient: !!editingClient,
          actionLoading
        }}
      />

      <PageMeta
        title="Base Clients | IPTV Management"
        description="Gérez votre base de données clients avec historique des achats"
      />

      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Base clients" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Base clients
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gérez vos clients et suivez leur historique d'achats
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/clients/historique"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Historique global
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Nouveau client
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total clients
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {totalClients}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Nouveaux ce mois
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {nouveauxCeMois}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  CA total clients
                </p>
                <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalAchats)}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ComponentCard title="Filtres">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom, téléphone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Wilaya
              </label>
              <select
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => setFilters({ ...filters, wilaya: e.target.value || undefined })}
              >
                <option value="">Toutes les wilayas</option>
                {WILAYAS.map((wilaya) => (
                  <option key={wilaya} value={wilaya}>
                    {wilaya}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Clients Grid */}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              Erreur lors du chargement: {error}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {clients.map((client) => (
              <ClientCard
                key={client.id_client}
                client={client}
                purchaseData={getPurchaseData(client.id_client)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewHistory={handleViewHistory}
              />
            ))}
          </div>
        )}

        {clients.length === 0 && !loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Aucun client
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Commencez par ajouter votre premier client.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Ajouter un client
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <ClientForm
            client={editingClient}
            onSuccess={() => {
              setShowCreateModal(false);
              setEditingClient(null);
              refetch();
            }}
            onCancel={() => {
              setShowCreateModal(false);
              setEditingClient(null);
            }}
          />
        )}
      </div>
    </>
  );
}

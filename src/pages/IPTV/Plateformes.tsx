import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { usePlateformes, usePlateformeActions } from '../../hooks/useApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Plateforme, PlateformeFilters } from '../../types/database';
import PlateformeForm from '../../components/iptv/PlateformeForm';
import RechargeForm from '../../components/iptv/RechargeForm';

// Mock data for development
const mockPlateformes: Plateforme[] = [
  {
    id_plateforme: 1,
    nom: 'DAR IPTV',
    description: 'Plateforme principale IPTV avec large catalogue',
    url: 'https://dar-iptv.com',
    solde_initial: 5000,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id_plateforme: 2,
    nom: 'Netflix Premium',
    description: 'Comptes Netflix premium partagés',
    url: 'https://netflix.com',
    solde_initial: 3000,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id_plateforme: 3,
    nom: 'IPTV Pro',
    description: 'Service IPTV professionnel haute qualité',
    url: 'https://iptv-pro.net',
    solde_initial: 7500,
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-01-09T09:15:00Z'
  }
];

interface PlateformeCardProps {
  plateforme: Plateforme;
  onEdit: (plateforme: Plateforme) => void;
  onDelete: (id: number) => void;
  onNewRecharge: (plateformeId: number) => void;
}

const PlateformeCard: React.FC<PlateformeCardProps> = ({ plateforme, onEdit, onDelete, onNewRecharge }) => {
  return (
    <div className="h-[280px] flex flex-col rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between flex-1">
        <div className="flex-1 min-h-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {plateforme.nom}
            </h3>
            <span className="rounded-full px-2 py-1 text-xs font-medium flex-shrink-0 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              {formatCurrency(plateforme.solde_initial || 0)}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxHeight: '2.5rem'
          }}>
            {plateforme.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="truncate">Créé le {formatDate(plateforme.created_at)}</span>
            <a
              href={plateforme.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 flex-shrink-0"
            >
              Visiter le site
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(plateforme)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(plateforme.id_plateforme)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
        <div className="flex gap-4">
          <Link
            to={`/recharges?plateforme=${plateforme.id_plateforme}`}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Voir recharges
          </Link>
        </div>
        <button
          onClick={() => onNewRecharge(plateforme.id_plateforme)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex-shrink-0"
        >
          Nouvelle recharge
        </button>
      </div>
    </div>
  );
};

export default function Plateformes() {
  const [filters, setFilters] = useState<PlateformeFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlateforme, setEditingPlateforme] = useState<Plateforme | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedPlateformeId, setSelectedPlateformeId] = useState<number | null>(null);

  // Use real API data
  const { data: apiData, loading, error, refetch } = usePlateformes(filters);
  const plateformes = apiData?.items || [];

  console.log('📊 Plateformes data:', { apiData, plateformes });

  const { deletePlateforme, loading: actionLoading, error: actionError } = usePlateformeActions();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput || undefined }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleEdit = (plateforme: Plateforme) => {
    setEditingPlateforme(plateforme);
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
    const plateforme = plateformes.find(p => p.id_plateforme === id);
    const platformName = plateforme?.nom || 'cette plateforme';

    if (window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${platformName}" ?\n\n` +
      `Cette action est irréversible et supprimera définitivement la plateforme.\n` +
      `Note: La suppression échouera s'il existe des recharges ou produits associés.`
    )) {
      console.log(`🗑️ Attempting to delete platform: ${platformName} (ID: ${id})`);

      try {
        const success = await deletePlateforme(id);
        console.log(`📊 Delete operation result:`, { success, error: actionError });

        if (success) {
          console.log(`✅ Platform deleted successfully: ${platformName}`);
          // Show success message
          alert(`Plateforme "${platformName}" supprimée avec succès!`);
          // Refresh data
          refetch();
        } else {
          console.log(`❌ Failed to delete platform: ${platformName}`, actionError);
          // Show error message
          alert(`Erreur lors de la suppression: ${actionError || 'Erreur inconnue'}`);
        }
      } catch (err) {
        console.error(`💥 Exception during delete:`, err);
        alert(`Erreur lors de la suppression: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      }
    }
  };

  const handleSearch = useCallback((search: string) => {
    setSearchInput(search);
  }, []);

  const handleNewRecharge = (plateformeId: number) => {
    console.log(`💰 Opening recharge form for platform ID: ${plateformeId}`);
    setSelectedPlateformeId(plateformeId);
    setShowRechargeModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Plateformes" />
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

  return (
    <>
      <PageMeta
        title="Gestion des Plateformes | IPTV Management"
        description="Gérez vos plateformes fournisseurs IPTV et services numériques"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Plateformes" />
        
        {/* Header with actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Plateformes
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Gérez vos plateformes fournisseurs et leurs recharges
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Nouvelle plateforme
          </button>
        </div>

        {/* Filters */}
        <ComponentCard title="Filtres">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rechercher
              </label>
              <input
                type="text"
                value={searchInput}
                placeholder="Nom de la plateforme..."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </ComponentCard>

        {/* Plateformes Grid */}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              Erreur lors du chargement: {error}
            </p>
          </div>
        ) : (
          <div className="min-h-[400px] grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plateformes.map((plateforme) => (
              <PlateformeCard
                key={plateforme.id_plateforme}
                plateforme={plateforme}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onNewRecharge={handleNewRecharge}
              />
            ))}
          </div>
        )}

        {plateformes.length === 0 && !loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Aucune plateforme
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Commencez par ajouter votre première plateforme fournisseur.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Ajouter une plateforme
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <PlateformeForm
            plateforme={editingPlateforme}
            onSuccess={() => {
              console.log('🎉 Platform form success! Closing modal and refetching...');
              setShowCreateModal(false);
              setEditingPlateforme(null);
              refetch();
            }}
            onCancel={() => {
              setShowCreateModal(false);
              setEditingPlateforme(null);
            }}
          />
        )}

        {/* Recharge Modal */}
        {showRechargeModal && selectedPlateformeId && (
          <RechargeForm
            plateformeId={selectedPlateformeId}
            onSuccess={() => {
              console.log('🎉 Recharge form success! Closing modal and refetching...');
              setShowRechargeModal(false);
              setSelectedPlateformeId(null);
              refetch(); // Refresh platform data to show updated recharge info
            }}
            onCancel={() => {
              setShowRechargeModal(false);
              setSelectedPlateformeId(null);
            }}
          />
        )}
      </div>
    </>
  );
}

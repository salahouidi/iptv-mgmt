import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { formatDate, formatFileSize } from '../../utils/helpers';
import Badge from '../../components/ui/badge/Badge';

// Mock backup data
const mockBackups = [
  {
    id: 1,
    filename: 'backup_2024-02-12_10-30.zip',
    type: 'automatic',
    size: 15728640, // 15 MB
    created_at: '2024-02-12T10:30:00Z',
    status: 'completed',
    includes: ['database', 'files', 'settings']
  },
  {
    id: 2,
    filename: 'backup_2024-02-11_02-00.zip',
    type: 'automatic',
    size: 14892032, // 14.2 MB
    created_at: '2024-02-11T02:00:00Z',
    status: 'completed',
    includes: ['database', 'files', 'settings']
  },
  {
    id: 3,
    filename: 'backup_manual_2024-02-10_16-45.zip',
    type: 'manual',
    size: 16777216, // 16 MB
    created_at: '2024-02-10T16:45:00Z',
    status: 'completed',
    includes: ['database', 'files', 'settings', 'logs']
  },
  {
    id: 4,
    filename: 'backup_2024-02-10_02-00.zip',
    type: 'automatic',
    size: 0,
    created_at: '2024-02-10T02:00:00Z',
    status: 'failed',
    includes: ['database', 'files', 'settings']
  }
];

interface BackupRowProps {
  backup: any;
  onDownload: (backup: any) => void;
  onRestore: (backup: any) => void;
  onDelete: (id: number) => void;
}

const BackupRow: React.FC<BackupRowProps> = ({ backup, onDownload, onRestore, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'failed':
        return 'Échouée';
      case 'in_progress':
        return 'En cours';
      default:
        return 'Inconnue';
    }
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${
            backup.type === 'manual' 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {backup.filename}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {backup.type === 'manual' ? 'Sauvegarde manuelle' : 'Sauvegarde automatique'}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">
          {formatDate(backup.created_at, 'datetime')}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 dark:text-white">
          {backup.status === 'completed' ? formatFileSize(backup.size) : '-'}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <Badge
          size="sm"
          color={getStatusColor(backup.status)}
        >
          {getStatusText(backup.status)}
        </Badge>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {backup.includes.map((item: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
            >
              {item}
            </span>
          ))}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {backup.status === 'completed' && (
            <>
              <button
                onClick={() => onDownload(backup)}
                className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
                title="Télécharger"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button
                onClick={() => onRestore(backup)}
                className="rounded-lg p-2 text-green-500 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                title="Restaurer"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(backup.id)}
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
};

export default function Sauvegarde() {
  const [backups, setBackups] = useState(mockBackups);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupOptions, setBackupOptions] = useState({
    includeDatabase: true,
    includeFiles: true,
    includeSettings: true,
    includeLogs: false
  });

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup = {
        id: Date.now(),
        filename: `backup_manual_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`,
        type: 'manual',
        size: Math.floor(Math.random() * 5000000) + 10000000, // Random size between 10-15MB
        created_at: new Date().toISOString(),
        status: 'completed',
        includes: Object.entries(backupOptions)
          .filter(([_, included]) => included)
          .map(([key, _]) => key.replace('include', '').toLowerCase())
      };
      
      setBackups(prev => [newBackup, ...prev]);
      alert('Sauvegarde créée avec succès !');
    } catch (error) {
      alert('Erreur lors de la création de la sauvegarde');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDownload = (backup: any) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = backup.filename;
    link.click();
    alert(`Téléchargement de ${backup.filename} démarré`);
  };

  const handleRestore = (backup: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir restaurer la sauvegarde ${backup.filename} ? Cette action remplacera toutes les données actuelles.`)) {
      alert('Restauration en cours... Cette opération peut prendre quelques minutes.');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
      setBackups(prev => prev.filter(backup => backup.id !== id));
    }
  };

  // Calculate statistics
  const totalBackups = backups.length;
  const completedBackups = backups.filter(b => b.status === 'completed').length;
  const totalSize = backups
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.size, 0);
  const lastBackup = backups.find(b => b.status === 'completed');

  return (
    <>
      <PageMeta
        title="Sauvegarde | IPTV Management"
        description="Gérez vos sauvegardes et restaurations de données"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Sauvegarde et restauration" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sauvegarde et restauration
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Protégez vos données avec des sauvegardes régulières
            </p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isCreatingBackup ? 'Création en cours...' : 'Nouvelle sauvegarde'}
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total sauvegardes
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {totalBackups}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Réussies
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedBackups}
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
                  Taille totale
                </p>
                <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatFileSize(totalSize)}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Dernière sauvegarde
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                  {lastBackup ? formatDate(lastBackup.created_at, 'relative') : 'Aucune'}
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

        {/* Backup Options */}
        <ComponentCard title="Options de sauvegarde">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sélectionnez les éléments à inclure dans la prochaine sauvegarde manuelle :
            </p>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={backupOptions.includeDatabase}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, includeDatabase: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Base de données
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Clients, produits, ventes, etc.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={backupOptions.includeFiles}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, includeFiles: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fichiers
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Images, documents, preuves de paiement
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={backupOptions.includeSettings}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, includeSettings: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Paramètres
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Configuration de l'application
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={backupOptions.includeLogs}
                  onChange={(e) => setBackupOptions(prev => ({ ...prev, includeLogs: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Journaux
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Logs d'activité et d'erreurs
                  </p>
                </div>
              </label>
            </div>
          </div>
        </ComponentCard>

        {/* Backups List */}
        <ComponentCard title="Historique des sauvegardes">
          {backups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Fichier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Taille
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Contenu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-white/[0.03]">
                  {backups.map((backup) => (
                    <BackupRow
                      key={backup.id}
                      backup={backup}
                      onDownload={handleDownload}
                      onRestore={handleRestore}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Aucune sauvegarde
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Créez votre première sauvegarde pour protéger vos données.
              </p>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}

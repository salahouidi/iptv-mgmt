import { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import { GroupIcon, LockIcon, UserIcon, TimeIcon } from '../../icons';
import { useAdministrators, useAdministratorActions, useAdminActivity } from '../../hooks/useApi';
import { Administrator, AdministratorFilters, AdminActivityFilters } from '../../types/database';
import AdministratorTable from '../../components/iptv/AdministratorTable';
import AdministratorForm from '../../components/iptv/AdministratorForm';

type TabType = 'identifiants' | 'utilisateurs' | 'historique';

export default function GestionAdministrateurs() {
  const [activeTab, setActiveTab] = useState<TabType>('utilisateurs');
  const [filters, setFilters] = useState<AdministratorFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Administrator | null>(null);

  // API hooks
  const { data: adminData, loading: adminLoading, error: adminError, refetch: refetchAdmins } = useAdministrators(filters);
  const { createAdministrator, updateAdministrator, deleteAdministrator, updateCredentials, loading: actionLoading } = useAdministratorActions();
  const { data: activityData, loading: activityLoading, error: activityError } = useAdminActivity({});
  const administrators = adminData?.items || [];
  const activities = activityData?.items || [];

  const tabs = [
    {
      id: 'identifiants' as TabType,
      name: 'Mes Identifiants',
      icon: <LockIcon className="h-5 w-5" />,
    },
    {
      id: 'utilisateurs' as TabType,
      name: 'Utilisateurs Admin',
      icon: <UserIcon className="h-5 w-5" />,
    },
    {
      id: 'historique' as TabType,
      name: 'Historique',
      icon: <TimeIcon className="h-5 w-5" />,
    },
  ];

  // Handler functions
  const handleCreateAdmin = async (data: any) => {
    await createAdministrator(data);
    refetchAdmins();
    setShowCreateModal(false);
  };

  const handleEditAdmin = (admin: Administrator) => {
    setEditingAdmin(admin);
  };

  const handleUpdateAdmin = async (data: any) => {
    if (editingAdmin) {
      await updateAdministrator(editingAdmin.id_admin, data);
      refetchAdmins();
      setEditingAdmin(null);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    await deleteAdministrator(id);
    refetchAdmins();
  };

  const handleUpdateCredentials = async (data: any) => {
    await updateCredentials(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identifiants':
        return (
          <MesIdentifiants
            onUpdateCredentials={handleUpdateCredentials}
            loading={actionLoading}
          />
        );
      case 'utilisateurs':
        return (
          <UtilisateursAdmin
            administrators={administrators}
            loading={adminLoading}
            error={adminError}
            onEdit={handleEditAdmin}
            onDelete={handleDeleteAdmin}
            onAdd={() => setShowCreateModal(true)}
          />
        );
      case 'historique':
        return (
          <Historique
            activities={activities}
            loading={activityLoading}
            error={activityError}
          />
        );
      default:
        return (
          <UtilisateursAdmin
            administrators={administrators}
            loading={adminLoading}
            error={adminError}
            onEdit={handleEditAdmin}
            onDelete={handleDeleteAdmin}
            onAdd={() => setShowCreateModal(true)}
          />
        );
    }
  };

  return (
    <>
      <PageMeta
        title="Gestion des Administrateurs | IPTV Management"
        description="Gérez les comptes administrateurs et la sécurité"
      />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
            <GroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Administrateurs
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gérez les comptes administrateurs et la sécurité
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Modals */}
        <AdministratorForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAdmin}
          loading={actionLoading}
        />

        <AdministratorForm
          isOpen={!!editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSubmit={handleUpdateAdmin}
          administrator={editingAdmin}
          loading={actionLoading}
        />
      </div>
    </>
  );
}

// Placeholder components for each tab
interface MesIdentifiantsProps {
  onUpdateCredentials: (data: any) => Promise<void>;
  loading: boolean;
}

function MesIdentifiants({ onUpdateCredentials, loading }: MesIdentifiantsProps) {
  const [formData, setFormData] = useState({
    username: '',
    new_password: '',
    confirm_password: '',
    current_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new_password: false,
    confirm_password: false,
    current_password: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Le nouveau mot de passe est requis';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.current_password) {
      newErrors.current_password = 'Le mot de passe actuel est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onUpdateCredentials({
        username: formData.username,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
        current_password: formData.current_password
      });

      // Reset form on success
      setFormData({
        username: '',
        new_password: '',
        confirm_password: '',
        current_password: ''
      });
    } catch (error) {
      console.error('Error updating credentials:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Modifier mes identifiants
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Changez votre nom d'utilisateur et mot de passe pour sécuriser votre compte.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nouveau nom d'utilisateur
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="Entrez le nouveau nom d'utilisateur"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
              errors.username
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            } dark:border-gray-600 dark:bg-gray-800 dark:text-white`}
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPasswords.new_password ? 'text' : 'password'}
              value={formData.new_password}
              onChange={(e) => handleChange('new_password', e.target.value)}
              placeholder="Entrez le nouveau mot de passe"
              className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 ${
                errors.new_password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } dark:border-gray-600 dark:bg-gray-800 dark:text-white`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new_password')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new_password ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.new_password && (
            <p className="mt-1 text-xs text-red-600">{errors.new_password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm_password ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              placeholder="Confirmez le nouveau mot de passe"
              className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 ${
                errors.confirm_password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } dark:border-gray-600 dark:bg-gray-800 dark:text-white`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm_password')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm_password ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe actuel
          </label>
          <div className="relative">
            <input
              type={showPasswords.current_password ? 'text' : 'password'}
              value={formData.current_password}
              onChange={(e) => handleChange('current_password', e.target.value)}
              placeholder="Entrez votre mot de passe actuel"
              className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 ${
                errors.current_password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              } dark:border-gray-600 dark:bg-gray-800 dark:text-white`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current_password')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current_password ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.current_password && (
            <p className="mt-1 text-xs text-red-600">{errors.current_password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Mise à jour...
            </div>
          ) : (
            'Mettre à jour les identifiants'
          )}
        </button>
      </form>
    </div>
  );
}

interface UtilisateursAdminProps {
  administrators: Administrator[];
  loading: boolean;
  error: string | null;
  onEdit: (admin: Administrator) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}

function UtilisateursAdmin({ administrators, loading, error, onEdit, onDelete, onAdd }: UtilisateursAdminProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Utilisateurs Administrateurs
        </h2>
        <button
          onClick={onAdd}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Ajouter un administrateur
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Erreur lors du chargement: {error}
          </p>
        </div>
      ) : (
        <AdministratorTable
          administrators={administrators}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

interface HistoriqueProps {
  activities: any[];
  loading: boolean;
  error: string | null;
}

function Historique({ activities, loading, error }: HistoriqueProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historique des Actions
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Historique des Actions
        </h2>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Erreur lors du chargement: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Historique des Actions
      </h2>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Aucune activité
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Aucune activité d'administrateur enregistrée pour le moment.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {activities.map((activity, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action || 'Action inconnue'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {activity.description || 'Aucune description disponible'}
                    </p>
                    {activity.ip_address && (
                      <p className="mt-1 text-xs text-gray-400">
                        IP: {activity.ip_address}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.created_at ? new Date(activity.created_at).toLocaleString('fr-FR') : 'Date inconnue'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, memo } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { formatCurrency } from '../../utils/helpers';
import { useParametres, useParametresActions } from '../../hooks/useApi';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import DebugInfo from '../../components/common/DebugInfo';
import { logError } from '../../utils/errorHandler';

// Mock current settings
const mockSettings = {
  business: {
    nom_entreprise: 'IPTV Solutions DZ',
    adresse: '123 Rue Didouche Mourad, Alger',
    telephone: '+213 555 123 456',
    email: 'contact@iptvsolutions.dz',
    site_web: 'https://iptvsolutions.dz',
    logo: '/logo.png'
  },
  financial: {
    devise_principale: 'DZD',
    taux_change_usd: 270,
    taux_change_eur: 290,
    tva_applicable: false,
    taux_tva: 19
  },
  notifications: {
    email_notifications: true,
    sms_notifications: false,
    stock_alerts: true,
    seuil_alerte_global: 10,
    rappel_paiements: true
  },
  system: {
    theme: 'auto',
    langue: 'fr',
    timezone: 'Africa/Algiers',
    format_date: 'DD/MM/YYYY',
    sauvegarde_auto: true,
    frequence_sauvegarde: 'daily'
  }
};

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = memo(({ title, description, children }) => {
  return (
    <ComponentCard title={title}>
      <div className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        {children}
      </div>
    </ComponentCard>
  );
});

export default function Parametres() {
  console.log('🔍 Parametres component: Starting render');

  try {
    const { data: apiSettings, loading: loadingSettings, error: loadError } = useParametres();
    const { updateParametres, loading, error } = useParametresActions();
    const [localSettings, setLocalSettings] = useState(mockSettings);
    const [saved, setSaved] = useState(false);

    console.log('🔍 Parametres component: State initialized', {
      apiSettings,
      loadingSettings,
      loadError,
      loading,
      error,
      localSettingsKeys: localSettings ? Object.keys(localSettings) : 'null'
    });

  // Update local settings when API data loads
  useEffect(() => {
    console.log('API Settings loaded:', apiSettings);
    if (apiSettings && typeof apiSettings === 'object') {
      // Ensure all required properties exist with fallbacks
      const safeSettings = {
        business: {
          nom_entreprise: apiSettings.business?.nom_entreprise || mockSettings.business.nom_entreprise,
          adresse: apiSettings.business?.adresse || mockSettings.business.adresse,
          telephone: apiSettings.business?.telephone || mockSettings.business.telephone,
          email: apiSettings.business?.email || mockSettings.business.email,
          site_web: apiSettings.business?.site_web || mockSettings.business.site_web,
          logo: apiSettings.business?.logo || mockSettings.business.logo
        },
        financial: {
          devise_principale: apiSettings.financial?.devise_principale || mockSettings.financial.devise_principale,
          taux_change_usd: apiSettings.financial?.taux_change_usd || mockSettings.financial.taux_change_usd,
          taux_change_eur: apiSettings.financial?.taux_change_eur || mockSettings.financial.taux_change_eur,
          tva_applicable: apiSettings.financial?.tva_applicable ?? mockSettings.financial.tva_applicable,
          taux_tva: apiSettings.financial?.taux_tva || mockSettings.financial.taux_tva
        },
        notifications: {
          email_notifications: apiSettings.notifications?.email_notifications ?? mockSettings.notifications.email_notifications,
          sms_notifications: apiSettings.notifications?.sms_notifications ?? mockSettings.notifications.sms_notifications,
          stock_alerts: apiSettings.notifications?.stock_alerts ?? mockSettings.notifications.stock_alerts,
          seuil_alerte_global: apiSettings.notifications?.seuil_alerte_global || mockSettings.notifications.seuil_alerte_global,
          rappel_paiements: apiSettings.notifications?.rappel_paiements ?? mockSettings.notifications.rappel_paiements
        },
        system: {
          theme: apiSettings.system?.theme || mockSettings.system.theme,
          langue: apiSettings.system?.langue || mockSettings.system.langue,
          timezone: apiSettings.system?.timezone || mockSettings.system.timezone,
          format_date: apiSettings.system?.format_date || mockSettings.system.format_date,
          sauvegarde_auto: apiSettings.system?.sauvegarde_auto ?? mockSettings.system.sauvegarde_auto,
          frequence_sauvegarde: apiSettings.system?.frequence_sauvegarde || mockSettings.system.frequence_sauvegarde
        }
      };
      setLocalSettings(safeSettings);
    }
  }, [apiSettings]);

  const handleSave = useCallback(async (section: string) => {
    try {
      console.log('🔍 Saving settings for section:', section, localSettings);

      if (!localSettings) {
        throw new Error('Local settings is null or undefined');
      }

      const result = await updateParametres(localSettings);
      if (result) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        console.log('✅ Settings saved successfully');
      }
    } catch (err) {
      console.error('❌ Error saving settings:', err);
      logError(err instanceof Error ? err : new Error(String(err)), {
        section,
        localSettings,
        component: 'Parametres'
      });
    }
  }, [localSettings, updateParametres]);

  const handleChange = useCallback((section: string, field: string, value: any) => {
    setLocalSettings(prev => {
      // Ensure prev exists and has the required structure
      if (!prev || typeof prev !== 'object') {
        console.warn('Invalid previous settings, using mock settings');
        return mockSettings;
      }

      // Ensure the section exists
      const currentSection = prev[section as keyof typeof prev];
      if (!currentSection || typeof currentSection !== 'object') {
        console.warn(`Invalid section ${section}, using default`);
        return {
          ...prev,
          [section]: {
            ...mockSettings[section as keyof typeof mockSettings],
            [field]: value
          }
        };
      }

      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: value
        }
      };
    });
  }, []);

  const currencyOptions = [
    { value: 'DZD', label: 'Dinar Algérien (DZD)' }
  ];

  const themeOptions = [
    { value: 'auto', label: 'Automatique' },
    { value: 'light', label: 'Clair' },
    { value: 'dark', label: 'Sombre' }
  ];

  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' }
  ];

  const backupFrequencyOptions = [
    { value: 'daily', label: 'Quotidienne' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuelle' }
  ];

  if (loadingSettings) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <PageBreadcrumb pageTitle="Paramètres" />
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-blue-600 dark:text-blue-400">
                Chargement des paramètres...
              </p>
            </div>
          </div>
          <div className="animate-pulse space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (loadError) {
    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <PageBreadcrumb pageTitle="Paramètres" />
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <div className="text-red-600 dark:text-red-400">⚠️</div>
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">
                  Erreur lors du chargement des paramètres
                </p>
                <p className="text-sm text-red-500 dark:text-red-300">
                  {loadError}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DebugInfo
        componentName="Parametres"
        data={apiSettings}
        loading={loadingSettings}
        error={loadError}
        additionalInfo={{
          localSettings,
          saved,
          updateLoading: loading,
          updateError: error
        }}
      />

      <PageMeta
        title="Paramètres | IPTV Management"
        description="Configurez les paramètres de votre application IPTV"
      />

      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Paramètres" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Paramètres
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configurez votre application selon vos besoins
            </p>
          </div>
          <div className="flex gap-3">
            {saved && (
              <div className="rounded-lg bg-green-50 px-4 py-2 dark:bg-green-900/20">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ Paramètres sauvegardés
                </p>
              </div>
            )}
            {loadingSettings && (
              <div className="rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Chargement...
                </p>
              </div>
            )}
            {loadError && (
              <div className="rounded-lg bg-red-50 px-4 py-2 dark:bg-red-900/20">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Erreur: {loadError}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Development mode info */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Mode développement : Configuration simulée
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                Les paramètres sont sauvegardés localement et seront synchronisés avec le backend une fois connecté.
              </p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <SettingsSection
          title="Informations de l'entreprise"
          description="Configurez les informations de votre entreprise qui apparaîtront sur les factures et documents."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="nom_entreprise">Nom de l'entreprise</Label>
              <Input
                type="text"
                id="nom_entreprise"
                value={localSettings?.business?.nom_entreprise || ''}
                onChange={(e) => handleChange('business', 'nom_entreprise', e.target.value)}
                placeholder="Nom de votre entreprise"
              />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                type="tel"
                id="telephone"
                value={localSettings?.business?.telephone || ''}
                onChange={(e) => handleChange('business', 'telephone', e.target.value)}
                placeholder="+213 555 123 456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={localSettings?.business?.email || ''}
                onChange={(e) => handleChange('business', 'email', e.target.value)}
                placeholder="contact@entreprise.com"
              />
            </div>
            <div>
              <Label htmlFor="site_web">Site web</Label>
              <Input
                type="url"
                id="site_web"
                value={localSettings?.business?.site_web || ''}
                onChange={(e) => handleChange('business', 'site_web', e.target.value)}
                placeholder="https://votre-site.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="adresse">Adresse complète</Label>
            <textarea
              id="adresse"
              value={localSettings?.business?.adresse || ''}
              onChange={(e) => handleChange('business', 'adresse', e.target.value)}
              placeholder="Adresse complète de votre entreprise"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            onClick={() => handleSave('business')}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </SettingsSection>

        {/* Financial Settings */}
        <SettingsSection
          title="Paramètres financiers"
          description="Configurez les devises, taux de change et paramètres de facturation."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="devise_principale">Devise principale</Label>
              <Select
                options={currencyOptions}
                value={localSettings?.financial?.devise_principale || 'DZD'}
                onChange={(value) => handleChange('financial', 'devise_principale', value)}
              />
            </div>
            <div>
              <Label htmlFor="taux_change_eur">Taux EUR → DZD</Label>
              <Input
                type="number"
                id="taux_change_eur"
                value={localSettings?.financial?.taux_change_eur || 290}
                onChange={(e) => handleChange('financial', 'taux_change_eur', parseFloat(e.target.value) || 0)}
                placeholder="290"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localSettings?.financial?.tva_applicable || false}
                onChange={(e) => handleChange('financial', 'tva_applicable', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Appliquer la TVA
              </span>
            </label>
            {localSettings?.financial?.tva_applicable && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={localSettings?.financial?.taux_tva || 19}
                  onChange={(e) => handleChange('financial', 'taux_tva', parseFloat(e.target.value) || 0)}
                  placeholder="19"
                  className="w-20"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSave('financial')}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          title="Notifications"
          description="Configurez les alertes et notifications que vous souhaitez recevoir."
        >
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSettings?.notifications?.email_notifications || false}
                onChange={(e) => handleChange('notifications', 'email_notifications', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notifications par email
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recevoir les notifications importantes par email
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSettings?.notifications?.stock_alerts || false}
                onChange={(e) => handleChange('notifications', 'stock_alerts', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alertes de stock
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Être alerté quand le stock est faible
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSettings?.notifications?.rappel_paiements || false}
                onChange={(e) => handleChange('notifications', 'rappel_paiements', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rappels de paiement
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Rappeler les paiements en attente
                </p>
              </div>
            </label>

            <div className="flex items-center gap-4">
              <Label htmlFor="seuil_alerte_global">Seuil d'alerte stock global</Label>
              <Input
                type="number"
                id="seuil_alerte_global"
                value={localSettings?.notifications?.seuil_alerte_global || 10}
                onChange={(e) => handleChange('notifications', 'seuil_alerte_global', parseInt(e.target.value) || 0)}
                placeholder="10"
                className="w-20"
                min="0"
              />
              <span className="text-sm text-gray-500">unités</span>
            </div>
          </div>

          <button
            onClick={() => handleSave('notifications')}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </SettingsSection>

        {/* System Settings */}
        <SettingsSection
          title="Paramètres système"
          description="Configurez l'apparence et le comportement de l'application."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="theme">Thème</Label>
              <Select
                options={themeOptions}
                value={localSettings?.system?.theme || 'auto'}
                onChange={(value) => handleChange('system', 'theme', value)}
              />
            </div>
            <div>
              <Label htmlFor="langue">Langue</Label>
              <Select
                options={languageOptions}
                value={localSettings?.system?.langue || 'fr'}
                onChange={(value) => handleChange('system', 'langue', value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localSettings?.system?.sauvegarde_auto || false}
                onChange={(e) => handleChange('system', 'sauvegarde_auto', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sauvegarde automatique
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sauvegarder automatiquement les données
                </p>
              </div>
            </label>

            {localSettings?.system?.sauvegarde_auto && (
              <div className="ml-6">
                <Label htmlFor="frequence_sauvegarde">Fréquence</Label>
                <Select
                  options={backupFrequencyOptions}
                  value={localSettings?.system?.frequence_sauvegarde || 'daily'}
                  onChange={(value) => handleChange('system', 'frequence_sauvegarde', value)}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => handleSave('system')}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </SettingsSection>

        {/* Danger Zone */}
        <ComponentCard title="Zone de danger">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Actions irréversibles qui affectent vos données.
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20">
                Exporter toutes les données
              </button>
              <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20">
                Réinitialiser les paramètres
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </ErrorBoundary>
  );

  } catch (componentError) {
    console.error('🚨 Critical error in Parametres component:', componentError);
    logError(componentError instanceof Error ? componentError : new Error(String(componentError)), {
      component: 'Parametres',
      phase: 'render'
    });

    return (
      <ErrorBoundary>
        <div className="space-y-6">
          <PageBreadcrumb pageTitle="Paramètres" />
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex items-center gap-3">
              <div className="text-red-600 dark:text-red-400">🚨</div>
              <div>
                <p className="font-medium text-red-600 dark:text-red-400">
                  Erreur critique dans les paramètres
                </p>
                <p className="text-sm text-red-500 dark:text-red-300">
                  {componentError instanceof Error ? componentError.message : String(componentError)}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                >
                  Recharger la page
                </button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
}

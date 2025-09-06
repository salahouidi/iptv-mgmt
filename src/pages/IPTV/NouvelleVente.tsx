import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { formatCurrency, formatDuration, getCategoryColor, PAYMENT_METHODS } from '../../utils/helpers';
import { CreateVenteData, CreateClientData } from '../../types/database';
import { useVenteActions, usePlateformes, useProduits, useClientActions } from '../../hooks/useApi';
import { useClientsWithContext } from '../../hooks/useClientsWithContext';
import { useClientContext } from '../../contexts/ClientContext';
import Badge from '../../components/ui/badge/Badge';

// Component interfaces
interface ProductSelectionProps {
  selectedProduct: any;
  onProductSelect: (product: any) => void;
}



export default function NouvelleVente() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedClientId = searchParams.get('client');

  const [formData, setFormData] = useState({
    id_client: preselectedClientId ? parseInt(preselectedClientId) : 0,
    id_produit: 0,
    id_plateforme: 0,
    quantite: 1,
    prix_unitaire: 0,
    methode_paiement: 'Espèce' as any,
    statut_paiement: 'Payé' as any,
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [newClientData, setNewClientData] = useState({
    nom_complet: '',
    telephone: '',
    email: '',
    wilaya: 'Alger',
    adresse: ''
  });

  // API hooks
  const { createVente, loading, error } = useVenteActions();
  const { createClient, loading: clientLoading, error: clientError } = useClientActions();

  // Client context for global state management
  const { addClient, refreshClients } = useClientContext();
  const { data: plateformesData, loading: plateformesLoading, error: plateformesError } = usePlateformes();
  const { data: produitsData, loading: produitsLoading, error: produitsError } = useProduits(
    selectedPlatform ? { plateforme_id: selectedPlatform.id_plateforme } : undefined
  );
  const { data: clientsData, loading: clientsLoading, error: clientsError, refetch: refetchClients } = useClientsWithContext();

  // Extract data from API responses
  const plateformes = plateformesData?.items || [];
  const produits = produitsData?.items || [];
  const clients = clientsData?.items || [];

  const handlePlatformSelect = (platformId: number) => {
    const platform = plateformes.find(p => p.id_plateforme === platformId);
    setSelectedPlatform(platform);
    setSelectedProduct(null); // Reset product when platform changes
    setFormData(prev => ({
      ...prev,
      id_plateforme: platformId,
      id_produit: 0,
      prix_unitaire: 0
    }));
    if (errors.id_plateforme) {
      setErrors(prev => ({ ...prev, id_plateforme: '' }));
    }
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      id_produit: product.id_produit,
      prix_unitaire: product.prix_vente || product.prix_vente_calcule || 0
    }));
    if (errors.id_produit) {
      setErrors(prev => ({ ...prev, id_produit: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    console.log('🔍 Validating form with clientType:', clientType);
    console.log('🔍 New client data:', newClientData);

    if (!formData.id_plateforme) {
      newErrors.id_plateforme = 'Veuillez sélectionner une plateforme';
    }

    // Client validation
    if (clientType === 'existing') {
      if (!formData.id_client) {
        newErrors.id_client = 'Veuillez sélectionner un client';
      }
    } else {
      // New client validation - ONLY nom_complet, telephone, and wilaya are required
      console.log('🔍 Validating new client fields...');
      if (!newClientData.nom_complet.trim()) {
        newErrors.client_nom_complet = 'Le nom complet est requis';
        console.log('❌ Missing nom_complet');
      }
      if (!newClientData.telephone.trim()) {
        newErrors.client_telephone = 'Le téléphone est requis';
        console.log('❌ Missing telephone');
      }
      if (!newClientData.wilaya.trim()) {
        newErrors.client_wilaya = 'La wilaya est requise';
        console.log('❌ Missing wilaya');
      }
      // Email and address are OPTIONAL - no validation required
      console.log('✅ Email and address are optional - no validation');
    }

    if (!formData.id_produit) {
      newErrors.id_produit = 'Veuillez sélectionner un produit';
    }

    if (!formData.quantite || formData.quantite < 1) {
      newErrors.quantite = 'La quantité doit être au moins 1';
    }

    if (selectedProduct && formData.quantite > (selectedProduct.stock_actuel || selectedProduct.stock)) {
      newErrors.quantite = `Stock insuffisant (${selectedProduct.stock} disponible)`;
    }

    if (!formData.prix_unitaire || formData.prix_unitaire <= 0) {
      newErrors.prix_unitaire = 'Le prix unitaire doit être positif';
    }

    console.log('🔍 Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('🔍 Form is valid:', isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let clientId = formData.id_client;

      // Create new client if needed
      if (clientType === 'new') {
        console.log('🆕 Creating new client:', newClientData);

        const clientData: CreateClientData = {
          nom_complet: newClientData.nom_complet.trim(),
          telephone: newClientData.telephone.trim(),
          email: newClientData.email.trim() || '', // Optional field
          wilaya: newClientData.wilaya.trim(), // Required field
          adresse: newClientData.adresse.trim() || '', // Optional field
          date_creation: new Date().toISOString(),
          date_modification: new Date().toISOString()
        };

        const newClient = await createClient(clientData);
        if (!newClient) {
          console.error('❌ Failed to create new client');
          return;
        }

        clientId = newClient.id_client;
        console.log('✅ New client created with ID:', clientId);

        // Add client to global context and trigger refetch
        console.log('🔄 Adding client to global context:', newClient);
        addClient(newClient);
        console.log('🔄 Refreshing clients list...');
        await refetchClients();
        refreshClients();
        console.log('✅ Client synchronization complete');
      }

      // Calculate purchase cost based on platform type and product data
      const platform = selectedPlatform;
      let purchaseCost = 0;
      let costType = 'currency';

      if (platform && selectedProduct) {
        if (platform.balance_type === 'points') {
          // For point-based platforms, use product's default cost or calculate from duration
          purchaseCost = selectedProduct.default_cost || selectedProduct.prix_achat_moyen || 1;
          costType = 'points';
        } else {
          // For currency-based platforms, use product's purchase cost
          purchaseCost = selectedProduct.default_cost || selectedProduct.prix_achat_moyen || 1;
          costType = 'currency';
        }
      }

      // Ensure purchase cost is never 0 (backend validation requires > 0)
      if (purchaseCost <= 0) {
        purchaseCost = 1; // Minimum fallback value
      }

      const venteData: CreateVenteData = {
        id_client: clientId,
        id_produit: formData.id_produit,
        id_plateforme: formData.id_plateforme,
        quantite: formData.quantite,
        prix_unitaire: formData.prix_unitaire,
        date_vente: new Date().toISOString(),
        methode_paiement: formData.methode_paiement,
        statut_paiement: formData.statut_paiement,
        notes: formData.notes || undefined,
        purchase_cost: purchaseCost,
        cost_type_vente: costType as 'currency' | 'points'
      };

      console.log('🚀 Submitting sale data:', venteData);

      const result = await createVente(venteData);
      if (result) {
        console.log('✅ Sale created successfully:', result);
        navigate('/ventes');
      } else {
        console.error('❌ Sale creation failed - no result returned');
      }
    } catch (err) {
      console.error('❌ Error creating sale:', err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNewClientChange = (field: string, value: string) => {
    setNewClientData(prev => ({ ...prev, [field]: value }));
    if (errors[`client_${field}`]) {
      setErrors(prev => ({ ...prev, [`client_${field}`]: '' }));
    }
  };

  const handleClientTypeChange = (type: 'existing' | 'new') => {
    setClientType(type);
    if (type === 'existing') {
      // Reset new client data
      setNewClientData({
        nom_complet: '',
        telephone: '',
        email: '',
        wilaya: 'Alger',
        adresse: ''
      });
    } else {
      // Reset existing client selection
      setFormData(prev => ({ ...prev, id_client: 0 }));
    }
    // Clear client-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.id_client;
      delete newErrors.client_nom_complet;
      delete newErrors.client_telephone;
      delete newErrors.client_wilaya;
      delete newErrors.client_email;
      delete newErrors.client_adresse;
      return newErrors;
    });
  };

  const calculateTotal = () => {
    return formData.prix_unitaire * formData.quantite;
  };

  // Create options from API data
  const plateformeOptions = plateformes.map(plateforme => ({
    value: plateforme.id_plateforme.toString(),
    label: plateforme.nom
  }));

  const clientOptions = clients.map(client => ({
    value: client.id_client.toString(),
    label: `${client.nom} ${client.prenom || ''} (${client.telephone || client.email})`
  }));

  const paymentMethodOptions = PAYMENT_METHODS.map(method => ({
    value: method,
    label: method
  }));

  const statusOptions = [
    { value: 'Payé', label: 'Payé' },
    { value: 'En attente', label: 'En attente' }
  ];

  return (
    <>
      <PageMeta
        title="Nouvelle Vente | IPTV Management"
        description="Enregistrez une nouvelle vente avec gestion automatique du stock"
      />

      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Nouvelle vente" />

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nouvelle vente
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enregistrez une nouvelle vente avec mise à jour automatique du stock
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/ventes')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Retour aux ventes
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {(plateformesLoading || clientsLoading) && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des données...</span>
            </div>
          )}

          {/* Error State */}
          {(plateformesError || clientsError || error) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erreur
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {plateformesError && <p>Plateformes: {plateformesError}</p>}
                    {clientsError && <p>Clients: {clientsError}</p>}
                    {error && <p>Vente: {error}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Platform Selection */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sélection de Plateforme
                </h2>
              </div>
              <div>
                <select
                  value={formData.id_plateforme || ''}
                  onChange={(e) => handlePlatformSelect(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  disabled={plateformesLoading}
                >
                  <option value="">
                    {plateformesLoading ? 'Chargement...' : 'Sélectionner une plateforme'}
                  </option>
                  {plateformeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.id_plateforme && (
                  <p className="mt-1 text-sm text-red-400">{errors.id_plateforme}</p>
                )}
                {plateformesError && (
                  <p className="mt-1 text-sm text-red-400">Erreur: {plateformesError}</p>
                )}
              </div>
            </div>

            {/* Product and Payment Type Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Produit *</span>
                </div>
                <select
                  value={selectedProduct?.id_produit || ''}
                  onChange={(e) => {
                    const product = produits.find(p => p.id_produit === parseInt(e.target.value));
                    if (product) handleProductSelect(product);
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  disabled={!selectedPlatform || produitsLoading}
                >
                  <option value="">
                    {!selectedPlatform
                      ? 'Sélectionnez d\'abord une plateforme'
                      : produitsLoading
                      ? 'Chargement...'
                      : 'Sélectionner un produit'
                    }
                  </option>
                  {produits.map(product => (
                    <option key={product.id_produit} value={product.id_produit}>
                      {product.nom} - {formatCurrency(product.prix_vente || product.prix_vente_calcule || 0)}
                    </option>
                  ))}
                </select>
                {errors.id_produit && (
                  <p className="mt-1 text-sm text-red-400">{errors.id_produit}</p>
                )}
                {produitsError && (
                  <p className="mt-1 text-sm text-red-400">Erreur: {produitsError}</p>
                )}
              </div>

              {/* Payment Type */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type de Paiement *</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="radio" name="payment_type" value="one_time" className="w-4 h-4 text-blue-600" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Achat ponctuel</span>
                  </label>
                  <label className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="radio" name="payment_type" value="recurring" className="w-4 h-4 text-blue-600" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Paiement récurrent</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Selected Product Display */}
            {selectedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {selectedProduct.nom}
                        </h3>
                        <Badge
                          size="sm"
                          className={getCategoryColor(selectedProduct.categorie as any)}
                        >
                          {selectedProduct.categorie}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span>Durée: {selectedProduct.duree_mois ? `${selectedProduct.duree_mois} mois` : 'Non spécifié'}</span>
                        <span>Stock: {selectedProduct.stock_actuel || selectedProduct.stock || 0}</span>
                        <span>{selectedPlatform?.nom}</span>
                      </div>

                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedProduct.prix_vente || selectedProduct.prix_vente_calcule || 0)}
                      </div>
                    </div>

                    {(selectedProduct.stock_actuel || selectedProduct.stock || 0) === 0 && (
                      <Badge size="sm" color="error">
                        Rupture
                      </Badge>
                    )}
                  </div>
                </div>


              </div>
            )}

            {/* Quantity and Unit Price */}
            {selectedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantité *</label>
                  <input
                    type="number"
                    value={formData.quantite}
                    onChange={(e) => handleChange('quantite', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="1"
                    min="1"
                    max={selectedProduct.stock_actuel || selectedProduct.stock || 0}
                  />
                  {errors.quantite && (
                    <p className="mt-1 text-sm text-red-400">{errors.quantite}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Stock disponible: {selectedProduct.stock_actuel || selectedProduct.stock || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prix unitaire (DZD) *</label>
                  <input
                    type="number"
                    value={formData.prix_unitaire}
                    onChange={(e) => handleChange('prix_unitaire', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  {errors.prix_unitaire && (
                    <p className="mt-1 text-sm text-red-400">{errors.prix_unitaire}</p>
                  )}
                </div>
              </div>
            )}

            {/* Client Information */}
            {selectedProduct && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Informations Client
                  </h2>
                </div>

                {/* Client Type Selection */}
                <div className="flex gap-4 mb-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="client_type"
                      value="existing"
                      checked={clientType === 'existing'}
                      onChange={() => handleClientTypeChange('existing')}
                      className="w-4 h-4 text-pink-600"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white">Client existant</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="client_type"
                      value="new"
                      checked={clientType === 'new'}
                      onChange={() => handleClientTypeChange('new')}
                      className="w-4 h-4 text-pink-600"
                    />
                    <span className="ml-2 text-gray-900 dark:text-white">Nouveau client</span>
                  </label>
                </div>

                {/* Existing Client Selection */}
                {clientType === 'existing' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sélectionner un client</label>
                    <select
                      value={formData.id_client.toString()}
                      onChange={(e) => handleChange('id_client', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      disabled={clientsLoading}
                    >
                      <option value="0">
                        {clientsLoading ? 'Chargement...' : 'Choisir un client'}
                      </option>
                      {clientOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.id_client && (
                      <p className="mt-1 text-sm text-red-400">{errors.id_client}</p>
                    )}
                    {clientsError && (
                      <p className="mt-1 text-sm text-red-400">Erreur: {clientsError}</p>
                    )}
                  </div>
                )}

                {/* New Client Form */}
                {clientType === 'new' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Nom complet *</label>
                      <input
                        type="text"
                        value={newClientData.nom_complet}
                        onChange={(e) => handleNewClientChange('nom_complet', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Nom complet du client"
                      />
                      {errors.client_nom_complet && (
                        <p className="mt-1 text-sm text-red-400">{errors.client_nom_complet}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Téléphone *</label>
                        <input
                          type="tel"
                          value={newClientData.telephone}
                          onChange={(e) => handleNewClientChange('telephone', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="+213 555 123 456"
                        />
                        {errors.client_telephone && (
                          <p className="mt-1 text-sm text-red-400">{errors.client_telephone}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <input
                          type="email"
                          value={newClientData.email}
                          onChange={(e) => handleNewClientChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Wilaya *</label>
                      <select
                        value={newClientData.wilaya}
                        onChange={(e) => handleNewClientChange('wilaya', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Alger">Alger</option>
                        <option value="Oran">Oran</option>
                        <option value="Constantine">Constantine</option>
                        <option value="Annaba">Annaba</option>
                        <option value="Blida">Blida</option>
                        <option value="Batna">Batna</option>
                        <option value="Djelfa">Djelfa</option>
                        <option value="Sétif">Sétif</option>
                        <option value="Sidi Bel Abbès">Sidi Bel Abbès</option>
                        <option value="Biskra">Biskra</option>
                        <option value="Tébessa">Tébessa</option>
                        <option value="El Oued">El Oued</option>
                        <option value="Skikda">Skikda</option>
                        <option value="Tiaret">Tiaret</option>
                        <option value="Béjaïa">Béjaïa</option>
                        <option value="Tlemcen">Tlemcen</option>
                        <option value="Ouargla">Ouargla</option>
                        <option value="Béchar">Béchar</option>
                        <option value="Mostaganem">Mostaganem</option>
                        <option value="Tamanghasset">Tamanghasset</option>
                        <option value="Médéa">Médéa</option>
                        <option value="Mascara">Mascara</option>
                        <option value="Bouira">Bouira</option>
                        <option value="Chlef">Chlef</option>
                        <option value="Laghouat">Laghouat</option>
                        <option value="Oum El Bouaghi">Oum El Bouaghi</option>
                        <option value="Bordj Bou Arréridj">Bordj Bou Arréridj</option>
                        <option value="Tizi Ouzou">Tizi Ouzou</option>
                        <option value="Jijel">Jijel</option>
                        <option value="Guelma">Guelma</option>
                        <option value="Saïda">Saïda</option>
                        <option value="Khenchela">Khenchela</option>
                        <option value="Souk Ahras">Souk Ahras</option>
                        <option value="Tipaza">Tipaza</option>
                        <option value="Mila">Mila</option>
                        <option value="Aïn Defla">Aïn Defla</option>
                        <option value="Naâma">Naâma</option>
                        <option value="Aïn Témouchent">Aïn Témouchent</option>
                        <option value="Ghardaïa">Ghardaïa</option>
                        <option value="Relizane">Relizane</option>
                        <option value="Tindouf">Tindouf</option>
                        <option value="Tissemsilt">Tissemsilt</option>
                        <option value="El Bayadh">El Bayadh</option>
                        <option value="Illizi">Illizi</option>
                        <option value="Bordj Badji Mokhtar">Bordj Badji Mokhtar</option>
                        <option value="Ouled Djellal">Ouled Djellal</option>
                        <option value="Béni Abbès">Béni Abbès</option>
                        <option value="In Salah">In Salah</option>
                        <option value="In Guezzam">In Guezzam</option>
                        <option value="Touggourt">Touggourt</option>
                        <option value="Djanet">Djanet</option>
                        <option value="El M'Ghair">El M'Ghair</option>
                        <option value="El Meniaa">El Meniaa</option>
                      </select>
                      {errors.client_wilaya && (
                        <p className="mt-1 text-sm text-red-400">{errors.client_wilaya}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Adresse complète</label>
                      <textarea
                        value={newClientData.adresse}
                        onChange={(e) => handleNewClientChange('adresse', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        placeholder="123 Rue Didouche Mourad, Alger Centre"
                        rows={3}
                      />
                    </div>

                    {clientError && (
                      <p className="mt-1 text-sm text-red-400">Erreur: {clientError}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sale Date and Payment Method */}
            {selectedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date de vente *</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Méthode de paiement *</label>
                  <select
                    value={formData.methode_paiement}
                    onChange={(e) => handleChange('methode_paiement', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Espèces">Espèces</option>
                    {paymentMethodOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Payment Status and Notes */}
            {selectedProduct && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Statut du paiement *</label>
                  <select
                    value={formData.statut_paiement}
                    onChange={(e) => handleChange('statut_paiement', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Payé">Payé</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Notes additionnelles..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedProduct && (
              <div className="flex justify-between items-center pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/ventes')}
                  className="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Annuler
                </button>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(calculateTotal())}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || clientLoading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {(loading || clientLoading) ? 'Enregistrement...' : 'Enregistrer la vente'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

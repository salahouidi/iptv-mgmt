import { useState, useEffect } from 'react';
import { useVenteActions } from '../../hooks/useApi';
import { VenteWithDetails, CreateVenteData, UpdateVenteData } from '../../types/database';
import { formatCurrency, PAYMENT_METHODS } from '../../utils/helpers';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/Select';

interface VenteFormProps {
  vente?: VenteWithDetails | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Mock data for dropdowns
const mockClients = [
  { id: 1, nom: 'Ahmed Benali', prenom: 'Ahmed' },
  { id: 2, nom: 'Fatima Mansouri', prenom: 'Fatima' },
  { id: 3, nom: 'Karim Benaissa', prenom: 'Karim' }
];

const mockProduits = [
  { id: 1, nom: 'IPTV Premium 12 mois', prix_vente: 15000 },
  { id: 2, nom: 'Netflix Premium 1 mois', prix_vente: 2500 },
  { id: 3, nom: 'IPTV Standard 6 mois', prix_vente: 8000 }
];

export default function VenteForm({ vente, onSuccess, onCancel }: VenteFormProps) {
  const { createVente, updateVente, loading, error } = useVenteActions();
  const [formData, setFormData] = useState({
    id_client: vente?.id_client || 0,
    id_produit: vente?.id_produit || 0,
    id_plateforme: vente?.id_plateforme || 0,
    quantite: vente?.quantite || 1,
    prix_unitaire: vente?.prix_unitaire || 0,
    methode_paiement: vente?.methode_paiement || 'espece',
    statut_paiement: vente?.statut_paiement || 'paye',
    notes: vente?.notes || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.id_client) {
      newErrors.id_client = 'Veuillez sélectionner un client';
    }
    if (!formData.id_produit) {
      newErrors.id_produit = 'Veuillez sélectionner un produit';
    }
    if (formData.quantite <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0';
    }
    if (formData.prix_unitaire <= 0) {
      newErrors.prix_unitaire = 'Le prix doit être supérieur à 0';
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
      if (vente) {
        // Update existing vente
        const updateData: UpdateVenteData = {
          quantite: formData.quantite,
          prix_unitaire: formData.prix_unitaire,
          methode_paiement: formData.methode_paiement,
          statut_paiement: formData.statut_paiement,
          notes: formData.notes || undefined
        };
        
        const result = await updateVente(vente.id_vente, updateData);
        if (result) {
          onSuccess();
        }
      } else {
        // Create new vente
        const createData: CreateVenteData = {
          id_client: formData.id_client,
          id_produit: formData.id_produit,
          id_plateforme: formData.id_plateforme,
          quantite: formData.quantite,
          prix_unitaire: formData.prix_unitaire,
          date_vente: new Date().toISOString(),
          methode_paiement: formData.methode_paiement,
          statut_paiement: formData.statut_paiement,
          notes: formData.notes || undefined
        };
        
        const result = await createVente(createData);
        if (result) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Error saving vente:', err);
    }
  };

  const handleProductChange = (productId: number) => {
    const product = mockProduits.find(p => p.id === productId);
    setFormData(prev => ({
      ...prev,
      id_produit: productId,
      prix_unitaire: product?.prix_vente || 0
    }));
  };

  const clientOptions = mockClients.map(client => ({
    value: client.id.toString(),
    label: `${client.prenom} ${client.nom}`
  }));

  const produitOptions = mockProduits.map(produit => ({
    value: produit.id.toString(),
    label: `${produit.nom} - ${formatCurrency(produit.prix_vente)}`
  }));

  const paymentMethodOptions = PAYMENT_METHODS.map(method => ({
    value: method.value,
    label: method.label
  }));

  const paymentStatusOptions = [
    { value: 'paye', label: 'Payé' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'annule', label: 'Annulé' }
  ];

  return (
    <div
      className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {vente ? 'Modifier la vente' : 'Nouvelle vente'}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Development mode info */}
        <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Mode développement : Les données sont simulées localement
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="id_client">Client *</Label>
              <Select
                options={clientOptions}
                value={formData.id_client.toString()}
                onChange={(value) => setFormData(prev => ({ ...prev, id_client: parseInt(value) }))}
                disabled={!!vente} // Can't change client for existing vente
              />
              {errors.id_client && (
                <p className="mt-1 text-sm text-red-600">{errors.id_client}</p>
              )}
            </div>

            <div>
              <Label htmlFor="id_produit">Produit *</Label>
              <Select
                options={produitOptions}
                value={formData.id_produit.toString()}
                onChange={(value) => handleProductChange(parseInt(value))}
                disabled={!!vente} // Can't change product for existing vente
              />
              {errors.id_produit && (
                <p className="mt-1 text-sm text-red-600">{errors.id_produit}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="quantite">Quantité *</Label>
              <Input
                type="number"
                id="quantite"
                value={formData.quantite}
                onChange={(e) => setFormData(prev => ({ ...prev, quantite: parseInt(e.target.value) || 0 }))}
                min="1"
                required
              />
              {errors.quantite && (
                <p className="mt-1 text-sm text-red-600">{errors.quantite}</p>
              )}
            </div>

            <div>
              <Label htmlFor="prix_unitaire">Prix unitaire (DA) *</Label>
              <Input
                type="number"
                id="prix_unitaire"
                value={formData.prix_unitaire}
                onChange={(e) => setFormData(prev => ({ ...prev, prix_unitaire: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
                required
              />
              {errors.prix_unitaire && (
                <p className="mt-1 text-sm text-red-600">{errors.prix_unitaire}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="methode_paiement">Méthode de paiement</Label>
              <Select
                options={paymentMethodOptions}
                value={formData.methode_paiement}
                onChange={(value) => setFormData(prev => ({ ...prev, methode_paiement: value }))}
              />
            </div>

            <div>
              <Label htmlFor="statut_paiement">Statut du paiement</Label>
              <Select
                options={paymentStatusOptions}
                value={formData.statut_paiement}
                onChange={(value) => setFormData(prev => ({ ...prev, statut_paiement: value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Total */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-green-600 dark:text-green-400">
                {formatCurrency(formData.quantite * formData.prix_unitaire)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : vente ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

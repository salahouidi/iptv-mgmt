import { useState, useEffect } from 'react';
import { Produit, CreateProduitData, UpdateProduitData } from '../../types/database';
import { useProduitActions, usePlateformes } from '../../hooks/useApi';
import { PRODUCT_CATEGORIES, PRODUCT_DURATIONS, calculateSalePrice } from '../../utils/helpers';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/Select';

interface ProduitFormProps {
  produit?: Produit | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Mock platforms data
const mockPlateformes = [
  { id: 1, nom: 'DAR IPTV', devise: 'DZD' },
  { id: 2, nom: 'Netflix Premium', devise: 'DZD' },
  { id: 3, nom: 'IPTV Pro', devise: 'DZD' }
];

export default function ProduitForm({ produit, onSuccess, onCancel }: ProduitFormProps) {
  const { createProduit, updateProduit, loading, error } = useProduitActions();
  const { data: plateformesData } = usePlateformes();
  const plateformes = plateformesData?.items || [];

  const [formData, setFormData] = useState({
    nom: '',
    categorie: 'IPTV' as 'IPTV' | 'Netflix' | 'Autres',
    duree: '1m' as '1w' | '1m' | '3m' | '6m' | '12m',
    description: '',
    id_plateforme: 0,
    stock: '',
    seuil_alerte: '',
    prix_achat_moyen: '',
    marge: '25' // Default margin
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (produit) {
      setFormData({
        nom: produit.nom || '',
        categorie: produit.categorie || 'IPTV',
        duree: produit.duree || '1m',
        description: produit.description || '',
        id_plateforme: produit.id_plateforme || 0,
        stock: (produit.stock ?? 0).toString(),
        seuil_alerte: (produit.seuil_alerte ?? 0).toString(),
        prix_achat_moyen: (produit.prix_achat_moyen ?? 0).toString(),
        marge: (produit.marge ?? 25).toString()
      });
    }
  }, [produit]);

  // Calculate sale price when relevant fields change
  useEffect(() => {
    const prixAchat = parseFloat(formData.prix_achat_moyen);
    const marge = parseFloat(formData.marge);

    if (!isNaN(prixAchat) && !isNaN(marge) && prixAchat > 0 && marge >= 0) {
      // Calculate price directly in DZD (no exchange rate needed)
      const price = calculateSalePrice(prixAchat, marge);
      setCalculatedPrice(price);
    } else {
      setCalculatedPrice(0);
    }
  }, [formData.prix_achat_moyen, formData.marge]);

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

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.id_plateforme) {
      newErrors.id_plateforme = 'La plateforme est requise';
    }

    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Le stock doit être un nombre positif';
    }

    if (!formData.seuil_alerte || isNaN(Number(formData.seuil_alerte)) || Number(formData.seuil_alerte) < 0) {
      newErrors.seuil_alerte = 'Le seuil d\'alerte doit être un nombre positif';
    }

    if (!formData.prix_achat_moyen || isNaN(Number(formData.prix_achat_moyen)) || Number(formData.prix_achat_moyen) <= 0) {
      newErrors.prix_achat_moyen = 'Le prix d\'achat doit être un nombre positif';
    }

    if (!formData.marge || isNaN(Number(formData.marge)) || Number(formData.marge) < 0) {
      newErrors.marge = 'La marge doit être un nombre positif';
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
      const submitData = {
        nom: formData.nom,
        categorie: formData.categorie,
        duree_mois: formData.duree === '1w' ? 0.25 : parseInt(formData.duree.replace(/[^0-9]/g, '')),
        description: formData.description,
        id_plateforme: Number(formData.id_plateforme),
        stock_actuel: Number(formData.stock),
        seuil_alerte: Number(formData.seuil_alerte),
        prix_achat_moyen: Number(formData.prix_achat_moyen),
        marge: Number(formData.marge)
      };

      console.log('🔍 Submitting product data:', submitData);

      let result;
      if (produit) {
        console.log('🔄 Updating existing product:', produit.id_produit);
        result = await updateProduit(produit.id_produit, submitData as UpdateProduitData);
      } else {
        console.log('➕ Creating new product');
        result = await createProduit(submitData as CreateProduitData);
      }

      console.log('✅ Product operation result:', result);

      if (result) {
        console.log('🎉 Product operation successful, calling onSuccess');
        onSuccess();
      } else {
        console.error('❌ Product operation failed - no result returned');
      }
    } catch (err) {
      console.error('❌ Error submitting form:', err);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const plateformeOptions = plateformes.map(platform => ({
    value: platform.id_plateforme.toString(),
    label: `${platform.nom} (${platform.devise})`
  }));

  const categorieOptions = PRODUCT_CATEGORIES.map(category => ({
    value: category,
    label: category
  }));

  const dureeOptions = PRODUCT_DURATIONS.map(duration => ({
    value: duration,
    label: duration === '1w' ? '1 semaine' :
           duration === '1m' ? '1 mois' :
           duration === '3m' ? '3 mois' :
           duration === '6m' ? '6 mois' :
           '12 mois'
  }));

  return (
    <div
      className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {produit ? 'Modifier le produit' : 'Nouveau produit'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {produit ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit au catalogue'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
              <Label htmlFor="nom">Nom du produit *</Label>
              <Input
                type="text"
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Ex: IPTV Premium 12 mois"
                className={errors.nom ? 'border-red-500' : ''}
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>
              )}
            </div>

            <div>
              <Label htmlFor="categorie">Catégorie *</Label>
              <Select
                options={categorieOptions}
                value={formData.categorie}
                onChange={(value) => handleChange('categorie', value)}
                placeholder="Sélectionnez une catégorie"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="duree">Durée *</Label>
              <Select
                options={dureeOptions}
                value={formData.duree}
                onChange={(value) => handleChange('duree', value)}
                placeholder="Sélectionnez une durée"
              />
            </div>

            <div>
              <Label htmlFor="id_plateforme">Plateforme *</Label>
              <Select
                options={plateformeOptions}
                value={formData.id_plateforme.toString()}
                onChange={(value) => handleChange('id_plateforme', Number(value))}
                placeholder="Sélectionnez une plateforme"
                className={errors.id_plateforme ? 'border-red-500' : ''}
              />
              {errors.id_plateforme && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_plateforme}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description détaillée du produit"
              rows={3}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="stock">Stock initial *</Label>
              <Input
                type="number"
                id="stock"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                placeholder="Ex: 50"
                min="0"
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stock}</p>
              )}
            </div>

            <div>
              <Label htmlFor="seuil_alerte">Seuil d'alerte *</Label>
              <Input
                type="number"
                id="seuil_alerte"
                value={formData.seuil_alerte}
                onChange={(e) => handleChange('seuil_alerte', e.target.value)}
                placeholder="Ex: 10"
                min="0"
                className={errors.seuil_alerte ? 'border-red-500' : ''}
              />
              {errors.seuil_alerte && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seuil_alerte}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="prix_achat_moyen">Prix d'achat (DZD) *</Label>
              <Input
                type="number"
                id="prix_achat_moyen"
                value={formData.prix_achat_moyen}
                onChange={(e) => handleChange('prix_achat_moyen', e.target.value)}
                placeholder="Ex: 12000.00"
                min="0"
                step="0.01"
                className={errors.prix_achat_moyen ? 'border-red-500' : ''}
              />
              {errors.prix_achat_moyen && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.prix_achat_moyen}</p>
              )}
            </div>

            <div>
              <Label htmlFor="marge">Marge (%) *</Label>
              <Input
                type="number"
                id="marge"
                value={formData.marge}
                onChange={(e) => handleChange('marge', e.target.value)}
                placeholder="Ex: 25"
                min="0"
                step="0.1"
                className={errors.marge ? 'border-red-500' : ''}
              />
              {errors.marge && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.marge}</p>
              )}
            </div>
          </div>

          {/* Price Calculation Preview */}
          {calculatedPrice > 0 && (
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Calcul automatique du prix de vente
              </h4>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>Prix d'achat: {formData.prix_achat_moyen} DZD</p>
                <p>Marge: {formData.marge}%</p>
                <p className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                  Prix de vente: {calculatedPrice.toLocaleString()} DA
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? 'Enregistrement...' : produit ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

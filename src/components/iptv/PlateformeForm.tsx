import { useState, useEffect } from 'react';
import { Plateforme, CreatePlateformeData, UpdatePlateformeData } from '../../types/database';
import { usePlateformeActions } from '../../hooks/useApi';
import Label from '../form/Label';
import Input from '../form/input/InputField';

interface PlateformeFormProps {
  plateforme?: Plateforme | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PlateformeForm({ plateforme, onSuccess, onCancel }: PlateformeFormProps) {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    url: '',
    solde_initial: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createPlateforme, updatePlateforme, loading, error } = usePlateformeActions();

  useEffect(() => {
    if (plateforme) {
      setFormData({
        nom: plateforme.nom,
        description: plateforme.description || '',
        url: plateforme.url || '',
        solde_initial: plateforme.solde_initial?.toString() || ''
      });
    }
  }, [plateforme]);

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

    // Required: Platform Name
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    // Required: Initial Credit Balance
    if (!formData.solde_initial.trim()) {
      newErrors.solde_initial = 'Le solde initial est requis';
    } else {
      const solde = parseFloat(formData.solde_initial);
      if (isNaN(solde) || solde < 0) {
        newErrors.solde_initial = 'Le solde initial doit être un nombre positif';
      }
    }

    // Optional: URL validation (only if provided)
    if (formData.url.trim()) {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'L\'URL n\'est pas valide';
      }
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
      // Prepare data for submission
      const submitData = {
        nom: formData.nom,
        description: formData.description || null,
        url: formData.url || null,
        solde_initial: parseFloat(formData.solde_initial)
      };

      console.log('🚀 Submitting form data:', submitData);
      let result;
      if (plateforme) {
        console.log('📝 Updating plateforme...');
        result = await updatePlateforme(plateforme.id_plateforme, submitData as UpdatePlateformeData);
      } else {
        console.log('➕ Creating new plateforme...');
        result = await createPlateforme(submitData as CreatePlateformeData);
      }

      console.log('📊 Form submission result:', result);
      if (result) {
        console.log('✅ Success! Calling onSuccess...');
        onSuccess();
      } else {
        console.log('❌ No result returned');
      }
    } catch (err) {
      console.error('💥 Error submitting form:', err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {plateforme ? 'Modifier la plateforme' : 'Nouvelle plateforme'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {plateforme ? 'Modifiez les informations de la plateforme' : 'Ajoutez une nouvelle plateforme fournisseur'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom de la plateforme *</Label>
            <Input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              placeholder="Ex: DAR IPTV"
              className={errors.nom ? 'border-red-500' : ''}
            />
            {errors.nom && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nom}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Description courte de la plateforme (optionnel)"
              rows={3}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="url">URL du site</Label>
            <Input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com (optionnel)"
              className={errors.url ? 'border-red-500' : ''}
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.url}</p>
            )}
          </div>

          <div>
            <Label htmlFor="solde_initial">Solde initial (DZD) *</Label>
            <Input
              type="number"
              id="solde_initial"
              value={formData.solde_initial}
              onChange={(e) => handleChange('solde_initial', e.target.value)}
              placeholder="Ex: 5000"
              min="0"
              step="0.01"
              className={errors.solde_initial ? 'border-red-500' : ''}
            />
            {errors.solde_initial && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.solde_initial}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Montant de crédit initial pour cette plateforme en dinars algériens
            </p>
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

          {error && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
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
              {loading ? 'Enregistrement...' : plateforme ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

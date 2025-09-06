import { useState, useEffect } from 'react';
import { Recharge, CreateRechargeData, UpdateRechargeData } from '../../types/database';
import { useRechargeActions, usePlateformes } from '../../hooks/useApi';
import { RECHARGE_STATUSES } from '../../utils/helpers';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/Select';

interface RechargeFormProps {
  recharge?: Recharge | null;
  plateformeId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}



export default function RechargeForm({ recharge, plateformeId, onSuccess, onCancel }: RechargeFormProps) {
  const [formData, setFormData] = useState({
    id_plateforme: plateformeId || 0,
    montant: '',
    statut: 'En attente' as 'Payé' | 'En attente',
    date_recharge: new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm format
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createRecharge, updateRecharge, loading, error } = useRechargeActions();

  // Fetch real platforms from API
  const { data: plateformesData, loading: plateformesLoading, error: plateformesError } = usePlateformes();
  const plateformes = plateformesData?.items || [];

  console.log('🏢 RechargeForm platforms data:', { plateformesData, plateformes, plateformesLoading, plateformesError });

  useEffect(() => {
    if (recharge) {
      setFormData({
        id_plateforme: recharge.id_plateforme,
        montant: recharge.montant.toString(),
        statut: recharge.statut,
        date_recharge: new Date(recharge.date_recharge).toISOString().slice(0, 16)
      });
    }
  }, [recharge]);

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

    if (!formData.id_plateforme) {
      newErrors.id_plateforme = 'La plateforme est requise';
    }

    if (!formData.montant || isNaN(Number(formData.montant)) || Number(formData.montant) <= 0) {
      newErrors.montant = 'Le montant doit être un nombre positif';
    }

    if (!formData.date_recharge) {
      newErrors.date_recharge = 'La date est requise';
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
      console.log('🚀 Submitting recharge data:', formData);

      const submitData = {
        id_plateforme: formData.id_plateforme,
        montant: Number(formData.montant),
        statut: formData.statut,
        date_recharge: formData.date_recharge,
        preuve_paiement: '' // Default empty string since field is removed
      };

      let result;
      if (recharge) {
        result = await updateRecharge(recharge.id_recharge, submitData as UpdateRechargeData);
      } else {
        result = await createRecharge(submitData as CreateRechargeData);
      }

      if (result) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Create platform options from real API data
  const plateformeOptions = plateformes.map(platform => ({
    value: platform.id_plateforme.toString(),
    label: platform.nom
  }));

  const statutOptions = RECHARGE_STATUSES.map(status => ({
    value: status,
    label: status
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
      <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {recharge ? 'Modifier la recharge' : 'Nouvelle recharge'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {recharge ? 'Modifiez les informations de la recharge' : 'Enregistrez une nouvelle recharge'}
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
          <div>
            <Label htmlFor="id_plateforme">Plateforme *</Label>
            {plateformesLoading ? (
              <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Chargement des plateformes...
              </div>
            ) : plateformes.length === 0 ? (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
                Aucune plateforme disponible. Veuillez d'abord créer une plateforme.
              </div>
            ) : (
              <Select
                options={plateformeOptions}
                value={formData.id_plateforme.toString()}
                onChange={(value) => handleChange('id_plateforme', Number(value))}
                placeholder="Sélectionnez une plateforme"
                className={errors.id_plateforme ? 'border-red-500' : ''}
              />
            )}
            {errors.id_plateforme && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.id_plateforme}</p>
            )}
            {plateformesError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Erreur lors du chargement des plateformes: {plateformesError}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="montant">Montant (DZD) *</Label>
            <Input
              type="number"
              id="montant"
              value={formData.montant}
              onChange={(e) => handleChange('montant', e.target.value)}
              placeholder="Ex: 50000"
              min="0"
              step="0.01"
              className={errors.montant ? 'border-red-500' : ''}
            />
            {errors.montant && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.montant}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date_recharge">Date de recharge *</Label>
            <Input
              type="datetime-local"
              id="date_recharge"
              value={formData.date_recharge}
              onChange={(e) => handleChange('date_recharge', e.target.value)}
              className={errors.date_recharge ? 'border-red-500' : ''}
            />
            {errors.date_recharge && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date_recharge}</p>
            )}
          </div>

          <div>
            <Label htmlFor="statut">Statut *</Label>
            <Select
              options={statutOptions}
              value={formData.statut}
              onChange={(value) => handleChange('statut', value)}
              placeholder="Sélectionnez un statut"
            />
          </div>



          {error && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
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
              disabled={loading || plateformesLoading || plateformes.length === 0}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? 'Enregistrement...' :
               plateformesLoading ? 'Chargement...' :
               plateformes.length === 0 ? 'Aucune plateforme' :
               recharge ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

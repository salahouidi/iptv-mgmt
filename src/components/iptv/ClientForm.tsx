import { useState, useEffect } from 'react';
import { Client, CreateClientData, UpdateClientData } from '../../types/database';
import { useClientActions } from '../../hooks/useApi';
import { WILAYAS, validateEmail, validatePhone } from '../../utils/helpers';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/Select';

interface ClientFormProps {
  client?: Client | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    nom_complet: '',
    telephone: '',
    wilaya: '',
    email: '',
    adresse: '',
    facebook: '',
    instagram: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createClient, updateClient, loading, error } = useClientActions();

  useEffect(() => {
    if (client) {
      setFormData({
        nom_complet: client.nom_complet,
        telephone: client.telephone,
        wilaya: client.wilaya,
        email: client.email,
        adresse: client.adresse,
        facebook: client.facebook || '',
        instagram: client.instagram || '',
        notes: client.notes || ''
      });
    }
  }, [client]);

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

    if (!formData.nom_complet.trim()) {
      newErrors.nom_complet = 'Le nom complet est requis';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le numéro de téléphone est requis';
    } else if (!validatePhone(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide (ex: +213 555 123 456)';
    }

    if (!formData.wilaya) {
      newErrors.wilaya = 'La wilaya est requise';
    }

    // Email is optional - only validate format if provided
    if (formData.email.trim() && !validateEmail(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Address is optional - no validation required

    // Validate social media URLs if provided
    if (formData.facebook && !formData.facebook.startsWith('https://')) {
      newErrors.facebook = 'L\'URL Facebook doit commencer par https://';
    }

    if (formData.instagram && !formData.instagram.startsWith('@') && !formData.instagram.startsWith('https://')) {
      newErrors.instagram = 'Instagram doit être un nom d\'utilisateur (@username) ou une URL';
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
        ...formData,
        facebook: formData.facebook || undefined,
        instagram: formData.instagram || undefined,
        notes: formData.notes || undefined
      };

      let result;
      if (client) {
        result = await updateClient(client.id_client, submitData as UpdateClientData);
      } else {
        result = await createClient(submitData as CreateClientData);
      }

      if (result) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const wilayaOptions = WILAYAS.map(wilaya => ({
    value: wilaya,
    label: wilaya
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
              {client ? 'Modifier le client' : 'Nouveau client'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {client ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client à votre base'}
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
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 pb-2 dark:border-gray-700">
              Informations personnelles
            </h3>
            
            <div>
              <Label htmlFor="nom_complet">Nom complet *</Label>
              <Input
                type="text"
                id="nom_complet"
                value={formData.nom_complet}
                onChange={(e) => handleChange('nom_complet', e.target.value)}
                placeholder="Ex: Ahmed Benali"
                className={errors.nom_complet ? 'border-red-500' : ''}
              />
              {errors.nom_complet && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nom_complet}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  type="tel"
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  placeholder="+213 555 123 456"
                  className={errors.telephone ? 'border-red-500' : ''}
                />
                {errors.telephone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telephone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="ahmed.benali@email.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 pb-2 dark:border-gray-700">
              Adresse
            </h3>
            
            <div>
              <Label htmlFor="wilaya">Wilaya *</Label>
              <Select
                options={wilayaOptions}
                value={formData.wilaya}
                onChange={(value) => handleChange('wilaya', value)}
                placeholder="Sélectionnez une wilaya"
                className={errors.wilaya ? 'border-red-500' : ''}
              />
              {errors.wilaya && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.wilaya}</p>
              )}
            </div>

            <div>
              <Label htmlFor="adresse">Adresse complète</Label>
              <textarea
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                placeholder="123 Rue Didouche Mourad, Alger Centre"
                rows={3}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                  errors.adresse ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.adresse && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.adresse}</p>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 pb-2 dark:border-gray-700">
              Réseaux sociaux (optionnel)
            </h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  type="url"
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/username"
                  className={errors.facebook ? 'border-red-500' : ''}
                />
                {errors.facebook && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.facebook}</p>
                )}
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  type="text"
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="@username ou URL complète"
                  className={errors.instagram ? 'border-red-500' : ''}
                />
                {errors.instagram && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.instagram}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Remarques, préférences, informations importantes..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

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
              {loading ? 'Enregistrement...' : client ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

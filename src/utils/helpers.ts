// Utility helper functions for IPTV management platform

import { Produit, Vente, Parametre } from '../types/database';

// Currency formatting
export const formatCurrency = (amount: number | null | undefined, currency: string = 'DZD'): string => {
  // Handle null, undefined, or invalid amount values
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0,00 DA';
  }

  // Ensure amount is a valid number
  const safeAmount = Number(amount);
  if (!isFinite(safeAmount)) {
    return '0,00 DA';
  }

  try {
    const formatter = new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: currency === 'DZD' ? 'DZD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (currency === 'DZD') {
      // Custom formatting for DZD since it might not be supported
      return `${safeAmount.toLocaleString('fr-DZ', { minimumFractionDigits: 2 })} DA`;
    }

    return formatter.format(safeAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${safeAmount.toFixed(2)} ${currency}`;
  }
};

// Date formatting
export const formatDate = (dateString: string, format: 'short' | 'long' | 'datetime' = 'short'): string => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('fr-FR');
    case 'long':
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'datetime':
      return date.toLocaleString('fr-FR');
    default:
      return date.toLocaleDateString('fr-FR');
  }
};

// Time ago formatting
export const timeAgo = (dateString: string | null | undefined): string => {
  // Handle null, undefined, or empty values
  if (!dateString || typeof dateString !== 'string') {
    return 'Date inconnue';
  }

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
    if (diffInSeconds < 31536000) return `Il y a ${Math.floor(diffInSeconds / 2592000)} mois`;
    return `Il y a ${Math.floor(diffInSeconds / 31536000)} ans`;
  } catch (error) {
    console.error('Error in timeAgo function:', error);
    return 'Date invalide';
  }
};

// Product pricing calculations
export const calculateSalePrice = (
  prixAchatMoyen: number,
  marge: number,
  tauxChange?: number
): number => {
  const margeAmount = (prixAchatMoyen * marge) / 100;
  const prixBase = prixAchatMoyen + margeAmount;
  
  // Apply exchange rate if provided (for foreign currency products)
  if (tauxChange && tauxChange > 0) {
    return Math.round(prixBase * tauxChange);
  }
  
  return Math.round(prixBase);
};

// Stock status helpers
export const getStockStatus = (stock: number, seuilAlerte: number): 'high' | 'medium' | 'low' | 'out' => {
  if (stock === 0) return 'out';
  if (stock <= seuilAlerte) return 'low';
  if (stock <= seuilAlerte * 2) return 'medium';
  return 'high';
};

export const getStockStatusColor = (status: 'high' | 'medium' | 'low' | 'out'): string => {
  switch (status) {
    case 'high': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-orange-600 bg-orange-100';
    case 'out': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Badge variant helpers for the Badge component
export const getStockStatusBadgeVariant = (status: 'high' | 'medium' | 'low' | 'out'): 'success' | 'warning' | 'error' | 'light' => {
  switch (status) {
    case 'high': return 'success';
    case 'medium': return 'warning';
    case 'low': return 'warning';
    case 'out': return 'error';
    default: return 'light';
  }
};

export const getCategoryBadgeVariant = (category: 'IPTV' | 'Netflix' | 'Autres' | string | null | undefined): 'primary' | 'error' | 'info' | 'light' => {
  if (!category || typeof category !== 'string') {
    return 'light';
  }

  const cleanCategory = category.toString().trim();

  switch (cleanCategory) {
    case 'IPTV': return 'primary';
    case 'Netflix': return 'error';
    case 'Autres': return 'info';
    default: return 'light';
  }
};

export const getStockStatusText = (status: 'high' | 'medium' | 'low' | 'out'): string => {
  switch (status) {
    case 'high': return 'Stock suffisant';
    case 'medium': return 'Stock moyen';
    case 'low': return 'Stock faible';
    case 'out': return 'Rupture de stock';
    default: return 'Inconnu';
  }
};

// Payment status helpers
export const getPaymentStatusColor = (status: 'Payé' | 'En attente'): string => {
  return status === 'Payé' 
    ? 'text-green-600 bg-green-100' 
    : 'text-orange-600 bg-orange-100';
};

// Category helpers
export const getCategoryColor = (category: 'IPTV' | 'Netflix' | 'Autres' | string | null | undefined): string => {
  // Handle null, undefined, or empty values
  if (!category || typeof category !== 'string') {
    return 'text-gray-600 bg-gray-100';
  }

  // Ensure category is a string and normalize case
  const cleanCategory = category.toString().trim();

  switch (cleanCategory) {
    case 'IPTV': return 'text-blue-600 bg-blue-100';
    case 'Netflix': return 'text-red-600 bg-red-100';
    case 'Autres': return 'text-purple-600 bg-purple-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Duration formatting
export const formatDuration = (duration: '1w' | '1m' | '3m' | '6m' | '12m' | string | number | null | undefined): string => {
  // Handle null, undefined, or empty values
  if (duration === null || duration === undefined) {
    return 'Non spécifié';
  }

  // Convert to string and trim whitespace
  const cleanDuration = duration.toString().trim();

  // Handle numeric values (months)
  if (!isNaN(Number(cleanDuration))) {
    const months = Number(cleanDuration);
    if (months === 1) return '1 mois';
    if (months === 3) return '3 mois';
    if (months === 6) return '6 mois';
    if (months === 12) return '12 mois';
    return `${months} mois`;
  }

  // Handle string formats
  switch (cleanDuration) {
    case '1w': return '1 semaine';
    case '1m': return '1 mois';
    case '3m': return '3 mois';
    case '6m': return '6 mois';
    case '12m': return '12 mois';
    default:
      // If it's a valid string but not a recognized format, return it safely
      return cleanDuration || 'Non spécifié';
  }
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Algerian phone number validation (basic)
  const phoneRegex = /^(\+213|0)(5|6|7)[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Search helpers
export const searchInText = (text: string, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

// Financial calculations
export const calculateProfit = (ventes: Vente[], produits: Produit[]): number => {
  return ventes.reduce((total, vente) => {
    const produit = produits.find(p => p.id_produit === vente.id_produit);
    if (!produit) return total;
    
    const coutAchat = produit.prix_achat_moyen * vente.quantite;
    const profit = vente.total - coutAchat;
    return total + profit;
  }, 0);
};

export const calculateMarginPercentage = (prixVente: number, prixAchat: number): number => {
  if (prixAchat === 0) return 0;
  return ((prixVente - prixAchat) / prixAchat) * 100;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// URL helpers
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Array helpers
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  if (!Array.isArray(array) || array.length === 0) {
    return {};
  }

  return array.reduce((groups, item) => {
    if (!item || typeof item !== 'object') {
      return groups;
    }

    const group = String(item[key] || 'undefined');
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Sorting helpers
export const sortByDate = <T extends { created_at?: string; date_vente?: string }>(
  array: T[],
  direction: 'asc' | 'desc' = 'desc'
): T[] => {
  if (!Array.isArray(array) || array.length === 0) {
    return [];
  }

  return [...array].sort((a, b) => {
    if (!a || !b) return 0;

    const dateA = new Date(a.created_at || a.date_vente || '').getTime();
    const dateB = new Date(b.created_at || b.date_vente || '').getTime();

    // Handle invalid dates
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;

    return direction === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

// Local storage helpers
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Debounce helper
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generate unique ID (for temporary use before backend integration)
export const generateTempId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Export all constants
export const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
  'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
  'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
  'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
  'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
  'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane'
];

export const PAYMENT_METHODS = [
  'Espèce',
  'CCP',
  'BaridiMob',
  'Virement bancaire',
  'Carte bancaire',
  'Autre'
];

export const PRODUCT_CATEGORIES = ['IPTV', 'Netflix', 'Autres'];
export const PRODUCT_DURATIONS = ['1w', '1m', '3m', '6m', '12m'];
export const CURRENCIES = ['DZD'];
export const PAYMENT_STATUSES = ['Payé', 'En attente'];
export const RECHARGE_STATUSES = ['Payé', 'En attente'];

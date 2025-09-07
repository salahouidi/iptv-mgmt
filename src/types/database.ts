// Database schema types based on PRD requirements

export interface Plateforme {
  id_plateforme: number;
  nom: string;
  description?: string;
  url?: string;
  solde_initial: number;
  balance_type: 'currency' | 'points';
  balance_unit: string;
  point_conversion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface Recharge {
  id_recharge: number;
  id_plateforme: number;
  montant: number;
  preuve_paiement: string; // URL to uploaded image
  statut: 'Payé' | 'En attente';
  date_recharge: string;
}

export interface Produit {
  id_produit: number;
  nom: string;
  categorie: 'IPTV' | 'Netflix' | 'Autres';
  duree: '1w' | '1m' | '3m' | '6m' | '12m';
  description: string;
  id_plateforme: number;
  stock: number;
  seuil_alerte: number;
  prix_achat_moyen: number;
  marge: number; // Percentage
  prix_vente_calcule: number;
  cost_type: 'currency' | 'points';
  default_cost: number;
  duration_weeks?: number;
  is_multi_panel: boolean;
  created_at: string;
}

export interface Client {
  id_client: number;
  nom_complet: string;
  telephone: string;
  wilaya: string;
  email: string;
  adresse: string;
  facebook?: string;
  instagram?: string;
  notes?: string;
  created_at: string;
}

export interface Vente {
  id_vente: number;
  id_plateforme: number;
  id_produit: number;
  id_client: number;
  quantite: number;
  prix_unitaire: number;
  total: number;
  date_vente: string;
  methode_paiement: 'Espèce' | 'CCP' | 'BaridiMob' | 'Autre';
  statut_paiement: 'Payé' | 'En attente';
  notes?: string;
  purchase_cost: number;
  cost_type_vente: 'currency' | 'points';
  panel_balance_before?: number;
  panel_balance_after?: number;
}

export interface Parametre {
  id_parametre: number;
  marge_defaut: number;
  taux_change: number;
  devise_principale: string;
  theme: 'light' | 'dark';
  langue: 'fr' | 'ar' | 'en';
  notifications: string; // JSON string for notification settings
}

// Extended types with relations for UI components
export interface PlateformeWithStats extends Plateforme {
  total_recharge: number;
  total_paye: number;
  total_en_attente: number;
  nb_produits: number;
}

export interface ProduitWithPlateforme extends Produit {
  plateforme_nom: string;
  plateforme_devise: string;
  is_low_stock: boolean;
}

export interface ClientWithStats extends Client {
  total_achats: number;
  nb_commandes: number;
  derniere_commande: string;
  solde_du?: number;
}

export interface VenteWithDetails extends Vente {
  client_nom: string;
  client_telephone: string;
  produit_nom: string;
  produit_categorie: string;
  plateforme_nom: string;
}

// Form types for creating/updating records
export type CreatePlateformeData = Omit<Plateforme, 'id_plateforme' | 'created_at' | 'updated_at'>;
export type UpdatePlateformeData = Partial<CreatePlateformeData>;

export type CreateRechargeData = Omit<Recharge, 'id_recharge'>;
export type UpdateRechargeData = Partial<CreateRechargeData>;

export type CreateProduitData = Omit<Produit, 'id_produit' | 'created_at' | 'prix_vente_calcule'>;
export type UpdateProduitData = Partial<CreateProduitData>;

export type CreateClientData = Omit<Client, 'id_client' | 'created_at'>;
export type UpdateClientData = Partial<CreateClientData>;

export type CreateVenteData = Omit<Vente, 'id_vente' | 'total'>;
export type UpdateVenteData = Partial<CreateVenteData>;

export type UpdateParametreData = Partial<Omit<Parametre, 'id_parametre'>>;

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard statistics types
export interface DashboardStats {
  totals: {
    total_clients: number;
    total_produits: number;
    total_plateformes: number;
    total_ventes: number;
    total_revenue: number;
    total_pending: number;
  };
  monthly: {
    ventes_count: number;
    revenue: number;
    new_clients: number;
    recharges: number;
  };
  weekly: {
    ventes_count: number;
    revenue: number;
  };
  daily: {
    ventes_count: number;
    revenue: number;
  };
  recent_activities: Array<{
    type: string;
    id: number;
    description: string;
    montant: number;
    date_activite: string;
  }>;
  low_stock_alerts: Array<any>;
  sales_by_category: Array<any>;
  top_clients: Array<any>;
}

// Filter and search types
export interface PlateformeFilters {
  search?: string;
}

export interface ProduitFilters {
  categorie?: string;
  id_plateforme?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  search?: string;
}

export interface ClientFilters {
  wilaya?: string;
  search?: string;
}

export interface VenteFilters {
  date_debut?: string;
  date_fin?: string;
  plateforme?: number;
  client?: number;
  statut_paiement?: string;
  methode_paiement?: string;
}

// Notification types
export interface NotificationSettings {
  stock_bas: boolean;
  factures_impayees: boolean;
  nouvelles_commandes: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

// New interfaces for flexible product system
export interface ProductPanel {
  id_association: number;
  id_produit: number;
  id_plateforme: number;
  cost_override?: number;
  is_active: boolean;
  date_creation: string;
}

export interface PointPricingRule {
  id_rule: number;
  id_plateforme: number;
  duration_weeks: number;
  points_cost: number;
  is_active: boolean;
  date_creation: string;
}

// Enhanced create/update types for new system
export type CreateProductPanelData = Omit<ProductPanel, 'id_association' | 'date_creation'>;
export type CreatePointPricingRuleData = Omit<PointPricingRule, 'id_rule' | 'date_creation'>;

// Administrator Management Types
export interface Administrator {
  id_admin: number;
  username: string;
  email?: string;
  role: 'Super Admin' | 'Admin' | 'Operator' | 'Custom';
  status: 'Actif' | 'Inactif' | 'Suspendu';
  permissions?: string; // JSON string for custom permissions
  created_at: string;
  updated_at: string;
  last_login?: string;
  created_by?: number;
  notes?: string;
}

export interface AdminActivity {
  id_activity: number;
  id_admin: number;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: number;
  old_values?: string; // JSON string
  new_values?: string; // JSON string
  created_at: string;
  username?: string; // From JOIN with administrators table
}

export interface AdministratorWithStats extends Administrator {
  total_activities: number;
  last_activity?: string;
  activities_last_7_days: number;
  activities_last_30_days: number;
}

// Filter types
export interface AdministratorFilters {
  role?: string;
  status?: string;
  search?: string;
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  last_login_before?: string;
}

export interface AdminActivityFilters {
  id_admin?: number;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Create/Update types
export interface CreateAdministratorData {
  username: string;
  email?: string;
  password: string;
  role: 'Super Admin' | 'Admin' | 'Operator' | 'Custom';
  status?: 'Actif' | 'Inactif' | 'Suspendu';
  permissions?: string;
  notes?: string;
}

export interface UpdateAdministratorData {
  username?: string;
  email?: string;
  role?: 'Super Admin' | 'Admin' | 'Operator' | 'Custom';
  status?: 'Actif' | 'Inactif' | 'Suspendu';
  permissions?: string;
  notes?: string;
}

export interface UpdateCredentialsData {
  username?: string;
  new_password: string;
  confirm_password: string;
  current_password: string;
}

export interface LogActivityData {
  id_admin: number;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: number;
  old_values?: any;
  new_values?: any;
}

// Permission system types
export interface Permission {
  module: string;
  actions: string[]; // ['read', 'create', 'update', 'delete']
}

export interface RolePermissions {
  role: string;
  permissions: Permission[];
}

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'Super Admin',
    permissions: [
      { module: 'administrators', actions: ['read', 'create', 'update', 'delete'] },
      { module: 'plateformes', actions: ['read', 'create', 'update', 'delete'] },
      { module: 'produits', actions: ['read', 'create', 'update', 'delete'] },
      { module: 'clients', actions: ['read', 'create', 'update', 'delete'] },
      { module: 'ventes', actions: ['read', 'create', 'update', 'delete'] },
      { module: 'recharges', actions: ['read', 'create', 'update', 'delete'] },
      { module: 'dashboard', actions: ['read'] },
      { module: 'parametres', actions: ['read', 'update'] }
    ]
  },
  {
    role: 'Admin',
    permissions: [
      { module: 'plateformes', actions: ['read', 'create', 'update'] },
      { module: 'produits', actions: ['read', 'create', 'update', 'delete'] },
      { module: 'clients', actions: ['read', 'create', 'update', 'delete'] },
      { module: 'ventes', actions: ['read', 'create', 'update'] },
      { module: 'recharges', actions: ['read', 'create'] },
      { module: 'dashboard', actions: ['read'] }
    ]
  },
  {
    role: 'Operator',
    permissions: [
      { module: 'clients', actions: ['read', 'create', 'update'] },
      { module: 'ventes', actions: ['read', 'create'] },
      { module: 'produits', actions: ['read'] },
      { module: 'dashboard', actions: ['read'] }
    ]
  }
];

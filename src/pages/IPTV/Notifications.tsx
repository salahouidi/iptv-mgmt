import { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { formatDate, timeAgo } from '../../utils/helpers';
import Badge from '../../components/ui/badge/Badge';

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'stock_alert',
    title: 'Stock faible - Netflix Premium 1 mois',
    message: 'Le stock est descendu à 5 unités (seuil: 8)',
    priority: 'high',
    read: false,
    created_at: '2024-02-12T10:30:00Z',
    action_url: '/stock'
  },
  {
    id: 2,
    type: 'payment_reminder',
    title: 'Paiement en attente - Fatima Zohra Mansouri',
    message: 'Paiement de 2500 DA en attente depuis 3 jours',
    priority: 'medium',
    read: false,
    created_at: '2024-02-11T15:45:00Z',
    action_url: '/ventes'
  },
  {
    id: 3,
    type: 'new_sale',
    title: 'Nouvelle vente enregistrée',
    message: 'Vente de IPTV Premium 12 mois à Ahmed Benali (15000 DA)',
    priority: 'low',
    read: true,
    created_at: '2024-02-10T14:20:00Z',
    action_url: '/ventes/1'
  },
  {
    id: 4,
    type: 'system',
    title: 'Sauvegarde automatique effectuée',
    message: 'Sauvegarde quotidienne terminée avec succès',
    priority: 'low',
    read: true,
    created_at: '2024-02-10T02:00:00Z',
    action_url: '/sauvegarde'
  },
  {
    id: 5,
    type: 'stock_alert',
    title: 'Rupture de stock - IPTV Standard 6 mois',
    message: 'Produit en rupture de stock, réapprovisionnement nécessaire',
    priority: 'critical',
    read: false,
    created_at: '2024-02-09T16:10:00Z',
    action_url: '/stock'
  }
];

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'stock_alert':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'payment_reminder':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'new_sale':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Critique';
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Normal';
    }
  };

  return (
    <div className={`rounded-lg border p-4 transition-all ${
      notification.read 
        ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]'
        : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`rounded-full p-2 ${getPriorityColor(notification.priority)}`}>
          {getIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${
                notification.read ? 'text-gray-900 dark:text-white' : 'text-blue-900 dark:text-blue-100'
              }`}>
                {notification.title}
              </h3>
              <p className={`mt-1 text-sm ${
                notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-blue-700 dark:text-blue-300'
              }`}>
                {notification.message}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Badge
                  size="sm"
                  className={getPriorityColor(notification.priority)}
                >
                  {getPriorityLabel(notification.priority)}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(notification.created_at)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="rounded-lg p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                  title="Marquer comme lu"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="rounded-lg p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                title="Supprimer"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {notification.action_url && (
            <div className="mt-3">
              <a
                href={notification.action_url}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Voir les détails →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleClearAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      setNotifications([]);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'critical':
        return notif.priority === 'critical';
      case 'stock':
        return notif.type === 'stock_alert';
      case 'payment':
        return notif.type === 'payment_reminder';
      default:
        return true;
    }
  });

  // Calculate statistics
  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical').length;
  const stockAlertsCount = notifications.filter(n => n.type === 'stock_alert').length;

  return (
    <>
      <PageMeta
        title="Notifications | IPTV Management"
        description="Consultez et gérez vos notifications système"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Notifications" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Restez informé des événements importants de votre activité
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleMarkAllAsRead}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Tout marquer comme lu
            </button>
            <button
              onClick={handleClearAll}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Tout supprimer
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Non lues
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {unreadCount}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Critiques
                </p>
                <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                  {criticalCount}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Alertes stock
                </p>
                <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stockAlertsCount}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ComponentCard title="Filtres">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'unread', label: 'Non lues' },
              { value: 'critical', label: 'Critiques' },
              { value: 'stock', label: 'Alertes stock' },
              { value: 'payment', label: 'Paiements' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  filter === filterOption.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </ComponentCard>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h8V9H4v2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                Aucune notification
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {filter === 'all' 
                  ? 'Vous n\'avez aucune notification pour le moment.'
                  : 'Aucune notification ne correspond aux filtres sélectionnés.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from 'react';
import { formatDate, formatCurrency, timeAgo } from '../../utils/helpers';

interface ActivityItem {
  id: number;
  type: 'vente' | 'recharge' | 'client' | 'produit';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status?: 'success' | 'warning' | 'info';
}

// Mock data - will be replaced with real API calls
const mockActivities: ActivityItem[] = [
  {
    id: 1,
    type: 'vente',
    title: 'Nouvelle vente',
    description: 'IPTV 12 mois vendu à Ahmed Benali',
    amount: 15000,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    status: 'success'
  },
  {
    id: 2,
    type: 'recharge',
    title: 'Recharge effectuée',
    description: 'Recharge de 50000 DA sur DAR IPTV',
    amount: 50000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'info'
  },
  {
    id: 3,
    type: 'client',
    title: 'Nouveau client',
    description: 'Fatima Zohra inscrite depuis Alger',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    status: 'info'
  },
  {
    id: 4,
    type: 'produit',
    title: 'Stock faible',
    description: 'Netflix 1 mois - Stock: 3 unités',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    status: 'warning'
  },
  {
    id: 5,
    type: 'vente',
    title: 'Vente annulée',
    description: 'Remboursement IPTV 6 mois - Karim Mansouri',
    amount: -8000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    status: 'warning'
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'vente':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'recharge':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case 'client':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'produit':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
    case 'warning':
      return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
    case 'info':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-6 py-5">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Activité récente
          </h3>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-1 h-3 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Activité récente
        </h3>
      </div>
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex items-center gap-4 p-4 ${
                index !== activities.length - 1
                  ? 'border-b border-gray-100 dark:border-gray-800'
                  : ''
              }`}
            >
              <div className={`rounded-full p-2 ${getStatusColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                  </p>
                  {activity.amount && (
                    <span
                      className={`text-sm font-medium ${
                        activity.amount > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {timeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            Voir toute l'activité
          </button>
        </div>
      </div>
    </div>
  );
}

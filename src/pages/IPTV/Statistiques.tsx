import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { formatCurrency, formatDate } from '../../utils/helpers';

// Mock data for detailed statistics
const mockStatistics = {
  salesByCategory: [
    { category: 'IPTV', sales: 88, percentage: 73, revenue: 1250000 },
    { category: 'Netflix', sales: 25, percentage: 21, revenue: 320000 },
    { category: 'Autres', sales: 7, percentage: 6, revenue: 85000 }
  ],
  salesByPlatform: [
    { platform: 'DAR IPTV', sales: 65, revenue: 980000 },
    { platform: 'Netflix Premium', sales: 25, revenue: 320000 },
    { platform: 'IPTV Pro', sales: 30, revenue: 355000 }
  ],
  salesByWilaya: [
    { wilaya: 'Alger', sales: 45, revenue: 675000 },
    { wilaya: 'Oran', sales: 28, revenue: 420000 },
    { wilaya: 'Constantine', sales: 22, revenue: 330000 },
    { wilaya: 'Sétif', sales: 15, revenue: 225000 },
    { wilaya: 'Autres', sales: 10, revenue: 150000 }
  ],
  paymentMethods: [
    { method: 'Espèce', count: 68, percentage: 57 },
    { method: 'CCP', count: 32, percentage: 27 },
    { method: 'BaridiMob', count: 15, percentage: 12 },
    { method: 'Autre', count: 5, percentage: 4 }
  ],
  weeklyTrend: [
    { day: 'Lun', sales: 12, revenue: 180000 },
    { day: 'Mar', sales: 18, revenue: 270000 },
    { day: 'Mer', sales: 15, revenue: 225000 },
    { day: 'Jeu', sales: 22, revenue: 330000 },
    { day: 'Ven', sales: 25, revenue: 375000 },
    { day: 'Sam', sales: 8, revenue: 120000 },
    { day: 'Dim', sales: 5, revenue: 75000 }
  ],
  hourlyDistribution: [
    { hour: '9h', sales: 8 },
    { hour: '10h', sales: 12 },
    { hour: '11h', sales: 15 },
    { hour: '12h', sales: 10 },
    { hour: '14h', sales: 18 },
    { hour: '15h', sales: 22 },
    { hour: '16h', sales: 20 },
    { hour: '17h', sales: 15 }
  ]
};

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  label, 
  value, 
  maxValue, 
  color, 
  showPercentage = false 
}) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-medium text-gray-900 dark:text-white w-20">
          {label}
        </span>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700">
            <div 
              className={`h-3 rounded-full ${color}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="text-right ml-4">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {value}
        </span>
        {showPercentage && (
          <span className="text-xs text-gray-500 ml-1">
            ({Math.round(percentage)}%)
          </span>
        )}
      </div>
    </div>
  );
};

interface ChartBarProps {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue: number;
}

const ChartBar: React.FC<ChartBarProps> = ({ data, maxValue }) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
            {item.label}
          </span>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded dark:bg-gray-700">
              <div 
                className={`h-8 rounded flex items-center justify-end pr-2 ${
                  item.color || 'bg-blue-500'
                }`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                <span className="text-xs font-medium text-white">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Statistiques() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [chartType, setChartType] = useState('category');

  const handleExportChart = () => {
    alert('Export du graphique en cours...');
  };

  const maxSales = Math.max(...mockStatistics.salesByCategory.map(s => s.sales));
  const maxRevenue = Math.max(...mockStatistics.salesByWilaya.map(s => s.revenue));
  const maxWeeklySales = Math.max(...mockStatistics.weeklyTrend.map(s => s.sales));
  const maxHourlySales = Math.max(...mockStatistics.hourlyDistribution.map(s => s.sales));

  return (
    <>
      <PageMeta
        title="Statistiques Avancées | IPTV Management"
        description="Analysez vos données avec des graphiques détaillés et des métriques avancées"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Statistiques avancées" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Statistiques avancées
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Analyses détaillées de vos performances commerciales
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/rapports"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Retour aux rapports
            </Link>
            <button
              onClick={handleExportChart}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Exporter graphiques
            </button>
          </div>
        </div>

        {/* Filters */}
        <ComponentCard title="Filtres">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Période d'analyse
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="thisWeek">Cette semaine</option>
                <option value="thisMonth">Ce mois</option>
                <option value="lastMonth">Mois dernier</option>
                <option value="thisQuarter">Ce trimestre</option>
                <option value="thisYear">Cette année</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type de graphique
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="category">Ventes par catégorie</option>
                <option value="platform">Ventes par plateforme</option>
                <option value="wilaya">Ventes par wilaya</option>
                <option value="payment">Méthodes de paiement</option>
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Main Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sales by Category */}
          <ComponentCard title="Ventes par catégorie">
            <div className="space-y-4">
              {mockStatistics.salesByCategory.map((item, index) => (
                <ProgressBar
                  key={index}
                  label={item.category}
                  value={item.sales}
                  maxValue={maxSales}
                  color="bg-blue-500"
                  showPercentage={true}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                {mockStatistics.salesByCategory.map((item, index) => (
                  <div key={index}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>

          {/* Sales by Wilaya */}
          <ComponentCard title="Répartition géographique">
            <div className="space-y-4">
              {mockStatistics.salesByWilaya.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-medium text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.wilaya}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.sales} ventes
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>

        {/* Weekly Trend */}
        <ComponentCard title="Tendance hebdomadaire">
          <ChartBar
            data={mockStatistics.weeklyTrend.map(item => ({
              label: item.day,
              value: item.sales,
              color: 'bg-green-500'
            }))}
            maxValue={maxWeeklySales}
          />
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-7 gap-2 text-center">
              {mockStatistics.weeklyTrend.map((item, index) => (
                <div key={index}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.day}</p>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ComponentCard>

        {/* Payment Methods and Hourly Distribution */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Payment Methods */}
          <ComponentCard title="Méthodes de paiement">
            <div className="space-y-4">
              {mockStatistics.paymentMethods.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.method}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.count}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>

          {/* Hourly Distribution */}
          <ComponentCard title="Distribution horaire">
            <ChartBar
              data={mockStatistics.hourlyDistribution.map(item => ({
                label: item.hour,
                value: item.sales,
                color: 'bg-orange-500'
              }))}
              maxValue={maxHourlySales}
            />
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Pic d'activité: 15h-16h ({Math.max(...mockStatistics.hourlyDistribution.map(h => h.sales))} ventes)
              </p>
            </div>
          </ComponentCard>
        </div>

        {/* Key Insights */}
        <ComponentCard title="Insights clés">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Croissance
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    +15% vs mois dernier
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Meilleur jour
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Vendredi (25 ventes)
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/30">
                  <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">
                    Top région
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Alger (45 ventes)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useSalesWithContext } from '../../hooks/useSalesWithContext';
import { useClientsWithContext } from '../../hooks/useClientsWithContext';
import { useProductsWithContext } from '../../hooks/useProductsWithContext';

// Real-time financial data calculations

interface ReportCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const ReportCard: React.FC<ReportCardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change && (
            <div className="mt-2 flex items-center">
              <span
                className={`text-sm font-medium ${
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="ml-1 text-sm text-gray-500">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function Rapports() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [reportType, setReportType] = useState('financial');

  // Get real data from contexts
  const { data: salesData, loading: salesLoading, error: salesError } = useSalesWithContext();
  const { data: clientsData, loading: clientsLoading, error: clientsError } = useClientsWithContext();
  const { data: productsData, loading: productsLoading, error: productsError } = useProductsWithContext();

  const allSales = salesData?.items || [];
  const allClients = clientsData?.items || [];
  const allProducts = productsData?.items || [];

  // Calculate real financial data
  const financialData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    // Filter sales by period
    const todaySales = allSales.filter(s => new Date(s.date_vente) >= today);
    const thisWeekSales = allSales.filter(s => new Date(s.date_vente) >= thisWeekStart);
    const thisMonthSales = allSales.filter(s => new Date(s.date_vente) >= thisMonthStart);
    const lastMonthSales = allSales.filter(s => {
      const saleDate = new Date(s.date_vente);
      return saleDate >= lastMonthStart && saleDate <= lastMonthEnd;
    });
    const thisYearSales = allSales.filter(s => new Date(s.date_vente) >= thisYearStart);

    // Calculate revenue
    const revenue = {
      today: todaySales.reduce((sum, s) => sum + s.total, 0),
      thisWeek: thisWeekSales.reduce((sum, s) => sum + s.total, 0),
      thisMonth: thisMonthSales.reduce((sum, s) => sum + s.total, 0),
      lastMonth: lastMonthSales.reduce((sum, s) => sum + s.total, 0),
      thisYear: thisYearSales.reduce((sum, s) => sum + s.total, 0)
    };

    // Calculate expenses (purchase costs)
    const expenses = {
      thisMonth: thisMonthSales.reduce((sum, s) => sum + (s.purchase_cost || 0), 0),
      lastMonth: lastMonthSales.reduce((sum, s) => sum + (s.purchase_cost || 0), 0),
      thisYear: thisYearSales.reduce((sum, s) => sum + (s.purchase_cost || 0), 0)
    };

    // Calculate profit
    const profit = {
      thisMonth: revenue.thisMonth - expenses.thisMonth,
      lastMonth: revenue.lastMonth - expenses.lastMonth,
      thisYear: revenue.thisYear - expenses.thisYear
    };

    return { revenue, expenses, profit };
  }, [allSales]);

  // Calculate top products
  const topProducts = useMemo(() => {
    const productStats = new Map();

    allSales.forEach(sale => {
      const productId = sale.id_produit;
      const productName = sale.produit_nom || allProducts.find(p => p.id_produit === productId)?.nom || 'Produit inconnu';

      if (!productStats.has(productId)) {
        productStats.set(productId, {
          nom: productName,
          ventes: 0,
          ca: 0
        });
      }

      const stats = productStats.get(productId);
      stats.ventes += sale.quantite;
      stats.ca += sale.total;
    });

    return Array.from(productStats.values())
      .sort((a, b) => b.ca - a.ca)
      .slice(0, 5);
  }, [allSales, allProducts]);

  // Calculate top clients
  const topClients = useMemo(() => {
    const clientStats = new Map();

    allSales.forEach(sale => {
      const clientId = sale.id_client;
      const clientName = sale.client_nom || allClients.find(c => c.id_client === clientId)?.nom_complet || 'Client inconnu';

      if (!clientStats.has(clientId)) {
        clientStats.set(clientId, {
          nom: clientName,
          commandes: 0,
          ca: 0
        });
      }

      const stats = clientStats.get(clientId);
      stats.commandes += 1;
      stats.ca += sale.total;
    });

    return Array.from(clientStats.values())
      .sort((a, b) => b.ca - a.ca)
      .slice(0, 5);
  }, [allSales, allClients]);

  // Loading state
  if (salesLoading || clientsLoading || productsLoading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Rapports financiers" />
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (salesError || clientsError || productsError) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Rapports financiers" />
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-medium">
            Erreur lors du chargement des données
          </div>
          <div className="text-gray-500 mt-2">
            {salesError || clientsError || productsError}
          </div>
        </div>
      </div>
    );
  }

  const handleExportPDF = () => {
    alert('Génération du rapport PDF en cours...');
    // Here you would implement PDF generation
  };

  const handleExportCSV = () => {
    alert('Export CSV en cours...');
    // Here you would implement CSV export
  };

  // Calculate growth percentages
  const revenueGrowth = financialData.revenue.lastMonth > 0
    ? ((financialData.revenue.thisMonth - financialData.revenue.lastMonth) / financialData.revenue.lastMonth) * 100
    : 0;
  const profitGrowth = financialData.profit.lastMonth > 0
    ? ((financialData.profit.thisMonth - financialData.profit.lastMonth) / financialData.profit.lastMonth) * 100
    : 0;
  const expenseGrowth = financialData.expenses.lastMonth > 0
    ? ((financialData.expenses.thisMonth - financialData.expenses.lastMonth) / financialData.expenses.lastMonth) * 100
    : 0;

  return (
    <>
      <PageMeta
        title="Rapports Financiers | IPTV Management"
        description="Consultez vos rapports financiers et analyses de performance"
      />
      
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Rapports financiers" />
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Rapports financiers
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Analysez vos performances et exportez vos données
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Period and Report Type Selection */}
        <ComponentCard title="Filtres">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Période
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="today">Aujourd'hui</option>
                <option value="thisWeek">Cette semaine</option>
                <option value="thisMonth">Ce mois</option>
                <option value="lastMonth">Mois dernier</option>
                <option value="thisYear">Cette année</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type de rapport
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="financial">Rapport financier</option>
                <option value="sales">Rapport des ventes</option>
                <option value="products">Rapport produits</option>
                <option value="clients">Rapport clients</option>
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ReportCard
            title="Chiffre d'affaires"
            value={formatCurrency(financialData.revenue.thisMonth)}
            change={{
              value: Math.round(revenueGrowth),
              isPositive: revenueGrowth > 0
            }}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
          />

          <ReportCard
            title="Dépenses"
            value={formatCurrency(financialData.expenses.thisMonth)}
            change={{
              value: Math.round(expenseGrowth),
              isPositive: false
            }}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
            color="orange"
          />

          <ReportCard
            title="Bénéfice net"
            value={formatCurrency(financialData.profit.thisMonth)}
            change={{
              value: Math.round(profitGrowth),
              isPositive: profitGrowth > 0
            }}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            color="blue"
          />

          <ReportCard
            title="Marge bénéficiaire"
            value={`${financialData.revenue.thisMonth > 0 ? Math.round((financialData.profit.thisMonth / financialData.revenue.thisMonth) * 100) : 0}%`}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Monthly Revenue Chart */}
          <ComponentCard title="Évolution mensuelle">
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  📊 Graphiques d'évolution mensuelle disponibles après 3 mois de données
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(financialData.revenue.thisWeek)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Cette semaine
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(financialData.profit.thisMonth)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Bénéfice ce mois
                    </div>
                  </div>
                </div>
              </div>
              {/* Placeholder for future monthly data
              */}
            </div>
          </ComponentCard>

          {/* Top Products */}
          <ComponentCard title="Produits les plus vendus">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.nom}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.ventes} ventes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(product.ca)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ComponentCard>
        </div>

        {/* Top Clients */}
        <ComponentCard title="Meilleurs clients">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Commandes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Chiffre d'affaires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-white/[0.03]">
                {topClients.map((client, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {client.nom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {client.commandes}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(client.ca)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/clients/historique?client=${index + 1}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                      >
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>

        {/* Quick Actions */}
        <ComponentCard title="Actions rapides">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              to="/statistiques"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Statistiques avancées
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Graphiques détaillés
                </p>
              </div>
            </Link>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Rapport complet PDF
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Export détaillé
                </p>
              </div>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Export données CSV
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Données brutes
                </p>
              </div>
            </button>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

import DashboardStats from "../../components/iptv/DashboardStats";
import RecentActivity from "../../components/iptv/RecentActivity";
import QuickActions from "../../components/iptv/QuickActions";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Tableau de bord IPTV | Gestion des produits numériques"
        description="Tableau de bord principal pour la gestion des plateformes IPTV, produits numériques, clients et ventes"
      />

      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Vue d'ensemble de votre activité IPTV et produits numériques
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Dashboard Statistics */}
        <div className="col-span-12">
          <DashboardStats />
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 xl:col-span-8">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="col-span-12 xl:col-span-4">
          <RecentActivity />
        </div>

        {/* Sales Chart */}
        <div className="col-span-12 xl:col-span-8">
          <MonthlySalesChart />
        </div>

        {/* Statistics Chart */}
        <div className="col-span-12 xl:col-span-4">
          <StatisticsChart />
        </div>
      </div>
    </>
  );
}

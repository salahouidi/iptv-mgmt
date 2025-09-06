import { Link } from 'react-router';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const QuickAction: React.FC<QuickActionProps> = ({ 
  title, 
  description, 
  icon, 
  href, 
  color 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30',
  };

  return (
    <Link
      to={href}
      className={`block rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
};

export default function QuickActions() {
  const actions = [
    {
      title: 'Nouvelle vente',
      description: 'Enregistrer une nouvelle vente rapidement',
      href: '/ventes/nouvelle',
      color: 'green' as const,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      title: 'Ajouter un client',
      description: 'Créer une nouvelle fiche client',
      href: '/clients?action=new',
      color: 'blue' as const,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: 'Nouveau produit',
      description: 'Ajouter un produit au catalogue',
      href: '/produits?action=new',
      color: 'purple' as const,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'Recharger plateforme',
      description: 'Effectuer une recharge sur une plateforme',
      href: '/recharges?action=new',
      color: 'orange' as const,
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Actions rapides
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Accès rapide aux fonctionnalités principales
        </p>
      </div>
      <div className="border-t border-gray-100 p-6 dark:border-gray-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {actions.map((action) => (
            <QuickAction
              key={action.title}
              title={action.title}
              description={action.description}
              href={action.href}
              color={action.color}
              icon={action.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

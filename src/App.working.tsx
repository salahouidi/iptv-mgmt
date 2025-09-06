import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

// Simple Login Component
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication check
    if ((username === 'ADMIN' && password === 'admin123') ||
        (username === 'DJO' && password === 'djo123') ||
        (username === 'SALAH' && password === 'salah123')) {
      localStorage.setItem('iptv_user', JSON.stringify({ username, role: 'Admin' }));
      navigate('/dashboard');
    } else {
      setError('Nom d\'utilisateur ou mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          🎬 IPTV Management
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ADMIN, DJO, ou SALAH"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Se connecter
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Comptes de test:</strong></p>
          <p>• ADMIN / admin123</p>
          <p>• DJO / djo123</p>
          <p>• SALAH / salah123</p>
        </div>
      </div>
    </div>
  );
}

// Simple Dashboard Component
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('iptv_user') || '{}');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('iptv_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              🎬 IPTV Management Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenue, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <Link to="/dashboard" className="hover:text-blue-200">Tableau de bord</Link>
            <Link to="/dashboard/admin-management" className="hover:text-blue-200">Gestion des Administrateurs</Link>
            <Link to="/dashboard/clients" className="hover:text-blue-200">Clients</Link>
            <Link to="/dashboard/products" className="hover:text-blue-200">Articles</Link>
            <Link to="/dashboard/sales" className="hover:text-blue-200">Ventes</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="admin-management" element={<AdminManagement />} />
          <Route path="clients" element={<div className="bg-white p-6 rounded-lg shadow">Gestion des Clients</div>} />
          <Route path="products" element={<div className="bg-white p-6 rounded-lg shadow">Gestion des Articles</div>} />
          <Route path="sales" element={<div className="bg-white p-6 rounded-lg shadow">Gestion des Ventes</div>} />
        </Routes>
      </main>
    </div>
  );
}

// Dashboard Home
function DashboardHome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Clients</h3>
        <p className="text-3xl font-bold text-blue-600">150</p>
        <p className="text-sm text-gray-600">Total des clients</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Articles</h3>
        <p className="text-3xl font-bold text-green-600">25</p>
        <p className="text-sm text-gray-600">Articles disponibles</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ventes</h3>
        <p className="text-3xl font-bold text-purple-600">89</p>
        <p className="text-sm text-gray-600">Ventes ce mois</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenus</h3>
        <p className="text-3xl font-bold text-orange-600">45,230 DZD</p>
        <p className="text-sm text-gray-600">Revenus ce mois</p>
      </div>
    </div>
  );
}

// Admin Management Component
function AdminManagement() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'credentials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes Identifiants
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Utilisateurs Admin
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Historique
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'credentials' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Gestion des Identifiants</h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue="ADMIN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Mettre à jour
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Utilisateurs Administrateurs</h3>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                + Ajouter Admin
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau d'accès
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de création
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">ADMIN</div>
                      <div className="text-sm text-gray-500">admin@blacknashop.local</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        Super Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Actif
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      22/08/2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Modifier</button>
                      <button className="text-red-600 hover:text-red-900">Supprimer</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">DJO</div>
                      <div className="text-sm text-gray-500">DJO@GMAIL.COM</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Admin
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Actif
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      22/08/2025
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Modifier</button>
                      <button className="text-red-600 hover:text-red-900">Supprimer</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Historique des Activités</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm font-medium">Connexion réussie</p>
                <p className="text-xs text-gray-500">ADMIN - 06/09/2025 09:15:00</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="text-sm font-medium">Nouveau client ajouté</p>
                <p className="text-xs text-gray-500">DJO - 05/09/2025 15:45:00</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="text-sm font-medium">Mise à jour des paramètres</p>
                <p className="text-xs text-gray-500">ADMIN - 06/09/2025 09:20:00</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('iptv_user');
  
  if (!user) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
}

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;

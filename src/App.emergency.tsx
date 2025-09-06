import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

// Composant de connexion simple
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎬 IPTV Management
          </h1>
          <p className="text-gray-600">Système de gestion IPTV</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ADMIN, DJO, ou SALAH"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors"
          >
            Se connecter
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Comptes de test:</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>ADMIN</strong> / admin123</p>
            <p>• <strong>DJO</strong> / djo123</p>
            <p>• <strong>SALAH</strong> / salah123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard principal
function Dashboard() {
  const user = JSON.parse(localStorage.getItem('iptv_user') || '{}');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

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
            <h1 className="text-2xl font-bold text-gray-900">
              🎬 IPTV Management Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenue, <strong>{user.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
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
          <div className="flex space-x-8 py-3 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap hover:text-blue-200 ${activeTab === 'dashboard' ? 'border-b-2 border-white' : ''}`}
            >
              Tableau de bord
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`whitespace-nowrap hover:text-blue-200 ${activeTab === 'admin' ? 'border-b-2 border-white' : ''}`}
            >
              Gestion des Administrateurs
            </button>
            <button 
              onClick={() => setActiveTab('clients')}
              className={`whitespace-nowrap hover:text-blue-200 ${activeTab === 'clients' ? 'border-b-2 border-white' : ''}`}
            >
              Clients
            </button>
            <button 
              onClick={() => setActiveTab('articles')}
              className={`whitespace-nowrap hover:text-blue-200 ${activeTab === 'articles' ? 'border-b-2 border-white' : ''}`}
            >
              Articles
            </button>
            <button 
              onClick={() => setActiveTab('ventes')}
              className={`whitespace-nowrap hover:text-blue-200 ${activeTab === 'ventes' ? 'border-b-2 border-white' : ''}`}
            >
              Ventes
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardHome />}
        {activeTab === 'admin' && <AdminManagement />}
        {activeTab === 'clients' && <ClientsManagement />}
        {activeTab === 'articles' && <ArticlesManagement />}
        {activeTab === 'ventes' && <VentesManagement />}
      </main>
    </div>
  );
}

// Composants des différentes sections
function DashboardHome() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h2>
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
    </div>
  );
}

function AdminManagement() {
  const [activeAdminTab, setActiveAdminTab] = useState('users');

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveAdminTab('credentials')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeAdminTab === 'credentials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes Identifiants
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeAdminTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Utilisateurs Admin
          </button>
          <button
            onClick={() => setActiveAdminTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeAdminTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Historique
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeAdminTab === 'credentials' && (
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

        {activeAdminTab === 'users' && (
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

        {activeAdminTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Historique des Activités</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-sm font-medium">Connexion réussie</p>
                <p className="text-xs text-gray-500">ADMIN - {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientsManagement() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Clients</h2>
      <p className="text-gray-600">Module de gestion des clients IPTV</p>
    </div>
  );
}

function ArticlesManagement() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Articles</h2>
      <p className="text-gray-600">Module de gestion des articles IPTV</p>
    </div>
  );
}

function VentesManagement() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Ventes</h2>
      <p className="text-gray-600">Module de gestion des ventes IPTV</p>
    </div>
  );
}

// Route protégée
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('iptv_user');
  
  if (!user) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
}

// App principal
function App() {
  console.log('🚀 App Emergency is loading...');
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={
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

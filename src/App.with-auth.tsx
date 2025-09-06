import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { ClientProvider } from "./contexts/ClientContext";
import { SalesProvider } from "./contexts/SalesContext";
import { ProductProvider } from "./contexts/ProductContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function TestLoginButton() {
  const { login } = useAuth();

  const handleTestLogin = async () => {
    try {
      const success = await login('ADMIN', 'admin123');
      alert(success ? 'Login successful!' : 'Login failed!');
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  };

  return (
    <button
      onClick={handleTestLogin}
      className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      Test Login
    </button>
  );
}

function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Home Page with Auth</h1>
      <p className="text-gray-700">✅ AuthProvider is working!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-green-100 border border-green-200 rounded-lg p-4">
          <h2 className="font-semibold text-green-800">Authentication Status:</h2>
          <ul className="text-green-700 mt-2 space-y-1">
            <li>• AuthProvider: ✅</li>
            <li>• Loading: {isLoading ? '⏳' : '✅'}</li>
            <li>• Authenticated: {isAuthenticated ? '✅' : '❌'}</li>
            <li>• User: {user?.username || 'Not logged in'}</li>
          </ul>
        </div>
        
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800">User Info:</h2>
          {user ? (
            <ul className="text-blue-700 mt-2 space-y-1">
              <li>• Username: {user.username}</li>
              <li>• Email: {user.email}</li>
              <li>• Role: {user.role}</li>
              <li>• Status: {user.status}</li>
            </ul>
          ) : (
            <p className="text-blue-700 mt-2">No user logged in</p>
          )}
        </div>
      </div>
      
      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mt-4">
        <h2 className="font-semibold text-yellow-800">Test Login:</h2>
        <p className="text-yellow-700 mt-2">
          Try logging in with: ADMIN / admin123
        </p>
        <TestLoginButton />
      </div>
    </div>
  );
}

function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
      <p className="text-gray-700">✅ Everything is working correctly!</p>
    </div>
  );
}

function AppContent() {
  return (
    <ClientProvider>
      <SalesProvider>
        <ProductProvider>
          <Router>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/test" element={<TestPage />} />
              </Route>
              <Route path="*" element={
                <div className="min-h-screen bg-gray-100 p-8">
                  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                  </div>
                </div>
              } />
            </Routes>
          </Router>
        </ProductProvider>
      </SalesProvider>
    </ClientProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

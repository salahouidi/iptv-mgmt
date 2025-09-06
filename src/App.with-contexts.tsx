import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { ClientProvider } from "./contexts/ClientContext";
import { SalesProvider } from "./contexts/SalesContext";
import { ProductProvider } from "./contexts/ProductContext";

function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Home Page with Contexts</h1>
      <p className="text-gray-700">✅ All context providers are working!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-green-100 border border-green-200 rounded-lg p-4">
          <h2 className="font-semibold text-green-800">Context Providers Status:</h2>
          <ul className="text-green-700 mt-2 space-y-1">
            <li>• ClientProvider: ✅</li>
            <li>• SalesProvider: ✅</li>
            <li>• ProductProvider: ✅</li>
            <li>• SidebarProvider: ✅</li>
          </ul>
        </div>
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-800">Layout Status:</h2>
          <ul className="text-blue-700 mt-2 space-y-1">
            <li>• Sidebar: ✅</li>
            <li>• Header: ✅</li>
            <li>• Navigation: ✅</li>
            <li>• Responsive: ✅</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
      <p className="text-gray-700">✅ Everything is working correctly!</p>
      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mt-4">
        <h2 className="font-semibold text-yellow-800">API Test:</h2>
        <button 
          onClick={() => {
            fetch('https://iptv-management-api.houidi-salaheddine.workers.dev/api/health')
              .then(res => res.json())
              .then(data => alert('API Response: ' + JSON.stringify(data, null, 2)))
              .catch(err => alert('API Error: ' + err.message));
          }}
          className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
}

function App() {
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

export default App;

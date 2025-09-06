import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Test context providers one by one
import { AuthProvider } from "./contexts/AuthContext";
import { ClientProvider } from "./contexts/ClientContext";
import { SalesProvider } from "./contexts/SalesContext";
import { ProductProvider } from "./contexts/ProductContext";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          🎬 IPTV Management - Context Providers Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Working Components</h2>
            <ul className="space-y-2 text-green-700">
              <li>• React Router ✅</li>
              <li>• AuthProvider ✅</li>
              <li>• ClientProvider ✅</li>
              <li>• SalesProvider ✅</li>
              <li>• ProductProvider ✅</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">🧪 Context Status</h2>
            <div className="space-y-2 text-blue-700">
              <p>All context providers are loaded successfully!</p>
              <p>This means the issue is likely with page components.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">📋 Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Context providers are working correctly</li>
            <li>Router navigation is functional</li>
            <li>Ready to test individual page components</li>
            <li>Will identify the problematic page import</li>
          </ol>
        </div>
        
        <div className="mt-6">
          <Link 
            to="/test" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4"
          >
            Test Page
          </Link>
          <Link 
            to="/signin" 
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Sign In Test
          </Link>
        </div>
      </div>
    </div>
  );
}

function TestPage() {
  return (
    <div className="min-h-screen bg-purple-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-purple-600 mb-6">
          🧪 Context Test Page
        </h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">✅ All Context Providers Working!</h2>
          <p className="text-green-700">
            All context providers (Auth, Client, Sales, Product) are functioning correctly.
            The blank page issue is likely caused by one of the page component imports.
          </p>
        </div>
        
        <Link 
          to="/" 
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          🔐 Sign In Test (With Contexts)
        </h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-700 text-sm">
            ✅ All context providers are available and working correctly.
          </p>
        </div>
        
        <div className="text-center">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  console.log('🎯 App.test-contexts.tsx is rendering');
  
  return (
    <AuthProvider>
      <ClientProvider>
        <SalesProvider>
          <ProductProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="*" element={
                  <div className="min-h-screen bg-red-100 p-8">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                      <h1 className="text-3xl font-bold text-red-600 mb-6">404 - Page Not Found</h1>
                      <p className="text-gray-700 mb-4">The page you're looking for doesn't exist.</p>
                      <Link 
                        to="/" 
                        className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
                      >
                        ← Back to Home
                      </Link>
                    </div>
                  </div>
                } />
              </Routes>
            </Router>
          </ProductProvider>
        </SalesProvider>
      </ClientProvider>
    </AuthProvider>
  );
}

export default App;

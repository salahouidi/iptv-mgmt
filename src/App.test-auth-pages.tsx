import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Test context providers
import { AuthProvider } from "./contexts/AuthContext";
import { ClientProvider } from "./contexts/ClientContext";
import { SalesProvider } from "./contexts/SalesContext";
import { ProductProvider } from "./contexts/ProductContext";

// Test auth pages - but import the forms directly to avoid PageMeta
import SignInForm from "./components/auth/SignInForm";
import SignUpForm from "./components/auth/SignUpForm";
import ResetPasswordForm from "./components/auth/ResetPasswordForm";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          🎬 IPTV Management - Auth Pages Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Working Components</h2>
            <ul className="space-y-2 text-green-700">
              <li>• React Router ✅</li>
              <li>• All Context Providers ✅</li>
              <li>• Auth Forms (without PageMeta) ✅</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">🔍 Testing Auth Pages</h2>
            <div className="space-y-2 text-yellow-700">
              <p>Testing auth pages without PageMeta component</p>
              <p>If this works, PageMeta is the culprit!</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">🧪 Test Navigation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link 
              to="/signin" 
              className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
            >
              Sign In Form
            </Link>
            <Link 
              to="/signup" 
              className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center"
            >
              Sign Up Form
            </Link>
            <Link 
              to="/reset-password" 
              className="block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-center"
            >
              Reset Password
            </Link>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">🎯 Diagnosis</h2>
          <p className="text-red-700">
            If all auth forms work here, then the issue is with the PageMeta component 
            that uses HelmetProvider. We'll need to fix or replace PageMeta.
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple wrapper for auth forms without PageMeta
function SimpleAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <SimpleAuthLayout>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
        <SignInForm />
      </div>
    </SimpleAuthLayout>
  );
}

function SignUpPage() {
  return (
    <SimpleAuthLayout>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
        <SignUpForm />
      </div>
    </SimpleAuthLayout>
  );
}

function ResetPasswordPage() {
  return (
    <SimpleAuthLayout>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
        <ResetPasswordForm />
      </div>
    </SimpleAuthLayout>
  );
}

function App() {
  console.log('🎯 App.test-auth-pages.tsx is rendering');
  
  return (
    <AuthProvider>
      <ClientProvider>
        <SalesProvider>
          <ProductProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
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

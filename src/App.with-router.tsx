import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Home Page</h1>
      <p className="text-gray-700">✅ React Router is working!</p>
      <div className="mt-4">
        <Link to="/test" className="text-blue-600 hover:text-blue-800 underline">
          Go to Test Page
        </Link>
      </div>
    </div>
  );
}

function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
      <p className="text-gray-700">✅ Navigation is working!</p>
      <div className="mt-4">
        <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
          Go to Home Page
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Router>
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">🎬 IPTV Management - Router Test</h1>
            <nav className="mt-2">
              <Link to="/" className="text-blue-600 hover:text-blue-800 mr-4">Home</Link>
              <Link to="/test" className="text-blue-600 hover:text-blue-800">Test</Link>
            </nav>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="*" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
                <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
                  Go to Home Page
                </Link>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;

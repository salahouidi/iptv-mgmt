import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Home Page with Layout</h1>
      <p className="text-gray-700">✅ AppLayout is working!</p>
      <div className="bg-green-100 border border-green-200 rounded-lg p-4 mt-4">
        <h2 className="font-semibold text-green-800">Layout Components Status:</h2>
        <ul className="text-green-700 mt-2 space-y-1">
          <li>• Sidebar: Working</li>
          <li>• Header: Working</li>
          <li>• Main Content: Working</li>
          <li>• Responsive Layout: Working</li>
        </ul>
      </div>
    </div>
  );
}

function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
      <p className="text-gray-700">✅ Navigation with layout is working!</p>
      <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mt-4">
        <h2 className="font-semibold text-blue-800">API Test:</h2>
        <button 
          onClick={() => {
            fetch('https://iptv-management-api.houidi-salaheddine.workers.dev/api/health')
              .then(res => res.json())
              .then(data => alert('API Response: ' + JSON.stringify(data, null, 2)))
              .catch(err => alert('API Error: ' + err.message));
          }}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Test API Connection
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
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
  );
}

export default App;

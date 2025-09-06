import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          🎬 IPTV Management - Router Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Working Components</h2>
            <ul className="space-y-2 text-green-700">
              <li>• React Router</li>
              <li>• Tailwind CSS</li>
              <li>• Component rendering</li>
              <li>• Navigation</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">🧪 Test Navigation</h2>
            <div className="space-y-2">
              <Link 
                to="/test" 
                className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
              >
                Go to Test Page
              </Link>
              <Link 
                to="/signin" 
                className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-4">📋 Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Router is working correctly</li>
            <li>CSS classes are applied</li>
            <li>Navigation between pages works</li>
            <li>Ready to test complex components</li>
          </ol>
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
          🧪 Test Page
        </h1>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Router Navigation Works!</h2>
          <p className="text-green-700">
            You successfully navigated to this page, which means React Router is functioning correctly.
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
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  
  return (
    <div className="min-h-screen bg-blue-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          🔐 Sign In Test
        </h1>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Sign In (Test)
          </button>
        </form>
        
        <div className="mt-6 text-center">
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
  console.log('🎯 App.test-router.tsx is rendering');
  
  return (
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
  );
}

export default App;

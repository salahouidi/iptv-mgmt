import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🎬 IPTV Management Platform
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-800 mb-2">✅ System Status</h2>
            <ul className="text-green-700 space-y-1">
              <li>• React is working</li>
              <li>• Tailwind CSS is loaded</li>
              <li>• Build process successful</li>
              <li>• Deployment successful</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">🔧 Environment</h2>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• API: {import.meta.env.VITE_API_BASE_URL || 'Default'}</li>
              <li>• Mode: {import.meta.env.VITE_ENVIRONMENT || 'Production'}</li>
              <li>• Time: {new Date().toLocaleString()}</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">🚀 Next Steps</h2>
          <p className="text-yellow-700">
            This basic version is working. Now we can gradually add back the complex features:
          </p>
          <ol className="text-yellow-700 mt-2 space-y-1 list-decimal list-inside">
            <li>Add React Router</li>
            <li>Add Layout Components</li>
            <li>Add Authentication</li>
            <li>Add Full Application</li>
          </ol>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => {
              fetch('https://iptv-management-api.houidi-salaheddine.workers.dev/api/health')
                .then(res => res.json())
                .then(data => alert('API Test: ' + JSON.stringify(data, null, 2)))
                .catch(err => alert('API Error: ' + err.message));
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Test API Connection
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

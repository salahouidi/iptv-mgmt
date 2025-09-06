import React from 'react';

function App() {
  console.log('App component is rendering');
  
  // Add error boundary
  try {
    return (
      <div style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        color: '#333'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
          🎬 IPTV Management - Debug Mode
        </h1>
        
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#059669', marginBottom: '10px' }}>✅ System Status</h2>
          <ul style={{ lineHeight: '1.6' }}>
            <li>React is loading: ✅</li>
            <li>JavaScript is working: ✅</li>
            <li>CSS styles are applied: ✅</li>
            <li>Component is rendering: ✅</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#92400e', marginBottom: '10px' }}>🔧 Debug Information</h2>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 100)}...</p>
          <p><strong>URL:</strong> {window.location.href}</p>
          <p><strong>Environment:</strong> {import.meta.env.VITE_ENVIRONMENT || 'Not set'}</p>
          <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
        </div>

        <div style={{
          backgroundColor: '#dbeafe',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #3b82f6',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#1e40af', marginBottom: '10px' }}>🧪 Interactive Tests</h2>
          
          <button 
            onClick={() => alert('Button click works!')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              marginBottom: '10px'
            }}
          >
            Test Button Click
          </button>

          <button 
            onClick={() => {
              console.log('Console test');
              alert('Check browser console for log message');
            }}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              marginBottom: '10px'
            }}
          >
            Test Console Log
          </button>

          <button 
            onClick={async () => {
              try {
                const response = await fetch('https://iptv-management-api.houidi-salaheddine.workers.dev/api/health');
                const data = await response.json();
                alert('API Test Success: ' + JSON.stringify(data, null, 2));
              } catch (error) {
                alert('API Test Failed: ' + error.message);
              }
            }}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Test API Connection
          </button>
        </div>

        <div style={{
          backgroundColor: '#f3e8ff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #8b5cf6'
        }}>
          <h2 style={{ color: '#6b21a8', marginBottom: '10px' }}>📋 Next Steps</h2>
          <ol style={{ lineHeight: '1.6' }}>
            <li>If you can see this page, the basic React app is working</li>
            <li>Click the buttons to test interactivity</li>
            <li>Check browser console for any errors</li>
            <li>Test API connection to verify backend connectivity</li>
            <li>If everything works, the issue is with the complex app structure</li>
          </ol>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#1f2937',
          color: '#f9fafb',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>Console Output:</strong> Check browser developer tools for any error messages
        </div>
      </div>
    );
  } catch (error) {
    console.error('App rendering error:', error);
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>❌ Application Error</h1>
        <p>Error: {error.message}</p>
        <p>Check browser console for more details.</p>
      </div>
    );
  }
}

export default App;

import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '50px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1>🎬 IPTV Management Platform - Test Page</h1>
        <p>✅ React application is loading correctly!</p>
        
        <div style={{ 
          background: '#d1ecf1', 
          padding: '15px', 
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          <strong>Environment Variables:</strong><br/>
          API Base URL: {import.meta.env.VITE_API_BASE_URL || 'Not set'}<br/>
          Use Mock Data: {import.meta.env.VITE_USE_MOCK_DATA || 'Not set'}<br/>
          Environment: {import.meta.env.VITE_ENVIRONMENT || 'Not set'}<br/>
          Debug: {import.meta.env.VITE_DEBUG || 'Not set'}
        </div>

        <div style={{ 
          background: '#f8d7da', 
          padding: '15px', 
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          <strong>API Test:</strong><br/>
          <button 
            onClick={async () => {
              try {
                const response = await fetch('https://iptv-management-api.houidi-salaheddine.workers.dev/api/health');
                const data = await response.json();
                alert('API Response: ' + JSON.stringify(data, null, 2));
              } catch (error) {
                alert('API Error: ' + error.message);
              }
            }}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test API Connection
          </button>
        </div>

        <div style={{ 
          background: '#d4edda', 
          padding: '15px', 
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          <strong>Current Time:</strong> {new Date().toISOString()}<br/>
          <strong>User Agent:</strong> {navigator.userAgent}<br/>
          <strong>Location:</strong> {window.location.href}
        </div>

        <div style={{ 
          background: '#fff3cd', 
          padding: '15px', 
          borderRadius: '5px',
          margin: '20px 0'
        }}>
          <strong>Next Steps:</strong><br/>
          1. If you see this page, React is working<br/>
          2. Click "Test API Connection" to verify backend<br/>
          3. Check browser console for any errors<br/>
          4. Verify environment variables are correct
        </div>
      </div>
    </div>
  );
}

export default App;

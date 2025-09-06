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
        <h1>🎬 IPTV Management Platform</h1>
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
          Environment: {import.meta.env.VITE_ENVIRONMENT || 'Not set'}
        </div>

        <button 
          onClick={() => window.location.href = '/test.html'}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test API
        </button>
      </div>
    </div>
  );
}

export default App;

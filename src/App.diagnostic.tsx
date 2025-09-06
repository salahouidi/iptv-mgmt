import React from 'react';

function App() {
  console.log('🔍 App.diagnostic.tsx is rendering');
  
  // Test if basic React is working
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    console.log('✅ React hooks are working');
    console.log('🌐 Window object:', typeof window);
    console.log('📄 Document object:', typeof document);
    console.log('🎯 Root element:', document.getElementById('root'));
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
        🔍 IPTV Management - Diagnostic Mode
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
          <li>✅ React is rendering</li>
          <li>✅ JavaScript is executing</li>
          <li>✅ DOM is accessible</li>
          <li>✅ Styles are applied</li>
          <li>✅ State management: {count}</li>
        </ul>
        
        <button 
          onClick={() => setCount(c => c + 1)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Test Counter: {count}
        </button>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #f59e0b',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#92400e', marginBottom: '10px' }}>🔧 Environment Info</h2>
        <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 80)}...</p>
        <p><strong>URL:</strong> {window.location.href}</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
      </div>

      <div style={{
        backgroundColor: '#dbeafe',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #3b82f6'
      }}>
        <h2 style={{ color: '#1e40af', marginBottom: '10px' }}>🧪 Next Steps</h2>
        <ol style={{ lineHeight: '1.6' }}>
          <li>If you see this page, basic React is working</li>
          <li>The issue is likely with complex components or imports</li>
          <li>We'll gradually add components to identify the problem</li>
          <li>Check browser console for any error messages</li>
        </ol>
      </div>
    </div>
  );
}

export default App;

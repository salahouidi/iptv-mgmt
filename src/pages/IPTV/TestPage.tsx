import { useState, useEffect } from 'react';

export default function TestPage() {
  console.log('🔍 TestPage: Component starting to render');
  
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    console.log('🔍 TestPage: useEffect running');
    setMounted(true);
    
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
    
    return () => {
      console.log('🔍 TestPage: Cleanup');
      clearInterval(timer);
    };
  }, []);
  
  console.log('🔍 TestPage: About to return JSX', { count, mounted });
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h1>🧪 Test Page</h1>
      <p>This is a simple test page to verify React rendering works.</p>
      <p>Count: {count}</p>
      <p>Mounted: {mounted ? 'Yes' : 'No'}</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => setCount(prev => prev + 10)}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add 10
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>React is rendering: ✅</li>
          <li>State updates work: {count > 0 ? '✅' : '❌'}</li>
          <li>Effects work: {mounted ? '✅' : '❌'}</li>
          <li>Console logging: Check browser console</li>
        </ul>
      </div>
    </div>
  );
}

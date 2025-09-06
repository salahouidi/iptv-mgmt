import { useState, useEffect } from 'react';

interface DebugInfoProps {
  componentName: string;
  data?: any;
  loading?: boolean;
  error?: string | null;
  additionalInfo?: Record<string, any>;
}

export default function DebugInfo({ 
  componentName, 
  data, 
  loading, 
  error, 
  additionalInfo 
}: DebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const log = `[${new Date().toLocaleTimeString()}] ${componentName}: Component mounted`;
    setLogs(prev => [...prev, log]);
  }, [componentName]);

  useEffect(() => {
    if (loading !== undefined) {
      const log = `[${new Date().toLocaleTimeString()}] ${componentName}: Loading = ${loading}`;
      setLogs(prev => [...prev, log]);
    }
  }, [loading, componentName]);

  useEffect(() => {
    if (error !== undefined) {
      const log = `[${new Date().toLocaleTimeString()}] ${componentName}: Error = ${error}`;
      setLogs(prev => [...prev, log]);
    }
  }, [error, componentName]);

  useEffect(() => {
    if (data !== undefined) {
      const log = `[${new Date().toLocaleTimeString()}] ${componentName}: Data received (${Array.isArray(data) ? data.length : typeof data})`;
      setLogs(prev => [...prev, log]);
    }
  }, [data, componentName]);

  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        backgroundColor: '#007bff',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontFamily: 'monospace'
      }} onClick={() => setIsVisible(true)}>
        🐛 Debug {componentName}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '500px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace',
      overflow: 'auto'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid #333',
        paddingBottom: '8px'
      }}>
        <h3 style={{ margin: 0, color: '#4CAF50' }}>🐛 Debug: {componentName}</h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#FFC107' }}>Current State:</h4>
        <div style={{ backgroundColor: '#1a1a1a', padding: '8px', borderRadius: '4px' }}>
          <div>Loading: <span style={{ color: loading ? '#FF5722' : '#4CAF50' }}>{String(loading)}</span></div>
          <div>Error: <span style={{ color: error ? '#FF5722' : '#4CAF50' }}>{error || 'None'}</span></div>
          <div>Data: <span style={{ color: data ? '#4CAF50' : '#FF5722' }}>
            {data ? (Array.isArray(data) ? `Array(${data.length})` : typeof data) : 'None'}
          </span></div>
        </div>
      </div>

      {additionalInfo && (
        <div style={{ marginBottom: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#FFC107' }}>Additional Info:</h4>
          <div style={{ backgroundColor: '#1a1a1a', padding: '8px', borderRadius: '4px' }}>
            <pre style={{ margin: 0, fontSize: '11px', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(additionalInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div>
        <h4 style={{ margin: '0 0 8px 0', color: '#FFC107' }}>Activity Log:</h4>
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          padding: '8px', 
          borderRadius: '4px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px', fontSize: '11px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #333' }}>
        <button 
          onClick={() => setLogs([])}
          style={{
            backgroundColor: '#FF5722',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            marginRight: '8px'
          }}
        >
          Clear Logs
        </button>
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

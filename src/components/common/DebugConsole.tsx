import { useState, useEffect } from 'react';
import { getErrorSummary, clearErrors } from '../../utils/errorHandler';

interface DebugConsoleProps {
  isVisible?: boolean;
}

export default function DebugConsole({ isVisible = false }: DebugConsoleProps) {
  const [visible, setVisible] = useState(isVisible);
  const [errorSummary, setErrorSummary] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (visible) {
      const summary = getErrorSummary();
      setErrorSummary(summary);
    }
  }, [visible, refreshKey]);

  // Keyboard shortcut to toggle debug console (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setVisible(!visible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const clearAllErrors = () => {
    clearErrors();
    refresh();
  };

  if (!visible) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: '#007bff',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'monospace',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        onClick={() => setVisible(true)}
        title="Click to open debug console (or press Ctrl+Shift+D)"
      >
        🐛 Debug Console
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '500px',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        border: '1px solid #333',
        borderRadius: '8px',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#2a2a2a'
        }}
      >
        <span style={{ fontWeight: 'bold' }}>🐛 Debug Console</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={refresh}
            style={{
              padding: '4px 8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            Refresh
          </button>
          <button
            onClick={clearAllErrors}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setVisible(false)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: '12px',
          maxHeight: '400px',
          overflow: 'auto'
        }}
      >
        {errorSummary ? (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#FFC107' }}>Error Summary:</h4>
              <div style={{ backgroundColor: '#2a2a2a', padding: '8px', borderRadius: '4px' }}>
                <div>Total Errors: <span style={{ color: '#FF5722' }}>{errorSummary.total}</span></div>
                <div>By Type:</div>
                {Object.entries(errorSummary.byType).map(([type, count]) => (
                  <div key={type} style={{ marginLeft: '16px' }}>
                    {type}: <span style={{ color: '#FF5722' }}>{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {errorSummary.recent.length > 0 && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#FFC107' }}>Recent Errors:</h4>
                <div style={{ backgroundColor: '#2a2a2a', padding: '8px', borderRadius: '4px' }}>
                  {errorSummary.recent.map((error: any, index: number) => (
                    <div key={index} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #444' }}>
                      <div style={{ color: '#FF5722', fontWeight: 'bold' }}>{error.type.toUpperCase()}</div>
                      <div style={{ color: '#FFC107' }}>{error.message}</div>
                      <div style={{ color: '#6c757d', fontSize: '10px' }}>{error.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errorSummary.total === 0 && (
              <div style={{ color: '#28a745', textAlign: 'center', padding: '20px' }}>
                ✅ No errors detected!
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#6c757d', textAlign: 'center', padding: '20px' }}>
            Loading error summary...
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #333',
          backgroundColor: '#2a2a2a',
          fontSize: '10px',
          color: '#6c757d'
        }}
      >
        Press Ctrl+Shift+D to toggle | Environment: {import.meta.env.MODE}
      </div>
    </div>
  );
}

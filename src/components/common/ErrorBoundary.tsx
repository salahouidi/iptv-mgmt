import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 ErrorBoundary: Error caught', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary: Component stack trace', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    this.setState({ error, errorInfo });

    // Send error to console for debugging
    console.group('🚨 DETAILED ERROR REPORT');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee', 
          border: '2px solid #f00',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2 style={{ color: '#d00', marginBottom: '16px' }}>
            🚨 Something went wrong!
          </h2>
          
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ color: '#800', marginBottom: '8px' }}>Error Details:</h3>
            <pre style={{ 
              backgroundColor: '#fff', 
              padding: '12px', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.toString()}
            </pre>
          </div>

          {this.state.errorInfo && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ color: '#800', marginBottom: '8px' }}>Component Stack:</h3>
              <pre style={{ 
                backgroundColor: '#fff', 
                padding: '12px', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                maxHeight: '200px'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}

          <button 
            onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

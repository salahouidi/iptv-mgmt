// Global error handler for catching unhandled errors
// This helps identify issues that might not be caught by ErrorBoundary

export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  userAgent: string;
  type: 'javascript' | 'unhandledrejection' | 'react';
  additionalInfo?: any;
}

class GlobalErrorHandler {
  private errors: ErrorReport[] = [];
  private maxErrors = 50; // Keep last 50 errors

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        type: 'javascript',
        additionalInfo: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        type: 'unhandledrejection',
        additionalInfo: {
          reason: event.reason
        }
      });
    });
  }

  logError(errorReport: ErrorReport) {
    // Add to internal log
    this.errors.push(errorReport);
    
    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console with detailed information
    console.group(`🚨 GLOBAL ERROR [${errorReport.type.toUpperCase()}]`);
    console.error('Message:', errorReport.message);
    console.error('Stack:', errorReport.stack);
    console.error('URL:', errorReport.url);
    console.error('Timestamp:', errorReport.timestamp);
    console.error('User Agent:', errorReport.userAgent);
    if (errorReport.additionalInfo) {
      console.error('Additional Info:', errorReport.additionalInfo);
    }
    console.groupEnd();

    // Check for specific error patterns
    this.analyzeError(errorReport);
  }

  private analyzeError(errorReport: ErrorReport) {
    const message = errorReport.message.toLowerCase();
    
    if (message.includes('settings is not defined')) {
      console.error('🎯 DETECTED: Settings reference error - likely undefined variable');
      console.error('💡 SOLUTION: Check for undefined settings variable references');
    }
    
    if (message.includes('cannot read properties of null')) {
      console.error('🎯 DETECTED: Null property access error');
      console.error('💡 SOLUTION: Add null checks before property access');
    }
    
    if (message.includes('cannot read properties of undefined')) {
      console.error('🎯 DETECTED: Undefined property access error');
      console.error('💡 SOLUTION: Add undefined checks or optional chaining');
    }
    
    if (message.includes('split')) {
      console.error('🎯 DETECTED: String split error - likely null/undefined string');
      console.error('💡 SOLUTION: Validate string before calling split()');
    }
    
    if (message.includes('reduce')) {
      console.error('🎯 DETECTED: Array reduce error - likely null/undefined array');
      console.error('💡 SOLUTION: Validate array before calling reduce()');
    }
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorSummary() {
    const summary = {
      total: this.errors.length,
      byType: {} as Record<string, number>,
      recent: this.errors.slice(-5)
    };

    this.errors.forEach(error => {
      summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
    });

    return summary;
  }
}

// Create global instance
export const globalErrorHandler = new GlobalErrorHandler();

// Export utility functions
export const logError = (error: Error, additionalInfo?: any) => {
  globalErrorHandler.logError({
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    type: 'react',
    additionalInfo
  });
};

export const getErrorSummary = () => globalErrorHandler.getErrorSummary();
export const clearErrors = () => globalErrorHandler.clearErrors();

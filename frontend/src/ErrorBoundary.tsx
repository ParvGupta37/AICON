import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'monospace'
        }}>
          <div style={{ maxWidth: '800px', width: '100%' }}>
            <div style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              ⚠️ App Error
            </div>
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              whiteSpace: 'pre-wrap',
              fontSize: '0.85rem',
              color: '#fca5a5'
            }}>
              {this.state.error?.toString()}
            </div>
            {this.state.errorInfo && (
              <details style={{ marginBottom: '1rem' }}>
                <summary style={{ cursor: 'pointer', color: '#9ca3af', marginBottom: '0.5rem' }}>
                  Component Stack
                </summary>
                <div style={{
                  background: '#111',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '1rem',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {this.state.errorInfo.componentStack}
                </div>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

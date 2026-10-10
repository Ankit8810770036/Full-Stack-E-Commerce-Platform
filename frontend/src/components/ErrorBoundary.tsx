import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0a0b10',
          color: '#f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            background: 'rgba(20, 22, 35, 0.85)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '540px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.5rem' }}>
              Something went wrong loading the view
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#f3f4f6',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Clear Storage & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * AppErrorBoundary — Global Error Boundary
 *
 * Catches React errors and displays a fallback UI.
 * Prevents entire app from crashing due to component errors.
 */

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Une erreur est survenue
            </h1>
            <p className="text-gray-600 mb-6">
              Une erreur inattendue s'est produite. Veuillez recharger la page pour continuer.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
            >
              Recharger la page
            </button>

            {/* Dev-only error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-xs font-semibold text-red-900 mb-2">
                  Détails de l'erreur (Dev Only):
                </p>
                <pre className="text-xs text-red-700 overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { USE_SUPABASE } from '@/config/runtime';

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

    // In production, log to monitoring service
    if (USE_SUPABASE && typeof window !== 'undefined') {
      const monitoringService = (window as any).__MONITORING_SERVICE__;
      if (monitoringService?.recordError) {
        monitoringService.recordError({
          type: 'ComponentError',
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center max-w-xl mx-auto px-4">
            {/* Error Icon */}
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Une erreur est survenue
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 mb-8 text-lg">
              L'application a rencontré un problème inattendu.
              {USE_SUPABASE ? ' Notre équipe a été notifiée.' : ''}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Recharger la page
              </button>
              <button
                onClick={this.handleDashboard}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                <Home className="h-4 w-4" />
                Retour au tableau de bord
              </button>
            </div>

            {/* Production Error Reference */}
            {USE_SUPABASE && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Référence :</strong> Notre équipe de support a reçu un rapport de cette erreur.
                  {isDev && ` ID: ${Date.now()}`}
                </p>
              </div>
            )}

            {/* Dev-only error details */}
            {isDev && this.state.error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-xs font-semibold text-red-900 mb-2">
                  📋 Détails technique (Mode Développement):
                </p>
                <pre className="text-xs text-red-700 overflow-auto max-h-48 whitespace-pre-wrap break-words">
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

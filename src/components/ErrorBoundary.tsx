import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4">
          <div className="max-w-md w-full bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-800">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Something went wrong</h2>
            <div className="bg-zinc-950 p-4 rounded-xl overflow-auto text-sm font-mono text-zinc-400 max-h-64">
              {this.state.error?.message || 'Unknown error occurred'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors font-medium"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from './icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] px-4 text-center">
          <div className="w-16 h-16 bg-[var(--wax)]/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangleIcon size={32} className="text-[var(--wax)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--ink)] mb-3">Something went wrong</h1>
          <p className="text-[var(--ink3)] mb-8 max-w-sm">
            We encountered an unexpected error while rendering this view.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--surface2)] hover:bg-[var(--surface2)] text-[var(--ink)] rounded-xl transition-colors border border-[var(--line)]/5"
          >
            <RefreshCwIcon size={20} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

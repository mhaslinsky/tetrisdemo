import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire application
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call the optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private handleReload = () => {
    // Reset the error state and reload the page
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleReset = () => {
    // Just reset the error state without reloading
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-8'>
          <div className='bg-gray-800 rounded-lg p-8 max-w-md w-full text-center border border-red-500'>
            <div className='text-red-400 text-6xl mb-4'>⚠️</div>
            <h1 className='text-2xl font-bold text-white mb-4'>Oops! Something went wrong</h1>
            <p className='text-gray-300 mb-6'>
              The game encountered an unexpected error. Don't worry, your progress hasn't been lost.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className='mb-6 text-left'>
                <summary className='text-red-400 cursor-pointer mb-2'>Error Details</summary>
                <pre className='text-xs text-gray-400 bg-gray-900 p-3 rounded overflow-auto max-h-32'>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className='flex gap-3 justify-center'>
              <button
                onClick={this.handleReset}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors'
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors'
              >
                Reload Page
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

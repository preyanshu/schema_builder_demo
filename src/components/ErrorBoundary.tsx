import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  resetKey: any; 
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded-md">
          <p className="font-bold">An error occurred while loading the form:</p>
          <pre className="whitespace-pre-wrap text-sm">{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

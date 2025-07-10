
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ConversationListErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

class ConversationListErrorBoundary extends React.Component<
  ConversationListErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ConversationListErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ConversationList Error Boundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ConversationList Error Boundary details:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            There was an error loading the conversation list. This might be due to duplicate data or connection issues.
          </p>
          <div className="space-y-2">
            <Button onClick={this.handleRetry} variant="outline">
              Try Again
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {this.state.error?.message && `Error: ${this.state.error.message}`}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ConversationListErrorBoundary;

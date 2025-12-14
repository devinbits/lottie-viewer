import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.stackContainer}>
                <Text style={styles.stackTitle}>Error Details:</Text>
                <Text style={styles.stackTrace}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.stackTrace}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
            <View style={styles.buttonContainer}>
              <Button title="Try Again" onPress={this.handleReset} />
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    maxWidth: 600,
    width: '100%',
    padding: 24,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  stackContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 20,
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default ErrorBoundary;


import { DataService } from '../dataService';

// Error types
export enum ErrorType {
  DATABASE = 'DATABASE_ERROR',
  NETWORK = 'NETWORK_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN_ERROR'
}

// Error details interface
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  operation?: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

// Monitoring and logging interface
export interface MonitoringService {
  logError(details: ErrorDetails): void;
  trackMetric(name: string, value: number, tags?: Record<string, string>): void;
}

// Default monitoring service implementation
class DefaultMonitoringService implements MonitoringService {
  logError(details: ErrorDetails) {
    console.error('Error:', details);
    // In production, this would send to an error tracking service
    // like Sentry, LogRocket, or similar
  }

  trackMetric(name: string, value: number, tags?: Record<string, string>) {
    console.debug('Metric:', { name, value, tags });
    // In production, this would send to a metrics service
    // like Datadog, New Relic, or similar
  }
}

// Global monitoring instance
const monitoringService: MonitoringService = new DefaultMonitoringService();

// Set custom monitoring service
export function setMonitoringService(service: MonitoringService) {
  Object.assign(monitoringService, service);
}

// Error handler middleware
export class ErrorHandler extends DataService {
  // Handle different types of errors and provide appropriate responses
  handleError(error: any, operation: string): never {
    // Extract user ID if available
    const getUserId = async () => {
      try {
        const user = await this.getCurrentUser();
        return user?.id;
      } catch {
        return undefined;
      }
    };

    // Determine error type and create error details
    const errorDetails: ErrorDetails = {
      type: this.determineErrorType(error),
      message: this.getErrorMessage(error),
      operation,
      timestamp: Date.now(),
      userId: await getUserId()
    };

    // Add metadata for database errors
    if (errorDetails.type === ErrorType.DATABASE && error.code) {
      errorDetails.metadata = {
        dbCode: error.code,
        dbMessage: error.message,
        dbDetails: error.details
      };
    }

    // Log the error
    monitoringService.logError(errorDetails);

    // Track error metric
    monitoringService.trackMetric('error_count', 1, {
      type: errorDetails.type,
      operation
    });

    // Throw standardized error
    switch (errorDetails.type) {
      case ErrorType.VALIDATION:
        throw new Error(`Validation failed: ${errorDetails.message}`);
      
      case ErrorType.AUTHENTICATION:
        throw new Error('Authentication required');
      
      case ErrorType.AUTHORIZATION:
        throw new Error('Insufficient permissions');
      
      case ErrorType.NOT_FOUND:
        throw new Error('Resource not found');
      
      case ErrorType.CONFLICT:
        throw new Error(`Resource conflict: ${errorDetails.message}`);
      
      case ErrorType.RATE_LIMIT:
        throw new Error('Too many requests. Please try again later.');
      
      case ErrorType.TIMEOUT:
        throw new Error('Request timed out. Please try again.');
      
      case ErrorType.NETWORK:
        throw new Error('Network error. Please check your connection.');
      
      case ErrorType.DATABASE:
        throw new Error('Database error. Please try again later.');
      
      default:
        throw new Error('An unexpected error occurred. Please try again later.');
    }
  }

  // Determine the type of error based on the error object
  private determineErrorType(error: any): ErrorType {
    if (!error) return ErrorType.UNKNOWN;

    // Handle Supabase-specific errors
    if (error.code) {
      switch (error.code) {
        case 'PGRST116': // Not found
          return ErrorType.NOT_FOUND;
        case '23505': // Unique violation
          return ErrorType.CONFLICT;
        case '42501': // Insufficient privileges
          return ErrorType.AUTHORIZATION;
        case '40001': // Serialization failure
        case '40P01': // Deadlock detected
          return ErrorType.DATABASE;
        case '42601': // Syntax error
          return ErrorType.DATABASE;
        case '42703': // Undefined column
          return ErrorType.DATABASE;
        case '42P01': // Undefined table
          return ErrorType.DATABASE;
        case '23503': // Foreign key violation
          return ErrorType.DATABASE;
        case '23514': // Check constraint violation
          return ErrorType.VALIDATION;
        case '22001': // String data right truncation
          return ErrorType.VALIDATION;
      }
    }

    // Handle network errors
    if (error.name === 'AbortError' || 
        error.name === 'NetworkError' || 
        error.message.includes('network') || 
        error.message.includes('fetch')) {
      return ErrorType.NETWORK;
    }

    // Handle timeout errors
    if (error.name === 'TimeoutError' || 
        error.message.includes('timeout') || 
        error.message.includes('timed out')) {
      return ErrorType.TIMEOUT;
    }

    // Handle validation errors
    if (error.name === 'ValidationError' || 
        error.message.includes('validation') || 
        error.message.includes('invalid') || 
        error.message.includes('required')) {
      return ErrorType.VALIDATION;
    }

    // Handle authentication errors
    if (error.name === 'AuthError' || 
        error.message.includes('unauthenticated') || 
        error.message.includes('authentication')) {
      return ErrorType.AUTHENTICATION;
    }

    // Handle authorization errors
    if (error.message.includes('permission') || 
        error.message.includes('authorized') || 
        error.message.includes('forbidden')) {
      return ErrorType.AUTHORIZATION;
    }

    // Handle rate limiting errors
    if (error.status === 429 || 
        error.message.includes('rate limit') || 
        error.message.includes('too many requests')) {
      return ErrorType.RATE_LIMIT;
    }

    // Handle database connection errors
    if (error.message.includes('database') || 
        error.message.includes('connection') || 
        error.message.includes('server')) {
      return ErrorType.DATABASE;
    }

    // Default to unknown error
    return ErrorType.UNKNOWN;
  }

  // Get a user-friendly error message
  private getErrorMessage(error: any): string {
    if (!error) return 'Unknown error';

    // Return specific error messages for known cases
    if (error.message) {
      // Database-specific messages
      if (error.code === '23505') { // Unique violation
        return 'A resource with this identifier already exists.';
      }
      
      if (error.code === 'PGRST116') { // Not found
        return 'The requested resource was not found.';
      }
      
      if (error.message.includes('foreign key')) {
        return 'Referenced resource does not exist.';
      }
      
      if (error.message.includes('null value')) {
        return 'Required field cannot be empty.';
      }
    }

    // Return the error message if it's already user-friendly
    if (error.message && typeof error.message === 'string') {
      return error.message;
    }

    // Fallback messages based on error type
    switch (this.determineErrorType(error)) {
      case ErrorType.VALIDATION:
        return 'Invalid input provided.';
      
      case ErrorType.AUTHENTICATION:
        return 'Authentication is required to perform this action.';
      
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      
      case ErrorType.NOT_FOUND:
        return 'The requested resource could not be found.';
      
      case ErrorType.CONFLICT:
        return 'The operation conflicts with existing data.';
      
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please try again later.';
      
      case ErrorType.TIMEOUT:
        return 'The request took too long to complete.';
      
      case ErrorType.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection.';
      
      case ErrorType.DATABASE:
        return 'Unable to process your request at this time. Please try again later.';
      
      default:
        return 'An unexpected error occurred.';
    }
  }
}
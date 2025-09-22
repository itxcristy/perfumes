// Utilities Barrel Exports - Organized by category

// Performance utilities
export * from './performance';

// Database utilities
export * from './database';

// Authentication utilities
export * from './auth';

// Core utilities
export { cacheManager } from './cache';
export {
  detectRLSRecursionError,
  generateRLSFixSuggestion,
  handleDatabaseError
} from './errorHandling';
export { validateUUID, generateUUID } from './uuidValidation';
export { serviceWorkerManager } from './serviceWorker';
export { withScrollToTop } from './withScrollToTop';

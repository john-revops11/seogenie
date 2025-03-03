
/**
 * Main export file for Pinecone service
 * Combines config and connection utilities
 */

// Re-export everything from config
export * from './config';

// Re-export testPineconeConnection from connection
export { testPineconeConnection } from './connection';

// Re-export all functionality from the modular files
export * from './connection';
export * from './embedding';
export * from './operations';

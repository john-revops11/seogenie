
// Re-export all Pinecone functionality from dedicated modules
export {
  configurePinecone,
  getPineconeConfig,
  getPineconeHostUrl,
  isPineconeConfigured
} from './pineconeConfig';

export { testPineconeConnection } from './pineconeConnection';

export { createEmbedding } from './embeddingService';

export {
  upsertToPinecone,
  queryPinecone,
  indexDocument,
  retrieveSimilarDocuments
} from './vectorOperations';

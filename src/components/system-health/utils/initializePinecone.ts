
import { configurePinecone } from '@/services/vector/config';
import { testPineconeConnection } from '@/services/vector/connection';

/**
 * Initialize Pinecone with the provided credentials
 */
export const initializePinecone = async () => {
  try {
    // Configure Pinecone with the provided credentials
    configurePinecone(
      "pcsk_2JMBqy_NGwjS5UqWkqAWDN6BGuW73KRJ9Hgd6G6T91LPpzsgkUMwchzzpXEQoFn7A1g797", 
      "llama-text-embed-v2-index", 
      "https://revology-rag-llm-6hv3n2l.svc.aped-4627-b74a.pinecone.io", 
      "us-east-1"
    );
    
    // Test the connection
    const isConnected = await testPineconeConnection();
    return isConnected;
  } catch (error) {
    console.error("Error initializing Pinecone:", error);
    return false;
  }
};
